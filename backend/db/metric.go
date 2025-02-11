package db

import (
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

type TmpMetric struct {
	types.Metric
	Filters []byte `db:"filters"`
}

func (db *DB) CreateMetric(metric types.Metric) (types.Metric, error) {
	var new_metric types.Metric
	query := `INSERT INTO metrics
		(project_id, name, type, name_pos, name_neg,  unit, stripe_api_key)
		VALUES (:project_id, :name, :type, :name_pos, :name_neg, :unit, :stripe_api_key) RETURNING *`

	rows, err := db.Conn.NamedQuery(query, metric)
	if err != nil {
		return types.Metric{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var tmp_metric TmpMetric
		err := rows.StructScan(&tmp_metric)
		if err != nil {
			return types.Metric{}, err
		}

		var metric_filters map[uuid.UUID]types.Filter
		if err := json.Unmarshal(tmp_metric.Filters, &metric_filters); err != nil {
			return types.Metric{}, err
		}

		new_metric = tmp_metric.Metric
		new_metric.Filters = metric_filters
	}

	return new_metric, err
}

func (db *DB) DeleteMetric(id, projectId uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metrics WHERE id = $1 AND project_id = $2", id, projectId)
	return err
}

func (db *DB) UpdateMetricAndCreateEvent(
	metricId uuid.UUID,
	projectId uuid.UUID,
	toAdd int,
	toRemove int,
	filters *map[string]string,
) (error, int) {
	tx, err := db.Conn.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err), 0
	}

	now := time.Now().UTC()

	var metricType int
	var filtersData []byte

	err = tx.QueryRowx(`
		UPDATE metrics
		SET total_pos = total_pos + $1,
			total_neg = total_neg + $2,
			event_count = event_count + 1,
			last_event_timestamp = $3
		WHERE id = $4
		RETURNING type, filters`,
		toAdd, toRemove, now, metricId,
	).Scan(&metricType, &filtersData)

	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update metrics and fetch totals: %v", err), 0
	}

	var metric_filters map[uuid.UUID]types.Filter
	if err := json.Unmarshal(filtersData, &metric_filters); err != nil {
		tx.Rollback()
		log.Println(err)
		return fmt.Errorf("Failed to fetch metric filters"), 0
	}

	var filter_list []uuid.UUID

	for filter_id, filter_value := range metric_filters {
		for category, name := range *filters {
			if filter_value.Name == name && filter_value.Category == category {
				filter_list = append(filter_list, filter_id)
			}
		}
	}

	marshaled_filters, err := json.Marshal(filter_list)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to include the chosen filters in the event %v", err), 0
	}

	var monthlyCount int
	err = tx.QueryRowx(`
		UPDATE projects
		SET monthly_event_count = monthly_event_count + 1
		WHERE id = $1
		RETURNING monthly_event_count`, projectId,
	).Scan(&monthlyCount)

	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update user's monthly event count: %v", err), 0
	}

	_, err = tx.Exec(`
		INSERT INTO metric_events ( metric_id, value_pos, value_neg, date, filters)
		VALUES ($1, $2, $3,$4, $5)
	`, metricId, toAdd, toRemove, now, marshaled_filters)

	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert metric event: %v", err), 0
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err), 0
	}

	return nil, monthlyCount
}

func (db *DB) GetMetricsCount(projectId uuid.UUID) (int, error) {
	var count int
	err := db.Conn.Get(&count, `
		SELECT COUNT(*)
		FROM metrics
		WHERE project_id = $1
	`, projectId)
	return count, err
}

func (db *DB) UpdateMetric(id, projectId uuid.UUID, name, namePos, nameNeg string) error {
	_, err := db.Conn.Exec(`
		UPDATE metrics
		SET name = $1, name_pos = $2, name_neg = $3
		WHERE id = $4 AND project_id = $5`,
		name, namePos, nameNeg, id, projectId)
	return err
}

