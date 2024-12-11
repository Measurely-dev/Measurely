package service

import (
	"Measurely/types"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	netmail "net/mail"
	"os"
	"strconv"
	"text/template"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/securecookie"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

func isEmailValid(e string) bool {
	_, err := netmail.ParseAddress(e)
	return err == nil
}

func isPasswordValid(p string) bool {
	return len(p) >= 7
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func CreateCookie(user *types.User, scookie *securecookie.SecureCookie) (http.Cookie, error) {
	// Create cookie and send it
	auth_cookie := types.AuthCookie{
		UserId:       user.Id,
		Email:        user.Email,
		CreationDate: time.Now(),
	}

	encrypted, err := scookie.Encode("measurely-session", auth_cookie)
	if err != nil {
		return http.Cookie{}, err
	}

	var cookie http.Cookie = http.Cookie{
		Name:     "measurely-session",
		Value:    encrypted,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(72 * time.Hour),
	}

	if os.Getenv("ENV") == "production" {
		cookie.Domain = "measurely.dev"
		cookie.SameSite = http.SameSiteNoneMode
	}

	return cookie, nil
}

func DeleteCookie() http.Cookie {
	var cookie http.Cookie = http.Cookie{
		Name:     "measurely-session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
	}

	if os.Getenv("ENV") == "production" {
		cookie.Domain = "measurely.dev"
		cookie.SameSite = http.SameSiteNoneMode
	}
	return cookie
}

func IsUUIDValid(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}

func (s *Service) SendEmail(to string, fields MailFields) error {
	t, err := template.ParseFiles("template.html")
	if err != nil {
		return err
	}

	buffer := new(bytes.Buffer)

	if err := t.Execute(buffer, fields); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "Info@measurely.dev")
	m.SetHeader("To", to)
	m.SetHeader("Subject", fields.Subject)
	m.SetBody("text/html", buffer.String())

	// Send the email to Bob, Cora and Dan.
	if err := s.dialer.DialAndSend(m); err != nil {
		return err
	}
	return nil
}

func GenerateRandomKey() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (s *Service) GetRate(name string) int {
	key := fmt.Sprintf("rate_limit:%s", name)
	val, err := s.redisClient.Get(s.redisCtx, key).Result()

	result, serr := strconv.Atoi(val)

	if err != nil || serr != nil {
		switch name {
		case "event":
			return defaultProcessRate
		case "storage":
			return defaultStorageRate
		case "email":
			return defaultEmailRate
		default:
			return 0
		}
	}

	return result
}

func (s *Service) GetPlan(identifier string) (types.Plan, bool) {
	key := fmt.Sprintf("plan:%s", identifier)
	val, err := s.redisClient.Get(s.redisCtx, key).Result()
	if err != nil {
		return types.Plan{}, false
	}

	var plan types.Plan
	err = json.Unmarshal([]byte(val), &plan)
	if err != nil {
		return types.Plan{}, false
	}

	return plan, true
}

// func (s *Service) RetrieveAccessToken(code string, w http.ResponseWriter, r *http.Request) (string, error) {
// 	ctx := context.Background()
// 	token, err := s.oauth2.Exchange(ctx, code)
// 	if err != nil {
// 		log.Println("Error exchanging code for token:", err)
// 		http.Redirect(w, r, os.Getenv("ORIGIN")+"/sign-in?error="+"Internal error", http.StatusMovedPermanently)
// 		return "", err
// 	}
//
// 	return token.AccessToken, nil
// }
//
// func (s * Service) RevokeUserToken(accessToken string) error {
// 	clientID := s.oauth2.ClientID
// 	clientSecret := s.oauth2.ClientSecret
//
// 	url := fmt.Sprintf("https://api.github.com/applications/%s/grant", clientID)
//
// 	req, err := http.NewRequest("DELETE", url, nil)
// 	if err != nil {
// 		log.Println("Error creating revoke request:", err)
// 		return err
// 	}
//
// 	req.SetBasicAuth(clientID, clientSecret)
// 	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
// 	req.Header.Set("Accept", "application/vnd.github+json")
//
// 	client := &http.Client{}
// 	resp, err := client.Do(req)
// 	if err != nil {
// 		log.Println("Error sending revoke request:", err)
// 		return err
// 	}
// 	defer resp.Body.Close()
//
// 	if resp.StatusCode != http.StatusNoContent {
// 		log.Println("Unexpected status code while revoking token:", resp.StatusCode)
// 		return fmt.Errorf("failed to revoke token, status code: %d", resp.StatusCode)
// 	}
//
// 	return nil
// }
