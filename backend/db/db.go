package db

import (
	"Measurely/types"
	"database/sql"
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
	db.SetMaxOpenConns(200)                 // Maximum number of open connections
	db.SetMaxIdleConns(100)                 // Maximum number of idle connections
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

	// Sort migration files to ensure they run in order
	sort.Strings(migrationFiles)

	// Retrieve already applied migrations from the database

	appliedMigrations := make(map[string]bool)
	rows, err := db.Query("SELECT filename FROM migrations")
	if err == nil {
		defer rows.Close()

		for rows.Next() {
			var filename string
			if err := rows.Scan(&filename); err != nil {
				log.Println("Error scanning migration row:", err)
				return err
			}
			appliedMigrations[filename] = true
		}
	}

	// Run only new migrations
	for _, migrationFile := range migrationFiles {
		if appliedMigrations[filepath.Base(migrationFile)] {
			fmt.Printf("Skipping already applied migration: %s\n", migrationFile)
			continue
		}

		b, err := os.ReadFile(migrationFile)
		if err != nil {
			return err
		}
		_, err = db.Exec(string(b))
		if err != nil {
			log.Printf("Error running migration %s: %v\n", migrationFile, err)
			return err
		}

		// Record the applied migration in the database
		_, err = db.Exec("INSERT INTO migrations (filename) VALUES ($1)", filepath.Base(migrationFile))
		if err != nil {
			log.Printf("Error recording migration %s: %v\n", migrationFile, err)
			return err
		}

		fmt.Printf("Successfully ran migration: %s\n", migrationFile)
	}

	return nil
}

func (d *DB) Close() error {
	return d.Conn.Close()
}

func (db *DB) CreateWaitlistEntry(email string, name string) error {
	_, err := db.Conn.Exec("INSERT into waitlists (email, name) VALUES ($1, $2)", email, name)
	return err
}

