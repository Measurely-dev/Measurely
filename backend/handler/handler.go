package handler

import (
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
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"OPTIONS", "POST"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
	}).Handler

	privateRouter := chi.NewRouter()
	publicRouter := chi.NewRouter()
	authRouter := chi.NewRouter()

	//// ROUTES THAT ARE ONLY AVAILABLE TO THE APPLICATION DOMAIN, PRIVATE CORS
	privateRouter.Use(privateCors)
	privateRouter.Post("/waitlist", h.service.JoinWaitlist)
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
	authRouter.Use(h.service.AuthenticatedMiddleware)
	authRouter.Post("/feedback", h.service.SendFeedback)

	authRouter.Get("/is-connected", h.service.IsConnected)
	authRouter.Delete("/account", h.service.DeleteAccount)
	authRouter.Post("/disconnect/{provider}", h.service.DisconnectProvider)
	authRouter.Get("/user", h.service.GetUser)
	authRouter.Post("/user-image", h.service.UploadUserImage)

	authRouter.Patch("/name", h.service.UpdateFirstAndLastName)
	authRouter.Patch("/password", h.service.UpdatePassword)
	authRouter.Post("/requestemailchange", h.service.RequestEmailChange)

	authRouter.Get("/projects", h.service.GetProjects)
	authRouter.Post("/project", h.service.CreateProject)
	authRouter.Delete("/project", h.service.DeleteProject)
	authRouter.Patch("/project-name", h.service.UpdateProjectName)
	authRouter.Post("/project-image/{projectid}", h.service.UploadProjectImage)
	authRouter.Patch("/rand-apikey", h.service.RandomizeApiKey)

	authRouter.Get("/blocks/{projectid}", h.service.GetBlocks)
	authRouter.Patch("/blocks/layout", h.service.UpdateBlocks)

	authRouter.Get("/members/{projectid}", h.service.GetTeamMembers)
	authRouter.Patch("/role", h.service.UpdateMemberRole)
	authRouter.Delete("/member", h.service.RemoveTeamMember)
	authRouter.Post("/member", h.service.AddTeamMember)
	authRouter.Get("/members", h.service.SearchUsers)

	authRouter.Get("/metrics", h.service.GetMetrics)
	authRouter.Get("/events", h.service.GetMetricEvents)
	authRouter.Get("/daily-variation", h.service.GetDailyVariation)
	authRouter.Post("/metric", h.service.CreateMetric)
	authRouter.Patch("/metric", h.service.UpdateMetric)
	authRouter.Delete("/metric", h.service.DeleteMetric)
	authRouter.Delete("/category", h.service.DeleteCategory)
	authRouter.Patch("/category", h.service.UpdateCategory)

	authRouter.Get("/billing", h.service.ManageBilling)
	authRouter.Post("/subscribe", h.service.Subscribe)

	authRouter.Get("/integrations/stripe", h.service.AuthorizeStripe)
	authRouter.Get("/integrations-callback/stripe", h.service.StripeCallback)
	////

	// PUBLIC API ENDPOINT
	publicRouter.Use(publicCors)
	publicRouter.Post("/v1/{metricidentifier}", h.service.CreateMetricEventV1)

	////

	privateRouter.Mount("/", authRouter)
	h.router.Mount("/", privateRouter)
	h.router.Mount("/event", publicRouter)
}
