package service

import (
	"bytes"
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
	UserURL  string
	GrantURL string
	Type     int
	Config   *oauth2.Config
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

	// Extract and normalize the "id" field
	switch id := raw["id"].(type) {
	case float64: // JSON numbers are parsed as float64
		userInfo.Id = fmt.Sprintf("%.0f", id)
	case string:
		userInfo.Id = id
	default:
		return UserInfo{}, errors.New("unexpected type for Id")
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
	req, err := http.NewRequest("GET", provider.UserURL, nil)
	if err != nil {
		log.Println(err)
		return UserInfo{}, errors.New("internal error")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return UserInfo{}, errors.New("internal error")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return UserInfo{}, errors.New("internal error")
	}

	userInfo, err := UnmarshalUserInfo(body)
	if err != nil {
		log.Println(err)
		return UserInfo{}, errors.New("internal error")
	}

	if !isEmailValid(userInfo.Email) || userInfo.Name == "" {
		return UserInfo{}, errors.New("invalid email and/or name")
	}

	return userInfo, nil
}

func RevokeUserToken(provider Provider, token string) {
	if provider.GrantURL == "" {
		return
	}

	reqBody := map[string]string{
		"access_token": token,
	}
	jsonBody, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("DELETE", provider.GrantURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Println(err)
		return
	}
	req.SetBasicAuth(provider.Config.ClientID, provider.Config.ClientSecret)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/vnd.github+json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
	}
	resp.Body.Close()
}

func BeginProviderAuth(provider Provider, state string) string {
	url := provider.Config.AuthCodeURL(state)
  log.Println(url)
	return url
}

func CompleteProviderAuth(provider Provider, code string) (UserInfo, string, error) {
	token, err := provider.Config.Exchange(context.Background(), code)
	if err != nil {
		log.Println(err)
		return UserInfo{}, "", errors.New("internal error")
	}

	user, err := GetProviderUserInformation(provider, token.AccessToken)
	if err != nil {
		return UserInfo{}, "", err
	}

	return user, token.AccessToken, nil
}
