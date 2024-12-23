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
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/customer"
	"github.com/stripe/stripe-go/v79/subscription"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

type MetricToKeyCache struct {
	key         string
	metric_type int
	total       int64
	user_id     uuid.UUID
	expiry      time.Time
}

type RateLimit struct {
	current int
	max     int
	expiry  time.Time
}

type UserPlanCache struct {
	plan   types.Plan
	expiry time.Time
}

type Cache struct {
	plans             sync.Map
	usersPlan         sync.Map
	metricIdToApiKeys sync.Map
	ratelimits        sync.Map
}

type Service struct {
	db        *db.DB
	email     *email.Email
	providers map[string]Provider
	cache     Cache
}

func New() Service {
	db, err := db.NewPostgres(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalln(err)
	}

	email, err := email.NewEmail()
	if err != nil {
		log.Fatalln(err)
	}

	stripe.Key = os.Getenv("STRIPE_SK")

	providers := make(map[string]Provider)
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

	return Service{
		db:        db,
		email:     email,
		providers: providers,
		cache: Cache{
			plans:             sync.Map{},
			usersPlan:         sync.Map{},
			metricIdToApiKeys: sync.Map{},
			ratelimits:        sync.Map{},
		},
	}
}

func (s *Service) SetupBasicPlans() {
	s.GetPlan("starter")
	s.GetPlan("plus")
	s.GetPlan("pro")
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
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	// Check if the email is valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email ", http.StatusBadRequest)
		return
	}

	_, derr := s.db.GetUserByEmail(request.Email)
	if request.Type == 0 {
		if derr == sql.ErrNoRows {
			http.Error(w, "No user account uses this email address", http.StatusNotFound)
			return
		}
	} else if request.Type == 1 {
		if derr != sql.ErrNoRows {
			http.Error(w, "Email address already used", http.StatusNotFound)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) IsConnected(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	if strings.Contains(request.Password, " ") {
		http.Error(w, "The password cannot contain spaces", http.StatusBadRequest)
		return
	}

	// Check if the email and password are valid
	if !isEmailValid(strings.ToLower(request.Email)) {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}

	if !isPasswordValid(request.Password) {
		http.Error(w, "Your password must have at least 7 characters", http.StatusBadRequest)
		return
	}

	// Check if a user with the chosen email exists
	user, err := s.db.GetUserByEmail(strings.ToLower(request.Email))
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Println(err)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		return
	}

	providers, err := s.db.GetProvidersByUserId(user.Id)
	if err != nil {
		if err != sql.ErrNoRows {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
	}

	if len(providers) > 0 {
		http.Error(w, "This account has been registered with a provider", http.StatusUnauthorized)
		return
	}

	// Check if the password is correct
	is_valid := CheckPasswordHash(request.Password, user.Password)
	if !is_valid {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// create auth cookie
	cookie, err := CreateCookie(&user, w)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)

	// send email
	go s.email.SendEmail(email.MailFields{
		To:          user.Email,
		Subject:     "A new login has been detected",
		Content:     "A new user has logged into your account. If you do not recall having logged into your Measurely dashboard, please update your password immediately.",
		Link:        GetOrigin() + "/dashboard",
		ButtonTitle: "Update password",
	})
}

func (s *Service) Oauth(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	state := r.URL.Query().Get("state")

	provider, exists := s.providers[providerName]
	if !exists {
		fmt.Println("error")
		http.Error(w, "Invalid provider", http.StatusBadRequest)
		return
	}

	url := BeginProviderAuth(provider, state)

	SetupCacheControl(w, 10)
	http.Redirect(w, r, url, http.StatusMovedPermanently)
}

func (s *Service) Callback(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	code := r.URL.Query().Get("code")

	state := r.URL.Query().Get("state")

	var action string
	var id string
	splitted := strings.Split(state, ".")

	if len(splitted) == 0 {
		http.Redirect(w, r, GetOrigin()+"/sign-in?error=missing parameters", http.StatusMovedPermanently)
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
		http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusMovedPermanently)
		return
	}

	providerUser, _, err := CompleteProviderAuth(chosenProvider, code)
	if err != nil {
		log.Print(err)
		http.Redirect(w, r, GetOrigin()+"/sign-in?error="+err.Error(), http.StatusMovedPermanently)
		return
	}

	var user types.User
	provider, gerr := s.db.GetProviderByProviderUserId(providerUser.Id, chosenProvider.Type)
	if gerr == sql.ErrNoRows {
		if action == "auth" {
			stripe_params := &stripe.CustomerParams{
				Email: stripe.String(providerUser.Email),
			}

			c, err := customer.New(stripe_params)
			if err != nil {
				log.Println(err)
				http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusMovedPermanently)
				return
			}

			user, err = s.db.CreateUser(types.User{
				Email:            strings.ToLower(providerUser.Email),
				Password:         "",
				FirstName:        providerUser.Name,
				LastName:         "",
				StripeCustomerId: c.ID,
				CurrentPlan:      "starter",
			})
			if err != nil {
				if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
					http.Redirect(w, r, GetOrigin()+"/sign-in?error=An account with the same email already exists", http.StatusMovedPermanently)
				} else {
					http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusMovedPermanently)
				}
				return
			}

			go SendMeasurelyMetricEvent("users", 1)
			go SendMeasurelyMetricEvent("starter", 1)

		} else if action == "connect" {
			parsedId, err := uuid.Parse(id)
			if err != nil {
				http.Redirect(w, r, GetOrigin()+"/sign-in?error=Invalid user identifier", http.StatusMovedPermanently)
				return
			}
			user, err = s.db.GetUserById(parsedId)
			if err != nil {
				log.Println(err)
				http.Redirect(w, r, GetOrigin()+"/sign-in?error=User not found", http.StatusMovedPermanently)
				return
			}
		}

		provider, err = s.db.CreateProvider(types.UserProvider{
			UserId:         user.Id,
			Type:           chosenProvider.Type,
			ProviderUserId: providerUser.Id,
		})
		if err != nil {
			log.Println(err)
			http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusMovedPermanently)
			return
		}
	}

	if gerr == nil {
		user, err = s.db.GetUserById(provider.UserId)
		if err != nil {
			log.Println(err)
			http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusMovedPermanently)
			return
		}
	}

	cookie, err := CreateCookie(&user, w)
	if err != nil {
		log.Println("error:", err)
		http.Redirect(w, r, GetOrigin()+"/sign-in?error=internal error", http.StatusMovedPermanently)
		return
	}

	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	http.Redirect(w, r, GetOrigin()+"/dashboard", http.StatusMovedPermanently)
}

