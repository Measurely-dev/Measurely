package service

import (
	"Measurely/db"
	"Measurely/email"
	"Measurely/types"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/measurely-dev/measurely-go"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/customer"
	"github.com/stripe/stripe-go/v79/subscription"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type MetricCache struct {
	key         string
	metric_type int
	user_id     uuid.UUID
	metric_id   uuid.UUID
	expiry      time.Time
}

type RateLimit struct {
	current int
	max     int
	expiry  time.Time
}

type UserCache struct {
	plan_identifier string
	metric_count    int64
	startDate       time.Time
}

type Cache struct {
	plans      sync.Map
	users      sync.Map
	metrics    []sync.Map
	ratelimits sync.Map
}

type Service struct {
	db        *db.DB
	email     *email.Email
	s3Client  *s3.Client
	providers map[string]Provider
	cache     Cache
}

func New() Service {
	// Initialize the database connection
	db, err := db.NewPostgres(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// Initialize email service
	email, err := email.NewEmail()
	if err != nil {
		log.Fatalf("Error initializing email service: %v", err)
	}

	// Set Stripe API key
	stripe.Key = os.Getenv("STRIPE_SK")
	if stripe.Key == "" {
		log.Fatal("Stripe API key is missing")
	}

	// Configure providers (GitHub and Google)
	providers := make(map[string]Provider)

	// GitHub provider setup
	providers["github"] = Provider{
		UserURL: os.Getenv("GITHUB_USER"),
		Type:    types.GITHUB_PROVIDER,
		Config: &oauth2.Config{
			ClientID:     os.Getenv("GITHUB_KEY"),
			ClientSecret: os.Getenv("GITHUB_SECRET"),
			Endpoint:     github.Endpoint,
			RedirectURL:  GetURL() + "/callback/github",
			Scopes:       []string{"read:user"},
		},
	}

	// Google provider setup
	providers["google"] = Provider{
		UserURL: os.Getenv("GOOGLE_USER"),
		Type:    types.GOOGLE_PROVIDER,
		Config: &oauth2.Config{
			ClientID:     os.Getenv("GOOGLE_KEY"),
			ClientSecret: os.Getenv("GOOGLE_SECRET"),
			Endpoint:     google.Endpoint,
			RedirectURL:  GetURL() + "/callback/google",
			Scopes:       []string{"openid", "profile", "email"},
		},
	}

	// Load AWS S3 configuration
	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithCredentialsProvider(aws.NewCredentialsCache(
			credentials.NewStaticCredentialsProvider(os.Getenv("S3_ACCESS_KEY"), os.Getenv("S3_SECRET_KEY"), ""),
		)),
		config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatalf("Error loading CLOUDFLARE R2 S3 config: %v", err)
	}

	// Initialize S3 client with custom endpoint
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("S3_ENDPOINT"))
	})

	// Return the new service with all components initialized
	return Service{
		db:        db,
		email:     email,
		providers: providers,
		s3Client:  client,
		cache: Cache{
			plans:      sync.Map{},
			users:      sync.Map{},
			metrics:    []sync.Map{{}, {}},
			ratelimits: sync.Map{},
		},
	}
}

func (s *Service) SetupBasicPlans() {
	s.GetPlan("starter")
	s.GetPlan("plus")
	s.GetPlan("pro")
}

func (s *Service) AuthenticatedMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the session cookie
		cookie, err := r.Cookie("measurely-session")
		if err == http.ErrNoCookie {
			http.Error(w, "Unauthorized: Missing session cookie", http.StatusUnauthorized)
			return
		} else if err != nil {
			http.Error(w, "Internal server error: Unable to read cookie", http.StatusInternalServerError)
			return
		}

		// Verify the token in the cookie
		token, err := VerifyToken(cookie.Value)
		if err != nil {
			http.Error(w, "Unauthorized: Invalid token - "+err.Error(), http.StatusUnauthorized)
			return
		}

		// Store token in the request context
		ctx := context.WithValue(r.Context(), types.TOKEN, token)

		// Check if the session cookie is about to expire
		if cookie.Expires.Sub(time.Now().UTC()) <= 12*time.Hour {
			// If so, refresh the cookie
			newCookie, err := CreateCookie(&types.User{Id: token.Id, Email: token.Email}, w)
			if err != nil {
				http.Error(w, "Internal error: Failed to create a new session cookie", http.StatusInternalServerError)
				return
			}

			// Set the refreshed cookie
			http.SetCookie(w, &newCookie)

			// Disable cache for this response
			SetupCacheControl(w, 0)
		}

		// Continue the request chain
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Service) CleanUp() {
	s.db.Close()
}

