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
	"feedbacks":   "3a1d7f3c-fe7e-440f-b595-cb476b20fc97",
	"metrics-pos": "93052127-5583-4154-abf5-756d409c9892",
	"metrics-neg": "23971131-90c8-4de0-a63b-05b5f5dba1f0",
	"apps-pos":    "1bfd37b1-c937-4833-89c6-abf5991dbc28",
	"apps-neg":    "d5f3d643-e08c-4e8a-a3d1-d3b2c711ebba",
	"pro-pos":     "aaea34dc-af05-4b46-96a2-5b8b45a0f13f",
	"pro-neg":     "5b6d0dd6-4992-41b4-b2a9-70664e4ea65d",
	"plus-pos":    "59d1c7da-eae3-4d03-a5de-2ea6740021c5",
	"plus-neg":    "932593b2-bb9d-4f0e-9bca-bac9ecfc64e9",
	"starter-pos": "a6304271-7e0b-42d3-b142-ec5238aab2d1",
	"starter-neg": "7cb981c0-c408-41aa-b6b1-6a0d0b658d98",
	"users-pos":   "5d999958-4f45-42c8-aa74-c6bad013b747",
	"users-neg":   "7d6578b8-d2f0-49d0-bba0-0d9b1abf6e20",
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
		var new_plan *types.Plan = nil
		switch identifier {
		case "starter":
			new_plan = &types.Plan{
				Price:             "",
				Identifier:        "starter",
				Name:              "Starter",
				AppLimit:          5,
				MetricPerAppLimit: 2,
				RequestLimit:      100,
				Range:             30,
			}
		case "plus":
			new_plan = &types.Plan{
				Price:             "price_1QVJwOKSu0h3NTsFEXJo7ORd",
				Identifier:        "plus",
				Name:              "Plus",
				AppLimit:          5,
				MetricPerAppLimit: 5,
				RequestLimit:      100,
				Range:             100,
			}
		case "pro":
			new_plan = &types.Plan{
				Price:             "price_1QVJwGKSu0h3NTsFaIS0vBeF",
				Identifier:        "pro",
				Name:              "Pro",
				AppLimit:          15,
				MetricPerAppLimit: 15,
				RequestLimit:      1000,
				Range:             365,
			}
		}

		if new_plan != nil {
			s.db.CreatePlan(*new_plan)
			s.cache.plans.Store(new_plan.Identifier, new_plan)
			return *new_plan, true
		}

		return types.Plan{}, false

	} else {
		plan = value.(types.Plan)
	}

	return plan, ok
}

func (s *Service) GetUserPlan(userid uuid.UUID) (types.Plan, error) {
	value, ok := s.cache.usersPlan.Load(userid)
	var planCache UserPlanCache
	expired := false

	if ok {
		planCache = value.(UserPlanCache)
		if time.Now().After(planCache.expiry) {
			expired = true
		}
	}

	if !ok || expired {

		user, err := s.db.GetUserById(userid)
		if err != nil {
			return types.Plan{}, nil
		}

		plan, exists := s.GetPlan(user.CurrentPlan)
		if !exists {
			return types.Plan{}, errors.New("plan does not exist")
		}

		s.cache.usersPlan.Store(userid, UserPlanCache{
			plan:   plan,
			expiry: time.Now().Add(30 * time.Minute),
		})

		return plan, nil
	}

	return planCache.plan, nil
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
