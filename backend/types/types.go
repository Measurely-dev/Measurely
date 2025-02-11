package types

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const (
	GITHUB_PROVIDER = iota
	GOOGLE_PROVIDER
)

const (
	BASE_METRIC = iota
	DUAL_METRIC
	AVERAGE_METRIC
	STRIPE_METRIC
)

const (
	TEAM_OWNER = iota
	TEAM_ADMIN
	TEAM_DEV
	TEAM_GUEST
)

const (
	SUBSCRIPTION_MONTHLY = iota
	SUBSCRIPTION_YEARLY
)

const (
	INVOICE_ACTIVE = iota
	INVOICE_FAILED
)

type key int

const TOKEN key = iota

type Token struct {
	Id    uuid.UUID `db:"id" json:"id"`
	Email string    `db:"email" json:"email"`
}
type User struct {
	Id               uuid.UUID `db:"id" json:"id"`
	Email            string    `db:"email" json:"email"`
	FirstName        string    `db:"first_name" json:"first_name"`
	LastName         string    `db:"last_name" json:"last_name"`
	Password         string    `db:"password" json:"-"`
	StripeCustomerId string    `db:"stripe_customer_id" json:"-"`
	Image            string    `db:"image" json:"image"`
	InvoiceStatus    int       `db:"invoice_status" json:"invoice_status"`
	UserRole         int       `json:"user_role" db:"user_role"`
	Verified         bool      `json:"verified" db:"verified"`
}

type UserProvider struct {
	Id             uuid.UUID `db:"id" json:"id"`
	UserId         uuid.UUID `db:"user_id" json:"user_id"`
	Type           int       `db:"type" json:"type"`
	ProviderUserId string    `db:"provider_user_id" json:"provider_user_id"`
}

type Project struct {
	Id                   uuid.UUID `db:"id" json:"id"`
	ApiKey               string    `db:"api_key" json:"api_key"`
	Units                []Unit    `json:"units" db:"units"`
	UserId               uuid.UUID `db:"user_id" json:"user_id"`
	UserRole             int       `json:"user_role" db:"user_role"`
	Name                 string    `db:"name" json:"name"`
	Image                string    `db:"image" json:"image"`
	CurrentPlan          string    `db:"current_plan" json:"current_plan"`
	SubscriptionType     int       `db:"subscription_type" json:"subscription_type"`
	StripeSubscriptionId string    `db:"stripe_subscription_id" json:"-"`
	MaxEventPerMonth     int       `db:"max_event_per_month" json:"max_event_per_month"`
	MonthlyEventCount    int       `db:"monthly_event_count" json:"monthly_event_count"`
}

type Metric struct {
	Id                 uuid.UUID            `db:"id" json:"id"`
	ProjectId          uuid.UUID            `db:"project_id" json:"project_id"`
	Unit               string               `json:"unit" db:"unit"`
	Name               string               `db:"name" json:"name"`
	Type               int                  `db:"type" json:"type"`
	EventCount         int64                `db:"event_count" json:"event_count"`
	TotalPos           int64                `db:"total_pos" json:"total_pos"`
	TotalNeg           int64                `db:"total_neg" json:"total_neg"`
	NamePos            string               `db:"name_pos" json:"name_pos"`
	NameNeg            string               `db:"name_neg" json:"name_neg"`
	Filters            map[uuid.UUID]Filter `db:"filters" json:"filters"`
	Created            time.Time            `db:"created" json:"created"`
	LastEventTimestamp time.Time            `db:"last_event_timestamp" json:"last_event_timestamp"`
	StripeApiKey       sql.Null[string]     `db:"stripe_api_key" json:"-"`
}

type MetricEvent struct {
	Id       uuid.UUID   `db:"id" json:"id"`
	MetricId uuid.UUID   `db:"metric_id" json:"metric_id"`
	ValuePos int         `db:"value_pos" json:"value_pos"`
	ValueNeg int         `db:"value_neg" json:"value_neg"`
	Date     time.Time   `db:"date" json:"date"`
	Filters  []uuid.UUID `db:"filters" json:"filters"`
}

type AccountRecovery struct {
	Id     uuid.UUID `db:"id"`
	UserId uuid.UUID `db:"user_id"`
}

type EmailChangeRequest struct {
	Id       uuid.UUID `db:"id"`
	UserId   uuid.UUID `db:"user_id"`
	NewEmail string    `db:"new_email"`
}

type Feedback struct {
	Id      uuid.UUID `db:"id"`
	Date    time.Time `db:"date"`
	Email   string    `db:"email"`
	Content string    `db:"content"`
}

type Plan struct {
	Name             string `json:"name"`
	MonthlyPriceId   string `json:"-"`
	YearlyPriceId    string `json:"-"`
	MetricLimit      int    `json:"metric_limit"`
	TeamMemberLimit  int    `json:"team_member_limit"`
	Range            int    `json:"range"`
	MaxEventPerMonth int    `json:"-"`
}

type TeamRelation struct {
	Id        uuid.UUID `db:"id" json:"id"`
	UserId    uuid.UUID `db:"user_id" json:"user_id"`
	ProjectId uuid.UUID `db:"project_id" json:"project_id"`
	Role      int       `db:"role" json:"rol"`
}

type Filter struct {
	Name     string `json:"name"`
	Category string `json:"category"`
}

type Blocks struct {
	TeamRelationId sql.Null[string] `db:"team_relation_id"`
	UserId         uuid.UUID        `db:"user_id"`
	ProjectId      uuid.UUID        `db:"project_id"`
	Layout         []Block          `db:"layout" json:"layout"`
	Labels         []Label          `db:"labels" json:"labels"`
}

type Block struct {
	UniqueKey        string      `json:"unique_key"`
	Id               int         `json:"id"`
	Name             string      `json:"name"`
	Nested           []Block     `json:"nested"`
	MetricIds        []uuid.UUID `json:"metric_ids"`
	FilterCategories []string    `json:"filter_categories"`
	Type             int         `json:"type"`
	ChartType        int         `json:"chart_type"`
	Label            string      `json:"label"`
	Color            string      `json:"color"`
}

type Label struct {
	Name         string `json:"name"`
	DefaultColor string `json:"default_color"`
}

type Unit struct {
	Name   string `json:"name"`
	Symbol string `json:"symbol"`
}

type EmailVerification struct {
	Id     uuid.UUID `json:"id" db:"id"`
	UserId uuid.UUID `json:"user_id" db:"user_id"`
}

type TeamInvite struct {
	Id     uuid.UUID `json:"id" db:"id"`
	UserId uuid.UUID `json:"user_id" db:"user_id"`
}
