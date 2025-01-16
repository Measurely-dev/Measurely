package service

import (
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/oauth"
)

func (s *Service) IntegrationWorker() {
	tick := time.NewTicker(time.Minute)
	defer tick.Stop()

	for {
		<-tick.C

		metrics, err := s.db.GetAllIntegrationMetrics()
		if err != nil && err != sql.ErrNoRows {
			log.Println("Failed to fetch all integration metrics")
		}

		log.Println(fmt.Sprintf("Starting workers on %d metrics", len(metrics)))
		for _, metric := range metrics {
			if metric.Type == types.STRIPE_METRIC {
				go s.stripeWorker(&metric)
			}
		}
	}
}

func (s *Service) stripeWorker(metric *types.Metric) {
	log.Println("running stripe worker on : ", metric.Name)
}

func (s *Service) AuthorizeStripe(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		MetricId  uuid.UUID `json:"metricid"`
		ProjectId uuid.UUID `json:"projectid"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		}
		return
	}

	if project.UserRole != types.TEAM_OWNER && project.UserRole != types.TEAM_ADMIN {
		http.Error(w, "You do not have the necessary role to perform this action.", http.StatusUnauthorized)
		return
	}

	metric, err := s.db.GetMetricById(request.MetricId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Metric not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error, please try again later.", http.StatusInternalServerError)
		}
		return
	}

	if metric.ProjectId != request.ProjectId {
		http.Error(w, "Metric not found", http.StatusNotFound)
		return
	}

	if metric.StripeAccount.Valid {
		http.Error(w, "The metric is already connected to a stripe account", http.StatusConflict)
		return
	}

	// Construct the Stripe OAuth URL
	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", os.Getenv("STRIPE_CLIENT_ID"))
	params.Add("scope", "read_write") // Adjust scope based on your needs
	params.Add("redirect_uri", GetURL()+"/integrations-callback/stripe")
	params.Add("state", metric.Id.String())

	// // Optional parameters for a better user experience
	// params.Add("stripe_user[business_type]", "company")
	// params.Add("stripe_user[country]", "US") // Default to US, adjust as needed

	stripeConnectURL := fmt.Sprintf("https://connect.stripe.com/oauth/authorize?%s", params.Encode())

	// Return the URL to the client
	response := struct {
		URL string `json:"url"`
	}{
		URL: stripeConnectURL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Service) StripeCallback(w http.ResponseWriter, r *http.Request) {
	// Get the authorization code and state from the URL parameters
	code := r.URL.Query().Get("code")
	metricid, err := uuid.Parse(r.URL.Query().Get("state"))
	if err != nil {
		http.Error(w, "Invalid state parameter", http.StatusBadRequest)
		return
	}

	// Exchange the authorization code for an access token
	params := &stripe.OAuthTokenParams{
		ClientSecret: stripe.String(os.Getenv("STRIPE_SK")),
		Code:         stripe.String(code),
		GrantType:    stripe.String("authorization_code"),
	}

	token, err := oauth.New(params)
	if err != nil {
		http.Error(w, "Failed to exchange authorization code", http.StatusInternalServerError)
		return
	}

	metric, err := s.db.GetMetricById(metricid)
	if err != nil {
		http.Error(w, "Failed to retrieve metric", http.StatusBadRequest)
		return
	}

	// Store the access token with the metric
	err = s.db.UpdateMetricStripeAccount(metricid, token.StripeUserID)
	if err != nil {
		http.Error(w, "Failed to store access token", http.StatusInternalServerError)
		return
	}

	// Redirect to a success page or close the window
	http.Redirect(w, r, GetOrigin()+"/dashboard/metrics/"+metric.Name, http.StatusTemporaryRedirect)
}
