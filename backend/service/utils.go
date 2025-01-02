package service

import (
	"Measurely/types"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
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
	"metrics":   "f0411319-7560-4c64-b09d-a2cd9137b053",
	"pro":       "696afc2e-3c8c-4752-9588-493602c6a7ad",
	"plus":      "4a58fb8b-ef70-483c-9f83-8cb67aa79315",
	"starter":   "729fb8b3-3e87-4279-9bd4-17a21f7530d5",
	"signups":   "2efb5cb3-9ed6-40f3-bbb3-2df19faf8ba7",
	"apps":      "eb585285-4397-4007-a877-07e54aff06c7",
	"feedbacks": "fc7306fd-0d8c-4e3d-a3f0-e0ce8d961a2d",
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
				Price:                 "",
				Identifier:            "starter",
				Name:                  "Starter",
				ProjectLimit:          1,
				MetricPerProjectLimit: 5,
				RequestLimit:          25,
				MonthlyEventLimit:     5000,
				Range:                 30,
			}
		case "plus":
			new_plan = &types.Plan{
				Price:                 os.Getenv("PLUS_PRICE_ID"),
				Identifier:            "plus",
				Name:                  "Plus",
				ProjectLimit:          3,
				MetricPerProjectLimit: 15,
				RequestLimit:          1000,
				MonthlyEventLimit:     1000000,
				Range:                 365,
			}
		case "pro":
			new_plan = &types.Plan{
				Price:                 os.Getenv("PRO_PRICE_ID"),
				Identifier:            "pro",
				Name:                  "Pro",
				ProjectLimit:          10,
				MetricPerProjectLimit: 35,
				RequestLimit:          10000,
				MonthlyEventLimit:     10000000,
				Range:                 365,
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

func (s *Service) GetUserCache(userid uuid.UUID) (UserCache, error) {
	value, ok := s.cache.users.Load(userid)
	var userCache UserCache
	expired := false

	if ok {
		userCache = value.(UserCache)
		if userCache.startDate.Month() != time.Now().UTC().Month() {
			expired = true
		}
	}

	if !ok || expired {
		user, err := s.db.GetUserById(userid)
		if err != nil {
			return UserCache{}, nil
		}

		plan, exists := s.GetPlan(user.CurrentPlan)
		if !exists {
			return UserCache{}, errors.New("user does not exist")
		}

		date := user.StartCountDate
		count := user.MonthlyEventCount
		if user.StartCountDate.Month() != time.Now().UTC().Month() {
			s.db.ResetUserCount(user.Id)
			date = time.Now().UTC()
			count = 0
		}

		cache := UserCache{
			plan_identifier: plan.Identifier,
			metric_count:    count,
			startDate:       date,
		}

		s.cache.users.Store(userid, cache)

		return cache, nil
	}

	userCache = value.(UserCache)
	return userCache, nil
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