func (db *DB) CreateUser(user types.User) (types.User, error) {
	var new_user types.User
	err := db.Conn.QueryRow("INSERT INTO users (email,  firstname, lastname, password, stripecustomerid, currentplan, startcountdate) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", user.Email, user.FirstName, user.LastName, user.Password, user.StripeCustomerId, user.CurrentPlan, time.Now().UTC()).Scan(&new_user.Id, &new_user.Email, &new_user.FirstName, &new_user.LastName, &new_user.Password, &new_user.StripeCustomerId, &new_user.CurrentPlan, &new_user.Image, &new_user.MonthlyEventCount, &new_user.StartCountDate)
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

func (db *DB) ResetUserCount(id uuid.UUID) error {
	_, err := db.Conn.Exec("UPDATE users SET monthlyeventcount = 0 , startcountdate = $1 WHERE id = $2 ", time.Now().UTC(), id)
	return err
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

func (db *DB) SearchUsers(search string) ([]types.User, error) {
	var users []types.User

	query := `
		SELECT * FROM users 
		WHERE email ILIKE $1
		OR (firstname ILIKE $1 AND lastname ILIKE $1)
	`

	err := db.Conn.Select(users, query, search)
	return users, err
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
	err := db.Conn.QueryRow("INSERT INTO metrics (projectid, name, type, namepos, nameneg, parentmetricid, filtercategory) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", metric.ProjectId, metric.Name, metric.Type, metric.NamePos, metric.NameNeg, metric.ParentMetricId, metric.FilterCategory).Scan(&new_metric.Id, &new_metric.ProjectId, &new_metric.Name, &new_metric.Type, &new_metric.TotalPos, &new_metric.TotalNeg, &new_metric.NamePos, &new_metric.NameNeg, &new_metric.Created, &new_metric.FilterCategory, &new_metric.ParentMetricId, &new_metric.EventCount)
	return new_metric, err
}

func (db *DB) DeleteMetric(id uuid.UUID, projectid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM metrics WHERE id = $1 AND projectid = $2", id, projectid)
	return err
}

func (db *DB) UpdateMetricAndCreateEvent(
	metricid uuid.UUID,
	userid uuid.UUID,
	toAdd int,
	toRemove int,
	filters *map[string]string, // Accept filters as a map
) (error, int64) {
	tx, err := db.Conn.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err), 0
	}

	// Update metric totals (totalpos, totalneg)
	var totalPos, totalNeg, eventCount int64
	var projectid uuid.UUID
	var metricType int
	err = tx.QueryRowx(
		"UPDATE metrics SET totalpos = totalpos + $1, totalneg = totalneg + $2, eventcount = eventcount + 1 WHERE id = $3 RETURNING totalpos, totalneg, projectid, type, eventcount",
		toAdd, toRemove, metricid,
	).Scan(&totalPos, &totalNeg, &projectid, &metricType, &eventCount)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update metrics and fetch totals: %v", err), 0
	}

	// Update user's monthly event count
	var monthlyCount int64
	err = tx.QueryRowx("UPDATE users SET monthlyeventcount = users.monthlyeventcount + 1 WHERE id = $1 RETURNING monthlyeventcount", userid).Scan(&monthlyCount)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update user's monthly event count: %v", err), 0
	}

	// Get current time and round to the nearest 20-minute interval
	now := time.Now().UTC().Truncate(time.Second)
	minute := now.Minute()
	var roundedMinute int

	if minute < 20 {
		roundedMinute = 0
	} else if minute < 40 {
		roundedMinute = 20
	} else {
		roundedMinute = 40
	}

	date := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), roundedMinute, 0, 0, time.UTC)

	// Prepare the MetricEvent for the main metric
	event := types.MetricEvent{
		RelativeTotalPos:   totalPos,
		RelativeTotalNeg:   totalNeg,
		RelativeEventCount: eventCount,
		MetricId:           metricid,
		ValuePos:           toAdd,
		ValueNeg:           toRemove,
		Date:               date,
	}

	// Insert or update the MetricEvent in metricevents table for the main metric
	_, err = tx.NamedExec(
		`INSERT INTO metricevents (metricid, valuepos, valueneg, relativetotalpos, relativetotalneg, relativeeventcount, date) 
    VALUES (:metricid, :valuepos, :valueneg, :relativetotalpos, :relativetotalneg, :relativeeventcount, :date)
        ON CONFLICT (metricid, date)
        DO UPDATE SET 
        valuepos = metricevents.valuepos + EXCLUDED.valuepos,
        valueneg = metricevents.valueneg + EXCLUDED.valueneg,
        eventcount = metricevents.eventcount + 1,
        relativetotalpos = EXCLUDED.relativetotalpos,
        relativetotalneg = EXCLUDED.relativetotalneg,
        relativeeventcount = EXCLUDED.relativeeventcount
       `,
		event,
	)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert metric event: %v", err), 0
	}

	// update filter metrics
	for key, value := range *filters {
		var filtertotalPos, filtertotalNeg, filtereventCount int64
		var filterId uuid.UUID
		err = tx.QueryRowx(`
			UPDATE metrics 
			SET totalpos = metrics.totalpos + $1,
					totalneg = metrics.totalneg + $2 
      WHERE parentmetricid = $3 AND filtercategory = $4 AND name = $5 
      RETURNING id, totalpos, totalneg, eventcount
		`, toAdd, toRemove, metricid, key, value).Scan(&filterId, &filtertotalPos, &filtertotalNeg, &filtereventCount)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert or update filter metrics: %v", err), 0
		}

		filterEvent := types.MetricEvent{
			RelativeTotalPos:   filtertotalPos,
			RelativeTotalNeg:   filtertotalNeg,
			RelativeEventCount: filtereventCount,
			MetricId:           filterId,
			ValuePos:           toAdd,
			ValueNeg:           toRemove,
			Date:               date,
		}

		// Insert or update MetricEvent for the filter
		_, err = tx.NamedExec(
			`INSERT INTO metricevents (metricid, valuepos, valueneg, relativetotalpos, relativetotalneg, relativeeventcount, date) 
    VALUES (:metricid, :valuepos, :valueneg, :relativetotalpos, :relativetotalneg, :relativeeventcount, :date)
        ON CONFLICT (metricid, date)
        DO UPDATE SET 
        valuepos = metricevents.valuepos + EXCLUDED.valuepos,
        valueneg = metricevents.valueneg + EXCLUDED.valueneg,
        eventcount = metricevents.eventcount + 1,
        relativetotalpos = EXCLUDED.relativetotalpos,
        relativetotalneg = EXCLUDED.relativetotalneg,
        relativeeventcount = EXCLUDED.relativeeventcount
       `,
			filterEvent,
		)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert filter metric event: %v", err), 0
		}

	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err), 0
	}

	return nil, monthlyCount
}

func (db *DB) GetMetricsCount(projectid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM metrics WHERE projectid = $1 AND parentmetricid IS NULL", projectid)
	return count, err
}

func (db *DB) UpdateMetric(id uuid.UUID, projectid uuid.UUID, name string, namepos string, nameneg string) error {
	_, err := db.Conn.Exec("UPDATE metrics SET name = $1, namepos = $2, nameneg = $3 WHERE id = $4 AND projectid = $5", name, namepos, nameneg, id, projectid)
	return err
}

