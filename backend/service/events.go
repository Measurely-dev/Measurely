package service

import (
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

func (s *Service) CreateMetricEvent(w http.ResponseWriter, r *http.Request) {
	var request CreateMetricEventRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		log.Println(jerr)
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	if !s.RateAllow(request.ApplicationApiKey) {
		http.Error(w, "You have exceeded the rate limit, 100 metric eventsper second", http.StatusServiceUnavailable)
		return
	}

	logKey := "events:process"
	bytes, jerr := json.Marshal(request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}
	if err := s.redisClient.RPush(s.redisCtx, logKey, bytes).Err(); err != nil {
		log.Println(err)
		http.Error(w, "Failed to store metric event", http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusAccepted)
}

func (s *Service) GetMetricEvents(w http.ResponseWriter, r *http.Request) {
	val, ok := r.Context().Value(types.USERID).(uuid.UUID)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request GetMetricEventsRequest

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Get application
	_, err := s.DB.GetApplication(request.AppId, val)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Get Metric
	_, err = s.DB.GetMetric(request.MetricId, request.AppId)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// get the metric events
	metrics, err := s.DB.GetMetricEvents(request.MetricId, request.Offset)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(metrics)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) UpdateMeterTotal() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C

		keys, err := s.redisClient.Keys(s.redisCtx, "metric:*:add").Result()
		if err != nil {
			log.Println("Failed to scan Redis keys:", err)
			continue
		}

		// Fetch counts
		counts := make(map[string]int)
		for _, key := range keys {
			count, err := s.redisClient.Get(s.redisCtx, key).Int()
			if err != nil {
				log.Println("Failed to get value from Redis:", err)
				continue
			}
			metricid := strings.TrimPrefix(key, "metric:")
			metricid = strings.TrimSuffix(metricid, ":add")
			counts[metricid] = count
		}

		// report to stripe
		for metricid, count := range counts {
			if count == 0 {
				continue
			}

			s.DB.UpdateMetricTotal(uuid.MustParse(metricid), count)

			redisKeyOverage := fmt.Sprintf("metric:%s:add", metricid)
			oerr := s.redisClient.Set(s.redisCtx, redisKeyOverage, 0, 0).Err()
			if oerr != nil {
				log.Println("Failed to reset overage count to zero in Redis:", oerr)
			}
		}
	}
}

func (s *Service) StoreMetricEvents() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C

		lockKey := "events:store:lock"
		var lock *redis.BoolCmd
		for {
			lock = s.redisClient.SetNX(s.redisCtx, lockKey, "locked", 10*time.Second)
			if !lock.Val() {
				// Failed to acquire lock
				time.Sleep(10 * time.Millisecond)
				continue
			}
			break
		}

		// Fetch logs from the list
		eventBytes, err := s.redisClient.LRange(s.redisCtx, "events:store", 0, int64(s.GetRate("storage"))-1).Result()
		if err != nil {
			log.Println("Failed to fetch logs from Redis:", err)
			continue
		}

		// Remove fetched logs from the list
		_, err = s.redisClient.LTrim(s.redisCtx, "events:store", int64(len(eventBytes)), -1).Result()
		if err != nil {
			log.Println("Failed to trim logs in Redis:", err)
			continue
		}

		s.redisClient.Del(s.redisCtx, lockKey)

		// Unmarshal and process logs
		var events []types.MetricEvent
		for _, eventStr := range eventBytes {
			var new_event types.MetricEvent
			if err := json.Unmarshal([]byte(eventStr), &new_event); err != nil {
				log.Println("Failed to unmarshal log:", err)
				continue
			}
			events = append(events, new_event)
		}

		// Store the logs
		if len(events) > 0 {
			if err := s.DB.CreateMetricEvents(events); err != nil {
				log.Println("Failed to create metric events:", err)
			}
		}
	}
}

func (s *Service) ProcessMetricEvents() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C

		for i := 0; i < s.GetRate("event"); i++ {
			logBytes, err := s.redisClient.BRPop(s.redisCtx, 0, "events:process").Result()
			if err != nil {
				log.Println("Failed to fetch metric events from Redis:", err)
				continue
			}
			if len(logBytes) < 2 {
				continue
			}

			logStr := logBytes[1]

			go func(logStr string) {
				var request CreateMetricEventRequest
				if err := json.Unmarshal([]byte(logStr), &request); err != nil {
					log.Println("Failed to unmarshal metric event:", err)
				}

				err := s.Process(request)
				if err != nil {
					log.Println("Failed to process metric event:", err)
				}

			}(logStr)

		}

	}
}

