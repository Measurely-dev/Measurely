package service

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
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
	"gopkg.in/gomail.v2"
)

type Service struct {
	DB          *db.DB
	scookie     *securecookie.SecureCookie
	dialer      *gomail.Dialer
	connManager *ConnectionManager
	redisClient *redis.Client
	redisCtx    context.Context
}

const defaultProcessRate = 10000
const defaultStorageRate = 10000
const defaultEmailRate = 10000

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

	return Service{
		DB:          db,
		scookie:     securecookie,
		dialer:      dialer,
		connManager: connManager,
		redisClient: redis_client,
		redisCtx:    redis_ctx,
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
			Price:             "price_1PoTkIIA5zCZk9dL7QEzx8XP",
			Identifier:        "plus",
			Name:              "Plus",
			AppLimit:          5,
			MetricPerAppLimit: 5,
			TimeFrames:        []int{types.YEAR, types.MONTH, types.WEEK, types.DAY, types.HOUR, types.MINUTE, types.SECOND},
		}

		pro := types.Plan{
			Price:             "price_1PoTlpIA5zCZk9dLdb4xESXC",
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
		s.redisClient.Set(s.redisCtx, key, bytes, 0)

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

	// check if the user uses GIthub
	if user.Provider == types.GITHUB {
		http.Error(w, "User uses Github", http.StatusUnauthorized)
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
			Content:     "A new user has logged into your account. If you do not recall having logged into your Measurely dashboard, please update your password immediately.",
			Link:        os.Getenv("ORIGIN") + "/dashboard",
			ButtonTitle: "Update password",
		},
	})

}

func (s *Service) LoginGithub(w http.ResponseWriter, r *http.Request) {
	// Get the environment variable
	githubClientID := os.Getenv("GITHUB_CLIENT_ID")

	// Create the dynamic redirect URL for login
	redirectURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&scope=user:email",
		githubClientID,
	)

	http.Redirect(w, r, redirectURL, http.StatusMovedPermanently)
}

func (s *Service) GithubCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	clientID := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_SECRET")

	// Set us the request body as JSON
	requestBodyMap := map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"code":          code,
	}
	requestJSON, _ := json.Marshal(requestBodyMap)

	// POST request to set URL
	req, reqerr := http.NewRequest(
		"POST",
		"https://github.com/login/oauth/access_token",
		bytes.NewBuffer(requestJSON),
	)
	if reqerr != nil {
		log.Println(reqerr)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Get the response
	resp, resperr := http.DefaultClient.Do(req)
	if resperr != nil {
		log.Println(resperr)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
		return
	}

	// Response body converted to stringified JSON
	respbody, _ := io.ReadAll(resp.Body)

	// Represents the response received from Github
	type githubAccessTokenResponse struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		Scope       string `json:"scope"`
	}

	// Convert stringified JSON to a struct object of type githubAccessTokenResponse
	var ghresp githubAccessTokenResponse
	json.Unmarshal(respbody, &ghresp)

	// Get request to a set URL
	req2, reqerr := http.NewRequest(
		"GET",
		"https://api.github.com/user",
		nil,
	)
	if reqerr != nil {
		log.Println(reqerr)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
		return
	}

	// Set the Authorization header before sending the request
	// Authorization: token XXXXXXXXXXXXXXXXXXXXXXXXXXX
	authorizationHeaderValue := fmt.Sprintf("Bearer %s", ghresp.AccessToken)
	req2.Header.Set("Authorization", authorizationHeaderValue)

	// Make the request
	resp2, resperr := http.DefaultClient.Do(req2)
	if resperr != nil {
		log.Println(resperr)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
		return
	}

	// Read the response as a byte slice
	respbody2, _ := io.ReadAll(resp2.Body)

	type UserInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	var userInfo UserInfo
	json.Unmarshal(respbody2, &userInfo)

	user, err := s.DB.GetUserByEmail(userInfo.Email)
	if err == sql.ErrNoRows {
		stripe_params := &stripe.CustomerParams{
			Email: stripe.String(userInfo.Email),
		}

		c, err := customer.New(stripe_params)
		if err != nil {
			log.Println(err)
			http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
			return
		}

		names := strings.Split(userInfo.Name, " ")
		var first_name string = ""
		var last_name string = ""
		if len(names) == 0 {
			first_name = userInfo.Email
		} else if len(names) == 1 {
			first_name = names[0]
		} else if len(names) == 2 {
			first_name = names[0]
			last_name = names[1]
		}

		new_user := types.User{
			Email:            userInfo.Email,
			Password:         "",
			Provider:         types.GITHUB,
			FirstName:        first_name,
			LastName:         last_name,
			StripeCustomerId: c.ID,
			CurrentPlan:      "starter",
		}

		user, err = s.DB.CreateUser(new_user)
		if err != nil {
			log.Println(err)
			http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
			return
		}

		// send email
		s.ScheduleEmail(SendEmailRequest{
			To: new_user.Email,
			Fields: MailFields{
				Subject:     "Thank you for joining Measurely",
				Content:     "You can now access your account's dashboard by using the following link.",
				Link:        os.Getenv("ORIGIN") + "/dashboard",
				ButtonTitle: "Access dashboard",
			},
		})
	} else if err != nil {
		log.Println(err)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
		return
	} else {
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

	if user.Provider != types.GITHUB {
		log.Println("user already exists")
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"An account using this email address already exists", http.StatusMovedPermanently)
		return
	}

	cookie, err := CreateCookie(&user, s.scookie)
	if err != nil {
		log.Println(err)
		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
		return
	}

	http.SetCookie(w, &cookie)
	http.Redirect(w, r, os.Getenv("ORIGIN")+"/dashboard", http.StatusMovedPermanently)
}

