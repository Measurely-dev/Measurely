package service

import (
	"Measurely/types"
	"time"

	"github.com/google/uuid"
)

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type EmailValidRequest struct {
	Email string `json:"email"`
	Type  int    `json:"type"`
}

type AuthCookie struct {
	UserId       uuid.UUID `json:"userId"`
	Email        string    `json:"email"`
	CreationDate time.Time `json:"creationDate"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type RecoverAccountRequest struct {
	Code        string `json:"code"`
	NewPassword string `json:"newpassword"`
}

type FeedbackRequest struct {
	Email   string `json:"email"`
	Content string `json:"content"`
}

type NewEmailRequest struct {
	Password string `json:"password"`
	NewEmail string `json:"newemail"`
}

type NewPasswordRequest struct {
	NewPassword string `json:"newpassword"`
	Password    string `json:"password"`
}

type DeleteAccountRequest struct {
	Password string `json:"password"`
}

type CreateApplicationRequest struct {
	Name string `json:"name"`
}

type DeleteApplicationRequest struct {
	ApplicationId uuid.UUID `json:"applicationid"`
}

type CreateMetricEventRequest struct {
	ApplicationApiKey string    `json:"applicationapikey"`
	Date              time.Time `json:"time"`
	Value             int       `json:"value"`
	Metric            string    `json:"metric"`
}

type GetMetricsRequest struct {
	AppId uuid.UUID `json:"appid"`
}

type CreateMetricRequest struct {
	Name  string    `json:"name"`
	AppId uuid.UUID `json:"appid"`
}
type DeleteMetricRequest struct {
	MetricId uuid.UUID `json:"metricid"`
	AppId    uuid.UUID `json:"appid"`
}

type ToggleMetricRequest struct {
	MetricId uuid.UUID `json:"metricid"`
	AppId    uuid.UUID `json:"appid"`
	Enabled  bool      `json:"enabled"`
}

type GetMetricEventsRequest struct {
	MetricId uuid.UUID `json:"metricid"`
	AppId    uuid.UUID `json:"appid"`
	Offset   int       `json:"offset"`
}

type SendEmailRequest struct {
	To     string
	Fields MailFields
}

type UpgradeRateRequest struct {
	Secret  string `json:"secret"`
	Name    string `json:"name"`
	NewRate int    `json:"newrate"`
}

type UpdatePlanRequest struct {
	Secret string     `json:"secret"`
	Name   string     `json:"name"`
	Plan   types.Plan `json:"plan"`
}

type CacheData struct {
	AppId   uuid.UUID      `json:"appid"`
	Metrics []types.Metric `json:"metrics"`
}

type CreateWebSocketRequest struct {
	AppId uuid.UUID `json:"appid"`
}

type MailFields struct {
	Subject     string
	Content     string
	Link        string
	ButtonTitle string
}

type ManageBillingResponse struct {
	URL string `json:"url"`
}

type SubscribeRequest struct {
	PlanName string `json:"planname"`
}

type SubscribeResponse struct {
	URL string `json:"url"`
}

type GetSubscriptionResponse struct {
	Plan   types.Plan `json:"plan"`
	Renews time.Time  `json:"renews"`
}

type ChangeSubscriptionRequest struct {
	Plan     string `json:"plan"`
	Password string `json:"password"`
}

type CancelSubscriptionRequest struct {
	Password string `json:"password"`
}

type GetRates struct {
	Secret string `json:"secret"`
}

type GetPlans struct {
	Secret string `json:"secret"`
}
