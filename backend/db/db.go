package db

import (
	"Measurely/types"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DB struct {
	Conn *sqlx.DB
}

func NewPostgres(url string) (*DB, error) {
	// Connect to the database
	db, err := sqlx.Connect("postgres", url)
	if err != nil {
		return nil, err
	}
	// Set connection pooling parameters
	db.SetMaxOpenConns(10)                  // Maximum number of open connections
	db.SetMaxIdleConns(5)                   // Maximum number of idle connections
	db.SetConnMaxLifetime(30 * time.Minute) // Maximum connection lifetime

	err = migrate(db)
	if err != nil {
		log.Fatal("Migration failed. aborting")
	}

	return &DB{Conn: db}, nil
}

func migrate(db *sqlx.DB) error {
	// Path to the migrations folder
	migrationsDir := "migrations"

	// Read the migration files from the migrations directory
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Println(err)
		return err
	}

	var migrationFiles []string
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".sql") {
			migrationFiles = append(migrationFiles, filepath.Join(migrationsDir, file.Name()))
		}
	}

	sort.Strings(migrationFiles) 
	for _, migrationFile := range migrationFiles {
		b, err := os.ReadFile(migrationFile)
		if err != nil {
			return err
		}
		_, err = db.Exec(string(b))
		if err != nil {
			log.Printf("Error running migration %s: %v\n", migrationFile, err)
			return err
		}
		fmt.Printf("Successfully ran migration: %s\n", migrationFile)
	}

	return nil
}

func (d *DB) Close() error {
	return d.Conn.Close()
}

func (db *DB) CreateUser(user types.User) (types.User, error) {
	var new_user types.User
	err := db.Conn.QueryRow("INSERT INTO users (email,  firstname, lastname, password, stripecustomerid, currentplan) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", user.Email, user.FirstName, user.LastName, user.Password, user.StripeCustomerId, user.CurrentPlan).Scan(&new_user.Id, &new_user.Email, &new_user.FirstName, &new_user.LastName, &new_user.Password, &new_user.StripeCustomerId, &new_user.CurrentPlan, &new_user.Image)
	return new_user, err
}

func (db *DB) DeleteUser(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM users WHERE id = $1", id)
	return err
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

func (db *DB) UpdateUserFirstAndLastName(id uuid.UUID, firstname string, lastname string) error {
	_, err := db.Conn.Exec("UPDATE users SET firstname = $1 , lastname = $2 WHERE id = $3", firstname, lastname, id.String())
	return err
}

func (db *DB) UpdateUserPassword(id uuid.UUID, password string) error {
	_, err := db.Conn.Exec("UPDATE users SET password = $1 WHERE id = $2", password, id)
	return err
}

func (db *DB) UpdateUserProvider(id uuid.UUID, provider int) error {
	_, err := db.Conn.Exec("UPDATE users SET provider = $1 WHERE id = $2", provider, id)
	return err
}

func (db *DB) UpdateUserEmail(id uuid.UUID, newemail string) error {
	_, err := db.Conn.Exec("UPDATE users SET email = $1 WHERE id = $2", newemail, id)
	return err
}

func (db *DB) UpdateUserPlan(id uuid.UUID, plan string) error {
	_, err := db.Conn.Exec("UPDATE users SET currentplan = $1 WHERE id = $2", plan, id)
	return err
}

func (db *DB) UpdateUserImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE users SET image = $1 WHERE id = $2", image, id)
	return err
}

func (db *DB) CreateProvider(provider types.UserProvider) (types.UserProvider, error) {
	var new_provider types.UserProvider
	err := db.Conn.QueryRow("INSERT INTO providers (userid, type, provideruserid) VALUES ($1, $2, $3) RETURNING *", provider.UserId, provider.Type, provider.ProviderUserId).Scan(&new_provider.Id, &new_provider.UserId, &new_provider.Type, &new_provider.ProviderUserId)
	return new_provider, err
}

func (db *DB) DeleteUserProvider(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM providers WHERE id = $1", id)
	return err
}

