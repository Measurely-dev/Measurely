package service

import (
	"Measurely/types"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Service) VerifyKeyToMetric(metricid uuid.UUID, apikey string) bool {
	value, ok := s.cache.metricIdToApiKeys.Load(metricid)
	var relation MetricToKeyCache
	expired := false

	if ok {
		relation = value.(MetricToKeyCache)
		if time.Now().After(relation.expiry) {
			expired = true
		}
	}

	if !ok || expired {
		metric, err := s.db.GetMetricById(metricid)
		if err != nil {
			log.Println(err)
			return false
		}
		app, err := s.db.GetApplicationByApi(apikey)
		if err != nil {
			log.Println(err)
			return false
		}

		if app.Id != metric.AppId {
			return false
		}

		s.cache.metricIdToApiKeys.Store(metricid, MetricToKeyCache{
			key:         apikey,
			metric_type: metric.Type,
			user_id:     app.UserId,
			expiry:      time.Now().Add(15 * time.Minute),
		})

		return true
	}

	return relation.key == apikey
}

func (s *Service) RateAllow(apikey string, maxRequest int) bool {
	value, ok := s.cache.ratelimits.Load(apikey)
	expired := false
	var rate RateLimit

	if ok {
		rate = value.(RateLimit)
		if time.Now().After(rate.expiry) {
			expired = true
		}
	}

	if !ok || expired {
		s.cache.ratelimits.Store(apikey, RateLimit{
			current: 1,
			max:     maxRequest,
			expiry:  time.Now().Add(1 * time.Minute),
		})

		return true
	}

	if rate.current > rate.max {
		return false
	}

	s.cache.ratelimits.Store(apikey, RateLimit{
		current: rate.current + 1,
		max:     rate.max,
		expiry:  rate.expiry,
	})

	return true
}

func (s *Service) CreateMetricEvent(w http.ResponseWriter, r *http.Request) {
	apikey := chi.URLParam(r, "apikey")
	metricid, err := uuid.Parse(chi.URLParam(r, "metricid"))
	if err != nil {
		http.Error(w, "Invalid metric ID", http.StatusBadRequest)
		return
	}

	var request struct {
		Value int `json:"value"`
	}

	// Decode the request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	// Verify the API key and metric ID
	if !s.VerifyKeyToMetric(metricid, apikey) {
		http.Error(w, "Invalid API key or metric ID", http.StatusUnauthorized)
		return
	}

	// Retrieve the metric's cache entry
	value, _ := s.cache.metricIdToApiKeys.Load(metricid)
	metricCache := value.(MetricToKeyCache)

	// Get the user's plan details
	plan, err := s.GetUserPlan(metricCache.user_id)
	if err != nil {
		log.Println("Error fetching plan:", err)
		http.Error(w, "Plan not found", http.StatusNotFound)
		return
	}

	// Check if the rate limit is exceeded
	if !s.RateAllow(apikey, plan.RequestLimit) {
		http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
		return
	}

	// Validate the metric value for base metrics
	if metricCache.metric_type == types.BASE_METRIC && request.Value < 0 {
		http.Error(w, "Base metric cannot have a negative value", http.StatusBadRequest)
		return
	}

	// Reject zero values
	if request.Value == 0 {
		http.Error(w, "Metric value cannot be zero", http.StatusBadRequest)
		return
	}

	// Determine positive and negative values for metrics
	pos, neg := 0, 0
	if request.Value > 0 {
		pos = request.Value
	} else {
		neg = -request.Value
	}

	// Update the metric cache
	s.cache.metricIdToApiKeys.Store(metricid, MetricToKeyCache{
		key:         apikey,
		metric_type: metricCache.metric_type,
		user_id:     metricCache.user_id,
		expiry:      time.Now().Add(15 * time.Minute),
	})

	// Update the metric and create the event summary in the database
	if err := s.db.UpdateMetricAndCreateEventSummary(metricid, int64(pos), int64(neg)); err != nil {
		http.Error(w, "Failed to update metric", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Service) GetMetricEvents(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	metricid, err := uuid.Parse(r.URL.Query().Get("metricid"))
	if err != nil {
		http.Error(w, "Invalid metric ID", http.StatusBadRequest)
		return
	}

	appid, err := uuid.Parse(r.URL.Query().Get("appid"))
	if err != nil {
		http.Error(w, "Invalid application ID", http.StatusBadRequest)
		return
	}

	start, err := time.Parse("Mon, 02 Jan 2006 15:04:05 MST", r.URL.Query().Get("start"))
	if err != nil {
		http.Error(w, "Invalid start date format", http.StatusBadRequest)
		return
	}

	end, err := time.Parse("Mon, 02 Jan 2006 15:04:05 MST", r.URL.Query().Get("end"))
	if err != nil {
		http.Error(w, "Invalid end date format", http.StatusBadRequest)
		return
	}

	daily := r.URL.Query().Get("daily")

	// Get the application
	app, err := s.db.GetApplication(appid, token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Verify API key and metric association
	if !s.VerifyKeyToMetric(metricid, app.ApiKey) {
		http.Error(w, "Metric not found", http.StatusNotFound)
		return
	}

	// Get the user's plan details
	plan, err := s.GetUserPlan(token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Ensure the requested date range is within the user's plan limits
	nbrDays := (float64(end.Sub(start).Abs()) / float64(24*time.Hour)) - 2
	if nbrDays > float64(plan.Range) {
		http.Error(w, fmt.Sprintf("Your current plan allows viewing up to %d days of data. Upgrade to unlock extended date ranges.", plan.Range), http.StatusUnauthorized)
		return
	}

	var bytes []byte
	if daily != "1" {
		// Ensure the range is within 24 hours for precise events
		if end.Sub(start) > 24*time.Hour {
			http.Error(w, "You cannot fetch more than 24 hours of precise events", http.StatusBadRequest)
			return
		}

		// Fetch the metric events
		metrics, err := s.db.GetMetricEvents(metricid, start, end)
		if err != nil {
			log.Println("Error fetching metric events:", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		bytes, err = json.Marshal(metrics)
		if err != nil {
			http.Error(w, "Failed to process events", http.StatusBadRequest)
			return
		}
	} else {
		// Fetch daily metric summary
		metricevents, err := s.db.GetDailyMetricSummary(metricid, start, end)
		if err != nil {
			log.Println("Error fetching daily metric summary:", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		bytes, err = json.Marshal(metricevents)
		if err != nil {
			http.Error(w, "Failed to process daily summary", http.StatusBadRequest)
			return
		}
	}

	if end.Before(time.Now()) {
		SetupCacheControl(w, 100000000)
	} else {
		SetupCacheControl(w, 5)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}