func (s *Service) EmailValid(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email string `json:"email"`
		Type  int    `json:"type"`
	}

	// Try to unmarshal the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	// Check if the email is valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	_, derr := s.db.GetUserByEmail(request.Email)
	if request.Type == 0 {
		if derr == sql.ErrNoRows {
			http.Error(w, "No user account found with this email address", http.StatusNotFound)
			return
		}
	} else if request.Type == 1 {
		if derr != sql.ErrNoRows {
			http.Error(w, "Email address is already in use", http.StatusConflict)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) IsConnected(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func (s *Service) JoinWaitlist(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	request.Name = strings.ToLower(strings.TrimSpace(request.Name))

	err := s.db.CreateWaitlistEntry(request.Email, request.Name)
	if err == nil {
		measurely.Capture(metricIds["waitlist"], measurely.CapturePayload{
			Value: 1,
		})
	} else {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, "Looks like you already joined the waitlist.", http.StatusAlreadyReported)
		} else {
			log.Println(err)
			http.Error(w, "Internal server error. Please try again later.", http.StatusInternalServerError)
		}
		return
	}

	// Send notification email about the new login
	go s.email.SendEmail(email.MailFields{
		To:      request.Email,
		Subject: "Welcome to Measurely!",
		Content: fmt.Sprintf(`
    Hi %s,<br>
    Thank you for joining the waitlist for Measurely!<br>
    Thanks for being part of this journey with us. Exciting things are coming, and we can’t wait to share them with you.
    `, request.Name),
		Link:        "https://x.com/getmeasurely",
		ButtonTitle: "Follow us on Twitter",
	})

	w.WriteHeader(http.StatusOK)
}

func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	// Try to unmarshal the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	// Check for password validity
	if strings.Contains(request.Password, " ") {
		http.Error(w, "Password cannot contain spaces", http.StatusBadRequest)
		return
	}

	// Validate email and password format
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	if !isPasswordValid(request.Password) {
		http.Error(w, "Password must be at least 7 characters long", http.StatusBadRequest)
		return
	}

	// Retrieve user by email
	user, err := s.db.GetUserByEmail(request.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Println("Error fetching user:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Check if the user has linked providers
	providers, err := s.db.GetProvidersByUserId(user.Id)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error fetching providers:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if len(providers) > 0 {
		http.Error(w, "Account is registered with an external provider. Login via the provider.", http.StatusUnauthorized)
		return
	}

	// Validate password hash
	if !CheckPasswordHash(request.Password, user.Password) {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Create auth cookie
	cookie, err := CreateCookie(&user, w)
	if err != nil {
		log.Println("Error creating auth cookie:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Set cache control and set cookie
	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)

	// Send notification email about the new login
	go s.email.SendEmail(email.MailFields{
		To:          user.Email,
		Subject:     "New login detected",
		Content:     "A new login to your Measurely account was detected. If this wasn't you, please update your password immediately.",
		Link:        GetOrigin() + "/dashboard",
		ButtonTitle: "Update Password",
	})
}

func (s *Service) Oauth(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	state := r.URL.Query().Get("state")

	provider, exists := s.providers[providerName]
	if !exists {
		log.Println("Invalid provider:", providerName)
		http.Error(w, "Invalid provider", http.StatusBadRequest)
		return
	}

	url := BeginProviderAuth(provider, state)

	SetupCacheControl(w, 10)
	http.Redirect(w, r, url, http.StatusFound)
}

func (s *Service) Callback(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	var action, id string
	splitted := strings.Split(state, ".")

	if len(splitted) == 0 {
		http.Redirect(w, r, GetOrigin()+"/sign-in?error=missing parameters", http.StatusFound)
		return
	}

	if len(splitted) > 0 {
		action = splitted[0]
		if len(splitted) > 1 {
			id = splitted[1]
		}
	}

	chosenProvider, exists := s.providers[providerName]
	if !exists {
		http.Redirect(w, r, GetOrigin()+"/sign-in?error=invalid provider", http.StatusFound)
		return
	}

	providerUser, _, err := CompleteProviderAuth(chosenProvider, code)
	if err != nil {
		log.Println("OAuth error:", err)
		http.Redirect(w, r, GetOrigin()+"/sign-in?error="+err.Error(), http.StatusFound)
		return
	}

	var user types.User
	provider, gerr := s.db.GetProviderByProviderUserId(providerUser.Id, chosenProvider.Type)
	if gerr == sql.ErrNoRows {
		if action == "auth" {
			// TODO : uncomment this code when the waitlist is done

			// Handle user creation logic
			// stripeParams := &stripe.CustomerParams{
			// 	Email: stripe.String(providerUser.Email),
			// }
			//
			// c, err := customer.New(stripeParams)
			// if err != nil {
			// 	log.Println("Stripe error:", err)
			// 	http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusFound)
			// 	return
			// }

			// user, err = s.db.CreateUser(types.User{
			// 	Email:            strings.ToLower(providerUser.Email),
			// 	Password:         "",
			// 	FirstName:        providerUser.Name,
			// 	LastName:         "",
			// 	StripeCustomerId: c.ID,
			// 	CurrentPlan:      "starter",
			// })
			// if err != nil {
			// 	if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			// 		http.Redirect(w, r, GetOrigin()+"/sign-in?error=account already exists", http.StatusFound)
			// 	} else {
			// 		http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusFound)
			// 	}
			// 	return
			// }
			//
			//    go measurely.Capture(metricIds["users"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan" : "starter"}})
			// go measurely.Capture(metricIds["signups"], measurely.CapturePayload{Value: 1})
		} else if action == "connect" {
			parsedId, err := uuid.Parse(id)
			if err != nil {
				http.Redirect(w, r, GetOrigin()+"/sign-in?error=invalid user identifier", http.StatusFound)
				return
			}

			user, err = s.db.GetUserById(parsedId)
			if err != nil {
				log.Println("Error fetching user:", err)
				http.Redirect(w, r, GetOrigin()+"/sign-in?error=user not found", http.StatusFound)
				return
			}
		}

		// Create provider link in DB
		provider, err = s.db.CreateProvider(types.UserProvider{
			UserId:         user.Id,
			Type:           chosenProvider.Type,
			ProviderUserId: providerUser.Id,
		})
		if err != nil {
			log.Println("Error creating provider link:", err)
			http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusFound)
			return
		}
	}

	if gerr == nil {
		user, err = s.db.GetUserById(provider.UserId)
		if err != nil {
			log.Println("Error fetching user:", err)
			http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusFound)
			return
		}
	}

	cookie, err := CreateCookie(&user, w)
	if err != nil {
		log.Println("Error creating cookie:", err)
		http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusFound)
		return
	}

	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	http.Redirect(w, r, GetOrigin()+"/dashboard", http.StatusFound)
}

