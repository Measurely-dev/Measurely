package service

import (
	"Measurely/types"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
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
			total:       metric.Total,
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
		rate := value.(RateLimit)
		if time.Now().After(rate.expiry) {
			expired = true
		}
	}

	if !ok || expired {
		s.cache.ratelimits.Store(apikey, RateLimit{
			current: 0,
			max:     maxRequest,
			expiry:  time.Now().Add(1 * time.Minute),
		})

		return true
	}

	if rate.current > rate.max {
		return false
	}

	return true
}

func (s *Service) CreateMetricEvent(w http.ResponseWriter, r *http.Request) {
	apikey := chi.URLParam(r, "apikey")
	metricid, err := uuid.Parse(chi.URLParam(r, "metricid"))
	if err != nil {
		http.Error(w, "Invalid metric id", http.StatusBadRequest)
	}

	var request struct {
		Value int64 `json:"value"`
	}

	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	valid := s.VerifyKeyToMetric(metricid, apikey)
	if !valid {
		http.Error(w, "Invalid api key and/or metric id", http.StatusBadRequest)
		return
	}

	value, _ := s.cache.metricIdToApiKeys.Load(metricid)
	metricCache := value.(MetricToKeyCache)
	plan, err := s.GetUserPlan(metricCache.user_id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Plan not found", http.StatusNotFound)
		return
	}

	if !s.RateAllow(apikey, plan.RequestLimit) {
		http.Error(w, "You have exceeded the rate limit, 100 metric eventsper second", http.StatusServiceUnavailable)
		return
	}

	if metricCache.metric_type == types.BASE_METRIC && request.Value < 0 {
		http.Error(w, "A base metric cannot have a negative value", http.StatusBadRequest)
		return
	}

	if request.Value == 0 {
		http.Error(w, "A value cannot be null", http.StatusBadRequest)
		return
	}
	if err := s.db.CreateMetricEvent(types.MetricEvent{
		MetricId:      metricid,
		Value:         request.Value,
		RelativeTotal: metricCache.total + request.Value,
	}); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if err := s.db.CreateDailyMetricSummary(types.DailyMetricSummary{
		Id:            metricid.String() + time.Now().UTC().Format("2006-01-02"),
		MetricId:      metricid,
		Value:         request.Value,
		RelativeTotal: metricCache.total + request.Value,
	}); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if err := s.db.UpdateMetricTotal(metricid, request.Value); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Update the cache
	s.cache.metricIdToApiKeys.Store(metricid, MetricToKeyCache{
		key:         apikey,
		metric_type: metricCache.metric_type,
		total:       metricCache.total + request.Value,
		expiry:      time.Now().Add(15 * time.Minute),
	})

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
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	appid, err := uuid.Parse(r.URL.Query().Get("appid"))
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	start, err := time.Parse("Mon, 02 Jan 2006 15:04:05 MST", r.URL.Query().Get("start"))
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	end, err := time.Parse("Mon, 02 Jan 2006 15:04:05 MST", r.URL.Query().Get("end"))
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	daily := r.URL.Query().Get("daily")

	// Get application
	app, err := s.db.GetApplication(appid, token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	valid := s.VerifyKeyToMetric(metricid, app.ApiKey)
	if !valid {
		http.Error(w, "metric not found", http.StatusNotFound)
		return
	}

	plan, err := s.GetUserPlan(token.Id)
	if err != nil {
		http.Error(w, "internal error", http.StatusNotFound)
		return
	}

	nbrDays := (float64(end.Sub(start).Abs()) / float64(24*time.Hour)) - 1

	if nbrDays > float64(plan.Range) {
		http.Error(w, "Your current plan allows viewing up to"+strconv.Itoa(plan.Range)+"days of data. Upgrade to unlock extended date ranges.", http.StatusUnauthorized)
		return
	}

	var bytes []byte
	if daily != "1" {
		if end.Sub(start) > 24*time.Hour {
			http.Error(w, "You cannot fetch more than 24 hours of precise events", http.StatusBadRequest)
			return
		}
		// get the metric events
		metrics, err := s.db.GetMetricEvents(metricid, start, end)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		bytes, err = json.Marshal(metrics)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	} else {
		metricevents, err := s.db.GetDailyMetricSummary(metricid, start, end)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		bytes, err = json.Marshal(metricevents)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	SetupCacheControl(w, 60)
	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}
