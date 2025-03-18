package db

import (
	"Measurely/types"
	"encoding/json"
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/google/uuid"
)

// BatchManager handles batched metric event processing
type BatchManager struct {
	db            *DB
	batchSize     int
	flushInterval time.Duration
	eventChan     chan MetricEventData
	wg            sync.WaitGroup
	shutdown      chan struct{}
}

// MetricEventData represents a single metric event to be batched
type MetricEventData struct {
	MetricID   uuid.UUID
	ProjectID  uuid.UUID
	ToAdd      int32
	ToRemove   int32
	Filters    map[string]string
	ResponseCh chan BatchResult
}

// BatchResult represents the result of processing a batched event
type BatchResult struct {
	Error        error
	MonthlyCount int
}

// NewBatchManager creates a new batch manager with specified parameters
func NewBatchManager(db *DB, batchSize int, flushInterval time.Duration) *BatchManager {
	if batchSize <= 0 {
		batchSize = 1000 // Default batch size
	}
	if flushInterval <= 0 {
		flushInterval = 1 * time.Second // Default flush interval
	}

	bm := &BatchManager{
		db:            db,
		batchSize:     batchSize,
		flushInterval: flushInterval,
		eventChan:     make(chan MetricEventData, batchSize*2), // Buffer twice the batch size
		shutdown:      make(chan struct{}),
	}

	// Start the background processing goroutines
	bm.start()
	return bm
}

// start launches the background processing goroutines
func (bm *BatchManager) start() {
	numWorkers := runtime.NumCPU() // Use one worker per CPU core
	bm.wg.Add(numWorkers)

	for i := 0; i < numWorkers; i++ {
		go bm.processEvents()
	}
}

// QueueEvent adds a metric event to the processing queue
func (bm *BatchManager) QueueEvent(event MetricEventData) BatchResult {
	resultCh := make(chan BatchResult, 1)
	event.ResponseCh = resultCh

	select {
	case bm.eventChan <- event:
		// Successfully queued
	case <-time.After(5 * time.Second):
		// Timeout if queue is full for too long
		return BatchResult{Error: fmt.Errorf("event queue is full"), MonthlyCount: 0}
	}

	return <-resultCh
}

// processEvents handles batched event processing
func (bm *BatchManager) processEvents() {
	defer bm.wg.Done()

	batch := make([]MetricEventData, 0, bm.batchSize)
	timer := time.NewTimer(bm.flushInterval)

	for {
		select {
		case <-bm.shutdown:
			if len(batch) > 0 {
				bm.processBatch(batch)
			}
			return

		case event := <-bm.eventChan:
			batch = append(batch, event)

			if len(batch) >= bm.batchSize {
				bm.processBatch(batch)
				batch = make([]MetricEventData, 0, bm.batchSize)
				timer.Reset(bm.flushInterval)
			}

		case <-timer.C:
			if len(batch) > 0 {
				bm.processBatch(batch)
				batch = make([]MetricEventData, 0, bm.batchSize)
			}
			timer.Reset(bm.flushInterval)
		}
	}
}

