package handler

import (
	"net/http"
	"os"

	"Measurely/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Handler struct {
	router  chi.Router
	service *service.Service
}

func New(s *service.Service) Handler {
	return Handler{
		router:  chi.NewRouter(),
		service: s,
	}
}

func (h *Handler) Start(port string) error {
	h.router.Use(middleware.StripSlashes)

	if os.Getenv("ENVIRONMENT") == "production" {
		h.router.Use(middleware.Recoverer)
	}

	if os.Getenv("ENVIRONMENT") == "development" {
		h.router.Use(middleware.Logger)
	}

	h.setup_api()

	go h.service.ProcessMetricEvents()
	go h.service.ProcessEmails()
	go h.service.StoreMetricEvents()

	defer h.service.CleanUp()

	return http.ListenAndServe(port, h.router)
}

func (h *Handler) setup_api() {
	Cors := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("ORIGIN")}, // Allow all origins for this route
		AllowedMethods:   []string{"POST", "GET", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler

	h.router.Use(Cors)
	h.router.Group(func(r chi.Router) {
		r.Post("/email-valid", h.service.EmailValid)
		r.Post("/login", h.service.Login)
		r.Get("/login-github", h.service.LoginGithub)
		r.Post("/register", h.service.Register)
		r.Post("/logout", h.service.Logout)
		r.Post("/forgot-password", h.service.ForgotPassword)
		r.Post("/recover-account", h.service.RecoverAccount)

		r.Post("/feedback", h.service.SendFeedback)

		r.Post("/{apikey}/{metric}", h.service.CreateMetricEvent)
		r.HandleFunc("/webhook", h.service.Webhook)
		r.HandleFunc("/github-callback", h.service.GithubCallback)

		r.Post("/update-rates", h.service.UpdateRates)
		r.Post("/update-plans", h.service.UpdatePlans)
		r.Get("/rates", h.service.GetRates)
		r.Get("/plans", h.service.GetPlans)

		r.Group(func(cr chi.Router) {
			cr.Use(h.service.AuthentificatedMiddleware)

			cr.Get("/is-connected", h.service.IsConnected)

			cr.Delete("/account", h.service.DeleteAccount)

			cr.Delete("/account", h.service.DeleteAccount)

			cr.Get("/application", h.service.GetApplications)
			cr.Post("/application", h.service.CreateApplication)
			cr.Delete("/application", h.service.DeleteApplication)
			cr.Get("/metrics", h.service.GetMetrics)
			cr.Get("/events", h.service.GetMetricEvents)
			cr.Get("/connect", h.service.HandleWebSocket)

			cr.Post("/metric", h.service.CreateMetric)
			cr.Patch("/metric", h.service.ToggleMetric)
			cr.Delete("/metric", h.service.DeleteMetric)

			cr.Get("/billing", h.service.ManageBilling)
			cr.Post("/subscribe", h.service.Subscribe)
			cr.Post("/cancel-subscription", h.service.CancelSubscription)
			cr.Post("/change-subscription", h.service.ChangeSubscription)
			cr.Get("/subscription", h.service.GetCurrentSubscription)
		})

	})
}
