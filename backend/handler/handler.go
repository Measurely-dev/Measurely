package handler

import (
	"Measurely/file"
	"Measurely/service"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Handler struct {
	router  *chi.Mux
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
	h.router.Use(middleware.Logger)
	h.router.Use(middleware.Recoverer)

	h.setup_api()

	defer h.service.CleanUp()

	return http.ListenAndServe(port, h.router)
}

func (h *Handler) setup_api() {
	privateCors := service.SetupCors().Handler

	publicCors := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"OPTIONS", "POST"},
	}).Handler

	privateRouter := chi.NewRouter()
	publicRouter := chi.NewRouter()
	authRouter := chi.NewRouter()

	//// ROUTES THAT ARE ONLY AVAILABLE TO THE APPLICATION DOMAIN, PRIVATE CORS
	privateRouter.Use(privateCors)
	privateRouter.Post("/email-valid", h.service.EmailValid)
	privateRouter.Post("/login", h.service.Login)
	privateRouter.Get("/oauth/{provider}", h.service.Oauth)
	privateRouter.HandleFunc("/callback/{provider}", h.service.Callback)
	privateRouter.Post("/register", h.service.Register)
	privateRouter.Post("/logout", h.service.Logout)
	privateRouter.Post("/forgot-password", h.service.ForgotPassword)
	privateRouter.Post("/recover-account", h.service.RecoverAccount)

	privateRouter.HandleFunc("/webhook", h.service.Webhook)

	// privateRouter.Post("/update-rates", h.service.UpdateRates)
	// privateRouter.Post("/update-plans", h.service.UpdatePlans)
	// privateRouter.Get("/rates", h.service.GetRates)
	// privateRouter.Get("/plans", h.service.GetPlans)

	privateRouter.Patch("/changeemail", h.service.UpdateUserEmail)
	////

	// ROUTES THAT REQUIRE AUTHENTIFICATION
	authRouter.Use(h.service.AuthentificatedMiddleware)
	authRouter.Post("/feedback", h.service.SendFeedback)

	authRouter.Get("/is-connected", h.service.IsConnected)

	authRouter.Delete("/account", h.service.DeleteAccount)

	authRouter.Post("/disconnect/{provider}", h.service.DisconnectProvider)

	authRouter.Get("/user", h.service.GetUser)

	authRouter.Get("/applications", h.service.GetApplications)
	authRouter.Post("/application", h.service.CreateApplication)
	authRouter.Delete("/application", h.service.DeleteApplication)
	authRouter.Patch("/app-name", h.service.UpdateApplicationName)
	authRouter.Get("/metrics", h.service.GetMetrics)
	authRouter.Patch("/rand-apikey", h.service.RandomizeApiKey)
	authRouter.Get("/events", h.service.GetMetricEvents)

	authRouter.Post("/metric", h.service.CreateMetric)
	authRouter.Patch("/metric", h.service.UpdateMetric)
	authRouter.Delete("/metric", h.service.DeleteMetric)

	authRouter.Get("/billing", h.service.ManageBilling)
	authRouter.Post("/subscribe", h.service.Subscribe)

	authRouter.Patch("/name", h.service.UpdateFirstAndLastName)
	authRouter.Patch("/password", h.service.UpdatePassword)

	authRouter.Post("/requestemailchange", h.service.RequestEmailChange)
	////

	// PUBLIC API ENDPOINT
	publicRouter.Use(publicCors)
	publicRouter.Post("/{apikey}/{metricid}", h.service.CreateMetricEvent)
	////

	/// SETUP FILE SERVER
	file.SetupFileServer(privateRouter)
	////

	privateRouter.Mount("/", authRouter)
	h.router.Mount("/", privateRouter)
	h.router.Mount("/event", publicRouter)
}
