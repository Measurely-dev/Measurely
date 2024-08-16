package db

import (
	"Measurely/types"
	"database/sql"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type DB struct {
	Conn *sqlx.DB
}

func NewPostgres(url string) (*DB, error) {
	db, err := sqlx.Connect("postgres", url)
	if err != nil {
		return nil, err
	}
	return &DB{Conn: db}, nil
}

func (d *DB) Close() error {
	return d.Conn.Close()
}

func (db *DB) CreateUser(user types.User) (types.User, error) {
	var new_user types.User
	err := db.Conn.QueryRow("INSERT INTO users (email, password, provider, stripecustomerid, currentplan) VALUES ($1, $2, $3, $4, $5) RETURNING *", user.Email, user.Password, user.Provider, user.StripeCustomerId, user.CurrentPlan).Scan(&new_user.Id, &new_user.Email, &new_user.Password, &new_user.Provider, &new_user.StripeCustomerId, &new_user.CurrentPlan)
	if err != nil {
		return new_user, err
	}
	return new_user, nil
}

func (db *DB) DeleteUser(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM users WHERE id = $1", id)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) GetUserByEmail(email string) (types.User, error) {
	var user types.User
	err := db.Conn.Get(&user, "SELECT * FROM users WHERE email = $1", email)
	return user, err
}
func (db *DB) GetUserById(id uuid.UUID) (types.User, error) {
	var user types.User
	err := db.Conn.Get(&user, "SELECT * FROM users WHERE id = $1", id)
	return user, err
}

func (db *DB) GetUserByCustomerId(cusId string) (types.User, error) {
	var user types.User
	err := db.Conn.Get(&user, "SELECT * FROM users WHERE stripecustomerid = $1", cusId)
	return user, err
}

func (db *DB) UpdateUserPassword(id uuid.UUID, password string) error {
	_, err := db.Conn.Exec("UPDATE users SET password = $1 WHERE id = $2", password, id)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) UpdateUserPlan(id uuid.UUID, plan sql.Null[string]) error {
	_, err := db.Conn.Exec("UPDATE users SET currentplan = $1 WHERE id = $2", plan, id)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateMetric(metric types.Metric) (types.Metric, error) {
	var new_metric types.Metric
	err := db.Conn.QueryRow("INSERT INTO users (appid, name, enabled) VALUES ($1, $2, $3) RETURNING *", metric.AppId, metric.Name, metric.Enabled).Scan(&new_metric.Id, &new_metric.AppId, &new_metric.Name, &new_metric.Enabled)
	if err != nil {
		return new_metric, err
	}
	return new_metric, nil
}

func (db *DB) CreateMetricEvents(events []types.MetricEvent) error {
	_, err := db.Conn.NamedExec("INSERT INTO metricevents (metricid, date, type, column, value) VALUES (:metricid, :date, :type, :column, :value) RETURNING *", events)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) GetMetrics(appid uuid.UUID) ([]types.Metric, error) {
	rows, err := db.Conn.Query("SELECT * FROM metrics WHERE appid = $1", appid)
	if err != nil {
		return []types.Metric{}, err
	}
	defer rows.Close()
	var metrics []types.Metric
	for rows.Next() {
		var metric types.Metric
		err := rows.Scan(&metric.AppId, &metric.Id, &metric.Name, &metric.Identifier, &metric.Enabled)
		if err != nil {
			return []types.Metric{}, err
		}
		metrics = append(metrics, metric)
	}

	return metrics, nil
}

func (db *DB) GetMetric(id uuid.UUID, appid uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE id = $1 AND appid = $2", id, appid)
	return metric, err
}

func (db *DB) GetMetricCount(appid uuid.UUID) (int, error) {
	var count int
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE appid = $1", appid)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (db *DB) GetMetricEvents(metricid uuid.UUID) ([]types.MetricEvent, error) {
	rows, err := db.Conn.Query("SELECT * FROM metricevents WHERE metricid = $1", metricid)
	if err != nil {
		return []types.MetricEvent{}, err
	}
	defer rows.Close()
	var events []types.MetricEvent
	for rows.Next() {
		var event types.MetricEvent
		err := rows.Scan(&event.Id, &event.Type, &event.Date, &event.Value, &event.MetricId, &event.Columns)
		if err != nil {
			return []types.MetricEvent{}, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (db *DB) ToggleMetric(id uuid.UUID, appid uuid.UUID, enabled bool) error {
	_, err := db.Conn.Exec("UPDATE metrics SET enabled = $1 WHERE id = $2 AND appid = $3", enabled, id, appid)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) DeleteMetric(id uuid.UUID, appid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metrics WHERE id = $1 AND appid = $2", id, appid)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) GetApplication(id uuid.UUID, userid uuid.UUID) (types.Application, error) {
	var app types.Application
	err := db.Conn.Get(&app, "SELECT * FROM applications WHERE id = $1 AND userid = $2", id, userid)
	if err != nil {
		return app, err
	}

	return app, nil
}

func (db *DB) GetApplicationCountByUser(userid uuid.UUID) (int, error) {
	var count int
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM applications WHERE userid = $1", userid)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (db *DB) GetApplicationByApi(key string) (types.Application, error) {
	var app types.Application
	err := db.Conn.Get(&app, "SELECT * FROM applications WHERE apikey = $1", key)
	if err != nil {
		return app, err
	}

	return app, nil
}

func (db *DB) GetApplications(userid uuid.UUID) ([]types.Application, error) {
	rows, err := db.Conn.Query("SELECT * FROM applications WHERE userid = $1", userid)
	if err != nil {
		return []types.Application{}, err
	}
	defer rows.Close()
	var apps []types.Application
	for rows.Next() {
		var app types.Application
		err := rows.Scan(&app.Id, &app.ApiKey, &app.UserId, &app.Name)
		if err != nil {
			return []types.Application{}, err
		}
		apps = append(apps, app)
	}

	return apps, nil
}

func (db *DB) GetApplicationByName(userid uuid.UUID, name string) (types.Application, error) {
	var app types.Application
	err := db.Conn.Get(&app, "SELECT * FROM applications WHERE userid = $1 AND name = $2", userid, name)
	if err != nil {
		return app, err
	}

	return app, nil
}
func (db *DB) CreateApplication(app types.Application) (types.Application, error) {
	var new_app types.Application
	err := db.Conn.QueryRow("INSERT INTO applications (userid, apikey, name) VALUES ($1, $2, $3) RETURNING *", app.UserId, app.ApiKey, app.Name).Scan(&new_app.Id, &new_app.ApiKey, &new_app.UserId, &new_app.Name)
	if err != nil {
		return new_app, err
	}
	return new_app, nil
}

func (db *DB) DeleteApplication(id uuid.UUID, userid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM applications WHERE id = $1 AND userid = $2", id, userid)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateAccountRecovery(userid uuid.UUID, code string) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.QueryRow("INSERT INTO accountrecovery (userid, code) VALUES ($1, $2) RETURNING *", userid, code).Scan(&account_recovery.UserId, &account_recovery.Code, &account_recovery.Id)
	if err != nil {
		return account_recovery, err
	}

	return account_recovery, nil
}
func (db *DB) GetAccountRecovery(code string) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.Get(&account_recovery, "SELECT * FROM accountrecovery WHERE code = $1", code)
	if err != nil {
		return account_recovery, err
	}
	return account_recovery, nil
}

func (db *DB) GetAccountRecoveryByUserId(userid uuid.UUID) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.Get(&account_recovery, "SELECT * FROM accountrecovery WHERE userid = $1", userid)
	if err != nil {
		return account_recovery, err
	}
	return account_recovery, nil
}

func (db *DB) DeleteAccountRecovery(code string) error {
	_, err := db.Conn.Exec("DELETE FROM accountrecovery WHERE code = $1", code)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateFeedback(feedback types.Feedback) error {
	_, err := db.Conn.Exec("INSERT INTO feedbacks (date, email, content) VALUES ($1, $2, $3)", feedback.Date, feedback.Email, feedback.Content)
	return err
}