func (db *DB) GetMetrics(projectid uuid.UUID) ([]types.Metric, error) {
	rows, err := db.Conn.Query("SELECT * FROM metrics WHERE projectid = $1", projectid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	metricsMap := make(map[uuid.UUID]map[string][]types.Metric)
	var metrics []types.Metric

	for rows.Next() {
		var metric types.Metric
		err := rows.Scan(&metric.Id, &metric.ProjectId, &metric.Name, &metric.Type, &metric.TotalPos, &metric.TotalNeg, &metric.NamePos, &metric.NameNeg, &metric.Created, &metric.FilterCategory, &metric.ParentMetricId, &metric.EventCount, &metric.IntegrationApiKey, &metric.LastEventTimestamp)
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
		metrics[i].Filters = metricsMap[metric.Id]
	}

	return metrics, nil
}

func (db *DB) GetAllIntegrationMetrics() ([]types.Metric, error) {
	rows, err := db.Conn.Query("SELECT * FROM metrics WHERE integrationapikey IS NOT NULL AND parentmetricid IS NULL")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	metricsMap := make(map[uuid.UUID]map[string][]types.Metric)
	var metrics []types.Metric

	for rows.Next() {
		var metric types.Metric
		err := rows.Scan(&metric.Id, &metric.ProjectId, &metric.Name, &metric.Type, &metric.TotalPos, &metric.TotalNeg, &metric.NamePos, &metric.NameNeg, &metric.Created, &metric.FilterCategory, &metric.ParentMetricId, &metric.EventCount, &metric.IntegrationApiKey, &metric.LastEventTimestamp)
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
		metrics[i].Filters = metricsMap[metric.Id]
	}

	return metrics, nil
}

func (db *DB) GetMetricByName(name string, projectid uuid.UUID) (types.Metric, error) {
	var metric types.Metric
	err := db.Conn.Get(&metric, "SELECT * FROM metrics WHERE projectid = $1 AND name = $2", projectid, name)
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

func (db *DB) GetMetricEvents(metricid uuid.UUID, start time.Time, end time.Time, usenext bool) ([]types.MetricEvent, error) {
	var query string
	var rows *sql.Rows
	var err error
	if usenext {
		query = `
            SELECT * 
            FROM metricevents
            WHERE metricid = $1 AND date > $2
            ORDER BY date ASC 
            LIMIT 1
    `
		rows, err = db.Conn.Query(query, metricid, end)
	} else {
		query = `
            SELECT * 
            FROM metricevents
            WHERE metricid = $1 AND date BETWEEN $2 AND $3 
            ORDER BY date ASC
            `
		rows, err = db.Conn.Query(query, metricid, start, end)
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

func (db *DB) GetVariationEvents(metricid uuid.UUID, start time.Time, end time.Time) ([]types.MetricEvent, error) {
	var events []types.MetricEvent

	query := `
		(
			SELECT * 
			FROM metricevents
			WHERE metricid = $1 AND date >= $2 AND date <= $3
			ORDER BY date ASC
			LIMIT 1
		)
		UNION ALL
		(
			SELECT * 
			FROM metricevents
			WHERE metricid = $1 AND date <= $3 AND date >= $2
			ORDER BY date DESC
			LIMIT 1
		)
	`

	err := db.Conn.Select(&events, query, metricid, start, end)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch variation events: %v", err)
	}

	return events, nil
}

func (db *DB) GetProject(id, userid uuid.UUID) (types.Project, error) {
	var project types.Project

	query := `
		SELECT 
			p.*,
			CASE
				WHEN p.userid = $2 THEN 0
				ELSE tr.role
			END AS userrole
		FROM 
			projects p
		LEFT JOIN 
			TeamRelation tr 
		ON 
			p.id = tr.projectid AND tr.userid = $2
		WHERE 
			p.id = $1
			AND (p.userid = $2 OR tr.userid = $2)
	`

	err := db.Conn.Get(&project, query, id, userid)
	return project, err
}

func (db *DB) UpdateProjectImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE projects SET image = $1 WHERE id = $2", image, id)
	return err
}

func (db *DB) GetProjectCountByUser(userid uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM projects WHERE userid = $1", userid)
	return count, err
}

func (db *DB) GetProjectByApi(key string) (types.Project, error) {
	var project types.Project
	err := db.Conn.Get(&project, "SELECT * FROM projects WHERE apikey = $1", key)
	return project, err
}

func (db *DB) GetProjects(userid uuid.UUID) ([]types.Project, error) {
	var projects []types.Project

	query := `
		SELECT 
			p.*,
			CASE
				WHEN p.userid = $1 THEN 0
				ELSE tr.role
			END AS userrole
		FROM 
			projects p
		LEFT JOIN 
			TeamRelation tr 
		ON 
			p.id = tr.projectid AND tr.userid = $1
		WHERE 
			p.userid = $1 OR tr.userid = $1
	`

	err := db.Conn.Select(&projects, query, userid)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

func (db *DB) GetProjectByName(userid uuid.UUID, name string) (types.Project, error) {
	var app types.Project
	err := db.Conn.Get(&app, "SELECT * FROM projects WHERE userid = $1 AND name = $2", userid, name)
	return app, err
}

func (db *DB) CreateProject(project types.Project) (types.Project, error) {
	var new_project types.Project
	err := db.Conn.QueryRow("INSERT INTO projects (userid, apikey, name) VALUES ($1, $2, $3) RETURNING *", project.UserId, project.ApiKey, project.Name).Scan(&new_project.Id, &new_project.ApiKey, &new_project.UserId, &new_project.Name, &new_project.Image)
	return new_project, err
}

func (db *DB) UpdateProjectApiKey(id uuid.UUID, apikey string) error {
	_, err := db.Conn.Exec("UPDATE projects SET apikey = $1 WHERE id = $2", apikey, id)
	return err
}

func (db DB) UpdateProjectName(id uuid.UUID, newname string) error {
	_, err := db.Conn.Exec("UPDATE projects SET name = $1 WHERE id = $2", newname, id)
	return err
}

func (db *DB) DeleteProject(id uuid.UUID, userid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM projects WHERE id = $1 AND userid = $2", id, userid)
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
	err := db.Conn.QueryRow("INSERT INTO emailchange (userid, newemail) VALUES ($1, $2) RETURNING *", userid, newemail).Scan(&emailchange.Id, &emailchange.UserId, &emailchange.NewEmail)
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
		err := rows.Scan(&plan.Identifier, &plan.Name, &plan.Price, &plan.ProjectLimit, &plan.MetricPerProjectLimit, &plan.RequestLimit, &plan.MonthlyEventLimit, &plan.Range)
		if err != nil {
			return []types.Plan{}, err
		}
		plans = append(plans, plan)
	}

	return plans, nil
}

func (db *DB) CreatePlan(plan types.Plan) error {
	_, err := db.Conn.Exec("INSERT INTO plans (name, identifier, price, projectlimit, metricperprojectlimit, requestlimit, monthlyeventlimit, range) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", plan.Name, plan.Identifier, plan.Price, plan.ProjectLimit, plan.MetricPerProjectLimit, plan.RequestLimit, plan.MonthlyEventLimit, plan.Range)
	return err
}

func (db *DB) UpdatePlan(identifier string, new_plan types.Plan) error {
	_, err := db.Conn.Exec("UPDATE plans SET name = $1, price = $2, project = $3, metricperprojectlimit = $4, range = $5, requestlimit = $6 WHERE identifier = $7", new_plan.Name, new_plan.Price, new_plan.ProjectLimit, new_plan.MetricPerProjectLimit, new_plan.Range, new_plan.RequestLimit, identifier)
	return err
}

func (db *DB) CreateTeamRelation(relation types.TeamRelation) error {
	_, err := db.Conn.Exec("INSERT INTO teamrelation (userid, projectid, role) VALUES ($1, $2, $3)", relation.UserId, relation.ProjectId, relation.Role)
	return err
}

func (db *DB) GetTeamRelation(id, projectid uuid.UUID) (types.TeamRelation, error) {
	var relation types.TeamRelation
	err := db.Conn.Get(&relation, "SELECT * FROM teamrelation WHERE userid = $1 AND projectid = $2", id, projectid)
	return relation, err
}

func (db *DB) DeleteTeamRelation(id, projectid uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM teamrelation WHERE userid = $1 AND projectid = $2", id, projectid)
	return err
}

func (db *DB) UpdateUserRole(id, projectid uuid.UUID, newrole int) error {
	_, err := db.Conn.Exec("UPDATE teamrealtion SET role = $1 WHERE userid = $2 AND projectid = $3", newrole, id, projectid)
	return err
}

func (db *DB) GetUsersByProjectId(projectid uuid.UUID) ([]types.User, error) {
	var users []types.User

	query := `
		SELECT 
			u.*,
			CASE
				WHEN p.userid = u.id THEN 0
				ELSE tr.role
			END AS userrole
		FROM 
			users u
		LEFT JOIN 
			TeamRelation tr 
		ON 
			u.id = tr.userid AND tr.projectid = $1
		LEFT JOIN 
			projects p
		ON 
			p.id = $1
		WHERE 
			p.userid = u.id OR tr.projectid = $1
    LIMIT 5
	`

	err := db.Conn.Select(&users, query, projectid)
	if err != nil {
		return nil, err
	}

	return users, nil
}