func (s *Service) DisconnectProvider(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	chosenProvider, exists := s.providers[providerName]
	if !exists {
		http.Error(w, "Provider not found", http.StatusNotFound)
		return
	}

	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	providers, err := s.db.GetProvidersByUserId(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			providers = []types.UserProvider{}
		} else {
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
	}

	// Handle password validation when there is only one provider linked
	if len(providers) == 1 {
		if !isPasswordValid(request.Password) {
			http.Error(w, "Password must have at least 7 characters", http.StatusBadRequest)
			return
		}

		hashedPassword, err := HashPassword(request.Password)
		if err != nil {
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		if err := s.db.UpdateUserPassword(token.Id, hashedPassword); err != nil {
			http.Error(w, "Failed to update password", http.StatusInternalServerError)
			return
		}
	}

	// Remove the provider from the user's linked accounts
	for _, provider := range providers {
		if provider.Type == chosenProvider.Type {
			if err := s.db.DeleteUserProvider(provider.Id); err != nil {
				http.Error(w, "Failed to disconnect provider", http.StatusInternalServerError)
				return
			}
			break
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email     string `json:"email"`
		Password  string `json:"password"`
		FirstName string `json:"firstname"`
		LastName  string `json:"lastname"`
	}

	// Try to unmarshal the request body
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if strings.Contains(request.Password, " ") {
		http.Error(w, "Password cannot contain spaces. Please ensure your password is valid.", http.StatusBadRequest)
		return
	}

	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	request.FirstName = strings.TrimSpace(request.FirstName)
	request.LastName = strings.TrimSpace(request.LastName)

	// Check if the email and password are valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email format. Please provide a valid email address.", http.StatusBadRequest)
		return
	}
	if !isPasswordValid(request.Password) {
		http.Error(w, "Password is too short. Your password must be at least 7 characters long.", http.StatusBadRequest)
		return
	}

	// Create new user
	hashed_password, herr := HashPassword(request.Password)
	if herr != nil {
		log.Println(herr)
		http.Error(w, "Internal server error. Please try again later.", http.StatusInternalServerError)
		return
	}
	stripe_params := &stripe.CustomerParams{
		Email: stripe.String(request.Email),
	}

	c, err := customer.New(stripe_params)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to create Stripe customer. Please try again later.", http.StatusInternalServerError)
		return
	}

	new_user, err := s.db.CreateUser(types.User{
		Email:            request.Email,
		Password:         hashed_password,
		FirstName:        request.FirstName,
		LastName:         request.LastName,
		StripeCustomerId: c.ID,
		CurrentPlan:      "starter",
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, "This email is already registered. Please try logging in instead.", http.StatusBadRequest)
		} else {
			log.Println(err)
			http.Error(w, "Internal server error. Please try again later.", http.StatusInternalServerError)
		}

		return
	}

	// create auth cookie
	cookie, cerr := CreateCookie(&new_user, w)
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal server error. Please try again later.", http.StatusInternalServerError)
		return
	}

	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusCreated)

	go measurely.Capture(metricIds["users"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan": "starter"}})
	go measurely.Capture(metricIds["signups"], measurely.CapturePayload{Value: 1})

	// send email
	go s.email.SendEmail(email.MailFields{
		To:          new_user.Email,
		Subject:     "Thank you for joining Measurely.",
		Content:     "You can now access your account's dashboard by using the following link.",
		Link:        GetOrigin() + "/dashboard",
		ButtonTitle: "Access dashboard",
	})
}

func (s *Service) Logout(w http.ResponseWriter, r *http.Request) {
	cookie := DeleteCookie()
	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetUser(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			cookie := DeleteCookie()
			SetupCacheControl(w, 0)
			http.SetCookie(w, &cookie)
			http.Error(w, "User not found. Please log in again.", http.StatusNotFound)
		} else {
			log.Println("Failed to get user by id: ", err)
			http.Error(w, "Failed to load your data. Please try again later.", http.StatusInternalServerError)
		}
		return
	}

	providers, err := s.db.GetProvidersByUserId(user.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			providers = []types.UserProvider{}
		} else {
			log.Println("Failed to get user providers by user id :", err)
			http.Error(w, "Internal server error. Please try again later.", http.StatusInternalServerError)
			return
		}
	}

	finalProviders := []types.UserProvider{}
	for _, provider := range providers {
		finalProviders = append(finalProviders, types.UserProvider{
			Id:   provider.Id,
			Type: provider.Type,
		})
	}

	userCache, err := s.GetUserCache(user.Id)
	if err != nil {
		log.Println("Failed to retrieve user from cache: ", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	plan, exists := s.GetPlan(userCache.plan_identifier)
	if !exists {
		log.Println("Failed to retrieve user plan from cache: ", err)
		http.Error(w, "Plan not found.", http.StatusNotFound)
		return
	}

	plan.Price = ""
	response := struct {
		Id         uuid.UUID            `json:"id"`
		Email      string               `json:"email"`
		FirstName  string               `json:"firstname"`
		LastName   string               `json:"lastname"`
		EventCount int64                `json:"eventcount"`
		Plan       types.Plan           `json:"plan"`
		Providers  []types.UserProvider `json:"providers"`
	}{
		Id:         user.Id,
		Email:      user.Email,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		EventCount: user.MonthlyEventCount,
		Plan:       plan,
		Providers:  finalProviders,
	}

	bytes, jerr := json.Marshal(response)
	if jerr != nil {
		http.Error(w, "Failed to retrieve user details. Please try again later.", http.StatusInternalServerError)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email string `json:"email"`
	}

	// Try to unmarshal the request body
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	// Check if the email is valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email address. Please ensure the email is in the correct format.", http.StatusBadRequest)
		return
	}

	// Check if a user with the chosen email exists
	user, derr := s.db.GetUserByEmail(request.Email)
	if derr == sql.ErrNoRows {
		http.Error(w, "User not found. Please check your email address or create a new account.", http.StatusNotFound)
		return
	}

	account_recovery, err := s.db.GetAccountRecoveryByUserId(user.Id)
	if err == sql.ErrNoRows {
		account_recovery, err = s.db.CreateAccountRecovery(user.Id)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error. Please try again later.", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	// Send email
	go s.email.SendEmail(email.MailFields{
		To:          user.Email,
		Subject:     "Recover your account",
		Content:     "A request has been made to recover your account. If you do not recall making this request, please update your password immediately.",
		Link:        GetOrigin() + "/reset?code=" + account_recovery.Id.String(),
		ButtonTitle: "Recover my account",
	})
}

func (s *Service) RecoverAccount(w http.ResponseWriter, r *http.Request) {
	var request struct {
		RequestId   uuid.UUID `json:"requestid"`
		NewPassword string    `json:"newpassword"`
	}

	// Try to unmarshal the request body
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// check if the new password is valid
	if !isPasswordValid(request.NewPassword) {
		http.Error(w, "Password is invalid. Please ensure your password is at least 7 characters long.", http.StatusBadRequest)
		return
	}

	// fetch the account recovery
	account_recovery, gerr := s.db.GetAccountRecovery(request.RequestId)
	if gerr != nil {
		http.Error(w, "Invalid account recovery link. Please check the link or request a new one.", http.StatusBadRequest)
		return
	}

	// hash the new password
	hashed_password, herr := HashPassword(request.NewPassword)
	if herr != nil {
		log.Println(herr)
		http.Error(w, "Internal error. Please try again later.", http.StatusInternalServerError)
		return
	}

	// update the user password
	if err := s.db.UpdateUserPassword(account_recovery.UserId, hashed_password); err != nil {
		log.Println(err)
		http.Error(w, "Failed to update password. Please try again later.", http.StatusInternalServerError)
		return
	}

	// delete the account recovery
	if err := s.db.DeleteAccountRecovery(account_recovery.Id); err != nil {
		log.Println(err)
		http.Error(w, "Internal error while finalizing account recovery. Please try again later.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) SendFeedback(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		Content string `json:"content"`
	}

	// Try to unmarshal the request body
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(request.Content) > 1000 {
		http.Error(w, "Feedback content is too long. Please limit your feedback to 1000 characters.", http.StatusBadRequest)
		return
	}

	if len(request.Content) == 0 {
		http.Error(w, "Please provide some content for your feedback.", http.StatusBadRequest)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found. Please log in again.", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error. Please try again later.", http.StatusInternalServerError)
		}
		return
	}

	// Create feedback entry
	cerr := s.db.CreateFeedback(types.Feedback{
		Email:   user.Email,
		Content: request.Content,
		Date:    time.Now(),
	})
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error. Unable to process your feedback. Please try again later.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Log the feedback event
	go measurely.Capture(metricIds["feedbacks"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan": user.CurrentPlan}})

	// Send email confirmation to user and the team
	go s.email.SendEmail(email.MailFields{
		To:      user.Email,
		Subject: "Feedback received",
		Content: "Thank you for your feedback. We will try to improve our service as soon as possible.",
	})
	go s.email.SendEmail(email.MailFields{
		To:      "info@measurely.dev",
		Subject: "Feedback Received from " + user.Email + " (" + user.CurrentPlan + ")",
		Content: request.Content,
	})
}

func (s *Service) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	// Get the user
	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error while retrieving your account. Please try again later.", http.StatusInternalServerError)
		return
	}

	if user.CurrentPlan != "starter" {
		result := subscription.List(&stripe.SubscriptionListParams{
			Customer: stripe.String(user.StripeCustomerId),
		})

		subscriptions := result.SubscriptionList()

		if subscriptions != nil {
			if len(subscriptions.Data) != 0 {
				_, err := subscription.Cancel(subscriptions.Data[0].ID, nil)
				if err != nil {
					log.Println("Failed to cancel subscriptions: ", err)
					http.Error(w, "Internal error", http.StatusInternalServerError)
					return
				}
			}
		}

	}

	// Delete stripe customer
	_, cerr := customer.Del(user.StripeCustomerId, nil)
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error while deleting your Stripe account. Please try again later.", http.StatusInternalServerError)
		return
	}

	// Delete linked providers
	providers, err := s.db.GetProvidersByUserId(token.Id)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Internal error while disconnecting your providers. Please try again later.", http.StatusInternalServerError)
		return
	}
	for _, provider := range providers {
		if err := s.db.DeleteUserProvider(provider.Id); err != nil {
			http.Error(w, "Failed to disconnect provider. Please try again later.", http.StatusInternalServerError)
			return
		}
	}

	// Delete the user account
	err = s.db.DeleteUser(user.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error while deleting your account. Please try again later.", http.StatusInternalServerError)
		return
	}

	go measurely.Capture(metricIds["users"], measurely.CapturePayload{Value: -1, Filters: map[string]string{"plan": user.CurrentPlan}})

	// Send confirmation emails
	go s.email.SendEmail(email.MailFields{
		To:      user.Email,
		Subject: "We're sorry to see you go!",
		Content: "Your account has been successfully deleted.",
	})

	// Log out the user
	cookie := DeleteCookie()
	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) RequestEmailChange(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		NewEmail string `json:"new_email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.NewEmail = strings.TrimSpace(strings.ToLower(request.NewEmail))

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	emailchange, err := s.db.GetEmailChangeRequestByUserId(token.Id, request.NewEmail)
	if err == sql.ErrNoRows {
		emailchange, err = s.db.CreateEmailChangeRequest(token.Id, request.NewEmail)
		if err != nil {
			log.Println("Error creating email change request:", err)
			http.Error(w, "Failed to process email change request", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	// Send email notification
	go s.email.SendEmail(email.MailFields{
		To:          user.Email,
		Subject:     "Change your email",
		Content:     "A request has been made to change your email. If you do not recall making this request, please update your password immediately.",
		Link:        GetOrigin() + "/change-email?code=" + emailchange.Id.String(),
		ButtonTitle: "Change my email",
	})
}

func (s *Service) UpdateUserEmail(w http.ResponseWriter, r *http.Request) {
	var request struct {
		RequestId uuid.UUID `json:"requestid"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	emailchange, err := s.db.GetEmailChangeRequest(request.RequestId)
	if err != nil {
		http.Error(w, "Invalid email change link or expired", http.StatusBadRequest)
		return
	}

	user, err := s.db.GetUserById(emailchange.UserId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error: Failed to retrieve user data", http.StatusInternalServerError)
		}
		return
	}

	if err := s.db.UpdateUserEmail(emailchange.UserId, emailchange.NewEmail); err != nil {
		log.Println("Error updating user email:", err)
		http.Error(w, "Failed to update user email", http.StatusInternalServerError)
		return
	}

	// Update Stripe customer email
	params := stripe.CustomerParams{
		Email: stripe.String(emailchange.NewEmail),
	}
	if _, err := customer.Update(user.StripeCustomerId, &params); err != nil {
		log.Println("Error updating Stripe customer email:", err)
		s.db.UpdateUserEmail(user.Id, user.Email) // Rollback
		http.Error(w, "Failed to update payment details", http.StatusInternalServerError)
		return
	}

	if err := s.db.DeleteEmailChangeRequest(emailchange.Id); err != nil {
		log.Println("Error deleting email change request:", err)
		http.Error(w, "Internal error: Failed to clean up email change request", http.StatusInternalServerError)
		return
	}

	SetupCacheControl(w, 0)
	cookie := DeleteCookie()
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdateFirstAndLastName(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.FirstName = strings.TrimSpace(request.FirstName)
	request.LastName = strings.TrimSpace(request.LastName)

	if err := s.db.UpdateUserFirstAndLastName(token.Id, request.FirstName, request.LastName); err != nil {
		log.Println("Error updating user's name:", err)
		http.Error(w, "Failed to update the user's first name and/or last name", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if !isPasswordValid(request.NewPassword) {
		http.Error(w, "Password must be at least 7 characters", http.StatusBadRequest)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		http.Error(w, "Failed to retrieve user", http.StatusInternalServerError)
		return
	}

	match := CheckPasswordHash(request.OldPassword, user.Password)
	if !match {
		http.Error(w, "Incorrect old password", http.StatusUnauthorized)
		return
	}

	hashed, err := HashPassword(request.NewPassword)
	if err != nil {
		http.Error(w, "Error hashing new password", http.StatusInternalServerError)
		return
	}

	if err := s.db.UpdateUserPassword(token.Id, hashed); err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) CreateProject(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.Name = strings.ToLower(strings.TrimSpace(request.Name))

	match, reerr := regexp.MatchString(`^[a-zA-Z0-9_ ]+$`, request.Name)
	if reerr != nil {
		http.Error(w, "Invalid project name format", http.StatusBadRequest)
		return
	}
	if !match {
		http.Error(w, "Project name can only contain letters, numbers, and underscores", http.StatusBadRequest)
		return
	}

	_, err := s.db.GetProjectByName(token.Id, request.Name)
	if err == nil {
		http.Error(w, "Project with this name already exists", http.StatusBadRequest)
		return
	}

	userCache, err := s.GetUserCache(token.Id)
	if err != nil {
		log.Println("Failed to retrieve user from cache: ", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	plan, exists := s.GetPlan(userCache.plan_identifier)
	if !exists {
		log.Println("Failed to retrieve user plan from cache: ", err)
		http.Error(w, "Plan not found.", http.StatusNotFound)
		return
	}
	if plan.ProjectLimit >= 0 {
		count, cerr := s.db.GetProjectCountByUser(token.Id)
		if cerr != nil {
			log.Println("Error retrieving project count:", cerr)
			http.Error(w, "Error checking project count, please try again later", http.StatusInternalServerError)
			return
		}

		if count >= plan.ProjectLimit {
			http.Error(w, "Project limit reached", http.StatusForbidden)
			return
		}
	}

	var apiKey string
	var aerr error
	for tries := 5; tries > 0; tries-- {
		apiKey, aerr = GenerateRandomKey()
		if aerr != nil {
			continue
		}

		_, aerr = s.db.GetProjectByApi(apiKey)
		if aerr != nil {
			break
		}
	}

	if apiKey == "" {
		http.Error(w, "Unable to generate API key, please try again later", http.StatusRequestTimeout)
		return
	}

	newApp, err := s.db.CreateProject(types.Project{
		ApiKey: apiKey,
		Name:   request.Name,
		UserId: token.Id,
	})
	if err != nil {
		log.Println("Error creating project:", err)
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}

  newApp.UserRole = types.TEAM_OWNER
	bytes, jerr := json.Marshal(newApp)
	if jerr != nil {
		http.Error(w, "Failed to marshal project data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)

	go measurely.Capture(metricIds["apps"], measurely.CapturePayload{Value: 1})
}

func (s *Service) RandomizeApiKey(w http.ResponseWriter, r *http.Request) {
	// Retrieve the token from the request context
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		ProjectId uuid.UUID `json:"projectid"`
	}

	// Attempt to decode the request body into the `request` struct
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Fetch the project from the database
	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		log.Println("Error fetching project:", err)
		http.Error(w, "Project does not exist.", http.StatusNotFound)
		return
	}

	if project.UserRole != types.TEAM_OWNER && project.UserRole != types.TEAM_ADMIN {
		http.Error(w, "You do not have the necessary role to perform this action", http.StatusUnauthorized)
		return
	}

	// Attempt to generate a unique API key
	const maxTries = 5
	var apiKey string
	var generationErr error

	for i := 0; i < maxTries; i++ {
		// Generate a random API key
		apiKey, generationErr = GenerateRandomKey()
		if generationErr != nil {
			log.Println("Error generating API key:", generationErr)
			continue // Retry if key generation fails
		}

		// Check if the API key already exists
		_, err := s.db.GetProjectByApi(apiKey)
		if err != nil {
			// If the API key is unique, break out of the loop
			break
		}
	}

	// If a valid API key wasn't generated, return a timeout error
	if apiKey == "" {
		http.Error(w, "Internal error, please try again later", http.StatusRequestTimeout)
		return
	}

	// Update the project with the new API key
	if err := s.db.UpdateProjectApiKey(request.ProjectId, apiKey); err != nil {
		log.Println("Error updating project API key:", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Respond with the new API key
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(apiKey))
}

func (s *Service) DeleteProject(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		ProjectId uuid.UUID `json:"project"`
	}

	// Try to unmarshal the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Delete the project
	if err := s.db.DeleteProject(request.ProjectId, token.Id); err != nil {
		log.Println("Error deleting project:", err)
		http.Error(w, "Failed to delete project", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	go measurely.Capture(metricIds["apps"], measurely.CapturePayload{Value: -1})
}

func (s *Service) UpdateProjectName(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		NewName   string    `json:"new_name"`
		ProjectId uuid.UUID `json:"projectid"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.NewName = strings.TrimSpace(request.NewName)

	// Get the project
	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println("Error fetching project:", err)
		http.Error(w, "Failed to retrieve project", http.StatusInternalServerError)
		return
	}

	if project.UserRole != types.TEAM_OWNER && project.UserRole != types.TEAM_ADMIN {
		http.Error(w, "You do not have the necessary role to perform this action", http.StatusUnauthorized)
		return
	}

	if err := s.db.UpdateProjectName(request.ProjectId, request.NewName); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			log.Println("Error updating project name:", err)
			http.Error(w, "Failed to update project name", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetProjects(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	// Fetch Projects
	projects, err := s.db.GetProjects(token.Id)
	if err == sql.ErrNoRows {
		projects = []types.Project{}
	} else if err != nil {
		log.Println("Error fetching projects:", err)
		http.Error(w, "Failed to retrieve projects", http.StatusInternalServerError)
		return
	}

	for i, project := range projects {
		if project.UserRole == types.TEAM_VIEW {
			projects[i].ApiKey = ""
		}
	}

	bytes, err := json.Marshal(projects)
	if err != nil {
		http.Error(w, "Failed to marshal projects data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func (s *Service) CreateMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		Name           string     `json:"name"`
		ProjectId      uuid.UUID  `json:"projectid"`
		Type           int        `json:"type"`
		BaseValue      int64      `json:"basevalue"`
		NamePos        string     `json:"namepos"`
		NameNeg        string     `json:"nameneg"`
		ParentMetricId *uuid.UUID `json:"parentmetricid,omitempty"`
		FilterCategory string     `json:"filtercategory"`
	}

	// Try to unmarshal the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.NamePos = strings.TrimSpace(request.NamePos)
	request.NameNeg = strings.TrimSpace(request.NameNeg)
	request.FilterCategory = strings.TrimSpace(strings.ToLower(request.FilterCategory))

	match, reerr := regexp.MatchString(`^[a-zA-Z0-9 _\-/\$%#&\*\(\)!~]+$`, request.Name)
	if reerr != nil {
		http.Error(w, "Invalid name format: "+reerr.Error(), http.StatusBadRequest)
		return
	}
	if !match {
		http.Error(w, "Metric name can only contain letters, numbers, spaces, and these special characters ($, _ , - , / , & , *, ! , ~)", http.StatusBadRequest)
		return
	}

	if request.Type != types.BASE_METRIC && request.Type != types.DUAL_METRIC && request.Type != types.AVERAGE_METRIC {
		http.Error(w, "Invalid metric type", http.StatusBadRequest)
		return
	}

	if request.BaseValue < 0 && request.Type == types.BASE_METRIC {
		http.Error(w, "Base value cannot be negative for base metrics", http.StatusBadRequest)
		return
	}

	// Get the project
	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println("Error fetching project:", err)
		http.Error(w, "Failed to retrieve project", http.StatusInternalServerError)
		return
	}

	if project.UserRole != types.TEAM_ADMIN && project.UserRole != types.TEAM_OWNER {
		http.Error(w, "You do not have the necessary role to perform this action.", http.StatusUnauthorized)
		return
	}

	// Get Metric Count
	count, err := s.db.GetMetricsCount(request.ProjectId)
	if err != nil {
		log.Println("Error getting metrics count:", err)
		http.Error(w, "Failed to retrieve metric count", http.StatusInternalServerError)
		return
	}

	userCache, err := s.GetUserCache(token.Id)
	if err != nil {
		log.Println("Failed to retrieve user from cache:", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	plan, exists := s.GetPlan(userCache.plan_identifier)
	if !exists {
		log.Println("Failed to retrieve user from cache:", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	if count >= plan.MetricPerProjectLimit {
		http.Error(w, "Metric limit reached for this app", http.StatusForbidden)
		return
	}

	var parentMetricId sql.Null[uuid.UUID]
	if request.ParentMetricId == nil {
		parentMetricId.Valid = false
	} else {
		parentMetricId.Valid = true
		parentMetricId.V = *request.ParentMetricId
	}

	// Create the metric
	metric, err := s.db.CreateMetric(types.Metric{
		Name:           request.Name,
		ProjectId:      request.ProjectId,
		Type:           request.Type,
		NamePos:        request.NamePos,
		NameNeg:        request.NameNeg,
		ParentMetricId: parentMetricId,
		FilterCategory: request.FilterCategory,
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, "Metric with the same name already exists", http.StatusBadRequest)
		} else {
			log.Println("Error creating metric:", err)
			http.Error(w, "Failed to create metric", http.StatusInternalServerError)
		}
		return
	}

	if request.BaseValue != 0 {
		app, err := s.db.GetProject(request.ProjectId, token.Id)
		if err == nil {
			data := map[string]interface{}{
				"value": request.BaseValue,
			}
			jsonData, err := json.Marshal(data)
			if err == nil {
				req, err := http.NewRequest("POST", GetURL()+"/event/v1/"+metric.Id.String(), bytes.NewBuffer(jsonData))
				req.Header.Set("Content-Type", "application/json")
				req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", app.ApiKey))
				if err == nil {
					resp, err := http.DefaultClient.Do(req)
					if err == nil && resp.StatusCode == 200 {
						metric.TotalPos = request.BaseValue
					}
				}
			}
		}
	}

	bytes, err := json.Marshal(metric)
	if err != nil {
		http.Error(w, "Failed to marshal metric data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)

	go measurely.Capture(metricIds["metrics"], measurely.CapturePayload{Value: 1})
}

func (s *Service) DeleteMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		MetricId  uuid.UUID `json:"metricid"`
		ProjectId uuid.UUID `json:"projectid"`
	}

	// Try to unmarshal the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the project
	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		log.Println("Error fetching project:", err)
		http.Error(w, "Failed to retrieve project", http.StatusInternalServerError)
		return
	}

	if project.UserRole != types.TEAM_ADMIN && project.UserRole != types.TEAM_OWNER {
		http.Error(w, "You do not have the necessary role to perform this action.", http.StatusUnauthorized)
		return
	}

	metric, err := s.db.GetMetricById(request.MetricId)
	if err != nil {
		http.Error(w, "Metric not found", http.StatusNotFound)
		return
	}

	// Delete the metric
	if err := s.db.DeleteMetric(request.MetricId, request.ProjectId); err != nil {
		log.Println("Error deleting metric:", err)
		http.Error(w, "Failed to delete metric", http.StatusInternalServerError)
		return
	}

	// Remove the metric from the cache
	s.cache.metrics[0].Delete(request.MetricId)
	s.cache.metrics[1].Delete(project.ApiKey + metric.Name)

	w.WriteHeader(http.StatusOK)
	go measurely.Capture(metricIds["metrics"], measurely.CapturePayload{Value: -1})
}

func (s *Service) GetMetrics(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	projectid, perr := uuid.Parse(r.URL.Query().Get("projectid"))
	if perr != nil {
		http.Error(w, "Invalid app ID format", http.StatusBadRequest)
		return
	}

	// Get project
	_, err := s.db.GetProject(projectid, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println("Error fetching project:", err)
		http.Error(w, "Failed to retrieve project", http.StatusInternalServerError)
		return
	}

	// Fetch Metrics
	metrics, err := s.db.GetMetrics(projectid)
	if err == sql.ErrNoRows {
		metrics = []types.Metric{}
	} else if err != nil {
		log.Println("Error fetching metrics:", err)
		http.Error(w, "Failed to retrieve metrics", http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(metrics)
	if err != nil {
		http.Error(w, "Failed to marshal metrics data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func (s *Service) UpdateMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		ProjectId uuid.UUID `json:"projectid"`
		MetricId  uuid.UUID `json:"metricid"`
		Name      string    `json:"name"`
		NamePos   string    `json:"namepos"`
		NameNeg   string    `json:"nameneg"`
	}

	// Try to unmarshal the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.NamePos = strings.TrimSpace(request.NamePos)
	request.NameNeg = strings.TrimSpace(request.NameNeg)

	// Get the project
	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println("Error fetching project:", err)
		http.Error(w, "Failed to retrieve project", http.StatusInternalServerError)
		return
	}

	if project.UserRole != types.TEAM_ADMIN && project.UserRole != types.TEAM_OWNER {
		http.Error(w, "You do not have the necessary role to perform this action.", http.StatusUnauthorized)
		return
	}

	metric, err := s.db.GetMetricById(request.MetricId)
	if err != nil {
		http.Error(w, "Metric not found", http.StatusNotFound)
		return
	}

	// Update the metric
	if err := s.db.UpdateMetric(request.MetricId, request.ProjectId, request.Name, request.NamePos, request.NameNeg); err != nil {
		log.Println("Error updating metric:", err)
		http.Error(w, "Failed to update metric", http.StatusInternalServerError)
		return
	}

	s.cache.metrics[1].Delete(project.ApiKey + metric.Name)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) SearchUsers(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		Search string `json:"search"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.Search = strings.ToLower(strings.TrimSpace(request.Search))

	users, err := s.db.SearchUsers(request.Search)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		return
	}

	for i := range users {
		users[i].Password = ""
	}

	body, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (s *Service) AddTeamMember(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		MemberId  uuid.UUID `json:"memberid"`
		ProjectId uuid.UUID `json:"projectid"`
		Role      int       `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if request.Role != types.TEAM_VIEW && request.Role != types.TEAM_DEV && request.Role != types.TEAM_ADMIN {
		http.Error(w, "Invalid team member role", http.StatusBadRequest)
		return
	}

	_, err := s.db.GetUserById(request.MemberId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		}
		return
	}

	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		}
		return
	}

	if project.UserRole != types.TEAM_OWNER && project.UserRole != types.TEAM_ADMIN {
		http.Error(w, "You do not have the role necessary to perform this action.", http.StatusUnauthorized)
		return
	}

	err = s.db.CreateTeamRelation(types.TeamRelation{
		UserId:    request.MemberId,
		ProjectId: request.ProjectId,
		Role:      request.Role,
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, "The User is already a member of this team", http.StatusAlreadyReported)
		} else {
			log.Println(err)
			http.Error(w, "Internal server error. Please try again later.", http.StatusInternalServerError)
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) RemoveTeamMember(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		MemberId  uuid.UUID `json:"memberid"`
		ProjectId uuid.UUID `json:"projectid"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		}
		return
	}

	if project.UserRole == types.TEAM_OWNER && request.MemberId == token.Id {
		http.Error(w, "You cannot remove yourself from your own project.", http.StatusConflict)
		return
	}

	team_relation, err := s.db.GetTeamRelation(request.MemberId, request.ProjectId)
	if err != nil && project.UserRole != types.TEAM_OWNER {
		if err == sql.ErrNoRows {
			http.Error(w, "Team member was not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		}
		return
	}

	if token.Id == request.MemberId || project.UserRole == types.TEAM_OWNER || team_relation.Role == types.TEAM_ADMIN {
		// can delete
		s.db.DeleteTeamRelation(request.MemberId, request.ProjectId)
	} else {
		http.Error(w, "You do not have the role necessary to perform this action.", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdateMemberRole(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		MemberId  uuid.UUID `json:"memberid"`
		ProjectId uuid.UUID `json:"projectid"`
		NewRole   int       `json:"NewRole"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if request.NewRole != types.TEAM_ADMIN && request.NewRole != types.TEAM_DEV && request.NewRole != types.TEAM_VIEW {
		http.Error(w, "Invalide role", http.StatusBadRequest)
		return
	}

	if request.MemberId == token.Id {
		http.Error(w, "You cannot update your own role.", http.StatusBadRequest)
		return
	}

	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		}
		return
	}

	if project.UserRole != types.TEAM_OWNER && project.UserRole != types.TEAM_ADMIN {
		http.Error(w, "You do not have the necessary role to perform this action", http.StatusUnauthorized)
		return
	}

	team_relation, err := s.db.GetTeamRelation(request.MemberId, request.ProjectId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid request", http.StatusBadGateway)
		} else {
			http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		}
		return
	}

	if team_relation.Role == project.UserRole {
		http.Error(w, "You do not have the necessary role to perform this action", http.StatusUnauthorized)
		return
	}

	err = s.db.UpdateUserRole(request.MemberId, request.ProjectId, request.NewRole)
	if err != nil {
		http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetTeamMembers(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	appid, err := uuid.Parse(chi.URLParam(r, "appid"))
	if err != nil {
		http.Error(w, "Invalid app id", http.StatusBadRequest)
		return
	}

	_, err = s.db.GetProject(appid, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		}
		return
	}

	users, err := s.db.GetUsersByProjectId(appid)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		return
	}

	for i := range users {
		users[i].Password = ""
	}

	body, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
