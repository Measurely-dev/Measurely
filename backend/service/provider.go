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

type Provider struct {
	UserURL string
	Type    int
	Config  *oauth2.Config
}

type UserInfo struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	Id    string `json:"id"`
}

func UnmarshalUserInfo(data []byte) (UserInfo, error) {
	var raw map[string]interface{}
	var userInfo UserInfo
	if err := json.Unmarshal(data, &raw); err != nil {
		return UserInfo{}, err
	}

	if sub, ok := raw["sub"].(string); ok {
		userInfo.Id = sub
	} else {
		// Extract and normalize the "id" field
		switch id := raw["id"].(type) {
		case float64: // JSON numbers are parsed as float64
			userInfo.Id = fmt.Sprintf("%.0f", id)
		case string:
			userInfo.Id = id
		default:
			return UserInfo{}, errors.New("unexpected type for Id")
		}
	}

	// Extract other fields
	if name, ok := raw["name"].(string); ok {
		userInfo.Name = name
	}
	if email, ok := raw["email"].(string); ok {
		userInfo.Email = email
	}

	return userInfo, nil
}

func GetProviderUserInformation(provider Provider, token string) (UserInfo, error) {
	// Create a new HTTP request
	req, err := http.NewRequest("GET", provider.UserURL, nil)
	if err != nil {
		log.Println("Error creating HTTP request:", err)
		return UserInfo{}, errors.New("failed to initialize the request to the provider")
	}

	// Set authorization header
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	// Send the HTTP request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("Error sending HTTP request:", err)
		return UserInfo{}, errors.New("unable to communicate with the provider")
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response body:", err)
		return UserInfo{}, errors.New("failed to process the provider's response")
	}

	// Unmarshal the response into a UserInfo struct
	userInfo, err := UnmarshalUserInfo(body)
	if err != nil {
		log.Println("Error unmarshaling user information:", err)
		return UserInfo{}, errors.New("received invalid user information from the provider")
	}

	// Validate the user's email and name
	if !isEmailValid(userInfo.Email) || userInfo.Name == "" {
		log.Println("Invalid user information: email or name is missing/invalid")
		return UserInfo{}, errors.New("the provider returned invalid email or name information")
	}

	return userInfo, nil
}


func BeginProviderAuth(provider Provider, state string) string {
	url := provider.Config.AuthCodeURL(state)
	return url
}

func CompleteProviderAuth(provider Provider, code string) (UserInfo, *oauth2.Token, error) {
	// Exchange the authorization code for an access token
	token, err := provider.Config.Exchange(context.Background(), code)
	if err != nil {
		log.Println("Error exchanging authorization code for token:", err)
		return UserInfo{}, nil, errors.New("failed to exchange authorization code for token")
	}

	// Retrieve user information using the access token
	user, err := GetProviderUserInformation(provider, token.AccessToken)
	if err != nil {
		log.Println("Error retrieving user information:", err)
		return UserInfo{}, nil, err
	}

	return user, token, nil
}

