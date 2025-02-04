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

// Map of metric IDs used for tracking different types of metrics
var metricIds = map[string]string{
	"metrics":   "dfc36841-99b2-4615-b1dc-fec5fba66153",
	"users":     "519b356c-0f82-4004-8b2c-13bca28fed2c",
	"signups":   "2efb5cb3-9ed6-40f3-bbb3-2df19faf8ba7",
	"apps":      "eb585285-4397-4007-a877-07e54aff06c7",
	"feedbacks": "fc7306fd-0d8c-4e3d-a3f0-e0ce8d961a2d",
	"waitlist":  "01a0b6a3-b1ec-46ca-b6b8-92a88b62b497",
}

// Validates email format using net/mail package
func isEmailValid(e string) bool {
	_, err := netmail.ParseAddress(e)
	return err == nil
}

// Checks if password meets minimum length requirement of 7 characters
func isPasswordValid(p string) bool {
	return len(p) >= 7
}

// Hashes password using bcrypt with minimum cost factor
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	return string(bytes), err
}

// Compares a password against its hash to verify if they match
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Creates a session cookie containing a JWT token for authentication
func CreateCookie(user *types.User, w http.ResponseWriter) (http.Cookie, error) {
	// Create JWT token with user claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"id":    user.Id,
			"email": user.Email,
		})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return http.Cookie{}, err
	}

	// Configure cookie settings
	cookie := http.Cookie{
		Name:     "measurely-session",
		Value:    tokenString,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().UTC().Add(72 * time.Hour),
	}

	// Add production-specific settings
	if os.Getenv("ENV") == "production" {
		cookie.Domain = ".measurely.dev"
		cookie.SameSite = http.SameSiteLaxMode
	}
	return cookie, nil
}

// Creates an expired cookie to effectively delete the session
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

// Verifies and parses a JWT token, returning the token claims
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
	}
	return types.Token{}, errors.New("invalid jwt token")
}

// Validates if a string is a valid UUID format
func IsUUIDValid(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}

// Generates a random 16-byte hex encoded string
func GenerateRandomKey() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Retrieves project cache by API key, creating it if it doesn't exist
func (s *Service) GetProjectCache(api_key string) (ProjectCache, error) {
	// Try to load from cache first
	value, ok := s.projectsCache.Load(api_key)
	var projectCache ProjectCache

	if !ok {
		// Cache miss - fetch from database
		project, err := s.db.GetProjectByApi(api_key)
		if err != nil {
			return ProjectCache{}, nil
		}

		cache := ProjectCache{
			api_key:             project.ApiKey,
			id:                  project.Id,
			event_count:         project.MonthlyEventCount,
			monthly_event_limit: project.MaxEventPerMonth,
		}

		s.projectsCache.Store(api_key, cache)
		return cache, nil
	}

	projectCache = value.(ProjectCache)
	return projectCache, nil
}

// Configures CORS settings based on environment
func SetupCors() *cors.Cors {
	allowed_origins := []string{"http://localhost:3000"}
	if os.Getenv("ENV") == "production" {
		allowed_origins = []string{"https://measurely.dev", "https://www.measurely.dev"}
	}

	return cors.New(cors.Options{
		AllowedOrigins:   allowed_origins,
		AllowedMethods:   []string{"POST", "GET", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	})
}

// Returns appropriate origin URL based on environment
func GetOrigin() string {
	if os.Getenv("ENV") == "production" {
		return "https://app.measurely.dev"
	}
	return "http://localhost:3000"
}

// Returns appropriate API URL based on environment
func GetURL() string {
	if os.Getenv("ENV") == "production" {
		return "https://api.measurely.dev"
	}
	return "http://localhost:8080"
}

// Sets cache control headers based on maxAge parameter
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
