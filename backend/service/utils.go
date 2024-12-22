package service

import (
	"Measurely/types"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	netmail "net/mail"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var metricIds = map[string]string{
	"feedbacks":    "15f5fc91-17fb-4ee4-bbdb-b8acca129c2a",
	"metrics-pos":  "76f36d78-c547-49ab-b13d-a31ee9614e76",
	"metrics-neg":  "022517ef-f5f6-4cfd-bd68-d5f96ff45220",
	"apps-pos":     "e07a31ed-b89e-46c8-8ab2-a361b7c568a9",
	"apps-neg":     "fc61add8-36be-4307-b8d7-70e749e07894",
	"pro-pos":      "83f99bbb-ca1f-4050-998b-f3310a01af5b",
	"pro-neg":      "1dfab73c-e0eb-46ad-8457-1f5ba727500f",
	"plus-pos":     "1e502b44-1014-42cc-994e-16cc1fa5c082",
	"plus-neg":     "38155176-d92b-46d0-9dd3-55d5ac6f63e1",
	"starter-pos":  "33e74281-318b-4afd-ab0a-668c5256d537",
	"starter-neg":  "14bd6ac5-0197-4f2a-9134-c55d3699391b",
	"users-pos":    "594391de-e76a-43fc-94fd-f6d4f9927c9b",
	"users-neg":    "6e728a5c-3756-44d1-b069-38ca18d389a5",
}

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
			"id":    user.Id,
			"email": user.Email,
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
			Id:    id,
			Email: fmt.Sprint(claims["email"]),
		}, nil
	} else {
		return types.Token{}, errors.New("invalid jwt token")
	}
}

func IsUUIDValid(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}

func GenerateRandomKey() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (s *Service) GetPlan(identifier string) (types.Plan, bool) {
	value, ok := s.cache.plans.Load(identifier)
	var plan types.Plan

	if !ok {
		switch identifier {
		case "starter":
			plan = types.Plan{
				Price:             "",
				Identifier:        "starter",
				Name:              "Starter",
				AppLimit:          5,
				MetricPerAppLimit: 2,
				RequestLimit:      100,
				Range:             30,
			}
			s.db.CreatePlan(plan)
			ok = true

		case "plus":
			plan = types.Plan{
				Price:             "price_1QVJwOKSu0h3NTsFEXJo7ORd",
				Identifier:        "plus",
				Name:              "Plus",
				AppLimit:          5,
				MetricPerAppLimit: 5,
				RequestLimit:      100,
				Range:             100,
			}
			s.db.CreatePlan(plan)
			ok = true
		case "pro":
			plan = types.Plan{
				Price:             "price_1QVJwGKSu0h3NTsFaIS0vBeF",
				Identifier:        "pro",
				Name:              "Pro",
				AppLimit:          15,
				MetricPerAppLimit: 15,
				RequestLimit:      1000,
				Range:             365,
			}
			s.db.CreatePlan(plan)
			ok = true
		}
	} else {
		plan = value.(types.Plan)
	}

	return plan, ok
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

func SendMeasurelyMetricEvent(name string, value int) {
	id, exists := metricIds[name]
	if !exists {
		log.Println("Metric with name " + name + " does not exist")
		return
	}
	if os.Getenv("ENV") != "production" {
		return
	}
	url := fmt.Sprintf("https://api.measurely.dev/event/%s/%s", os.Getenv("MEASURELY_API_KEY"), id)
	jsonData := map[string]interface{}{
		"value": value,
	}
	jsonValue, _ := json.Marshal(jsonData)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonValue))
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
}
