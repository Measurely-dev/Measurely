package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"golang.org/x/oauth2"
)

// Provider contains OAuth2 provider configuration
type Provider struct {
	UserURL string          // Endpoint URL for retrieving user information
	Type    int            // Provider type identifier
	Config  *oauth2.Config // OAuth2 configuration
}

// UserInfo represents user profile data returned by OAuth providers
type UserInfo struct {
	Email string `json:"email"`
	Name  string `json:"name"` 
	Id    string `json:"id"`
}

// UnmarshalUserInfo parses the raw user data from OAuth providers into a UserInfo struct
func UnmarshalUserInfo(data []byte) (UserInfo, error) {
	var raw map[string]interface{}
	var userInfo UserInfo

	if err := json.Unmarshal(data, &raw); err != nil {
		return UserInfo{}, err
	}

	// Handle OAuth sub claim first, fallback to regular id field
	if sub, ok := raw["sub"].(string); ok {
		userInfo.Id = sub
	} else {
		switch id := raw["id"].(type) {
		case float64:
			userInfo.Id = fmt.Sprintf("%.0f", id)
		case string:
			userInfo.Id = id
		default:
			return UserInfo{}, errors.New("unexpected type for Id")
		}
	}

	userInfo.Name, _ = raw["name"].(string)
	userInfo.Email, _ = raw["email"].(string)

	return userInfo, nil
}

// GetProviderUserInformation retrieves user profile data from the OAuth provider
func GetProviderUserInformation(provider Provider, token string) (UserInfo, error) {
	req, err := http.NewRequest("GET", provider.UserURL, nil)
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return UserInfo{}, errors.New("failed to initialize provider request")
	}

	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Failed to send request: %v", err)
		return UserInfo{}, errors.New("provider communication failed")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read response: %v", err)
		return UserInfo{}, errors.New("invalid provider response")
	}

	userInfo, err := UnmarshalUserInfo(body)
	if err != nil {
		log.Printf("Failed to parse user info: %v", err)
		return UserInfo{}, errors.New("invalid user data")
	}

	if !isEmailValid(userInfo.Email) || userInfo.Name == "" {
		log.Print("Invalid user profile data")
		return UserInfo{}, errors.New("incomplete user profile")
	}

	return userInfo, nil
}

// BeginProviderAuth initiates OAuth flow by returning authorization URL
func BeginProviderAuth(provider Provider, state string) string {
	return provider.Config.AuthCodeURL(state)
}

// CompleteProviderAuth handles OAuth callback by exchanging code for token and user info
func CompleteProviderAuth(provider Provider, code string) (UserInfo, *oauth2.Token, error) {
	token, err := provider.Config.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Token exchange failed: %v", err)
		return UserInfo{}, nil, errors.New("auth code exchange failed")
	}

	user, err := GetProviderUserInformation(provider, token.AccessToken)
	if err != nil {
		return UserInfo{}, nil, err
	}

	return user, token, nil
}
