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

	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var metricIds = map[string]string{
  "metrics" : "51d61716-6ea8-4852-a250-7b8e151cda7d",
  "pro": "63d6759d-dc89-43e6-917d-b973d4aea522",
  "plus" : "a14f296d-34b3-459a-a37d-96be9be6b12b",
  "starter" : "fe8ca8bb-90b5-41a2-ae9a-599869bfa86f",
  "users" : "f9305a84-b5e8-4a3b-8a4f-f406354cf743",
  "apps" : "cd27516f-a029-44bc-8422-a3adb2163476",
  "feedbacks" : "312b3535-36e9-4148-bbb0-deea7da40ac0",
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
				AppLimit:          1,
				MetricPerAppLimit: 2,
				RequestLimit:      100,
				Range:             30,
			}
		case "plus":
			new_plan = &types.Plan{
				Price:             os.Getenv("PLUS_PRICE_ID"),
				Identifier:        "plus",
				Name:              "Plus",
				AppLimit:          3,
				MetricPerAppLimit: 15,
				RequestLimit:      1000,
				Range:             365,
			}
		case "pro":
			new_plan = &types.Plan{
				Price:             os.Getenv("PRO_PRICE_ID"),
				Identifier:        "pro",
				Name:              "Pro",
				AppLimit:          10,
				MetricPerAppLimit: 30,
				RequestLimit:      10000,
				Range:             365,
			}
		}

		if new_plan != nil {
			s.db.CreatePlan(*new_plan)
			s.cache.plans.Store(new_plan.Identifier, *new_plan)
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

func SetupCors() *cors.Cors {
	var allowed_origins []string
	if os.Getenv("ENV") == "production" {
		allowed_origins = []string{"https://measurely.dev", "https://www.measurely.dev"}
	} else {
		allowed_origins = []string{"http://localhost:3000"}
	}

	return cors.New(cors.Options{
		AllowedOrigins:   allowed_origins, // Allow all origins for this route
		AllowedMethods:   []string{"POST", "GET", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	})
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
