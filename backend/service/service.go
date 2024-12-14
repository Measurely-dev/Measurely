package service

import (
	"Measurely/db"
	"Measurely/types"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/securecookie"
	"github.com/lib/pq"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/customer"
	"github.com/stripe/stripe-go/v79/subscription"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
	"gopkg.in/gomail.v2"
)

type Service struct {
	DB          *db.DB
	scookie     *securecookie.SecureCookie
	dialer      *gomail.Dialer
	connManager *ConnectionManager
	redisClient *redis.Client
	redisCtx    context.Context
	providers   map[string]Provider
}

const (
	defaultProcessRate = 10000
	defaultStorageRate = 10000
	defaultEmailRate   = 10000
)

func New() Service {
	db, err := db.NewPostgres(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalln(err)
	}

	hash_key := []byte(os.Getenv("HASH_KEY"))
	block_key := []byte(os.Getenv("BLOCK_KEY"))
	securecookie := securecookie.New(hash_key, block_key)

	dialer := gomail.NewDialer("smtp.gmail.com", 587, "Info@measurely.dev", os.Getenv("APP_PWD"))
	if dialer == nil {
		log.Fatalln("Failed to create dialer")
	}

	connManager := NewConnectionManager()

	stripe.Key = os.Getenv("STRIPE_SK")

	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		log.Fatalln(err)
	}

	redis_client := redis.NewClient(&redis.Options{
		Addr:     opt.Addr,
		DB:       opt.DB,
		Password: opt.Password,
	})

	redis_ctx := context.Background()
	_, rerr := redis_client.Ping(redis_ctx).Result()
	if rerr != nil {
		log.Fatalln(rerr)
	}

	providers := make(map[string]Provider)
	providers["github"] = Provider{
		UserURL: os.Getenv("GITHUB_USER"),
		Type:    types.GITHUB,
		Config: &oauth2.Config{
			ClientID:     os.Getenv("GITHUB_KEY"),
			ClientSecret: os.Getenv("GITHUB_SECRET"),
			Endpoint:     github.Endpoint,
			RedirectURL:  os.Getenv("URL") + "/callback/github",
			Scopes:       []string{"read:user"},
		},
	}
	providers["google"] = Provider{
		UserURL: os.Getenv("GOOGLE_USER"),
		Type:    types.GOOGLE,
		Config: &oauth2.Config{
			ClientID:     os.Getenv("GOOGLE_KEY"),
			ClientSecret: os.Getenv("GOOGLE_SECRET"),
			Endpoint:     google.Endpoint,
			RedirectURL:  os.Getenv("URL") + "/callback/google",
			Scopes:       []string{"openid", "profile", "email"},
		},
	}

	return Service{
		DB:          db,
		scookie:     securecookie,
		dialer:      dialer,
		connManager: connManager,
		redisClient: redis_client,
		redisCtx:    redis_ctx,
		providers:   providers,
	}
}

func (s *Service) SetupSharedVariables() {
	defaultProcessRate := 10000
	defaultStorageRate := 10000
	defaultEmailRate := 10000

	if _, err := s.redisClient.Get(s.redisCtx, "rate:event").Result(); err == redis.Nil {
		s.redisClient.Set(s.redisCtx, "rate:event", defaultProcessRate, 0)
	}

	if _, err := s.redisClient.Get(s.redisCtx, "rate:storage").Result(); err == redis.Nil {
		s.redisClient.Set(s.redisCtx, "rate:storage", defaultStorageRate, 0)
	}

	if _, err := s.redisClient.Get(s.redisCtx, "rate:email").Result(); err == redis.Nil {
		s.redisClient.Set(s.redisCtx, "rate:email", defaultEmailRate, 0)
	}

	plans, err := s.DB.GetPlans()
	if err != nil && err != sql.ErrNoRows {
		log.Fatalln(err)
	}

	if len(plans) == 0 {
		starter := types.Plan{
			Price:             "",
			Identifier:        "starter",
			Name:              "Starter",
			AppLimit:          10000,
			MetricPerAppLimit: 2,
			TimeFrames:        []int{types.YEAR, types.MONTH},
		}

		plus := types.Plan{
			Price:             "price_1QVJwOKSu0h3NTsFEXJo7ORd",
			Identifier:        "plus",
			Name:              "Plus",
			AppLimit:          5,
			MetricPerAppLimit: 5,
			TimeFrames:        []int{types.YEAR, types.MONTH, types.WEEK, types.DAY, types.HOUR, types.MINUTE, types.SECOND},
		}

		pro := types.Plan{
			Price:             "price_1QVJwGKSu0h3NTsFaIS0vBeF",
			Identifier:        "pro",
			Name:              "Pro",
			AppLimit:          15,
			MetricPerAppLimit: 15,
			TimeFrames:        []int{types.YEAR, types.MONTH, types.WEEK, types.DAY, types.HOUR, types.MINUTE, types.SECOND},
		}

		plans = []types.Plan{starter, plus, pro}

		s.DB.CreatePlan(starter)
		s.DB.CreatePlan(plus)
		s.DB.CreatePlan(pro)
	}

	for _, plan := range plans {
		bytes, err := json.Marshal(plan)
		if err != nil {
			log.Fatalln(err)
		}

		key := fmt.Sprintf("plan:%s", plan.Identifier)
		if err := s.redisClient.Set(s.redisCtx, key, bytes, 0).Err(); err != nil {
			log.Fatalln("Failed to update plans in redis: ", err)
		}
	}
}

