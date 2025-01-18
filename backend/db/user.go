package db

import (
	"Measurely/types"
	"time"

	"github.com/google/uuid"
)

func (db *DB) CreateWaitlistEntry(email string, name string) error {
	_, err := db.Conn.Exec("INSERT into waitlists (email, name) VALUES ($1, $2)", email, name)
	return err
}

func (db *DB) CreateProvider(provider types.UserProvider) (types.UserProvider, error) {
	var new_provider types.UserProvider
	err := db.Conn.QueryRow(`
		INSERT INTO providers (user_id, type, provider_user_id)
		VALUES ($1, $2, $3)
		RETURNING *`,
		provider.UserId, provider.Type, provider.ProviderUserId,
	).Scan(&new_provider)
	return new_provider, err
}

func (db *DB) DeleteUserProvider(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM providers WHERE id = $1", id)
	return err
}

func (db *DB) GetProviderByProviderUserId(provideruserid string, providerType int) (types.UserProvider, error) {
	var provider types.UserProvider
	err := db.Conn.Get(&provider, `
		SELECT * FROM providers
		WHERE provider_user_id = $1 AND type = $2`,
		provideruserid, providerType,
	)
	return provider, err
}

func (db *DB) GetProvidersByUserId(userid uuid.UUID) ([]types.UserProvider, error) {
	rows, err := db.Conn.Query("SELECT * FROM providers WHERE user_id = $1", userid)
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

func (db *DB) CreateFeedback(feedback types.Feedback) error {
	_, err := db.Conn.Exec(
		"INSERT INTO feedbacks (date, email, content) VALUES ($1, $2, $3)",
		feedback.Date, feedback.Email, feedback.Content,
	)
	return err
}

func (db *DB) CreateUser(user types.User) (types.User, error) {
	var new_user types.User
	rows, err := db.Conn.NamedQuery(`
		INSERT INTO users (
			email, first_name, last_name, password, stripe_customer_id, current_plan, start_count_date
		) VALUES (:email, :first_name, :last_name, :password, :stripe_customer_id, :current_plan, :start_count_date)
		RETURNING *`,
		user,
	)
	if err != nil {
		return types.User{}, err
	}
	defer rows.Close()
	for rows.Next() {
		err := rows.Scan(&new_user)
		if err != nil {
			return types.User{}, err
		}
	}
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
	_, err := db.Conn.Exec(`
		UPDATE users
		SET monthly_event_count = 0, start_count_date = $1
		WHERE id = $2`,
		time.Now().UTC(), id,
	)
	return err
}

func (db *DB) GetUserByCustomerId(cusId string) (types.User, error) {
	var user types.User
	err := db.Conn.Get(&user, "SELECT * FROM users WHERE stripe_customer_id = $1", cusId)
	return user, err
}

func (db *DB) UpdateUserFirstAndLastName(id uuid.UUID, firstname string, lastname string) error {
	_, err := db.Conn.Exec(`
		UPDATE users
		SET first_name = $1, last_name = $2
		WHERE id = $3`,
		firstname, lastname, id.String(),
	)
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

func (db *DB) UpdateUserImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE users SET image = $1 WHERE id = $2", image, id)
	return err
}

func (db *DB) SearchUsers(search string) ([]types.User, error) {
	var users []types.User

	query := `
		SELECT * FROM users
		WHERE email ILIKE $1
		OR (first_name ILIKE $1 AND last_name ILIKE $1)
	`

	err := db.Conn.Select(users, query, search)
	return users, err
}

func (db *DB) CreateAccountRecovery(userId uuid.UUID) (types.AccountRecovery, error) {
	var recovery types.AccountRecovery
	err := db.Conn.QueryRow("INSERT INTO account_recovery (user_id) VALUES ($1) RETURNING *", userId).Scan(&recovery.Id, &recovery.UserId)
	return recovery, err
}

func (db *DB) GetAccountRecovery(id uuid.UUID) (types.AccountRecovery, error) {
	var recovery types.AccountRecovery
	err := db.Conn.Get(&recovery, "SELECT * FROM account_recovery WHERE id = $1", id)
	return recovery, err
}

func (db *DB) GetAccountRecoveryByUserId(userId uuid.UUID) (types.AccountRecovery, error) {
	var recovery types.AccountRecovery
	err := db.Conn.Get(&recovery, "SELECT * FROM account_recovery WHERE user_id = $1", userId)
	return recovery, err
}

func (db *DB) GetEmailChangeRequest(id uuid.UUID) (types.EmailChangeRequest, error) {
	var request types.EmailChangeRequest
	err := db.Conn.Get(&request, "SELECT * FROM email_change WHERE id = $1", id)
	return request, err
}

func (db *DB) GetEmailChangeRequestByUserId(userId uuid.UUID, newEmail string) (types.EmailChangeRequest, error) {
	var request types.EmailChangeRequest
	err := db.Conn.Get(&request, "SELECT * FROM email_change WHERE user_id = $1 AND new_email = $2", userId, newEmail)
	return request, err
}

func (db *DB) CreateEmailChangeRequest(userId uuid.UUID, newEmail string) (types.EmailChangeRequest, error) {
	var request types.EmailChangeRequest
	err := db.Conn.QueryRow(
		"INSERT INTO email_change (user_id, new_email) VALUES ($1, $2) RETURNING *",
		userId, newEmail,
	).Scan(&request.Id, &request.UserId, &request.NewEmail)
	return request, err
}

func (db *DB) DeleteEmailChangeRequest(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM email_change WHERE id = $1", id)
	return err
}

func (db *DB) DeleteAccountRecovery(id uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM account_recovery WHERE id = $1", id)
	return err
}
