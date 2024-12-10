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

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
}

type GetUserResponse struct {
	Email       string `json:"email"`
	FirstName   string `json:"firstname"`
	LastName    string `json:"lastname"`
	Image       string `json:"image"`
	CurrentPlan string `json:"currentplan"`
	Provider    int    `json:"provider"`
	Plan        string `json:"plan"`
}

type EmailValidRequest struct {
	Email string `json:"email"`
	Type  int    `json:"type"`
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

type UpdateApplicationImageRequest struct {
	AppId uuid.UUID `json:"appid"`
	Image string    `json:"image"`
}

type RandomizeApiKeyRequest struct {
	AppId uuid.UUID `json:"appid"`
}

type DeleteApplicationRequest struct {
	AppId uuid.UUID `json:"appid"`
}

type CreateMetricEventRequest struct {
	ApplicationApiKey string    `json:"applicationapikey"`
	MetricId          uuid.UUID `json:"metricid"`
	Date              time.Time `json:"time"`
	Value             int       `json:"value"`
}

type MetricGroupResponse struct {
	types.MetricGroup
	Metrics []types.Metric `json:"metrics"`
}

type GetMetricsRequest struct {
	MetricId uuid.UUID `json:"metricid"`
}

type CreateGroupRequest struct {
	Name      string    `json:"name"`
	AppId     uuid.UUID `json:"appid"`
	Type      int       `json:"type"`
	BaseValue int       `json:"basevalue"`
	Metrics   []string  `json:"metrics"`
}
type DeleteGroupRequest struct {
	GroupId uuid.UUID `json:"groupid"`
	AppId   uuid.UUID `json:"appid"`
}

type UpdateGroupRequest struct {
	GroupId uuid.UUID `json:"groupid"`
	Name    string    `json:"name"`
	AppId   uuid.UUID `json:"appid"`
}

type UpdateMetricRequest struct {
	AppId    uuid.UUID `json:"appid"`
	MetricId uuid.UUID `json:"metricid"`
	Name     string    `json:"name"`
	Groupid  uuid.UUID `json:"groupid"`
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
	AppId        uuid.UUID           `json:"appid"`
	MetricGroups []types.MetricGroup `json:"metricgroups"`
	Metrics      []types.Metric      `json:"metrics"`
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
