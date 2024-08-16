package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"Measurely/db"
	"Measurely/types"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/securecookie"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/customer"
	"github.com/stripe/stripe-go/v79/subscription"
	"golang.org/x/time/rate"
	"gopkg.in/gomail.v2"
)

type Service struct {
	DB              *db.DB
	scookie         *securecookie.SecureCookie
	dialer          *gomail.Dialer
	connManager     *ConnectionManager
	ApiRateLimiters map[string]*rate.Limiter
	redisClient     *redis.Client
	redisCtx        context.Context
	plans           map[string]types.Plan
	discountCode    string
}

func New() Service {
	db, err := db.NewPostgres(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalln(err)
	}

	hash_key := []byte(os.Getenv("HASH_KEY"))
	block_key := []byte(os.Getenv("BLOCK_KEY"))
	securecookie := securecookie.New(hash_key, block_key)

	dialer := gomail.NewDialer("smtp.gmail.com", 587, "logtracetest", os.Getenv("APP_PWD"))
	if dialer == nil {
		log.Fatalln("Failed to create dialer")
	}

	connManager := NewConnectionManager()

	stripe.Key = os.Getenv("STRIPE_SK")

	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		panic(err)
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

	plans := make(map[string]types.Plan)
	plans["starter"] = types.Plan{
		Name:              "Base",
		Price:             "",
		AppLimit:          1,
		MetricPerAppLimit: 2,
		TimeFrames:        []int{types.YEAR, types.MONTH},
	}

	plans["plus"] = types.Plan{
		Name:              "Starter",
		Price:             "price_1PoTkIIA5zCZk9dL7QEzx8XP",
		AppLimit:          5,
		MetricPerAppLimit: 5,
		TimeFrames:        []int{types.YEAR, types.MONTH, types.WEEK, types.DAY, types.HOUR, types.MINUTE, types.SECOND},
	}

	plans["pro"] = types.Plan{
		Name:              "Pro",
		Price:             "price_1PoTlpIA5zCZk9dLdb4xESXC",
		AppLimit:          15,
		MetricPerAppLimit: 15,
		TimeFrames:        []int{types.YEAR, types.MONTH, types.WEEK, types.DAY, types.HOUR, types.MINUTE, types.SECOND},
	}

	discountCode := "V9boHIHP"

	return Service{
		DB:              db,
		scookie:         securecookie,
		dialer:          dialer,
		connManager:     connManager,
		ApiRateLimiters: make(map[string]*rate.Limiter),
		redisClient:     redis_client,
		redisCtx:        redis_ctx,
		plans:           plans,
		discountCode:    discountCode,
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

	// Check if the email is valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email ", http.StatusBadRequest)
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

func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
	var request AuthRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Check if the email and password are valid
	if !isEmailValid(request.Email) || !isPasswordValid(request.Password) {
		http.Error(w, "Invalid email or/and password", http.StatusBadRequest)
		return
	}

	// Check if a user with the chosen email exists
	user, derr := s.DB.GetUserByEmail(request.Email)
	if derr == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Check if the password is correct
	is_pwd_valid := CheckPasswordHash(request.Password, user.Password)
	if !is_pwd_valid {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// create auth cookie
	cookie, err := CreateCookie(&user, s.scookie)
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
			Content:     "A new user has logged into your account. If you do not recall having logged into your Log Trace dashboard, please update your password immediately.",
			Link:        os.Getenv("ORIGIN") + "/dashboard",
			ButtonTitle: "Update password",
		},
	})

}

func (s *Service) LoginGithub(w http.ResponseWriter, r *http.Request) {
}

func (s *Service) GithubCallback(w http.ResponseWriter, r *http.Request) {

}

func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
	var request AuthRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Check if the email and password are valid
	if !isEmailValid(request.Email) || !isPasswordValid(request.Password) {
		http.Error(w, "Invalid email or/and password", http.StatusBadRequest)
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
		Email:            request.Email,
		Password:         hashed_password,
		StripeCustomerId: c.ID,
	})
	if err != nil {
		log.Println(err)
		http.Error(w, "Email already exists", http.StatusBadRequest)
		return
	}

	// create auth cookie
	cookie, cerr := CreateCookie(&new_user, s.scookie)
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
			Subject:     "Thank you for joining Log Trace.",
			Content:     "You can now access your account's dashboard by using the following link.",
			Link:        os.Getenv("ORIGIN") + "/dashboard",
			ButtonTitle: "Access dashboard",
		},
	})
}

