package service

import (
	"Measurely/types"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	netmail "net/mail"
	"os"
	"strconv"
	"text/template"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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

func CreateCookie(user *types.User, w http.ResponseWriter) (http.Cookie, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"id":           user.Id,
			"email":        user.Email,
		})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return http.Cookie{}, err
	}

	cookie := http.Cookie{
		Name:     "measurely-session",
		Value:    tokenString,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().UTC().Add(72 * time.Hour),
	}

	if os.Getenv("ENV") == "production" {
		cookie.Domain = ".measurely.dev"
		cookie.SameSite = http.SameSiteLaxMode
	}
	return cookie, nil
}

func DeleteCookie() http.Cookie {
	cookie := http.Cookie{
		Name:     "measurely-session",
		Value:    "",
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
	}

	if os.Getenv("ENV") == "production" {
		cookie.Domain = ".measurely.dev"
		cookie.SameSite = http.SameSiteLaxMode
	}
	return cookie
}

func VerifyToken(tokenStr string) (types.Token, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return types.Token{}, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		id, err := uuid.Parse(fmt.Sprint(claims["id"]))
		if err != nil {
			return types.Token{}, errors.New("invalid jwt token")
		}

		return types.Token{
			Id:           id,
			Email:        fmt.Sprint(claims["email"]),
		}, nil
	} else {
		return types.Token{}, errors.New("invalid jwt token")
	}
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

func GetOrigin() string {
	if os.Getenv("ENV") == "production" {
		return "https://measurely.dev"
	} else {
		return "http://localhost:3000"
	}
}

func GetURL() string {
	if os.Getenv("ENV") == "production" {
		return "https://api.measurely.dev"
	} else {
		return "http://localhost:8080"
	}
}

func SetupCacheControl(w http.ResponseWriter, maxAge int) {
	if maxAge <= 0 {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
	} else {
		maxAgeStr := strconv.Itoa(maxAge)
		w.Header().Set("Cache-Control", "max-age="+maxAgeStr+", public")
	}
}
