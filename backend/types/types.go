package types

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const (
	EMAIL = iota
	GITHUB
)

const (
	TIME = iota
)

const (
	YEAR = iota
	MONTH
	WEEK
	DAY
	HOUR
	MINUTE
	SECOND
)

type User struct {
	Id               uuid.UUID
	Email            string
	Password         string
	Provider         int
	StripeCustomerId string
	CurrentPlan      string
}

type Application struct {
	Id     uuid.UUID `json:"id"`
	ApiKey string    `json:"apikey"`
	UserId uuid.UUID `json:"userid"`
	Name   string    `json:"name"`
}

type Metric struct {
	Id         uuid.UUID `json:"id"`
	AppId      uuid.UUID `json:"appid"`
	Name       string    `json:"name"`
	Identifier string    `json:"identifier"`
	Enabled    bool      `json:"enabled"`
	Total      int       `json:"total"`
}

type MetricEvent struct {
	Id       uuid.UUID        `json:"id"`
	MetricId uuid.UUID        `json:"metricid"`
	Date     time.Time        `json:"date"`
	Type     int              `json:"type"`
	Columns  sql.Null[string] `json:"column"`
	Value    int              `json:"value"`
}

type AccountRecovery struct {
	Id     uuid.UUID
	Code   string
	UserId uuid.UUID
}
type Feedback struct {
	Id      uuid.UUID
	Date    time.Time
	Email   string `db:"email"`
	Content string `db:"content"`
}

type Plan struct {
	Name              string `json:"name"`
	Identifier        string `json:"identifier"`
	Price             string `json:"price"`
	AppLimit          int    `json:"applimit"`
	MetricPerAppLimit int    `json:"metricperapplimit"`
	TimeFrames        []int  `json:"timeframes"`
}