func (s *Service) Logout(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{
		Name:     "log-trace-session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var request ForgotPasswordRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Check if the email is valid
	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email ", http.StatusBadRequest)
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
			if aerr != nil {
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
			Link:        os.Getenv("ORIGIN") + "/recover?code=" + account_recovery.Code,
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

	// check if the new password is valid
	if !isPasswordValid(request.NewPassword) {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	// fetch the account recovery
	account_recovery, gerr := s.DB.GetAccountRecovery(request.Code)
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
	var request FeedbackRequest

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

	if !isEmailValid(request.Email) {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}

	// send email

	cerr := s.DB.CreateFeedback(types.Feedback{
		Email:   request.Email,
		Content: request.Content,
		Date:    time.Now(),
	})
	if cerr != nil {
		log.Println(cerr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	s.ScheduleEmail(SendEmailRequest{
		To: request.Email,
		Fields: MailFields{
			Subject: "Feedback received",
			Content: "Thank you for your feedback. We will try to improve our service as soon as possible.",
		},
	})
	w.WriteHeader(http.StatusOK)

}

// func (s *Service) NewEmail(w http.ResponseWriter, r *http.Request) {
// 	val, ok := r.Context().Value("userid").(uuid.UUID)
// 	if !ok {
// 		http.Error(w, "Internal error", http.StatusInternalServerError)
// 		return
// 	}

// 	var request NewEmailRequest

// 	// Try to unmarshal the request body
// 	jerr := json.NewDecoder(r.Body).Decode(&request)
// 	if jerr != nil {
// 		http.Error(w, jerr.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	// Get the user
// 	user, err := s.DB.GetUserById(val)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Internal error", http.StatusInternalServerError)
// 		return
// 	}

// 	// Verify the email and password is valid
// 	if !isEmailValid(request.NewEmail) || !isPasswordValid(request.Password) {
// 		http.Error(w, "Invalid email or/and password", http.StatusBadRequest)
// 		return
// 	}

// 	// Check if there is an account with then new email
// 	_, err = s.DB.GetUserByEmail(request.NewEmail)
// 	if err == nil {
// 		http.Error(w, "Email already in use", http.StatusBadRequest)
// 		return
// 	}

// 	// Check if the password is correct
// 	if !CheckPasswordHash(request.Password, user.Password) {
// 		http.Error(w, "Invalid password", http.StatusBadRequest)
// 		return
// 	}

// 	// Update the user email
// 	err = s.DB.UpdateUserEmail(user.Id, request.NewEmail)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Internal error", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)

// 	// Send email
// 	s.ScheduleEmail(SendEmailRequest{
// 		To: user.Email,
// 		Fields: MailFields{
// 			Subject:     "Log Trace email has been changed",
// 			Content:     "Your account's email has been successfully changed from " + user.Email + " to " + request.NewEmail + ". You must now use this new email to log into your account.",
// 			Link:        os.Getenv("ORIGIN") + "/login",
// 			ButtonTitle: "Login",
// 		},
// 	})

// 	s.ScheduleEmail(SendEmailRequest{
// 		To: request.NewEmail,
// 		Fields: MailFields{
// 			Subject:     "Log Trace email has been changed",
// 			Content:     "Your account's email has been successfully changed from " + user.Email + " to " + request.NewEmail + ". You must now use this new email to log into your account.",
// 			Link:        os.Getenv("ORIGIN") + "/login",
// 			ButtonTitle: "Login",
// 		},
// 	})
// }

func (s *Service) NewPassword(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request NewPasswordRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the user
	user, err := s.DB.GetUserById(val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Verify the email and password is valid
	if !isPasswordValid(request.NewPassword) || !isPasswordValid(request.Password) {
		http.Error(w, "Invalid new password or/and password", http.StatusBadRequest)
		return
	}

	// Check if the password is correct
	if !CheckPasswordHash(request.Password, user.Password) {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	// Update the user email
	hashed_password, herr := HashPassword(request.NewPassword)
	if herr != nil {
		log.Println(herr)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	err = s.DB.UpdateUserPassword(user.Id, hashed_password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	// Send email
	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject:     "Log Trace password has been changed",
			Content:     "Your account's password has been successfully changed. You must now use this new password to log into your account.",
			Link:        os.Getenv("ORIGIN") + "/login",
			ButtonTitle: "Login",
		},
	})

}

func (s *Service) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request DeleteAccountRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the user
	user, err := s.DB.GetUserById(val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Verify the Password
	if !isPasswordValid(request.Password) {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	// Check if the password is correct
	if !CheckPasswordHash(request.Password, user.Password) {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	if user.CurrentPlan != "free" {
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

	// Delete the user
	err = s.DB.DeleteUser(user.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// logout
	cookie := http.Cookie{
		Name:     "log-trace-session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)

	//send email
	s.ScheduleEmail(SendEmailRequest{
		To: user.Email,
		Fields: MailFields{
			Subject: "We're sorry to see you go!",
			Content: "Your account has been successfully deleted.",
		},
	})
}

func (s *Service) CreateApplication(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
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
	_, gerr := s.DB.GetApplicationByName(val, request.Name)
	if gerr == nil {
		http.Error(w, "Application with this name already exists", http.StatusBadRequest)
		return
	}

	// Get user
	user, err := s.DB.GetUserById(val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		return
	}

	if s.plans[user.CurrentPlan].AppLimit >= 0 {

		// Get application count
		count, cerr := s.DB.GetApplicationCountByUser(val)
		if cerr != nil {
			log.Println(cerr)
			http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
			return
		}

		if count >= s.plans[user.CurrentPlan].AppLimit {
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
		UserId: val,
	})
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error, please try again later", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(new_app)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
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

	// Get the application
	app, err := s.DB.GetApplication(request.ApplicationId, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if app.UserId != val {
		http.Error(w, "You don't have access to this application", http.StatusForbidden)
		return
	}

	// Delete the application
	err = s.DB.DeleteApplication(app.Id, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetApplications(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Fetch Applications
	apps, err := s.DB.GetApplications(val)
	if err != nil {
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

func (s *Service) CreateMetric(w http.ResponseWriter, r *http.Request) {

	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request CreateMetricRequest

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

	identifier := strings.ReplaceAll(request.Name, " ", "_")

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get Metric Count
	count, err := s.DB.GetMetricCount(request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get the user
	user, err := s.DB.GetUserById(val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var enabled bool
	if count >= s.plans[user.CurrentPlan].MetricPerAppLimit {
		enabled = false
	} else {
		enabled = true
	}

	// Create the metric
	metric, err := s.DB.CreateMetric(types.Metric{
		Name:       request.Name,
		Identifier: identifier,
		AppId:      request.AppId,
		Enabled:    enabled,
	})

	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(metric)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) DeleteMetric(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request DeleteMetricRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Delete the metric
	err = s.DB.DeleteMetric(request.MetricId, request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetMetrics(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request GetMetricsRequest

	// Get application
	_, err := s.DB.GetApplication(request.AppId, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Fetch Metrics
	metrics, err := s.DB.GetMetrics(request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(metrics)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) ToggleMetric(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value("userid").(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request ToggleMetricRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Toggle the metric
	err = s.DB.ToggleMetric(request.MetricId, request.AppId, request.Enabled)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) AuthentificatedMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("log-trace-session")
		if err == http.ErrNoCookie {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var auth_cookie AuthCookie
		derr := s.scookie.Decode("log-trace-session", cookie.Value, &auth_cookie)
		if derr != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userid", auth_cookie.UserId)

		if cookie.Expires.Sub(auth_cookie.CreationDate) <= 12*time.Hour {
			new_cookie, err := CreateCookie(&types.User{Id: auth_cookie.UserId}, s.scookie)
			if err == nil {
				http.SetCookie(w, &new_cookie)
			}
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Service) IsConnected(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