func (db *DB) GetProviderByProviderUserId(provideruserid string, providerType int) (types.UserProvider, error) {
	var provider types.UserProvider
	err := db.Conn.Get(&provider, "SELECT * FROM providers WHERE provideruserid = $1 AND type = $2", provideruserid, providerType)
	return provider, err
}

func (db *DB) GetProvidersByUserId(userid uuid.UUID) ([]types.UserProvider, error) {
	rows, err := db.Conn.Query("SELECT * FROM providers WHERE userid = $1", userid)
	if err != nil {
		return []types.UserProvider{}, err
	}
	defer rows.Close()
	var providers []types.UserProvider
	for rows.Next() {
		var provider types.UserProvider
		err := rows.Scan(&provider.Id, &provider.UserId, &provider.Type, &provider.ProviderUserId)
		if err != nil {
			return []types.UserProvider{}, err
		}
		providers = append(providers, provider)
	}

	return providers, nil
}

func (db *DB) CreateMetric(metric types.Metric) (types.Metric, error) {
	var new_metric types.Metric
	err := db.Conn.QueryRow("INSERT INTO metrics (appid, name, type, namepos, nameneg) VALUES ($1, $2, $3, $4, $5) RETURNING *", metric.AppId, metric.Name, metric.Type, metric.NamePos, metric.NameNeg).Scan(&new_metric.Id, &new_metric.AppId, &new_metric.Name, &new_metric.Type, &new_metric.Total, &new_metric.NamePos, &new_metric.NameNeg, &new_metric.Created)
	return new_metric, err
}

func (db *DB) DeleteMetric(id uuid.UUID, appid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metrics WHERE id = $1 AND appid = $2", id, appid)
	return err
}

func (db *DB) CreateMetricEvents(events []types.MetricEvent) error {
	_, err := db.Conn.NamedExec("INSERT INTO metricevents (metricid, value) VALUES (:metricid, :value)", events)
	return err
}

func (db *DB) CreateMetricEvent(event types.MetricEvent) error {
	_, err := db.Conn.NamedExec("INSERT INTO metricevents (metricid, value, relativetotal) VALUES (:metricid, :value, :relativetotal)", event)
	return err
}

func (db *DB) CreateDailyMetricSummary(summary types.DailyMetricSummary) error {
	_, err := db.Conn.NamedExec(`INSERT INTO metricdailysummary (id, metricid, valuepos, valueneg, relativetotal) VALUES (:id, :metricid, :valuepos, :valueneg, :relativetotal) ON CONFLICT (id) DO UPDATE SET valuepos = metricdailysummary.valuepos + EXCLUDED.valuepos, valueneg = metricdailysummary.valueneg + EXCLUDED.valueneg, relativetotal = metricdailysummary.relativetotal + EXCLUDED.valuepos + EXCLUDED.valueneg`, summary)
	return err
}

func (db *DB) GetMetricsCount(appid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE appid = $1", appid)
	return count, err
}

func (db *DB) UpdateMetric(id uuid.UUID, appid uuid.UUID, name string, namepos string, nameneg string) error {
	_, err := db.Conn.Exec("UPDATE metrics SET name = $1, namepos = $2, nameneg = $3 WHERE id = $4 AND appid = $5", name, namepos, nameneg, id, appid)
	return err
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
		err := rows.Scan(&metric.Id, &metric.AppId, &metric.Name, &metric.Type, &metric.Total, &metric.NamePos, &metric.NameNeg, &metric.Created)
		if err != nil {
			return []types.Metric{}, err
		}
		metrics = append(metrics, metric)
	}

	return metrics, nil
}

// Gets the metric by id and group id
func (db *DB) GetMetric(id uuid.UUID, appid uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE id = $1 AND groupid = $2", id, appid)
	return metric, err
}

// Gets the metric by id
func (db *DB) GetMetricById(id uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE id = $1", id)
	return metric, err
}

