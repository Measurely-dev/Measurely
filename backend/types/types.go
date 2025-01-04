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
)

const (
	TEAM_VIEW = iota
	TEAM_DEV
	TEAM_ADMIN
)

type key int

const TOKEN key = iota

type Token struct {
	Id    uuid.UUID `json:"id"`
	Email string    `json:"email"`
}
type User struct {
	Id                uuid.UUID
	Email             string
	FirstName         string
	LastName          string
	Password          string
	StripeCustomerId  string
	CurrentPlan       string
	Image             string
	MonthlyEventCount int64
	StartCountDate    time.Time
}

type UserProvider struct {
	Id             uuid.UUID `json:"id"`
	UserId         uuid.UUID `json:"userid"`
	Type           int       `json:"type"`
	ProviderUserId string    `json:"provideruserid"`
}

type Project struct {
	Id     uuid.UUID `json:"id"`
	ApiKey string    `json:"apikey"`
	UserId uuid.UUID `json:"userid"`
	Name   string    `json:"name"`
	Image  string    `json:"image"`
}

type Metric struct {
	Id             uuid.UUID           `json:"id"`
	ProjectId      uuid.UUID           `json:"projectid"`
	FilterCategory string              `json:"filtercategory"`
	ParentMetricId sql.Null[uuid.UUID] `json:"parentmetricid"`
	Name           string              `json:"name"`
	Type           int                 `json:"type"`
	EventCount     int64               `json:"eventcount"`
	TotalPos       int64               `json:"totalpos"`
	TotalNeg       int64               `json:"totalneg"`
	NamePos        string              `json:"namepos"`
	NameNeg        string              `json:"nameneg"`
	Filters        map[string][]Metric `json:"filters"`
	Created        time.Time           `json:"created"`
}

type MetricEvent struct {
	Id                 uuid.UUID `json:"id"`
	MetricId           uuid.UUID `json:"metricid"`
	Date               time.Time `json:"date"`
	EventCount         int       `json:"eventcount"`
	ValuePos           int       `json:"valuepos"`
	ValueNeg           int       `json:"valueneg"`
	RelativeEventCount int64     `json:"relativeeventcount"`
	RelativeTotalPos   int64     `json:"relativetotalpos"`
	RelativeTotalNeg   int64     `json:"relativetotalneg"`
}

type AccountRecovery struct {
	Id     uuid.UUID
	UserId uuid.UUID
}

type EmailChangeRequest struct {
	Id       uuid.UUID
	UserId   uuid.UUID
	NewEmail string
}

type Feedback struct {
	Id      uuid.UUID
	Date    time.Time
	Email   string `db:"email"`
	Content string `db:"content"`
}

type Plan struct {
	Name                  string `json:"name"`
	Identifier            string `json:"identifier"`
	Price                 string `json:"price"`
	ProjectLimit          int    `json:"projectlimit"`
	MetricPerProjectLimit int    `json:"metric_per_project_limit"`
	RequestLimit          int    `json:"requestlimit"`
	MonthlyEventLimit     int64  `json:"monthlyeventlimit"`
	Range                 int    `json:"range"`
}

type TeamRelation struct {
	Id        uuid.UUID `json:"id"`
	UserId    uuid.UUID `json:"userid"`
	ProjectId uuid.UUID `json:"projectid"`
	Role      int       `json:"rol"`
}
