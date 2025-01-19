package db

import (
	"Measurely/types"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func (db *DB) CreateMetric(metric types.Metric) (types.Metric, error) {
	var newMetric types.Metric
	query := `INSERT INTO metrics
		(project_id, name, type, name_pos, name_neg, parent_metric_id, filter_category)
		VALUES (:project_id, :name, :type, :name_pos, :name_neg, :parent_metric_id, :filter_category) RETURNING *`

	rows, err := db.Conn.NamedQuery(query, metric)
	if err != nil {
		return types.Metric{}, err
	}
	defer rows.Close()
	rows.Next()
	err = rows.StructScan(&newMetric)
	if err != nil {
		return types.Metric{}, err
	}

	return newMetric, err
}

func (db *DB) DeleteMetric(id, projectId uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metrics WHERE id = $1 AND project_id = $2", id, projectId)
	return err
}

func (db *DB) DeleteMetricByCategory(parentMetricId, projectId uuid.UUID, category string) error {
	_, err := db.Conn.Exec(`
		DELETE FROM metrics
		WHERE parent_metric_id = $1
		AND project_id = $2
		AND filter_category = $3`,
		parentMetricId, projectId, category)
	return err
}

func (db *DB) UpdateCategoryName(oldName, newName string, parentMetricId, projectId uuid.UUID) error {
	_, err := db.Conn.Exec(`
		UPDATE metrics
		SET filter_category = $1
		WHERE parent_metric_id = $2
		AND project_id = $3
		AND filter_category = $4`,
		newName, parentMetricId, projectId, oldName)
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

	var totalPos, totalNeg, eventCount int64
	var metricType int

	err = tx.QueryRowx(`
		UPDATE metrics
		SET total_pos = total_pos + $1,
			total_neg = total_neg + $2,
			event_count = event_count + 1
		WHERE id = $3
		RETURNING total_pos, total_neg,  type, event_count`,
		toAdd, toRemove, metricId,
	).Scan(&totalPos, &totalNeg, &metricType, &eventCount)

	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update metrics and fetch totals: %v", err), 0
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

	now := time.Now().UTC().Truncate(time.Second)
	minute := now.Minute()
	roundedMinute := 0

	switch {
	case minute < 20:
		roundedMinute = 0
	case minute < 40:
		roundedMinute = 20
	default:
		roundedMinute = 40
	}

	date := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), roundedMinute, 0, 0, time.UTC)

	event := types.MetricEvent{
		RelativeTotalPos:   totalPos,
		RelativeTotalNeg:   totalNeg,
		RelativeEventCount: eventCount,
		MetricId:           metricId,
		ValuePos:           toAdd,
		ValueNeg:           toRemove,
		Date:               date,
	}

	const upsertEventQuery = `
		INSERT INTO metric_events (
			metric_id, value_pos, value_neg,
			relative_total_pos, relative_total_neg,
			relative_event_count, date
		) VALUES (
			:metric_id, :value_pos, :value_neg,
			:relative_total_pos, :relative_total_neg,
			:relative_event_count, :date
		) ON CONFLICT (metric_id, date) DO UPDATE SET
			value_pos = metric_events.value_pos + EXCLUDED.value_pos,
			value_neg = metric_events.value_neg + EXCLUDED.value_neg,
			event_count = metric_events.event_count + 1,
			relative_total_pos = EXCLUDED.relative_total_pos,
			relative_total_neg = EXCLUDED.relative_total_neg,
			relative_event_count = EXCLUDED.relative_event_count`

	_, err = tx.NamedExec(upsertEventQuery, event)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert metric event: %v", err), 0
	}

	for key, value := range *filters {
		var filterTotalPos, filterTotalNeg, filterEventCount int64
		var filterId uuid.UUID

		err = tx.QueryRowx(`
			UPDATE metrics
			SET total_pos = metrics.total_pos + $1,
				total_neg = metrics.total_neg + $2
			WHERE parent_metric_id = $3
			AND filter_category = $4
			AND name = $5
			RETURNING id, total_pos, total_neg, event_count`,
			toAdd, toRemove, metricId, key, value,
		).Scan(&filterId, &filterTotalPos, &filterTotalNeg, &filterEventCount)

		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert or update filter metrics: %v", err), 0
		}

		filterEvent := types.MetricEvent{
			RelativeTotalPos:   filterTotalPos,
			RelativeTotalNeg:   filterTotalNeg,
			RelativeEventCount: filterEventCount,
			MetricId:           filterId,
			ValuePos:           toAdd,
			ValueNeg:           toRemove,
			Date:               date,
		}

		_, err = tx.NamedExec(upsertEventQuery, filterEvent)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert filter metric event: %v", err), 0
		}
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
		AND parent_metric_id IS NULL`, projectId)
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

	metricsMap := make(map[string]map[string][]types.Metric)
	var metrics []types.Metric

	for rows.Next() {
		var metric types.Metric
		err := rows.StructScan(&metric)
		if err != nil {
			return nil, err
		}

		if metric.ParentMetricId.Valid {
			if metricsMap[metric.ParentMetricId.V] == nil {
				metricsMap[metric.ParentMetricId.V] = make(map[string][]types.Metric)
			}
			metricsMap[metric.ParentMetricId.V][metric.FilterCategory] = append(
				metricsMap[metric.ParentMetricId.V][metric.FilterCategory],
				metric,
			)
		} else {
			metrics = append(metrics, metric)
		}
	}

	for i, metric := range metrics {
		metrics[i].Filters = metricsMap[metric.Id.String()]
	}

	return metrics, nil
}

func (db *DB) GetAllIntegrationMetrics() ([]types.Metric, error) {
	rows, err := db.Conn.Query("SELECT * FROM metrics WHERE type > 2 AND parent_metric_id IS NULL")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	metricsMap := make(map[string]map[string][]types.Metric)
	var metrics []types.Metric

	for rows.Next() {
		var metric types.Metric
		err := rows.Scan(&metric)
		if err != nil {
			return nil, err
		}

		if metric.ParentMetricId.Valid {
			if metricsMap[metric.ParentMetricId.V] == nil {
				metricsMap[metric.ParentMetricId.V] = make(map[string][]types.Metric)
			}
			metricsMap[metric.ParentMetricId.V][metric.FilterCategory] = append(metricsMap[metric.ParentMetricId.V][metric.FilterCategory], metric)
		} else {
			metrics = append(metrics, metric)
		}
	}

	for i, metric := range metrics {
		metrics[i].Filters = metricsMap[metric.Id.String()]
	}

	return metrics, nil
}

func (db *DB) GetMetricByName(name string, projectId uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE project_id = $1 AND name = $2", projectId, name)
	return metric, err
}

func (db *DB) GetMetricById(id uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE id = $1", id)
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
		err := rows.Scan(&event.Id, &event.MetricId, &event.ValuePos, &event.ValueNeg, &event.RelativeTotalPos, &event.RelativeTotalNeg, &event.Date, &event.RelativeEventCount, &event.EventCount)
		if err != nil {
			return []types.MetricEvent{}, err
		}
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

	var events []types.MetricEvent
	err := db.Conn.Select(&events, query, metricId, start, end)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch variation events: %v", err)
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
