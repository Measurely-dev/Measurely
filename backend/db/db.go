package db

import (
	"Measurely/types"
	"log"
	"os"
	"strconv"
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
	db, err := sqlx.Connect("postgres", url)
	if err != nil {
		return nil, err
	}

	b, err := os.ReadFile("migration.sql")
	if err != nil {
		log.Fatalln("Failed to read migration file: ", err)
	}
	db.Exec(string(b))

	return &DB{Conn: db}, nil
}

func (d *DB) Close() error {
	return d.Conn.Close()
}

func (db *DB) CreateUser(user types.User) (types.User, error) {
	var new_user types.User
	err := db.Conn.QueryRow("INSERT INTO users (email,  firstname, lastname, password, provider, stripecustomerid, currentplan) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", user.Email, user.FirstName, user.LastName, user.Password, user.Provider, user.StripeCustomerId, user.CurrentPlan).Scan(&new_user.Id, &new_user.Email, &new_user.FirstName, &new_user.LastName, &new_user.Password, &new_user.Provider, &new_user.StripeCustomerId, &new_user.CurrentPlan, &new_user.Image)
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

func (db *DB) CreateMetric(metric types.Metric) (types.Metric, error) {
	var new_metric types.Metric
	err := db.Conn.QueryRow("INSERT INTO metrics (groupid, name, total) VALUES ($1, $2, $3) RETURNING *", metric.GroupId, metric.Name, metric.Total).Scan(&new_metric.Id, &new_metric.GroupId, &new_metric.Name, &new_metric.Total)
	return new_metric, err
}

func (db *DB) CreateMetricEvents(events []types.MetricEvent) error {
	_, err := db.Conn.NamedExec("INSERT INTO metricevents (metricid, value) VALUES (:metricid, :value)", events)
	return err
}

func (db *DB) CreateDailyMetricSummary(summary types.DailyMetricSummary) error {
	_, err := db.Conn.NamedExec(`INSERT INTO metricdailysummary (id, metricid, value) VALUES (:id, :metricid, :value) ON CONFLICT (id) DO UPDATE SET value = metricdailysummary.value + EXCLUDED.value`, summary)
	return err
}

func (db *DB) CreateMetricGroup(group types.MetricGroup) (types.MetricGroup, error) {
	var new_group types.MetricGroup
	err := db.Conn.QueryRow("INSERT INTO metricgroups (appid, type, name) VALUES ($1, $2, $3) RETURNING *", group.AppId, group.Type, group.Name).Scan(&new_group.Id, &new_group.AppId, &new_group.Type, &new_group.Name, &new_group.Created)
	return new_group, err
}

func (db *DB) DeleteMetricGroup(metricid uuid.UUID, appid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metricgroups WHERE id = $1 AND appid = $2", metricid, appid)
	return err
}

func (db *DB) GetMetricGroupCount(appid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metricgroups WHERE appid = $1", appid)
	return count, err
}

func (db *DB) UpdateMetricGroup(groupid uuid.UUID, appid uuid.UUID, name string) error {
	_, err := db.Conn.Exec("UPDATE metricgroups SET name = $1 WHERE id = $2 AND appid = $3", name, groupid, appid)
	return err
}

func (db *DB) UpdateMetric(metricid uuid.UUID, groupid uuid.UUID, name string) error {
	_, err := db.Conn.Exec("UPDATE metrics SET name = $1 WHERE groupid = $2 AND id = $3", name, groupid, metricid)
	return err
}

func (db *DB) GetMetricGroups(appid uuid.UUID) ([]types.MetricGroup, error) {
	rows, err := db.Conn.Query("SELECT * FROM metricgroups WHERE appid = $1", appid)
	if err != nil {
		return []types.MetricGroup{}, err
	}
	defer rows.Close()
	var groups []types.MetricGroup
	for rows.Next() {
		var group types.MetricGroup
		err := rows.Scan(&group.Id, &group.AppId, &group.Type, &group.Name, &group.Created)
		if err != nil {
			return []types.MetricGroup{}, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (db *DB) GetMetricGroup(id uuid.UUID, appid uuid.UUID) (types.MetricGroup, error) {
	var group types.MetricGroup
	err := db.Conn.Get(&group, "SELECT * FROM metricgroups WHERE id = $1 AND appid = $2", id, appid)
	return group, err
}

func (db *DB) GetMetrics(groupid uuid.UUID) ([]types.Metric, error) {
	rows, err := db.Conn.Query("SELECT * FROM metrics WHERE groupid = $1", groupid)
	if err != nil {
		return []types.Metric{}, err
	}
	defer rows.Close()
	var metrics []types.Metric
	for rows.Next() {
		var metric types.Metric
		err := rows.Scan(&metric.Id, &metric.GroupId, &metric.Name, &metric.Total)
		if err != nil {
			return []types.Metric{}, err
		}
		metrics = append(metrics, metric)
	}

	return metrics, nil
}

func (db *DB) GetMetric(id uuid.UUID, groupid uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE id = $1 AND groupid = $2", id, groupid)
	return metric, err
}

func (db *DB) GetMetricCount(groupid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE groupid = $1", groupid)
	return count, err
}

func (db *DB) GetMetricEvents(metricid uuid.UUID, day time.Time) ([]types.MetricEvent, error) {
	formattedDate := day.Format("2006-01-02")
	rows, err := db.Conn.Query(`SELECT * FROM metricevents WHERE metricid = $1 AND date::date = $2 ORDER BY date DESC`, metricid, formattedDate)
	if err != nil {
		return []types.MetricEvent{}, err
	}
	defer rows.Close()
	var events []types.MetricEvent
	for rows.Next() {
		var event types.MetricEvent
		err := rows.Scan(&event.Id, &event.MetricId, &event.Date, &event.Value)
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
	rows, err := db.Conn.Query(`SELECT * FROM metricdailysummary WHERE metricid = $1 AND date::date BETWEEN $2 AND $3 ORDER BY date DESC`, metricid, formattedStart, formattedEnd)
	if err != nil {
		return []types.DailyMetricSummary{}, err
	}
	defer rows.Close()
	var dailysummarymetrics []types.DailyMetricSummary
	for rows.Next() {
		var summary types.DailyMetricSummary
		err := rows.Scan(&summary.Id, &summary.MetricId, &summary.Date, &summary.Value)
		if err != nil {
			return []types.DailyMetricSummary{}, err
		}
		dailysummarymetrics = append(dailysummarymetrics, summary)
	}

	return dailysummarymetrics, err
}

func (db *DB) UpdateMetricTotal(id uuid.UUID, total int) error {
	_, err := db.Conn.Exec("UPDATE metrics SET total = $1 WHERE id = $2", total, id)
	return err
}

func (db *DB) DeleteMetric(id uuid.UUID, appid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metrics WHERE id = $1 AND appid = $2", id, appid)
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

func (db *DB) CreateAccountRecovery(userid uuid.UUID, code string) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.QueryRow("INSERT INTO accountrecovery (userid, code) VALUES ($1, $2) RETURNING *", userid, code).Scan(&account_recovery.Id, &account_recovery.Code, &account_recovery.UserId)
	return account_recovery, err
}

func (db *DB) GetAccountRecovery(code string) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.Get(&account_recovery, "SELECT * FROM accountrecovery WHERE code = $1", code)
	return account_recovery, err
}

func (db *DB) GetAccountRecoveryByUserId(userid uuid.UUID) (types.AccountRecovery, error) {
	var account_recovery types.AccountRecovery
	err := db.Conn.Get(&account_recovery, "SELECT * FROM accountrecovery WHERE userid = $1", userid)
	return account_recovery, err
}

func (db *DB) GetEmailChangeRequest(code string) (types.EmailChangeRequest, error) {
	var emailchange types.EmailChangeRequest
	err := db.Conn.Get(&emailchange, "SELECT * FROM emailchange WHERE code = $1", code)
	return emailchange, err
}

func (db *DB) GetEmailChangeRequestByUserId(userid uuid.UUID, newemail string) (types.EmailChangeRequest, error) {
	var emailchange types.EmailChangeRequest
	err := db.Conn.Get(&emailchange, "SELECT * FROM emailchange WHERE userid = $1 AND newemail = $2", userid, newemail)
	return emailchange, err
}

func (db *DB) CreateEmailChangeRequest(userid uuid.UUID, code string, newemail string) (types.EmailChangeRequest, error) {
	var emailchange types.EmailChangeRequest
	err := db.Conn.QueryRow("INSERT INTO emailchange (userid, code, newemail) VALUES ($1, $2, $3) RETURNING *", userid, code, newemail).Scan(&emailchange.Id, &emailchange.Code, &emailchange.UserId, &emailchange.NewEmail)
	return emailchange, err
}

func (db *DB) DeleteEmailChangeRequest(code string) error {
	_, err := db.Conn.Exec("DELETE FROM emailchange WHERE code = $1", code)
	return err
}

func (db *DB) DeleteAccountRecovery(code string) error {
	_, err := db.Conn.Exec("DELETE FROM accountrecovery WHERE code = $1", code)
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
		var timeframes string
		err := rows.Scan(&plan.Identifier, &plan.Name, &plan.Price, &plan.AppLimit, &plan.MetricPerAppLimit, &timeframes)
		if err != nil {
			return []types.Plan{}, err
		}

		plan.TimeFrames, err = StringToIntArray(timeframes)
		if err != nil {
			return []types.Plan{}, err
		}

		plans = append(plans, plan)
	}

	return plans, nil
}

func (db *DB) CreatePlan(plan types.Plan) error {
	timeframes := IntArrayToString(plan.TimeFrames)
	_, err := db.Conn.Exec("INSERT INTO plans (name, identifier, price, applimit, metricperapplimit, timeframes) VALUES ($1, $2, $3, $4, $5, $6)", plan.Name, plan.Identifier, plan.Price, plan.AppLimit, plan.MetricPerAppLimit, timeframes)
	return err
}

func (db *DB) UpdatePlan(identifier string, new_plan types.Plan) error {
	timeframes := IntArrayToString(new_plan.TimeFrames)
	_, err := db.Conn.Exec("UPDATE plans SET name = $1, price = $2, applimit = $3, metricperapplimit = $4, timeframes = $5 WHERE identifier = $6", new_plan.Name, new_plan.Price, new_plan.AppLimit, new_plan.MetricPerAppLimit, timeframes, identifier)
	return err
}

func IntArrayToString(arr []int) string {
	var strArr []string
	for _, num := range arr {
		strArr = append(strArr, strconv.Itoa(num))
	}
	return strings.Join(strArr, ",")
}

func StringToIntArray(str string) ([]int, error) {
	strArr := strings.Split(str, ",")
	var intArr []int

	for _, s := range strArr {
		num, err := strconv.Atoi(s)
		if err != nil {
			return nil, err
		}
		intArr = append(intArr, num)
	}
	return intArr, nil
}
