package service

import (
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func (s *Service) IntegrationWorker() {
	tick := time.NewTicker(time.Second)
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

	if metric.IntegrationApiKey.Valid {
		http.Error(w, "The metric is already connected to a stripe account", http.StatusConflict)
		return
	}

  // TODO : Proceed to connect to stripe
}