func (s *Service) DisconnectProvider(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	chosenProvider, exists := s.providers[providerName]
	if !exists {
		http.Error(w, "The provider does not exists", http.StatusNotFound)
		return
	}

	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	providers, err := s.db.GetProvidersByUserId(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			providers = []types.UserProvider{}
		} else {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
	}

	if len(providers) == 1 {
		if !isPasswordValid(request.Password) {
			http.Error(w, "Your password must have at least 7 characters", http.StatusBadRequest)
			return
		}
		hashed_password, err := HashPassword(request.Password)
		if err != nil {
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		if err := s.db.UpdateUserPassword(token.Id, hashed_password); err != nil {
			http.Error(w, "Failed to update password", http.StatusInternalServerError)
			return
		}

	}

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
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if strings.Contains(request.Password, " ") {
		http.Error(w, "The password cannot contain spaces", http.StatusBadRequest)
		return
	}

	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	request.FirstName = strings.TrimSpace(request.FirstName)
	request.LastName = strings.TrimSpace(request.LastName)

	// Check if the email and password are valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}
	if !isPasswordValid(request.Password) {
		http.Error(w, "Your password must have at least 7 characters", http.StatusBadRequest)
		return
	}

	// Create new user
	hashed_password, herr := HashPassword(request.Password)
	if herr != nil {
		log.Println(herr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	stripe_params := &stripe.CustomerParams{
		Email: stripe.String(request.Email),
	}

	c, err := customer.New(stripe_params)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
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
			http.Error(w, "Email already exists", http.StatusBadRequest)
		} else {
			log.Println(err)
			http.Error(w, "internal error", http.StatusInternalServerError)
		}

		return
	}

	// create auth cookie
	cookie, cerr := CreateCookie(&new_user, w)
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusCreated)

	go SendMeasurelyMetricEvent("users", 1)
	go SendMeasurelyMetricEvent("starter", 1)

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
		log.Println("Failed to get user token")
		http.Error(w, "Failed to retrieve user session", http.StatusInternalServerError)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			cookie := DeleteCookie()
			SetupCacheControl(w, 0)
			http.SetCookie(w, &cookie)
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Println("Failed to get user by id: ", err)
			http.Error(w, "Failed to load the user data", http.StatusInternalServerError)
		}
		return
	}

	providers, err := s.db.GetProvidersByUserId(user.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			providers = []types.UserProvider{}
		} else {
			log.Println("Failed to get user providers by user id :", err)
			http.Error(w, "internal error", http.StatusInternalServerError)
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

	plan, exists := s.GetPlan(user.CurrentPlan)
	if !exists {
		http.Error(w, "Plan not found", http.StatusNotFound)
		return
	}

	plan.Price = ""
	response := struct {
		Id        uuid.UUID            `json:"id"`
		Email     string               `json:"email"`
		FirstName string               `json:"firstname"`
		LastName  string               `json:"lastname"`
		Plan      types.Plan           `json:"plan"`
		Providers []types.UserProvider `json:"providers"`
	}{
		Id:        user.Id,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Plan:      plan,
		Providers: finalProviders,
	}

	bytes, jerr := json.Marshal(response)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusInternalServerError)
		return
	}

	SetupCacheControl(w, 15)
	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email string `json:"email"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	// Check if the email is valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email ", http.StatusBadRequest)
		return
	}

	// Check if a user with the chosen email exists
	user, derr := s.db.GetUserByEmail(request.Email)
	if derr == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	account_recovery, err := s.db.GetAccountRecoveryByUserId(user.Id)
	if err == sql.ErrNoRows {
		account_recovery, err = s.db.CreateAccountRecovery(user.Id)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
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
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// check if the new password is valid
	if !isPasswordValid(request.NewPassword) {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	// fetch the account recovery
	account_recovery, gerr := s.db.GetAccountRecovery(request.RequestId)
	if gerr != nil {
		http.Error(w, "Invalid account recovery link", http.StatusBadRequest)
		return
	}

	// hash the new password
	hashed_password, herr := HashPassword(request.NewPassword)
	if herr != nil {
		log.Println(herr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// update the user password
	err := s.db.UpdateUserPassword(account_recovery.UserId, hashed_password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// delete the account recovery
	derr := s.db.DeleteAccountRecovery(account_recovery.Id)
	if derr != nil {
		log.Println(derr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) SendFeedback(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		Content string `json:"content"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if len(request.Content) > 1000 {
		http.Error(w, "Content too long", http.StatusBadRequest)
		return
	}

	if len(request.Content) == 0 {
		http.Error(w, "Please provide content", http.StatusBadRequest)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "user not found", http.StatusNotFound)
		} else {
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}

	// send email
	cerr := s.db.CreateFeedback(types.Feedback{
		Email:   user.Email,
		Content: request.Content,
		Date:    time.Now(),
	})
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	go SendMeasurelyMetricEvent("feedbacks", 1)

	go s.email.SendEmail(email.MailFields{
		To:      user.Email,
		Subject: "Feedback received",
		Content: "Thank you for your feedback. We will try to improve our service as soon as possible.",
	})
	go s.email.SendEmail(email.MailFields{
		To:      "info@measurely.dev",
		Subject: "Feedback Received from " + user.Email,
		Content: request.Content,
	})
}