func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
	var request RegisterRequest

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
		FirstName:        request.FirstName,
		LastName:         request.LastName,
		StripeCustomerId: c.ID,
		Provider:         types.EMAIL,
		CurrentPlan:      "starter",
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
			Subject:     "Thank you for joining Measurely.",
			Content:     "You can now access your account's dashboard by using the following link.",
			Link:        os.Getenv("ORIGIN") + "/dashboard",
			ButtonTitle: "Access dashboard",
		},
	})
}

func (s *Service) Logout(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{
		Name:     "measurely-session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetUser(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	user, err := s.DB.GetUserById(val)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	resp := GetUserResponse{
		Email:       user.Email,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		CurrentPlan: user.CurrentPlan,
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

func (s *Service) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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
		Name:     "measurely-session",
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
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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

	plan, _ := s.GetPlan(user.CurrentPlan)
	if plan.AppLimit >= 0 {

		// Get application count
		count, cerr := s.DB.GetApplicationCountByUser(val)
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
		ApiKey:      api_key,
		Name:        request.Name,
		Description: request.Description,
		UserId:      val,
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

func (s *Service) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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

	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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

	// Get the application
	_, err := s.DB.GetApplication(request.AppId, val)
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
	user, err := s.DB.GetUserById(val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	plan, _ := s.GetPlan(user.CurrentPlan)
	var enabled bool
	if count >= plan.MetricPerAppLimit {
		enabled = false
	} else {
		enabled = true
	}

	// Create the metric
	metric, err := s.DB.CreateMetricGroup(types.MetricGroup{
		Name:    request.Name,
		AppId:   request.AppId,
		Type:    request.Type,
		Enabled: enabled,
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
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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
	err = s.DB.DeleteMetricGroup(request.MetricId, request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetMetrics(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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
	metrics, err := s.DB.GetMetricGroups(request.AppId)
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
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
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

	if request.Enabled {
		// Get the user
		user, gerr := s.DB.GetUserById(val)
		if gerr != nil {
			log.Println(gerr)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		count, err := s.DB.GetMetricGroupCount(request.AppId)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		plan, _ := s.GetPlan(user.CurrentPlan)
		if count >= plan.MetricPerAppLimit {
			http.Error(w, "You have reached your limit", http.StatusBadRequest)
			return
		}
	}

	// Toggle the metric
	err = s.DB.ToggleMetricGroup(request.MetricId, request.AppId, request.Enabled)
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

		var auth_cookie types.AuthCookie
		derr := s.scookie.Decode("measurely-session", cookie.Value, &auth_cookie)
		if derr != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), types.USERID, auth_cookie.UserId)

		if cookie.Expires.Sub(auth_cookie.CreationDate) <= 12*time.Hour {
			new_cookie, err := CreateCookie(&types.User{Id: auth_cookie.UserId}, s.scookie)
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
		http.Error(w, "Invalid Request", http.StatusBadRequest)
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
		http.Error(w, "Invalid Request", http.StatusBadRequest)
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
		http.Error(w, "Invalid Request", http.StatusBadRequest)
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
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	keys, err := s.redisClient.Keys(s.redisCtx, "plan:*").Result()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rates := make(map[string]types.Plan)
	for _, key := range keys {
		val, err := s.redisClient.Get(s.redisCtx, key).Result()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var plan types.Plan
		err = json.Unmarshal([]byte(val), &plan)
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