func (db *DB) GetMetrics(projectId uuid.UUID) ([]types.Metric, error) {
	rows, err := db.Conn.Queryx(`
		SELECT * FROM metrics
		WHERE project_id = $1`, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []types.Metric

	for rows.Next() {
		var tmp_metric TmpMetric
		err := rows.StructScan(&tmp_metric)
		if err != nil {
			return nil, err
		}

		var metric_filters map[uuid.UUID]types.Filter
		if err := json.Unmarshal(tmp_metric.Filters, &metric_filters); err != nil {
			return nil, err
		}

		var metric types.Metric
		metric = tmp_metric.Metric
		metric.Filters = metric_filters

		metrics = append(metrics, metric)

	}

	return metrics, nil
}

func (db *DB) GetAllIntegrationMetrics() ([]types.Metric, error) {
	rows, err := db.Conn.Queryx("SELECT * FROM metrics WHERE type > 2")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []types.Metric

	for rows.Next() {
		var tmp_metric TmpMetric
		err := rows.StructScan(&tmp_metric)
		if err != nil {
			return nil, err
		}

		var metric_filters map[uuid.UUID]types.Filter
		if err := json.Unmarshal(tmp_metric.Filters, &metric_filters); err != nil {
			return nil, err
		}

		var metric types.Metric
		metric = tmp_metric.Metric
		metric.Filters = metric_filters

		metrics = append(metrics, metric)
	}

	return metrics, nil
}

func (db *DB) GetMetricByName(name string, projectId uuid.UUID) (types.Metric, error) {
	var tmp_metric TmpMetric
	err := db.Conn.Get(&tmp_metric, "SELECT * FROM metrics WHERE project_id = $1 AND name = $2", projectId, name)

	filters := make(map[uuid.UUID]types.Filter)
	if err := json.Unmarshal(tmp_metric.Filters, &filters); err != nil {
		return types.Metric{}, err
	}

	var metric types.Metric
	metric = tmp_metric.Metric
	metric.Filters = filters

	return metric, err
}

func (db *DB) GetMetricById(id uuid.UUID) (types.Metric, error) {
	var tmp_metric TmpMetric
	err := db.Conn.Get(&tmp_metric, "SELECT * FROM metrics WHERE id = $1", id)

	filters := make(map[uuid.UUID]types.Filter)
	if err := json.Unmarshal(tmp_metric.Filters, &filters); err != nil {
		return types.Metric{}, err
	}

	var metric types.Metric
	metric = tmp_metric.Metric
	metric.Filters = filters

	return metric, err
}

func (db *DB) GetMetricCount(groupId uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE group_id = $1", groupId)
	return count, err
}

func (db *DB) GetMetricEvents(metricId uuid.UUID, start time.Time, end time.Time, useNext bool) ([]types.MetricEvent, error) {
	var query string
	var rows *sql.Rows
	var err error

	if useNext {
		query = `
		SELECT * FROM metric_events
		WHERE metric_id = $1 AND date > $2
		ORDER BY date ASC LIMIT 1
		`
		rows, err = db.Conn.Query(query, metricId, end)
	} else {
		query = `
		SELECT * FROM metric_events
		WHERE metric_id = $1 AND date BETWEEN $2 AND $3
		ORDER BY date ASC
		`
		rows, err = db.Conn.Query(query, metricId, start, end)
	}

	if err != nil {
		return []types.MetricEvent{}, err
	}
	defer rows.Close()

	var events []types.MetricEvent
	for rows.Next() {
		var event types.MetricEvent
		var filter_list []byte
		err := rows.Scan(&event.Id, &event.MetricId, &event.ValuePos, &event.ValueNeg, &event.Date, &filter_list)
		if err != nil {
			return []types.MetricEvent{}, err
		}

		var filters []uuid.UUID
		err = json.Unmarshal(filter_list, &filters)
		if err != nil {
			return []types.MetricEvent{}, err
		}

		event.Filters = filters
		events = append(events, event)
	}

	return events, nil
}

func (db *DB) GetVariationEvents(metricId uuid.UUID, start time.Time, end time.Time) ([]types.MetricEvent, error) {
	query := `
		(SELECT * FROM metric_events
		WHERE metric_id = $1 AND date >= $2 AND date <= $3
		ORDER BY date ASC LIMIT 1)
		UNION ALL
		(SELECT * FROM metric_events
		WHERE metric_id = $1 AND date <= $3 AND date >= $2
		ORDER BY date DESC LIMIT 1)
	`

	rows, err := db.Conn.Query(query, metricId, start, end)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch variation events: %v", err)
	}

	defer rows.Close()

	var events []types.MetricEvent
	for rows.Next() {
		var event types.MetricEvent
		var filter_list []byte
		err := rows.Scan(&event.Id, &event.MetricId, &event.ValuePos, &event.ValueNeg, &event.Date, &filter_list)
		if err != nil {
			return []types.MetricEvent{}, err
		}

		var filters []uuid.UUID
		err = json.Unmarshal(filter_list, &filters)
		if err != nil {
			return []types.MetricEvent{}, err
		}

		event.Filters = filters
		events = append(events, event)
	}

	return events, nil
}