// processBatch executes a batch of metric events
func (bm *BatchManager) processBatch(batch []MetricEventData) {
	tx, err := bm.db.Conn.Beginx()
	if err != nil {
		// Handle error - return error to all events in batch
		for _, event := range batch {
			event.ResponseCh <- BatchResult{
				Error:        fmt.Errorf("failed to begin transaction: %v", err),
				MonthlyCount: 0,
			}
		}
		return
	}

	now := time.Now().UTC()
	projectCounts := make(map[uuid.UUID]int)
	results := make(map[int]BatchResult)

	// Prepare statement for updating metrics
	updateMetricStmt, err := tx.Preparex(`
		UPDATE metrics
		SET total = total + ( CAST($1 AS BIGINT) - CAST($2 AS BIGINT) ),
			event_count = event_count + 1,
			last_event_timestamp = $3
		WHERE id = $4
		RETURNING type, filters`)
	if err != nil {
		tx.Rollback()
		for _, event := range batch {
			event.ResponseCh <- BatchResult{
				Error:        fmt.Errorf("failed to prepare update statement: %v", err),
				MonthlyCount: 0,
			}
		}
		return
	}
	defer updateMetricStmt.Close()

	// Prepare statement for inserting events
	insertEventStmt, err := tx.Preparex(`
		INSERT INTO metric_events ( metric_id, value_pos, value_neg, date, filters)
		VALUES ($1, $2, $3, $4, $5)`)
	if err != nil {
		tx.Rollback()
		for _, event := range batch {
			event.ResponseCh <- BatchResult{
				Error:        fmt.Errorf("failed to prepare insert statement: %v", err),
				MonthlyCount: 0,
			}
		}
		return
	}
	defer insertEventStmt.Close()

	// Process each event in the batch
	for i, event := range batch {
		var metricType int
		var filtersData []byte

		// Update the metric
		err := updateMetricStmt.QueryRowx(
			event.ToAdd, event.ToRemove, now, event.MetricID,
		).Scan(&metricType, &filtersData)

		if err != nil {
			results[i] = BatchResult{
				Error:        fmt.Errorf("failed to update metric: %v", err),
				MonthlyCount: 0,
			}
			continue
		}

		// Process filters
		var metric_filters map[uuid.UUID]types.Filter
		if err := json.Unmarshal(filtersData, &metric_filters); err != nil {
			results[i] = BatchResult{
				Error:        fmt.Errorf("failed to fetch metric filters: %v", err),
				MonthlyCount: 0,
			}
			continue
		}

		var filter_list []uuid.UUID
		for filter_id, filter_value := range metric_filters {
			for category, name := range event.Filters {
				if filter_value.Name == name && filter_value.Category == category {
					filter_list = append(filter_list, filter_id)
				}
			}
		}

		marshaled_filters, err := json.Marshal(filter_list)
		if err != nil {
			results[i] = BatchResult{
				Error:        fmt.Errorf("failed to process filters: %v", err),
				MonthlyCount: 0,
			}
			continue
		}

		// Insert the event
		_, err = insertEventStmt.Exec(
			event.MetricID, event.ToAdd, event.ToRemove, now, marshaled_filters,
		)

		if err != nil {
			results[i] = BatchResult{
				Error:        fmt.Errorf("failed to insert event: %v", err),
				MonthlyCount: 0,
			}
			continue
		}

		// Track project counts
		projectCounts[event.ProjectID]++
	}

	// Bulk update project monthly counts
	for projectID, count := range projectCounts {
		var monthlyCount int
		err := tx.QueryRowx(`
			UPDATE projects
			SET monthly_event_count = monthly_event_count + $1
			WHERE id = $2
			RETURNING monthly_event_count`, count, projectID,
		).Scan(&monthlyCount)

		if err != nil {
			tx.Rollback()
			for _, event := range batch {
				if event.ProjectID == projectID {
					event.ResponseCh <- BatchResult{
						Error:        fmt.Errorf("failed to update monthly count: %v", err),
						MonthlyCount: 0,
					}
				}
			}
			return
		}

		// Set successful results for this project
		for i, event := range batch {
			if event.ProjectID == projectID && results[i].Error == nil {
				results[i] = BatchResult{
					Error:        nil,
					MonthlyCount: monthlyCount,
				}
			}
		}
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		for i := range batch {
			results[i] = BatchResult{
				Error:        fmt.Errorf("failed to commit transaction: %v", err),
				MonthlyCount: 0,
			}
		}
	}

	// Send results to waiting goroutines
	for i, event := range batch {
		result, exists := results[i]
		if !exists {
			result = BatchResult{
				Error:        fmt.Errorf("unhandled event"),
				MonthlyCount: 0,
			}
		}
		event.ResponseCh <- result
	}
}

// Shutdown gracefully stops the batch manager after processing any remaining events
func (bm *BatchManager) Shutdown() {
	close(bm.shutdown)
	bm.wg.Wait()
}

// UpdateMetricAndCreateEvent is now a wrapper around the batch processor
func (db *DB) UpdateMetricAndCreateEvent(
	metricId uuid.UUID,
	projectId uuid.UUID,
	toAdd int32,
	toRemove int32,
	filters *map[string]string,
	bm *BatchManager,
) (int, error) {
	// Create a map if filters is nil
	actualFilters := make(map[string]string)
	if filters != nil {
		actualFilters = *filters
	}

	// Queue the event and wait for the result
	result := bm.QueueEvent(MetricEventData{
		MetricID:  metricId,
		ProjectID: projectId,
		ToAdd:     toAdd,
		ToRemove:  toRemove,
		Filters:   actualFilters,
	})

	return result.MonthlyCount, result.Error
}

// BatchManagerSingleton maintains a singleton instance of the BatchManager
var (
	batchManagerInstance *BatchManager
	batchManagerOnce     sync.Once
	batchManagerMu       sync.Mutex
)

// GetBatchManager returns the shared batch manager instance
func GetBatchManager(db *DB) *BatchManager {
	batchManagerMu.Lock()
	defer batchManagerMu.Unlock()

	batchManagerOnce.Do(func() {
		batchManagerInstance = NewBatchManager(db, 1000, 500*time.Millisecond)
	})

	return batchManagerInstance
}
