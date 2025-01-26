package service

import (
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// validFilterRegex is a precompiled regex for validating filter names and values
var validFilterRegex = regexp.MustCompile(`^[a-zA-Z0-9 _\-/\$%#&\*\(\)!~]+$`)

// CacheDuration defines how long metrics are cached
const CacheDuration = 15 * time.Minute

// VerifyKeyToMetricId checks if an API key is authorized to access a metric by ID
func (s *Service) VerifyKeyToMetricId(metricid uuid.UUID, apikey string) bool {
	// Check cache first
	if value, ok := s.metricsCache.Load(metricid); ok {
		relation := value.(MetricCache)
		if !time.Now().After(relation.expiry) {
			return relation.key == apikey
		}
	}

	// Cache miss or expired, fetch from DB
	metric, err := s.db.GetMetricById(metricid)
	if err != nil {
		log.Printf("Failed to get metric by ID: %v", err)
		return false
	}

	app, err := s.db.GetProjectByApi(apikey)
	if err != nil {
		log.Printf("Failed to get project by API key: %v", err)
		return false
	}

	if app.Id != metric.ProjectId {
		return false
	}

	// Update cache
	s.metricsCache.Store(metricid, MetricCache{
		key:         apikey,
		metric_type: metric.Type,
		user_id:     app.UserId,
		metric_id:   metric.Id,
		expiry:      time.Now().Add(CacheDuration),
	})

	return true
}

// VerifyKeyToMetricName checks if an API key is authorized to access a metric by name
func (s *Service) VerifyKeyToMetricName(metricname string, apikey string) bool {
	cacheKey := apikey + metricname

	// Check cache first
	if value, ok := s.metricsCache.Load(cacheKey); ok {
		relation := value.(MetricCache)
		if !time.Now().After(relation.expiry) {
			return relation.key == apikey
		}
	}

	// Cache miss or expired, fetch from DB
	app, err := s.db.GetProjectByApi(apikey)
	if err != nil {
		log.Printf("Failed to get project by API key: %v", err)
		return false
	}

	metric, err := s.db.GetMetricByName(metricname, app.Id)
	if err != nil && err != sql.ErrNoRows {
		log.Printf("Failed to get metric by name: %v", err)
		return false
	}

	if app.Id != metric.ProjectId {
		return false
	}

	// Update cache
	s.metricsCache.Store(cacheKey, MetricCache{
		key:         apikey,
		metric_type: metric.Type,
		user_id:     app.UserId,
		metric_id:   metric.Id,
		expiry:      time.Now().Add(CacheDuration),
	})

	return true
}

// CreateMetricEventV1 handles the creation of new metric events
func (s *Service) CreateMetricEventV1(w http.ResponseWriter, r *http.Request) {
	// Validate auth header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		http.Error(w, "Invalid or missing Authorization header", http.StatusUnauthorized)
		return
	}
	apikey := authHeader[7:]

	// Parse metric identifier
	metricid, err := uuid.Parse(chi.URLParam(r, "metric_identifier"))
	metricname := chi.URLParam(r, "metric_identifier")
	useName := metricname != "" && err != nil

	if metricname == "" && err != nil {
		http.Error(w, "Invalid metric ID", http.StatusBadRequest)
		return
	}

	// Parse request body
	var request struct {
		Value   int               `json:"value"`
		Filters map[string]string `json:"filters"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate and format filters
	formattedFilters := make(map[string]string, len(request.Filters))
	for key, value := range request.Filters {
		key = strings.ToLower(strings.TrimSpace(key))
		value = strings.ToLower(strings.TrimSpace(value))

		if !validFilterRegex.MatchString(key) || !validFilterRegex.MatchString(value) {
			http.Error(w, "Invalid filter format - only alphanumeric and selected special characters allowed", http.StatusBadRequest)
			return
		}
		formattedFilters[key] = value
	}

	// Verify metric access
	var value any
	if useName {
		if !s.VerifyKeyToMetricName(metricname, apikey) {
			http.Error(w, "Invalid API key or metric name", http.StatusUnauthorized)
			return
		}
		value, _ = s.metricsCache.Load(apikey + metricname)
	} else {
		if !s.VerifyKeyToMetricId(metricid, apikey) {
			http.Error(w, "Invalid API key or metric ID", http.StatusUnauthorized)
			return
		}
		value, _ = s.metricsCache.Load(metricid)
	}

	metricCache := value.(MetricCache)
	projectCache, err := s.GetProjectCache(metricCache.key)
	if err != nil {
		log.Printf("Failed to retrieve project from cache: %v", err)
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	// Validate event limits and rules
	if projectCache.event_count > projectCache.monthly_event_limit {
		http.Error(w, fmt.Sprintf("Monthly event limit exceeded: %d events", projectCache.monthly_event_limit), http.StatusTooManyRequests)
		return
	}

	if metricCache.metric_type == types.BASE_METRIC && request.Value < 0 {
		http.Error(w, "Base metric cannot have negative value", http.StatusBadRequest)
		return
	}

	if request.Value == 0 && metricCache.metric_type != types.AVERAGE_METRIC {
		http.Error(w, "Metric value cannot be zero", http.StatusBadRequest)
		return
	}

	// Process metric value
	pos, neg := 0, 0
	if request.Value > 0 {
		pos = request.Value
	} else {
		neg = -request.Value
	}

	// Update metric and create event
	if err, count := s.db.UpdateMetricAndCreateEvent(metricCache.metric_id, projectCache.id, pos, neg, &formattedFilters); err != nil {
		log.Printf("Failed to update metric and create event: %v", err)
		http.Error(w, "Failed to update metric", http.StatusInternalServerError)
		return
	} else {
		s.projectsCache.Store(projectCache.api_key, ProjectCache{
			api_key:             projectCache.api_key,
			id:                  projectCache.id,
			event_count:         count,
			monthly_event_limit: projectCache.monthly_event_limit,
		})
	}

	w.WriteHeader(http.StatusOK)
}

// GetMetricEvents retrieves events for a given metric within a time range
func (s *Service) GetMetricEvents(w http.ResponseWriter, r *http.Request) {
	// Validate token
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Invalid authentication token", http.StatusUnauthorized)
		return
	}

	// Parse and validate query parameters
	metricid, err := uuid.Parse(r.URL.Query().Get("metric_id"))
	if err != nil {
		http.Error(w, "Invalid metric ID", http.StatusBadRequest)
		return
	}

	projectid, err := uuid.Parse(r.URL.Query().Get("project_id"))
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

	usenext := r.URL.Query().Get("use_next") == "1"

	// Validate access and retrieve data
	project, err := s.db.GetProject(projectid, token.Id)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	if !s.VerifyKeyToMetricId(metricid, project.ApiKey) {
		http.Error(w, "Unauthorized access to metric", http.StatusUnauthorized)
		return
	}

	plan, exists := s.plans[project.CurrentPlan]
	if !exists {
		http.Error(w, "Invalid subscription plan", http.StatusBadRequest)
		return
	}

	// Validate date range against plan limits
	nbrDays := (float64(end.Sub(start).Abs()) / float64(24*time.Hour)) - 2
	if nbrDays > float64(plan.Range) {
		http.Error(w, fmt.Sprintf("Date range exceeds plan limit of %d days", plan.Range), http.StatusUnauthorized)
		return
	}

	// Fetch and return events
	metrics, err := s.db.GetMetricEvents(metricid, start, end, usenext)
	if err != nil {
		log.Printf("Error fetching metric events: %v", err)
		http.Error(w, "Failed to retrieve events", http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(metrics)
	if err != nil {
		http.Error(w, "Failed to process events", http.StatusInternalServerError)
		return
	}

	// Set appropriate cache control
	if end.Before(time.Now()) {
		SetupCacheControl(w, 100000000)
	} else {
		SetupCacheControl(w, 5)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

// GetDailyVariation retrieves daily variation data for a metric
func (s *Service) GetDailyVariation(w http.ResponseWriter, r *http.Request) {
	// Validate token
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Invalid authentication token", http.StatusUnauthorized)
		return
	}

	// Parse and validate query parameters
	metricid, err := uuid.Parse(r.URL.Query().Get("metric_id"))
	if err != nil {
		http.Error(w, "Invalid metric ID", http.StatusBadRequest)
		return
	}

	projectid, err := uuid.Parse(r.URL.Query().Get("project_id"))
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

	// Validate access and retrieve data
	app, err := s.db.GetProject(projectid, token.Id)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	if !s.VerifyKeyToMetricId(metricid, app.ApiKey) {
		http.Error(w, "Unauthorized access to metric", http.StatusUnauthorized)
		return
	}

	events, err := s.db.GetVariationEvents(metricid, start, end)
	if err != nil {
		http.Error(w, "Failed to retrieve variation data", http.StatusInternalServerError)
		return
	}

	// Remove duplicate events
	if len(events) > 1 && events[0].Id == events[1].Id {
		events = events[:1]
	}

	body, err := json.Marshal(events)
	if err != nil {
		http.Error(w, "Failed to process events", http.StatusInternalServerError)
		return
	}

	// Set appropriate cache control
	if end.Before(time.Now()) {
		SetupCacheControl(w, 100000000)
	} else {
		SetupCacheControl(w, 5)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