func (db *DB) GetMetricCount(groupid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE groupid = $1", groupid)
	return count, err
}

func (db *DB) GetMetricEvents(metricid uuid.UUID, start time.Time, end time.Time) ([]types.MetricEvent, error) {
	formattedStart := start.Format("2006-01-02")
	formattedEnd := end.Format("2006-01-02")
	rows, err := db.Conn.Query(`SELECT * FROM metricevents WHERE metricid = $1 AND date::date BETWEEN $2 AND $3 ORDER BY date ASC`, metricid, formattedStart, formattedEnd)
	if err != nil {
		return []types.MetricEvent{}, err
	}
	defer rows.Close()
	var events []types.MetricEvent
	for rows.Next() {
		var event types.MetricEvent
		err := rows.Scan(&event.Id, &event.MetricId, &event.Value, &event.RelativeTotal, &event.Date)
		if err != nil {
			return []types.MetricEvent{}, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (db *DB) GetDailyMetricSummary(metricid uuid.UUID, start time.Time, end time.Time) ([]types.DailyMetricSummary, error) {
	formattedStart := start.Format("2006-01-02")
	formattedEnd := end.Format("2006-01-02")
	rows, err := db.Conn.Query(`SELECT * FROM metricdailysummary WHERE metricid = $1 AND date::date BETWEEN $2 AND $3 ORDER BY date ASC`, metricid, formattedStart, formattedEnd)
	if err != nil {
		return []types.DailyMetricSummary{}, err
	}
	defer rows.Close()
	var dailysummarymetrics []types.DailyMetricSummary
	for rows.Next() {
		var summary types.DailyMetricSummary
		err := rows.Scan(&summary.Id, &summary.MetricId, &summary.ValuePos, &summary.ValueNeg, &summary.RelativeTotal, &summary.Date)
		if err != nil {
			return []types.DailyMetricSummary{}, err
		}
		dailysummarymetrics = append(dailysummarymetrics, summary)
	}

	return dailysummarymetrics, err
}

func (db *DB) UpdateMetricTotal(id uuid.UUID, toAdd int64) error {
	_, err := db.Conn.Exec("UPDATE metrics SET total = total + $1 WHERE id = $2", toAdd, id)
	return err
}

func (db *DB) GetApplication(id uuid.UUID, userid uuid.UUID) (types.Application, error) {
	var app types.Application
	err := db.Conn.Get(&app, "SELECT * FROM applications WHERE id = $1 AND userid = $2", id, userid)
	return app, err
}

func (db *DB) UpdateApplicationImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE applications SET image = $1 WHERE id = $2", image, id)
	return err
}

func (db *DB) GetApplicationCountByUser(userid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM applications WHERE userid = $1", userid)
	return count, err
}

func (db *DB) GetApplicationByApi(key string) (types.Application, error) {
	var app types.Application
	err := db.Conn.Get(&app, "SELECT * FROM applications WHERE apikey = $1", key)
	return app, err
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
		err := rows.Scan(&app.Id, &app.ApiKey, &app.UserId, &app.Name, &app.Image)
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
	return app, err
}

func (db *DB) CreateApplication(app types.Application) (types.Application, error) {
	var new_app types.Application
	err := db.Conn.QueryRow("INSERT INTO applications (userid, apikey, name) VALUES ($1, $2, $3) RETURNING *", app.UserId, app.ApiKey, app.Name).Scan(&new_app.Id, &new_app.ApiKey, &new_app.UserId, &new_app.Name, &new_app.Image)
	return new_app, err
}

func (db *DB) UpdateApplicationApiKey(id uuid.UUID, userid uuid.UUID, apikey string) error {
	_, err := db.Conn.Exec("UPDATE applications SET apikey = $1 WHERE id = $2 AND userid = $3", apikey, id, userid)
	return err
}

func (db DB) UpdateApplicationName(id uuid.UUID, userid uuid.UUID, newname string) error {
	_, err := db.Conn.Exec("UPDATE applications SET name = $1 WHERE id = $2 AND userid = $3", newname, id, userid)
	return err
}

func (db *DB) DeleteApplication(id uuid.UUID, userid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM applications WHERE id = $1 AND userid = $2", id, userid)
	return err
}

func (db *DB) CreateAccountRecovery(userid uuid.UUID) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.QueryRow("INSERT INTO accountrecovery (userid) VALUES ($1) RETURNING *", userid).Scan(&account_recovery.Id, &account_recovery.UserId)
	return account_recovery, err
}

func (db *DB) GetAccountRecovery(id uuid.UUID) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.Get(&account_recovery, "SELECT * FROM accountrecovery WHERE id = $1", id)
	return account_recovery, err
}