func (db *DB) UpdateMetricStripeAccount(id uuid.UUID, stripeId string) error {
	_, err := db.Conn.Exec(
		"UPDATE metrics SET stripe_account = $1 WHERE id = $2 AND type = $3",
		stripeId, id, types.STRIPE_METRIC,
	)
	return err
}

func (db *DB) UpdateMetricLastEventTimestamp(id uuid.UUID, date time.Time) error {
	_, err := db.Conn.Exec(
		"UPDATE metrics SET last_event_timestamp = $1 WHERE id = $2",
		date, id,
	)
	return err
}

func (db *DB) UpdateMetricUnit(id uuid.UUID, project_id uuid.UUID, unit string) error {
	_, err := db.Conn.Exec(`UPDATE metrics SET unit = $1 WHERE id = $2 AND project_id = $3 `, unit, id, project_id)
	return err
}

func (db *DB) AddFilters(id uuid.UUID, project_id uuid.UUID, newFilters *[]byte) error {
	_, err := db.Conn.Exec("UPDATE metrics SET filters = filters || $1 WHERE id = $2 AND project_id = $3", *newFilters, id, project_id)
	return err
}

func (db *DB) DeleteFilter(id uuid.UUID, project_id uuid.UUID, filter_id uuid.UUID) error {
	_, err := db.Conn.Exec("UPDATE metrics SET filters = filters - $1 WHERE id = $2 AND project_id = $3", filter_id, id, project_id)
	return err
}

func (db *DB) UpdateFilterName(id uuid.UUID, project_id uuid.UUID, filter_id uuid.UUID, name string) error {
	_, err := db.Conn.Exec(`
		UPDATE metrics
        SET filters = jsonb_set(
            filters,
            ARRAY[$1, 'name'],
            to_jsonb($2::text)
        )
        WHERE filters ? $1 AND id = $3 AND project_id = $4;
		`, filter_id, name, id, project_id)
	return err
}

func (db *DB) UpdateCategoryName(id uuid.UUID, project_id uuid.UUID, category string, new_category string) error {
	_, err := db.Conn.Exec(`
		UPDATE metrics
	    SET filters = (
	        SELECT jsonb_object_agg(key,
	            CASE
	                WHEN value->>'category' = $1
	                THEN jsonb_set(value, '{category}', to_jsonb($2::text))
	                ELSE value
	            END
	        )
	        FROM jsonb_each(filters)
	    )
		WHERE id = $3 AND project_id = $4
		`, category, new_category, id, project_id)

	return err
}

func (db *DB) DeleteCategory(id uuid.UUID, project_id uuid.UUID, category string) error {
	_, err := db.Conn.Exec(`
		UPDATE metrics
		SET filters = COALESCE(
		  (
		    SELECT jsonb_object_agg(key, value)
		    FROM jsonb_each(filters) AS elem(key, value)
		    WHERE value->>'category' <> $1
		  ),
		  '{}'::jsonb
		)
		WHERE id = $2 AND project_id = $3
		`, category, id, project_id)

	return err
}
