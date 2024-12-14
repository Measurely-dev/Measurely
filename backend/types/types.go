package types

import (
	"time"

	"github.com/google/uuid"
)

const (
	EMAIL = iota
	GITHUB
	GOOGLE
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

const (
	BASE = iota
	DUAL
	MULTI
)

type key int

const TOKEN key = iota

type Token struct {
	Id           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
}
type User struct {
	Id               uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Password         string
	StripeCustomerId string
	CurrentPlan      string
	Image            string
}

type UserProvider struct {
	Id             uuid.UUID `json:"id"`
	UserId         uuid.UUID `json:"userid"`
	Type           int       `json:"type"`
	ProviderUserId string    `json:"provideruserid"`
}

type Application struct {
	Id     uuid.UUID `json:"id"`
	ApiKey string    `json:"apikey"`
	UserId uuid.UUID `json:"userid"`
	Name   string    `json:"name"`
	Image  string    `json:"image"`
}

type MetricGroup struct {
	Id      uuid.UUID `json:"id"`
	AppId   uuid.UUID `json:"appid"`
	Name    string    `json:"name"`
	Type    int       `json:"type"`
	Created time.Time `json:"created"`
}

type Metric struct {
	Id      uuid.UUID `json:"id"`
	GroupId uuid.UUID `json:"groupid"`
	Name    string    `json:"name"`
	Total   int       `json:"total"`
}

type MetricEvent struct {
	Id       uuid.UUID `json:"id"`
	MetricId uuid.UUID `json:"metricid"`
	Date     time.Time `json:"date"`
	Value    int       `json:"value"`
}

type AccountRecovery struct {
	Id     uuid.UUID
	Code   string
	UserId uuid.UUID
}

type EmailChangeRequest struct {
	Id       uuid.UUID
	Code     string
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
	Name              string `json:"name"`
	Identifier        string `json:"identifier"`
	Price             string `json:"price"`
	AppLimit          int    `json:"applimit"`
	MetricPerAppLimit int    `json:"metricperapplimit"`
	TimeFrames        []int  `json:"timeframes"`
}

type DailyMetricSummary struct {
	Id       string    `json:"id"`
	Date     time.Time `json:"date"`
	MetricId uuid.UUID `json:"metricid"`
	Value    int       `json:"value"`
}