func (s *Service) CleanUp() {
	s.DB.Close()
}

func (s *Service) EmailValid(w http.ResponseWriter, r *http.Request) {
	var request EmailValidRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Check if the email is tokenid
	if !isEmailValid(request.Email) {
		http.Error(w, "Intokenid email ", http.StatusBadRequest)
		return
	}

	_, derr := s.DB.GetUserByEmail(request.Email)
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
	var request AuthRequest

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

	// Check if the email and password are tokenid
	if !isEmailValid(strings.ToLower(request.Email)) {
		http.Error(w, "Intokenid email", http.StatusBadRequest)
		return
	}

	if !isPasswordValid(request.Password) {
		http.Error(w, "Your password must have at least 7 characters", http.StatusBadRequest)
		return
	}

	// Check if a user with the chosen email exists
	user, derr := s.DB.GetUserByEmail(strings.ToLower(request.Email))
	if derr == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	providers, err := s.DB.GetProvidersByUserId(user.Id)
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
	is_pwd_tokenid := CheckPasswordHash(request.Password, user.Password)
	if !is_pwd_tokenid {
		http.Error(w, "Intokenid password", http.StatusUnauthorized)
		return
	}

	// create auth cookie
	cookie, err := CreateCookie(&user)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)

	// send email
	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject:     "A new login has been detected",
			Content:     "A new user has logged into your account. If you do not recall having logged into your Measurely dashboard, please update your password immediately.",
			Link:        os.Getenv("ORIGIN") + "/dashboard",
			ButtonTitle: "Update password",
		},
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
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=missing parameters", http.StatusMovedPermanently)
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
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=internal error", http.StatusMovedPermanently)
		return
	}

	providerUser, token, err := CompleteProviderAuth(chosenProvider, code)
	if err != nil {
		log.Print(err)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+err.Error(), http.StatusMovedPermanently)
		return
	}

	var user types.User
	provider, gerr := s.DB.GetProviderByProviderUserId(providerUser.Id, chosenProvider.Type)
	if gerr == sql.ErrNoRows {
		if action == "auth" {
			stripe_params := &stripe.CustomerParams{
				Email: stripe.String(providerUser.Email),
			}

			c, err := customer.New(stripe_params)
			if err != nil {
				log.Println(err)
				http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=internal error", http.StatusMovedPermanently)
				return
			}

			user, err = s.DB.CreateUser(types.User{
				Email:            strings.ToLower(providerUser.Email),
				Password:         "",
				FirstName:        providerUser.Name,
				LastName:         "",
				StripeCustomerId: c.ID,
				CurrentPlan:      "starter",
			})
			if err != nil {
				if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
					http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=An account with the same email already exists", http.StatusMovedPermanently)
				} else {
					http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=internal error", http.StatusMovedPermanently)
				}
				return
			}
		} else if action == "connect" {
			parsedId, err := uuid.Parse(id)
			if err != nil {
				http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=Intokenid user identifier", http.StatusMovedPermanently)
				return
			}
			user, err = s.DB.GetUserById(parsedId)
			if err != nil {
				http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=User not found", http.StatusMovedPermanently)
				return
			}
		}

		provider, err = s.DB.CreateProvider(types.UserProvider{
			UserId:         user.Id,
			Type:           chosenProvider.Type,
			ProviderUserId: providerUser.Id,
		})
		if err != nil {
			log.Println(err)
			http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=internal error", http.StatusMovedPermanently)
			return
		}
	}

	if gerr == nil {
		user, err = s.DB.GetUserById(provider.UserId)
		if err != nil {
			log.Println(err)
			http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=internal error", http.StatusMovedPermanently)
			return
		}
	}

	cookie, err := CreateCookie(&user)
	if err != nil {
		log.Println("error:", err)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error=internal error", http.StatusMovedPermanently)
		return
	}

	http.SetCookie(w, &cookie)
	http.Redirect(w, r, os.Getenv("ORIGIN")+"/dashboard", http.StatusMovedPermanently)
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

	providers, err := s.DB.GetProvidersByUserId(token.Id)
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

		if err := s.DB.UpdateUserPassword(token.Id, hashed_password); err != nil {
			http.Error(w, "Failed to update password", http.StatusInternalServerError)
			return
		}

	}

	for _, provider := range providers {
		if provider.Type == chosenProvider.Type {
			if err := s.DB.DeleteUserProvider(provider.Id); err != nil {
				http.Error(w, "Failed to disconnect provider", http.StatusInternalServerError)
				return
			}
			break
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
	var request RegisterRequest

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

	// Check if the email and password are tokenid
	if !isEmailValid(request.Email) {
		http.Error(w, "Intokenid email", http.StatusBadRequest)
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

	new_user, err := s.DB.CreateUser(types.User{
		Email:            strings.ToLower(request.Email),
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
	cookie, cerr := CreateCookie(&new_user)
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusCreated)

	// send email
	s.ScheduleEmail(SendEmailRequest{
		To: new_user.Email,
		Fields: MailFields{
			Subject:     "Thank you for joining Measurely.",
			Content:     "You can now access your account's dashboard by using the following link.",
			Link:        os.Getenv("ORIGIN") + "/dashboard",
			ButtonTitle: "Access dashboard",
		},
	})
}

func (s *Service) Logout(w http.ResponseWriter, r *http.Request) {
	cookie := DeleteCookie()

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetUser(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	providers, err := s.DB.GetProvidersByUserId(user.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			providers = []types.UserProvider{}
		} else {
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

	resp := GetUserResponse{
		Id:          user.Id,
		Email:       user.Email,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		CurrentPlan: user.CurrentPlan,
		Plan:        user.CurrentPlan,
		Providers:   finalProviders,
	}

	bytes, jerr := json.Marshal(resp)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var request ForgotPasswordRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Check if the email is tokenid
	if !isEmailValid(request.Email) {
		http.Error(w, "Intokenid email ", http.StatusBadRequest)
		return
	}

	// Check if a user with the chosen email exists
	user, derr := s.DB.GetUserByEmail(request.Email)
	if derr == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	var account_recovery types.AccountRecovery
	account_recovery, gerr := s.DB.GetAccountRecoveryByUserId(user.Id)
	if gerr == sql.ErrNoRows {
		tries := 5
		var code string = ""
		var aerr error
		for {
			if tries <= 0 {
				break
			}
			tries -= 1
			code, aerr = GenerateRandomKey()
			if aerr != nil {
				continue
			}

			_, aerr = s.DB.GetAccountRecovery(code)
			if aerr == sql.ErrNoRows {
				break
			}
		}

		if code == "" {
			http.Error(w, "Timeout, please try again later", http.StatusRequestTimeout)
			return
		}

		var cerr error
		account_recovery, cerr = s.DB.CreateAccountRecovery(user.Id, code)
		if cerr != nil {
			log.Println(cerr)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	// Send email
	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject:     "Recover your account",
			Content:     "A request has been made to recover your account. If you do not recall making this request, please update your password immediately.",
			Link:        os.Getenv("ORIGIN") + "/reset?code=" + account_recovery.Code,
			ButtonTitle: "Recover my account",
		},
	})
}

func (s *Service) RecoverAccount(w http.ResponseWriter, r *http.Request) {
	var request RecoverAccountRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// check if the new password is tokenid
	if !isPasswordValid(request.NewPassword) {
		http.Error(w, "Intokenid password", http.StatusBadRequest)
		return
	}

	// fetch the account recovery
	account_recovery, gerr := s.DB.GetAccountRecovery(request.Code)
	if gerr != nil {
		http.Error(w, "Intokenid account recovery link", http.StatusBadRequest)
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
	err := s.DB.UpdateUserPassword(account_recovery.UserId, hashed_password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// delete the account recovery
	derr := s.DB.DeleteAccountRecovery(account_recovery.Code)
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

	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "user not found", http.StatusNotFound)
		} else {

			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}

	// send email
	cerr := s.DB.CreateFeedback(types.Feedback{
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
	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject: "Feedback received",
			Content: "Thank you for your feedback. We will try to improve our service as soon as possible.",
		},
	})
	s.ScheduleEmail(SendEmailRequest{
		To: "info@measurely.dev",
		Fields: MailFields{
			Subject: "Feedback Received from " + user.Email,
			Content: request.Content,
		},
	})
}

func (s *Service) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get the user
	user, err := s.DB.GetUserById(token.Id)
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

	providers, err := s.DB.GetProvidersByUserId(token.Id)
	if err != nil {
		if err != sql.ErrNoRows {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
	} else {
		for _, provider := range providers {
			if err := s.DB.DeleteUserProvider(provider.Id); err != nil {
				http.Error(w, "Failed to disconnect provider", http.StatusInternalServerError)
				return
			}
		}
	}

	// Delete the user
	err = s.DB.DeleteUser(user.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject: "We're sorry to see you go!",
			Content: "Your account has been successfully deleted.",
		},
	})

	// logout
	cookie := DeleteCookie()
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
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

	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var emailchange types.EmailChangeRequest
	emailchange, gerr := s.DB.GetEmailChangeRequestByUserId(token.Id, strings.ToLower(request.NewEmail))
	if gerr == sql.ErrNoRows {
		tries := 5
		var code string = ""
		var aerr error
		for {
			if tries <= 0 {
				break
			}
			tries -= 1
			code, aerr = GenerateRandomKey()
			if aerr != nil {
				continue
			}

			_, aerr = s.DB.GetEmailChangeRequest(code)
			if aerr == sql.ErrNoRows {
				break
			}
		}

		if code == "" {
			http.Error(w, "Timeout, please try again later", http.StatusRequestTimeout)
			return
		}

		var cerr error
		emailchange, cerr = s.DB.CreateEmailChangeRequest(token.Id, code, strings.ToLower(request.NewEmail))
		if cerr != nil {
			log.Println(cerr)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)

	// Send email
	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject:     "Change your email",
			Content:     "A request has been made to change your email. If you do not recall making this request, please update your password immediately.",
			Link:        os.Getenv("ORIGIN") + "/change-email?code=" + emailchange.Code,
			ButtonTitle: "Change my email",
		},
	})
}