func (db *DB) GetAccountRecoveryByUserId(userid uuid.UUID) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.Get(&account_recovery, "SELECT * FROM accountrecovery WHERE userid = $1", userid)
	return account_recovery, err
}

func (db *DB) GetEmailChangeRequest(id uuid.UUID) (types.EmailChangeRequest, error) {
	var emailchange types.EmailChangeRequest
	err := db.Conn.Get(&emailchange, "SELECT * FROM emailchange WHERE id = $1", id)
	return emailchange, err
}

func (db *DB) GetEmailChangeRequestByUserId(userid uuid.UUID, newemail string) (types.EmailChangeRequest, error) {
	var emailchange types.EmailChangeRequest
	err := db.Conn.Get(&emailchange, "SELECT * FROM emailchange WHERE userid = $1 AND newemail = $2", userid, newemail)
	return emailchange, err
}

func (db *DB) CreateEmailChangeRequest(userid uuid.UUID, newemail string) (types.EmailChangeRequest, error) {
	var emailchange types.EmailChangeRequest
	err := db.Conn.QueryRow("INSERT INTO emailchange (userid, newemail) VALUES ($1, $3) RETURNING *", userid, newemail).Scan(&emailchange.Id, &emailchange.UserId, &emailchange.NewEmail)
	return emailchange, err
}

func (db *DB) DeleteEmailChangeRequest(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM emailchange WHERE id = $1", id)
	return err
}

func (db *DB) DeleteAccountRecovery(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM accountrecovery WHERE id = $1", id)
	return err
}

func (db *DB) CreateFeedback(feedback types.Feedback) error {
	_, err := db.Conn.Exec("INSERT INTO feedbacks (date, email, content) VALUES ($1, $2, $3)", feedback.Date, feedback.Email, feedback.Content)
	return err
}

func (db *DB) GetPlans() ([]types.Plan, error) {
	rows, err := db.Conn.Query("SELECT * FROM plans")
	if err != nil {
		return []types.Plan{}, err
	}
	defer rows.Close()
	var plans []types.Plan
	for rows.Next() {
		var plan types.Plan
		err := rows.Scan(&plan.Identifier, &plan.Name, &plan.Price, &plan.AppLimit, &plan.MetricPerAppLimit, &plan.RequestLimit, &plan.Range)
		if err != nil {
			return []types.Plan{}, err
		}
		plans = append(plans, plan)
	}

	return plans, nil
}

func (db *DB) CreatePlan(plan types.Plan) error {
	_, err := db.Conn.Exec("INSERT INTO plans (name, identifier, price, applimit, metricperapplimit, requestlimit, range) VALUES ($1, $2, $3, $4, $5, $6, $7)", plan.Name, plan.Identifier, plan.Price, plan.AppLimit, plan.MetricPerAppLimit, plan.RequestLimit, plan.Range)
	return err
}

func (db *DB) UpdatePlan(identifier string, new_plan types.Plan) error {
	_, err := db.Conn.Exec("UPDATE plans SET name = $1, price = $2, applimit = $3, metricperapplimit = $4, range = $5, requestlimit = $6 WHERE identifier = $7", new_plan.Name, new_plan.Price, new_plan.AppLimit, new_plan.MetricPerAppLimit, new_plan.Range, new_plan.RequestLimit, identifier)
	return err
}
