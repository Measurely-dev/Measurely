package service

import (
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Service) VerifyKeyToMetricId(metricid uuid.UUID, apikey string) bool {
	value, ok := s.cache.metrics[0].Load(metricid)
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
		app, err := s.db.GetProjectByApi(apikey)
		if err != nil {
			log.Println(err)
			return false
		}

		if app.Id != metric.ProjectId {
			return false
		}

		s.cache.metrics[0].Store(metricid, MetricCache{
			key:         apikey,
			metric_type: metric.Type,
			user_id:     app.UserId,
			metric_id:   metric.Id,
			expiry:      time.Now().Add(15 * time.Minute),
		})

		return true
	}

	return relation.key == apikey
}

func (s *Service) VerifyKeyToMetricName(metricname string, apikey string) bool {
	value, ok := s.cache.metrics[1].Load(apikey + metricname)
	var relation MetricCache
	expired := false

	if ok {
		relation = value.(MetricCache)
		if time.Now().After(relation.expiry) {
			expired = true
		}
	}

	if !ok || expired {
		app, err := s.db.GetProjectByApi(apikey)
		if err != nil {
			log.Println(err)
			return false
		}

		metric, err := s.db.GetMetricByName(metricname, app.Id)
		if err != nil && err != sql.ErrNoRows {
			log.Println(err)
			return false
		}

		if app.Id != metric.ProjectId {
			return false
		}

		s.cache.metrics[1].Store(apikey+metricname, MetricCache{
			key:         apikey,
			metric_type: metric.Type,
			user_id:     app.UserId,
			metric_id:   metric.Id,
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

func (s *Service) CreateMetricEventV1(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		http.Error(w, "Invalid or missing Authorization header", http.StatusUnauthorized)
		return
	}
	apikey := authHeader[7:]

	metricid, err := uuid.Parse(chi.URLParam(r, "metricidentifier"))
	metricname := chi.URLParam(r, "metricidentifier")
	useName := false

	if metricname == "" && err != nil {
		http.Error(w, "Invalid metric ID", http.StatusBadRequest)
		return
	}

	if metricname != "" && err != nil {
		useName = true
	}

	var request struct {
		Value   int               `json:"value"`
		Filters map[string]string `json:"filters"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	formattedFilters := make(map[string]string)

	for key, value := range request.Filters {
		key = strings.ToLower(strings.TrimSpace(key))
		value = strings.ToLower(strings.TrimSpace(value))

		match1, err := regexp.MatchString(`^[a-zA-Z0-9 _\-/\$%#&\*\(\)!~]+$`, key)
		if err != nil {
			http.Error(w, "Invalid name format for filter category: ", http.StatusBadRequest)
			return
		}

		match2, err := regexp.MatchString(`^[a-zA-Z0-9 _\-/\$%#&\*\(\)!~]+$`, value)
		if err != nil {
			http.Error(w, "Invalid name format for filter name:", http.StatusBadRequest)
			return
		}
		if !match1 || !match2 {
			http.Error(w, "Metric name can only contain letters, numbers, spaces, and these special characters ($, _ , - , / , & , *, ! , ~)", http.StatusBadRequest)
			return
		}

		formattedFilters[key] = value
	}

	var value any
	if useName {
		if !s.VerifyKeyToMetricName(metricname, apikey) {
			http.Error(w, "Invalid API key or metric name", http.StatusUnauthorized)
			return
		}

		value, _ = s.cache.metrics[1].Load(apikey + metricname)
	} else {
		if !s.VerifyKeyToMetricId(metricid, apikey) {
			http.Error(w, "Invalid API key or metric ID", http.StatusUnauthorized)
			return
		}
		value, _ = s.cache.metrics[0].Load(metricid)
	}

	// Retrieve the metric's and user's cache entry
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
	if err, count := s.db.UpdateMetricAndCreateEvent(metricCache.metric_id, metricCache.user_id, pos, neg, &formattedFilters); err != nil {
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

	projectid, err := uuid.Parse(r.URL.Query().Get("projectid"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
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

	// Get the project
	app, err := s.db.GetProject(projectid, token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Verify API key and metric association
	if !s.VerifyKeyToMetricId(metricid, app.ApiKey) {
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

	projectid, err := uuid.Parse(r.URL.Query().Get("projectid"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
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

	// Get the project
	app, err := s.db.GetProject(projectid, token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Verify API key and metric association
	if !s.VerifyKeyToMetricId(metricid, app.ApiKey) {
		http.Error(w, "Metric not found", http.StatusNotFound)
		return
	}

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

	if end.Before(time.Now()) {
		SetupCacheControl(w, 100000000)
	} else {
		SetupCacheControl(w, 5)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