func (s *Service) Process(request CreateMetricEventRequest) error {
	val, err := s.redisClient.Get(s.redisCtx, request.ApplicationApiKey).Result()
	if err == redis.Nil {
		lockKey := "events:lock:" + request.ApplicationApiKey
		lock := s.redisClient.SetNX(s.redisCtx, lockKey, "locked", 0)
		if lock.Val() {
			log.Println("Acquired lock for", request.ApplicationApiKey)
			// Get the app
			app, err := s.DB.GetApplicationByApi(request.ApplicationApiKey)
			if err != nil {
				return err
			}

			metrics, err := s.DB.GetMetrics(app.Id)
			if err != nil {
				return err
			}

			var cache CacheData

			cache.AppId = app.Id
			cache.Metrics = metrics

			bytes, err := json.Marshal(cache)
			if err != nil {
				return err
			}

			s.redisClient.Set(s.redisCtx, request.ApplicationApiKey, bytes, 1*time.Minute)

			val = string(bytes)

			s.redisClient.Del(s.redisCtx, lockKey)
		} else {
			// Lock not acquired, wait and try again
			retryCount := 0
			maxRetries := 100
			retryDelay := 10 * time.Millisecond

			for retryCount < maxRetries {
				time.Sleep(retryDelay)
				exists, err := s.redisClient.Exists(s.redisCtx, lockKey).Result()
				if err != nil {
					log.Println("Failed to check lock existence:", err)
					continue
				}
				if exists <= 0 {
					val = s.redisClient.Get(s.redisCtx, request.ApplicationApiKey).Val()
					break
				}
				retryCount++
			}
		}

	} else if err != nil {
		return err
	}

	var cache CacheData
	jerr := json.Unmarshal([]byte(val), &cache)
	if jerr != nil {
		return jerr
	}

	// Check if the metric is disbled
	var metricid uuid.UUID
	exists := false
	for _, metric := range cache.Metrics {
		if metric.Identifier == request.Metric {
			exists = true
			if !metric.Enabled {
				return errors.New("metric is disabled")
			}
			break
		}
	}

	if !exists {
		return errors.New("metric not found")
	}

	// update the total
	key := fmt.Sprintf("metric:%s:add", metricid)
	s.redisClient.IncrBy(s.redisCtx, key, int64(request.Value))

	// Broadcast message to connected clients
	bytes, err := json.Marshal(request)
	if err == nil {
		s.redisClient.Publish(s.redisCtx, cache.AppId.String(), bytes).Err()
	}

	// Create the log
	new_event := types.MetricEvent{
		Date:    request.Date,
		Type:    types.TIME,
		Columns: sql.Null[string]{V: "", Valid: false},
		Value:   request.Value,
	}

	eventKey := "events:store"
	bytes, jjerr := json.Marshal(new_event)
	if jjerr != nil {
		return jjerr
	}
	if err := s.redisClient.RPush(s.redisCtx, eventKey, bytes).Err(); err != nil {
		return err
	}

	return nil
}

func (s *Service) RateAllow(key string) bool {
	now := time.Now()
	bucketKey := fmt.Sprintf("rate_limit:%s", key)
	refillKey := fmt.Sprintf("rate_limit_refill:%s", key)
	bucketSize := 100
	refillRate := time.Second

	// Get the current token count and last refill time
	tokenCount, err1 := s.redisClient.Get(s.redisCtx, bucketKey).Int()
	if err1 != nil && err1 != redis.Nil {
		log.Println("Failed to get token count:", err1)
		return false
	}

	lastRefill, err2 := s.redisClient.Get(s.redisCtx, refillKey).Time()
	if err2 != nil && err2 != redis.Nil {
		log.Println("Failed to get last refill time:", err2)
		return false
	}

	if err1 == redis.Nil || err2 == redis.Nil {
		s.redisClient.Set(s.redisCtx, bucketKey, bucketSize-1, 0)
		s.redisClient.Set(s.redisCtx, refillKey, now, 0)
		return true
	}

	// Calculate the elapsed time since the last refill
	elapsed := now.Sub(lastRefill)
	if elapsed < refillRate {
		if tokenCount == 0 {
			return false
		} else {
			s.redisClient.Decr(s.redisCtx, bucketKey)
			return true
		}
	}
	s.redisClient.Set(s.redisCtx, bucketKey, bucketSize-1, 0)
	s.redisClient.Set(s.redisCtx, refillKey, now, 0)

	return true
}
