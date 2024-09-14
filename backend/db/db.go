package db

import (
	"Measurely/types"
	"database/sql"
	"strconv"
	"strings"

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
	return &DB{Conn: db}, nil
}

func (d *DB) Close() error {
	return d.Conn.Close()
}

func (db *DB) CreateUser(user types.User) (types.User, error) {
	var new_user types.User
	err := db.Conn.QueryRow("INSERT INTO users (email,  firstname, lastname, password, provider, stripecustomerid, currentplan) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", user.Email, user.FirstName, user.LastName, user.Password, user.Provider, user.StripeCustomerId, user.CurrentPlan).Scan(&new_user.Id, &new_user.Email, &new_user.FirstName, &new_user.LastName, &new_user.Password, &new_user.Provider, &new_user.StripeCustomerId, &new_user.CurrentPlan)
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

func (db *DB) UpdateUserImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE users SET image = $1 WHERE id = $2", image, id)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateMetric(metric types.Metric) (types.Metric, error) {
	var new_metric types.Metric
	err := db.Conn.QueryRow("INSERT INTO users (groupid, name, total) VALUES ($1, $2, $3) RETURNING *", metric.GroupId, metric.Name, metric.Total).Scan(&new_metric.Id, &new_metric.GroupId, &new_metric.Name, &new_metric.Total)
	if err != nil {
		return new_metric, err
	}
	return new_metric, nil
}

func (db *DB) CreateMetricEvents(events []types.MetricEvent) error {
	_, err := db.Conn.NamedExec("INSERT INTO metricevents (metricid, date, type, value) VALUES (:metricid, :date, :type, :value)", events)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateMetricGroup(group types.MetricGroup) (types.MetricGroup, error) {
	var new_group types.MetricGroup
	err := db.Conn.QueryRow("INSERT INTO metricgroups (appid, type, name, enabled) VALUES ($1, $2, $3, $4) RETURNING *", group.AppId, group.Type, group.Name, group.Enabled).Scan(&new_group.Id, &new_group.AppId, &new_group.Type, &new_group.Name, &new_group.Enabled)
	if err != nil {
		return new_group, err
	}
	return new_group, nil
}

func (db *DB) DeleteMetricGroup(metricid uuid.UUID, appid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metricgroups WHERE id = $1 AND appid = $2", metricid, appid)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) GetMetricGroupCount(appid uuid.UUID) (int, error) {
	var count int
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metricgroups WHERE appid = $1 AND enabled = true", appid)

	if err != nil {
		return 0, err
	}
	return count, nil
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
		err := rows.Scan(&group.Id, &group.AppId, &group.Type, &group.Name, &group.Enabled)
		if err != nil {
			return []types.MetricGroup{}, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (db *DB) GetMetrics(metricid uuid.UUID) ([]types.Metric, error) {
	rows, err := db.Conn.Query("SELECT * FROM metrics WHERE groupid = $1", metricid)
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

func (db *DB) GetMetric(id uuid.UUID, appid uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE id = $1 AND appid = $2", id, appid)
	return metric, err
}

func (db *DB) GetMetricCount(metricid uuid.UUID) (int, error) {
	var count int
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE groupid = $1", metricid)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (db *DB) GetMetricEvents(metricid uuid.UUID, offset int) ([]types.MetricEvent, error) {
	rows, err := db.Conn.Query("SELECT * FROM metricevents WHERE metricid = $1 LIMIT $2 OFFSET $3 ORDER BY date DESC", metricid, 1000, offset)
	if err != nil {
		return []types.MetricEvent{}, err
	}
	defer rows.Close()
	var events []types.MetricEvent
	for rows.Next() {
		var event types.MetricEvent
		err := rows.Scan(&event.Id, &event.Type, &event.Date, &event.Value, &event.MetricId)
		if err != nil {
			return []types.MetricEvent{}, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (db *DB) ToggleMetricGroup(id uuid.UUID, appid uuid.UUID, enabled bool) error {
	_, err := db.Conn.Exec("UPDATE metricgroups SET enabled = $1 WHERE id = $2 AND appid = $3", enabled, id, appid)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) UpdateMetricTotal(id uuid.UUID, total int) error {
	_, err := db.Conn.Exec("UPDATE metrics SET total = $1 WHERE id = $2", total, id)
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

func (db *DB) UpdateApplicationImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE applications SET image = $1 WHERE id = $2", image, id)
	if err != nil {
		return err
	}
	return nil
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
		err := rows.Scan(&app.Id, &app.ApiKey, &app.UserId, &app.Name, &app.Description)
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
	err := db.Conn.QueryRow("INSERT INTO applications (userid, apikey, name, description) VALUES ($1, $2, $3, $4) RETURNING *", app.UserId, app.ApiKey, app.Name, app.Description).Scan(&new_app.Id, &new_app.ApiKey, &new_app.UserId, &new_app.Name, &new_app.Description, &new_app.Image)
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
		err := rows.Scan(&plan.Price, &plan.Identifier, &plan.Name, &plan.AppLimit, &plan.MetricPerAppLimit, &timeframes)
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
	if err != nil {
		return err
	}
	return nil
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