func (s *Service) UpdateUserEmail(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Code string `json:"code"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// fetch the account recovery
	emailchange, gerr := s.DB.GetEmailChangeRequest(request.Code)
	if gerr != nil {
		http.Error(w, "Intokenid email change link", http.StatusBadRequest)
		return
	}

	user, err := s.DB.GetUserById(emailchange.UserId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error", http.StatusInternalServerError)
		}
		return
	}

	// update the user password
	if err = s.DB.UpdateUserEmail(emailchange.UserId, emailchange.NewEmail); err != nil {
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
		s.DB.UpdateUserEmail(user.Id, user.Email)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// delete the account recovery
	if err := s.DB.DeleteEmailChangeRequest(emailchange.Code); err != nil {
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

	if err := s.DB.UpdateUserFirstAndLastName(token.Id, request.FirstName, request.LastName); err != nil {
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

	user, err := s.DB.GetUserById(token.Id)
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

	if err := s.DB.UpdateUserPassword(token.Id, hashed); err != nil {
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

	var request CreateApplicationRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

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
	_, gerr := s.DB.GetApplicationByName(token.Id, request.Name)
	if gerr == nil {
		http.Error(w, "Application with this name already exists", http.StatusBadRequest)
		return
	}

	// Get user
	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		return
	}

	plan, _ := s.GetPlan(user.CurrentPlan)
	if plan.AppLimit >= 0 {

		// Get application count
		count, cerr := s.DB.GetApplicationCountByUser(token.Id)
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

		_, aerr = s.DB.GetApplicationByApi(api_key)
		if aerr != nil {
			break
		}
	}

	if api_key == "" {
		http.Error(w, "Internal error, please try again later", http.StatusRequestTimeout)
		return
	}

	new_app, err := s.DB.CreateApplication(types.Application{
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
}

func (s *Service) RandomizeApiKey(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request RandomizeApiKeyRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, gerr := s.DB.GetApplication(request.AppId, token.Id)
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

		_, aerr = s.DB.GetApplicationByApi(api_key)
		if aerr != nil {
			break
		}
	}

	if api_key == "" {
		http.Error(w, "Internal error, please try again later", http.StatusRequestTimeout)
		return
	}

	// Update the app's api key
	err := s.DB.UpdateApplicationApiKey(request.AppId, token.Id, api_key)
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

	var request DeleteApplicationRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Delete the application
	err := s.DB.DeleteApplication(request.AppId, token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
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

	if err := s.DB.UpdateApplicationName(request.AppId, token.Id, request.NewName); err != nil {
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
	apps, err := s.DB.GetApplications(token.Id)
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

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) CreateGroup(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request CreateGroupRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	match, reerr := regexp.MatchString(`^[a-zA-Z0-9 ]+$`, request.Name)
	if reerr != nil {
		http.Error(w, reerr.Error(), http.StatusBadRequest)
		return
	}
	if !match {
		http.Error(w, "You can only use letters, numbers and underscores", http.StatusBadRequest)
		return
	}

	if request.Type != types.BASE && request.Type != types.DUAL {
		http.Error(w, "Intokenid metric type", http.StatusBadRequest)
		return
	}

	if request.Type == types.BASE && len(request.Metrics) != 1 {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	if request.Type == types.DUAL && len(request.Metrics) != 2 {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Get the application
	app, err := s.DB.GetApplication(request.AppId, token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get Metric Count
	count, err := s.DB.GetMetricGroupCount(request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get the user
	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	plan, _ := s.GetPlan(user.CurrentPlan)

	log.Println(count, plan.MetricPerAppLimit)
	if count >= plan.MetricPerAppLimit {
		http.Error(w, "You have reached the limit of metrics for this app", http.StatusUnauthorized)
		return
	}

	// Create the metric
	group, err := s.DB.CreateMetricGroup(types.MetricGroup{
		Name:  request.Name,
		AppId: request.AppId,
		Type:  request.Type,
	})
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	metricsResp := MetricGroupResponse{
		MetricGroup: group,
	}

	for _, metric := range request.Metrics {
		created_metric, err := s.DB.CreateMetric(types.Metric{
			Name:    metric,
			GroupId: group.Id,
			Total:   request.BaseValue,
		})
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		metricsResp.Metrics = append(metricsResp.Metrics, created_metric)
	}

	bytes, jerr := json.Marshal(metricsResp)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	// remove the redis cache
	s.redisClient.Del(s.redisCtx, app.ApiKey)

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request DeleteGroupRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Delete the metric
	err = s.DB.DeleteMetricGroup(request.GroupId, request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetMetricGroups(w http.ResponseWriter, r *http.Request) {
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
	_, err := s.DB.GetApplication(appid, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Fetch Metrics
	metrics, err := s.DB.GetMetricGroups(appid)
	if err == sql.ErrNoRows {
		metrics = []types.MetricGroup{}
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	metricsResp := []MetricGroupResponse{}

	for _, metric := range metrics {
		subs, err := s.DB.GetMetrics(metric.Id)
		if err != nil && err != sql.ErrNoRows {
			log.Println(err)
		}

		metricsResp = append(metricsResp, MetricGroupResponse{
			MetricGroup: metric,
			Metrics:     subs,
		})
	}

	bytes, jerr := json.Marshal(metricsResp)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request UpdateGroupRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Update the metric
	err = s.DB.UpdateMetricGroup(request.GroupId, request.AppId, request.Name)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdateMetric(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request UpdateMetricRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, token.Id)
	if err == sql.ErrNoRows {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get the metric group
	_, err = s.DB.GetMetricGroup(request.Groupid, request.AppId)
	if err == sql.ErrNoRows {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get the metric group
	err = s.DB.UpdateMetric(request.MetricId, request.Groupid, request.Name)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// func (s *Service) ToggleMetric(w http.ResponseWriter, r *http.Request) {
// 	token, ok := r.Context().Value(types.TOKEN).(types.Token)
// 	if !ok {
// 		http.Error(w, "Internal error", http.StatusInternalServerError)
// 		return
// 	}

// 	var request ToggleMetricRequest

// 	// Try to unmarshal the request body
// 	jerr := json.NewDecoder(r.Body).Decode(&request)
// 	if jerr != nil {
// 		http.Error(w, jerr.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	// Get the application
// 	_, err := s.DB.GetApplication(request.AppId, token)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Internal error", http.StatusInternalServerError)
// 		return
// 	}

// 	if request.Enabled {
// 		// Get the user
// 		user, gerr := s.DB.GetUserById(token)
// 		if gerr != nil {
// 			log.Println(gerr)
// 			http.Error(w, "Internal error", http.StatusInternalServerError)
// 			return
// 		}

// 		count, err := s.DB.GetMetricGroupCount(request.AppId)
// 		if err != nil {
// 			log.Println(err)
// 			http.Error(w, "Internal error", http.StatusInternalServerError)
// 			return
// 		}

// 		plan, _ := s.GetPlan(user.CurrentPlan)
// 		if count >= plan.MetricPerAppLimit {
// 			http.Error(w, "You have reached your limit", http.StatusBadRequest)
// 			return
// 		}
// 	}

// 	// Toggle the metric
// 	err = s.DB.ToggleMetricGroup(request.MetricId, request.AppId, request.Enabled)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Internal error", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// }

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

		if cookie.Expires.Sub(token.CreationDate) <= 12*time.Hour {
			new_cookie, err := CreateCookie(&types.User{Id: token.Id, Email: token.Email})
			if err == nil {
				http.SetCookie(w, &new_cookie)
			}
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Service) UpdateRates(w http.ResponseWriter, r *http.Request) {
	secret := os.Getenv("UPGRADE_SECRET")

	var request UpgradeRateRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if request.Secret != secret {
		http.Error(w, "Intokenid Request", http.StatusBadRequest)
		return
	}

	newRate := request.NewRate

	// Update global variables
	key := fmt.Sprintf("rate:%s", request.Name)
	s.redisClient.Set(s.redisCtx, key, newRate, 0)

	w.Write([]byte("Successfully changed the rate"))
	w.WriteHeader(http.StatusOK)
}

func (s *Service) UpdatePlans(w http.ResponseWriter, r *http.Request) {
	secret := os.Getenv("UPGRADE_SECRET")

	var request UpdatePlanRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if request.Secret != secret {
		http.Error(w, "Intokenid Request", http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("plan:%s", request.Name)

	// Get the plan
	_, exists := s.GetPlan(request.Name)
	if !exists {
		request.Plan.Identifier = request.Name
		if err := s.DB.CreatePlan(request.Plan); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		if err := s.DB.UpdatePlan(request.Name, request.Plan); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	bytes, err := json.Marshal(request.Plan)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.redisClient.Set(s.redisCtx, key, bytes, 0)

	w.Write([]byte("Successfully updated the plan."))
	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetRates(w http.ResponseWriter, r *http.Request) {
	secret := os.Getenv("UPGRADE_SECRET")

	var request GetRates

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if request.Secret != secret {
		http.Error(w, "Intokenid Request", http.StatusBadRequest)
		return
	}

	keys, err := s.redisClient.Keys(s.redisCtx, "rate:*").Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rates := make(map[string]float64)
	for _, key := range keys {
		rate, err := s.redisClient.Get(s.redisCtx, key).Float64()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		rates[strings.TrimPrefix(key, "rate:")] = rate
	}

	bytes, jerr := json.Marshal(rates)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) GetPlans(w http.ResponseWriter, r *http.Request) {
	secret := os.Getenv("UPGRADE_SECRET")

	var request GetPlans

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if request.Secret != secret {
		http.Error(w, "Intokenid Request", http.StatusBadRequest)
		return
	}

	keys, err := s.redisClient.Keys(s.redisCtx, "plan:*").Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rates := make(map[string]types.Plan)
	for _, key := range keys {
		token, err := s.redisClient.Get(s.redisCtx, key).Result()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var plan types.Plan
		err = json.Unmarshal([]byte(token), &plan)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		rates[strings.TrimPrefix(key, "plan:")] = plan
	}

	bytes, jerr := json.Marshal(rates)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}