func (s *Service) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get the user
	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if user.CurrentPlan != "starter" {
		result := subscription.List(&stripe.SubscriptionListParams{
			Customer: stripe.String(user.StripeCustomerId),
		})

		subscriptions := result.SubscriptionList()

		if subscriptions == nil {
			http.Error(w, "no subscriptions found", http.StatusBadRequest)
			return
		}

		if len(subscriptions.Data) == 0 {
			http.Error(w, "no subscriptions found", http.StatusBadRequest)
			return
		}

		_, serr := subscription.Cancel(subscriptions.Data[0].ID, nil)
		if serr != nil {
			log.Println(serr)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
	}

	// Delete stripe customer
	_, cerr := customer.Del(user.StripeCustomerId, nil)
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	providers, err := s.db.GetProvidersByUserId(token.Id)
	if err != nil {
		if err != sql.ErrNoRows {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
	} else {
		for _, provider := range providers {
			if err := s.db.DeleteUserProvider(provider.Id); err != nil {
				http.Error(w, "Failed to disconnect provider", http.StatusInternalServerError)
				return
			}
		}
	}

	// Delete the user
	err = s.db.DeleteUser(user.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	go s.email.SendEmail(email.MailFields{
		To:      user.Email,
		Subject: "We're sorry to see you go!",
		Content: "Your account has been successfully deleted.",
	})

	// logout
	cookie := DeleteCookie()
	SetupCacheControl(w, 0)
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)

	go SendMeasurelyMetricEvent("users", -1)
}

func (s *Service) RequestEmailChange(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
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
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	emailchange, err := s.db.GetEmailChangeRequestByUserId(token.Id, request.NewEmail)
	if err == sql.ErrNoRows {
		emailchange, err = s.db.CreateEmailChangeRequest(token.Id, request.NewEmail)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	// Send email
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

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// fetch the account recovery
	emailchange, gerr := s.db.GetEmailChangeRequest(request.RequestId)
	if gerr != nil {
		http.Error(w, "Invalid email change link", http.StatusBadRequest)
		return
	}

	user, err := s.db.GetUserById(emailchange.UserId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error", http.StatusInternalServerError)
		}
		return
	}

	// update the user password
	if err = s.db.UpdateUserEmail(emailchange.UserId, emailchange.NewEmail); err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	params := stripe.CustomerParams{
		Email: stripe.String(emailchange.NewEmail),
	}
	_, err = customer.Update(user.StripeCustomerId, &params)
	if err != nil {
		log.Println("Failed to update stripe customer email")
		s.db.UpdateUserEmail(user.Id, user.Email)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// delete the account recovery
	if err := s.db.DeleteEmailChangeRequest(emailchange.Id); err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdateFirstAndLastName(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
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
		http.Error(w, "Failed to update the user's first name and/or last name", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
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
		http.Error(w, "Your password must have at least 7 characters", http.StatusBadRequest)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	match := CheckPasswordHash(request.OldPassword, user.Password)
	if !match {
		http.Error(w, "The entered password is incorrect", http.StatusUnauthorized)
		return
	}

	hashed, err := HashPassword(request.NewPassword)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if err := s.db.UpdateUserPassword(token.Id, hashed); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) CreateApplication(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		Name string `json:"name"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	request.Name = strings.TrimSpace(request.Name)

	match, reerr := regexp.MatchString(`^[a-zA-Z0-9_ ]+$`, request.Name)
	if reerr != nil {
		http.Error(w, reerr.Error(), http.StatusBadRequest)
		return
	}
	if !match {
		http.Error(w, "You can only use letters, numbers and underscores", http.StatusBadRequest)
		return
	}

	// Fetch application
	_, err := s.db.GetApplicationByName(token.Id, request.Name)
	if err == nil {
		http.Error(w, "Application with this name already exists", http.StatusBadRequest)
		return
	}

	plan, _ := s.GetUserPlan(token.Id)
	if plan.AppLimit >= 0 {

		// Get application count
		count, cerr := s.db.GetApplicationCountByUser(token.Id)
		if cerr != nil {
			log.Println(cerr)
			http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
			return
		}

		if count >= plan.AppLimit {
			http.Error(w, "You have reached your application limit", http.StatusUnauthorized)
			return
		}

	}

	// Create the application
	tries := 5
	var api_key string = ""
	var aerr error
	for {
		if tries <= 0 {
			break
		}
		tries -= 1
		api_key, aerr = GenerateRandomKey()
		if aerr != nil {
			continue
		}

		_, aerr = s.db.GetApplicationByApi(api_key)
		if aerr != nil {
			break
		}
	}

	if api_key == "" {
		http.Error(w, "Internal error, please try again later", http.StatusRequestTimeout)
		return
	}

	new_app, err := s.db.CreateApplication(types.Application{
		ApiKey: api_key,
		Name:   request.Name,
		UserId: token.Id,
	})
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(new_app)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")

	go SendMeasurelyMetricEvent("apps", 1)
}

func (s *Service) RandomizeApiKey(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		AppId uuid.UUID `json:"appid"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, gerr := s.db.GetApplication(request.AppId, token.Id)
	if gerr != nil {
		log.Println(gerr)
		http.Error(w, "Application does not exist.", http.StatusNotFound)
		return
	}

	tries := 5
	var api_key string = ""
	var aerr error
	for {
		if tries <= 0 {
			break
		}
		tries -= 1
		api_key, aerr = GenerateRandomKey()
		if aerr != nil {
			continue
		}

		_, aerr = s.db.GetApplicationByApi(api_key)
		if aerr != nil {
			break
		}
	}

	if api_key == "" {
		http.Error(w, "Internal error, please try again later", http.StatusRequestTimeout)
		return
	}

	// Update the app's api key
	err := s.db.UpdateApplicationApiKey(request.AppId, token.Id, api_key)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(api_key))
	w.WriteHeader(http.StatusOK)
}

func (s *Service) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		AppId uuid.UUID `json:"appid"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Delete the application
	err := s.db.DeleteApplication(request.AppId, token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	go SendMeasurelyMetricEvent("apps", -1)
}

func (s *Service) UpdateApplicationName(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		NewName string    `json:"new_name"`
		AppId   uuid.UUID `json:"app_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request.NewName = strings.TrimSpace(request.NewName)

	if err := s.db.UpdateApplicationName(request.AppId, token.Id, request.NewName); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "The application was not found", http.StatusBadRequest)
			return

		} else {
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetApplications(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Fetch Applications
	apps, err := s.db.GetApplications(token.Id)
	if err == sql.ErrNoRows {
		apps = []types.Application{}
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(apps)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	SetupCacheControl(w, 15)
	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) CreateMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		Name      string    `json:"name"`
		AppId     uuid.UUID `json:"appid"`
		Type      int       `json:"type"`
		BaseValue int64     `json:"basevalue"`
		NamePos   string    `json:"namepos"`
		NameNeg   string    `json:"nameneg"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.NamePos = strings.TrimSpace(request.NamePos)
	request.NameNeg = strings.TrimSpace(request.NameNeg)

	match, reerr := regexp.MatchString(`^[a-zA-Z0-9 ]+$`, request.Name)
	if reerr != nil {
		http.Error(w, reerr.Error(), http.StatusBadRequest)
		return
	}
	if !match {
		http.Error(w, "You can only use letters, numbers and underscores", http.StatusBadRequest)
		return
	}

	if request.Type != types.BASE_METRIC && request.Type != types.DUAL_METRIC {
		http.Error(w, "Invalid metric type", http.StatusBadRequest)
		return
	}

	if request.BaseValue < 0 && request.Type == types.BASE_METRIC {
		http.Error(w, "The base value cannot be negative", http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.db.GetApplication(request.AppId, token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get Metric Count
	count, err := s.db.GetMetricsCount(request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	plan, _ := s.GetUserPlan(token.Id)

	if count >= plan.MetricPerAppLimit {
		http.Error(w, "You have reached the limit of metrics for this app", http.StatusUnauthorized)
		return
	}

	// Create the metric
	metric, err := s.db.CreateMetric(types.Metric{
		Name:    request.Name,
		AppId:   request.AppId,
		Type:    request.Type,
		NamePos: request.NamePos,
		NameNeg: request.NameNeg,
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, "A metric with the same name already exists", http.StatusBadRequest)
		} else {
			log.Println(err)
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}

	if request.BaseValue != 0 {
		app, err := s.db.GetApplication(request.AppId, token.Id)
		if err == nil {
			data := map[string]interface{}{
				"value": request.BaseValue,
			}
			jsonData, err := json.Marshal(data)
			if err == nil {
				req, err := http.NewRequest("POST", GetURL()+"/event/"+app.ApiKey+"/"+metric.Id.String(), bytes.NewBuffer(jsonData))
				if err == nil {
					resp, err := http.DefaultClient.Do(req)
					if err == nil && resp.StatusCode == 200 {
						metric.Total = request.BaseValue
					}
				}
			}
		}
	}

	bytes, jerr := json.Marshal(metric)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	SetupCacheControl(w, 5)
	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")

	go SendMeasurelyMetricEvent("metrics", 1)
}

func (s *Service) DeleteMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		MetricId uuid.UUID `json:"metricid"`
		AppId    uuid.UUID `json:"appid"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.db.GetApplication(request.AppId, token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Delete the metric
	err = s.db.DeleteMetric(request.MetricId, request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	s.cache.metricIdToApiKeys.Delete(request.MetricId)

	w.WriteHeader(http.StatusOK)

	go SendMeasurelyMetricEvent("metrics", -1)
}

func (s *Service) GetMetrics(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	appid, perr := uuid.Parse(r.URL.Query().Get("appid"))
	if perr != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Get application
	_, err := s.db.GetApplication(appid, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Fetch Metrics
	metrics, err := s.db.GetMetrics(appid)
	if err == sql.ErrNoRows {
		metrics = []types.Metric{}
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(metrics)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	SetupCacheControl(w, 5)
	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) UpdateMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		AppId    uuid.UUID `json:"appid"`
		MetricId uuid.UUID `json:"metricid"`
		Name     string    `json:"name"`
		NamePos  string    `json:"namepos"`
		NameNeg  string    `json:"nameneg"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.NamePos = strings.TrimSpace(request.NamePos)
	request.NameNeg = strings.TrimSpace(request.NameNeg)

	// Get the application
	_, err := s.db.GetApplication(request.AppId, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Update the metric
	err = s.db.UpdateMetric(request.MetricId, request.AppId, request.Name, request.NamePos, request.NameNeg)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) AuthentificatedMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("measurely-session")
		if err == http.ErrNoCookie {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token, err := VerifyToken(cookie.Value)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), types.TOKEN, token)

		if cookie.Expires.Sub(time.Now().UTC()) <= 12*time.Hour {
			new_cookie, err := CreateCookie(&types.User{Id: token.Id, Email: token.Email}, w)

			if err == nil {
				http.SetCookie(w, &new_cookie)
			}

			SetupCacheControl(w, 0)
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// TODO: update this function
// func (s *Service) UpdatePlans(w http.ResponseWriter, r *http.Request) {
// 	secret := os.Getenv("UPGRADE_SECRET")
//
// 	var request UpdatePlanRequest
//
// 	// Try to unmarshal the request body
// 	jerr := json.NewDecoder(r.Body).Decode(&request)
// 	if jerr != nil {
// 		http.Error(w, jerr.Error(), http.StatusBadRequest)
// 		return
// 	}
//
// 	if request.Secret != secret {
// 		http.Error(w, "Invalid request", http.StatusBadRequest)
// 		return
// 	}
//
// 	key := fmt.Sprintf("plan:%s", request.Name)
//
// 	// Get the plan
// 	_, exists := s.GetPlan(request.Name)
// 	if !exists {
// 		request.Plan.Identifier = request.Name
// 		if err := s.db.CreatePlan(request.Plan); err != nil {
// 			http.Error(w, err.Error(), http.StatusInternalServerError)
// 			return
// 		}
// 	} else {
// 		if err := s.db.UpdatePlan(request.Name, request.Plan); err != nil {
// 			http.Error(w, err.Error(), http.StatusInternalServerError)
// 			return
// 		}
// 	}
//
// 	bytes, err := json.Marshal(request.Plan)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}
//
// 	w.Write([]byte("Successfully updated the plan."))
// 	w.WriteHeader(http.StatusOK)
// }

// func (s *Service) GetPlans(w http.ResponseWriter, r *http.Request) {
// 	secret := os.Getenv("UPGRADE_SECRET")
//
// 	var request GetPlans
//
// 	// Try to unmarshal the request body
// 	jerr := json.NewDecoder(r.Body).Decode(&request)
// 	if jerr != nil {
// 		http.Error(w, jerr.Error(), http.StatusBadRequest)
// 		return
// 	}
//
// 	if request.Secret != secret {
// 		http.Error(w, "Invalid Request", http.StatusBadRequest)
// 		return
// 	}
//
// 	keys, err := s.redisClient.Keys(s.redisCtx, "plan:*").Result()
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
//
// 	rates := make(map[string]types.Plan)
// 	for _, key := range keys {
// 		token, err := s.redisClient.Get(s.redisCtx, key).Result()
// 		if err != nil {
// 			http.Error(w, err.Error(), http.StatusInternalServerError)
// 			return
// 		}
//
// 		var plan types.Plan
// 		err = json.Unmarshal([]byte(token), &plan)
// 		if err != nil {
// 			http.Error(w, err.Error(), http.StatusInternalServerError)
// 			return
// 		}
// 		rates[strings.TrimPrefix(key, "plan:")] = plan
// 	}
//
// 	bytes, jerr := json.Marshal(rates)
// 	if jerr != nil {
// 		http.Error(w, jerr.Error(), http.StatusContinue)
// 		return
// 	}
//
// 	w.Write(bytes)
// 	w.Header().Set("Content-Type", "application/json")
// }
