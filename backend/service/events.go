package service

import (
	"Measurely/types"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Service) VerifyKeyToMetric(metricid uuid.UUID, apikey string) bool {
	value, ok := s.cache.metrics.Load(metricid)
	var relation MetricCache
	expired := false

	if ok {
		relation = value.(MetricCache)
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

		s.cache.metrics.Store(metricid, MetricCache{
			key:         apikey,
			metric_type: metric.Type,
			user_id:     app.UserId,
			expiry:      time.Now().Add(15 * time.Minute),
		})

		return true
	}

	return relation.key == apikey
}

func (s *Service) RateAllow(user_id uuid.UUID, maxRequest int) bool {
	value, ok := s.cache.ratelimits.Load(user_id)
	expired := false
	var rate RateLimit

	if ok {
		rate = value.(RateLimit)
		if time.Now().After(rate.expiry) {
			expired = true
		}
	}

	if !ok || expired {
		s.cache.ratelimits.Store(user_id, RateLimit{
			current: 1,
			max:     maxRequest,
			expiry:  time.Now().Add(1 * time.Minute),
		})

		return true
	}

	if rate.current > rate.max {
		return false
	}

	s.cache.ratelimits.Store(user_id, RateLimit{
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

	// Retrieve the metric's and user's cache entry
	value, _ := s.cache.metrics.Load(metricid)
	metricCache := value.(MetricCache)
	userCache, err := s.GetUserCache(metricCache.user_id)
	if err != nil {
		log.Println("Failed to retrieve user from cache:", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	plan, exists := s.GetPlan(userCache.plan_identifier)
	if !exists {
		log.Println("Failed to retrieve user from cache:", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	// Check if the rate limit is exceeded
	if !s.RateAllow(metricCache.user_id, plan.RequestLimit) {
		http.Error(w, "You have exceeded your plan's rate limit: "+strconv.Itoa(plan.RequestLimit)+" requests per minute", http.StatusTooManyRequests)
		return
	}

	// Check if the monthly limit is exceeded
	if userCache.metric_count >= plan.MonthlyEventLimit {
		http.Error(w, "You have exceeded your monthly event limit: "+strconv.FormatInt(plan.MonthlyEventLimit, 10)+" events per month", http.StatusTooManyRequests)
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

	// Update the metric and create the event summary in the database
	if err, count := s.db.UpdateMetricAndCreateEvent(metricid, metricCache.user_id, pos, neg); err != nil {
		log.Print("Failed to update metric and create event: ", err)
		http.Error(w, "Failed to update metric", http.StatusInternalServerError)
		return
	} else {
		s.cache.users.Store(metricCache.user_id, UserCache{
			plan_identifier: userCache.plan_identifier,
			metric_count:    count,
			startDate:       userCache.startDate,
		})
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

	start, err := time.Parse("2006-01-02T15:04:05.000Z", r.URL.Query().Get("start"))
	if err != nil {
		http.Error(w, "Invalid start date format", http.StatusBadRequest)
		return
	}

	end, err := time.Parse("2006-01-02T15:04:05.000Z", r.URL.Query().Get("end"))
	if err != nil {
		http.Error(w, "Invalid end date format", http.StatusBadRequest)
		return
	}

	usenext := false
	if r.URL.Query().Get("usenext") == "1" {
		usenext = true
	}

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

	userCache, err := s.GetUserCache(token.Id)
	if err != nil {
		log.Println("Failed to retrieve user from cache:", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	plan, exists := s.GetPlan(userCache.plan_identifier)
	if !exists {
		log.Println("Failed to retrieve user from cache:", err)
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	// Ensure the requested date range is within the user's plan limits
	nbrDays := (float64(end.Sub(start).Abs()) / float64(24*time.Hour)) - 2
	if nbrDays > float64(plan.Range) {
		http.Error(w, fmt.Sprintf("Your current plan allows viewing up to %d days of data. Upgrade to unlock extended date ranges.", plan.Range), http.StatusUnauthorized)
		return
	}

	var bytes []byte
	// Fetch the metric events
	metrics, err := s.db.GetMetricEvents(metricid, start, end, usenext)
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

	if end.Before(time.Now()) {
		SetupCacheControl(w, 100000000)
	} else {
		SetupCacheControl(w, 5)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func (s *Service) GetDailyVariation(w http.ResponseWriter, r *http.Request) {
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

	start := time.Now().UTC().Truncate(time.Hour)
	end := time.Date(start.Year(), start.Month(), start.Day(), 23, 0, 0, 0, time.UTC)
	events, err := s.db.GetVariationEvents(metricid, start, end)
	if err != nil {
		http.Error(w, "Internal error, failed to retrieve daily variation", http.StatusInternalServerError)
		return
	}

	if len(events) > 1 {
		if events[0].Id == events[1].Id {
			events = events[:1]
		}
	}

	body, err := json.Marshal(events)

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
