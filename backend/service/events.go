package service

import (
	"Measurely/types"
	"encoding/json"
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
		relation := value.(MetricToKeyCache)
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
		group, err := s.db.GetMetricGroupById(metric.GroupId)
		if err != nil {
			log.Println(err)
			return false
		}
		app, err := s.db.GetApplicationByApi(apikey)
		if err != nil {
			log.Println(err)
			return false
		}

		if app.Id != group.AppId {
			return false
		}

		s.cache.metricIdToApiKeys.Store(metricid, MetricToKeyCache{
			key:    apikey,
			expiry: time.Now().Add(30 * time.Minute),
		})

		return true
	}

	return relation.key == apikey
}

func (s *Service) CreateMetricEvent(w http.ResponseWriter, r *http.Request) {
	apikey := chi.URLParam(r, "apikey")
	metricid, err := uuid.Parse(chi.URLParam(r, "metricid"))
	if err != nil {
		http.Error(w, "Invalid metric id", http.StatusBadRequest)
	}
	//
	// if !s.RateAllow(apikey) {
	// 	http.Error(w, "You have exceeded the rate limit, 100 metric eventsper second", http.StatusServiceUnavailable)
	// 	return
	// }

	var request struct {
		Value int `json:"value"`
	}

	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if request.Value <= 0 {
		http.Error(w, "Value cannot be negative or null", http.StatusBadRequest)
	}

	valid := s.VerifyKeyToMetric(metricid, apikey)
	if !valid {
		http.Error(w, "Invalid api key and/or metric id", http.StatusBadRequest)
		return
	}

	if err := s.db.CreateMetricEvent(types.MetricEvent{
		MetricId: metricid,
		Value:    request.Value,
	}); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if err := s.db.CreateDailyMetricSummary(types.DailyMetricSummary{
		Id:       metricid.String() + time.Now().UTC().Format("2006-01-02"),
		MetricId: metricid,
		Value:    request.Value,
	}); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if err := s.db.UpdateMetricTotal(metricid, request.Value); err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
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
	groupid, err := uuid.Parse(r.URL.Query().Get("groupid"))
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
	_, err = s.db.GetApplication(appid, token.Id)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get Group
	_, err = s.db.GetMetricGroup(groupid, appid)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get Metric
	_, err = s.db.GetMetric(metricid, groupid)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var bytes []byte
	if end.Year() == start.Year() && end.Month() == start.Month() && end.Day() == start.Day() && daily != "1" {
		// get the metric events
		metrics, err := s.db.GetMetricEvents(metricid, start)
		if err != nil {
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
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		bytes, err = json.Marshal(metricevents)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}
