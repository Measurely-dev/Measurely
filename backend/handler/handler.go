package handler

import (
	"Measurely/service"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

func (h *Handler) Start(port string) {
	h.router.Use(middleware.StripSlashes)
	h.router.Use(middleware.Logger)
	h.router.Use(middleware.Recoverer)

	h.setup_api()

	server := &http.Server{
		Addr:    port,
		Handler: h.router,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "Failed to start the server: %v", err)
			os.Exit(1)
		}
	}()

	fmt.Printf("🚀 Starting application on port %v\n", port)

	<-quit
	fmt.Println("Shutting down server...")

	// Create a context with a timeout for graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "Server Shutdown Failed:%+v", err)
	}

	h.service.CleanUp()

	fmt.Println("Server gracefully stopped")
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
	privateRouter.Post("/email_valid", h.service.EmailValid)
	privateRouter.Post("/login", h.service.Login)
	privateRouter.Get("/oauth/{provider}", h.service.Oauth)
	privateRouter.HandleFunc("/callback/{provider}", h.service.Callback)
	privateRouter.Post("/register", h.service.Register)
	privateRouter.Post("/logout", h.service.Logout)
	privateRouter.Post("/forgot_password", h.service.ForgotPassword)
	privateRouter.Post("/recover_account", h.service.RecoverAccount)
	privateRouter.HandleFunc("/webhook", h.service.Webhook)

	// privateRouter.Post("/update-rates", h.service.UpdateRates)
	// privateRouter.Post("/update-plans", h.service.UpdatePlans)
	// privateRouter.Get("/rates", h.service.GetRates)
	// privateRouter.Get("/plans", h.service.GetPlans)

	privateRouter.Patch("/change_email", h.service.UpdateUserEmail)
	////

	// ROUTES THAT REQUIRE AUTHENTIFICATION
	authRouter.Use(h.service.AuthenticatedMiddleware)
	authRouter.Post("/feedback", h.service.SendFeedback)

	authRouter.Get("/is_connected", h.service.IsConnected)
	authRouter.Delete("/account", h.service.DeleteAccount)
	authRouter.Post("/disconnect/{provider}", h.service.DisconnectProvider)
	authRouter.Get("/user", h.service.GetUser)
	authRouter.Post("/user_image", h.service.UploadUserImage)

	authRouter.Patch("/name", h.service.UpdateFirstAndLastName)
	authRouter.Patch("/password", h.service.UpdatePassword)
	authRouter.Post("/request_email_change", h.service.RequestEmailChange)

	authRouter.Get("/projects", h.service.GetProjects)
	authRouter.Post("/project", h.service.CreateProject)
	authRouter.Delete("/project", h.service.DeleteProject)
	authRouter.Patch("/project_name", h.service.UpdateProjectName)
	authRouter.Post("/project_image/{project_id}", h.service.UploadProjectImage)
	authRouter.Patch("/rand_apikey", h.service.RandomizeApiKey)
	authRouter.Patch("/project-units", h.service.UpdateProjectUnits)

	authRouter.Get("/blocks/{project_id}", h.service.GetBlocks)
	authRouter.Patch("/blocks/layout", h.service.UpdateBlocks)

	authRouter.Get("/members/{project_id}", h.service.GetTeamMembers)
	authRouter.Patch("/role", h.service.UpdateMemberRole)
	authRouter.Delete("/member", h.service.RemoveTeamMember)
	authRouter.Post("/member", h.service.AddTeamMember)

	authRouter.Get("/metrics", h.service.GetMetrics)
	authRouter.Get("/events", h.service.GetMetricEvents)
	authRouter.Get("/daily_variation", h.service.GetDailyVariation)
	authRouter.Post("/metric", h.service.CreateMetric)
	authRouter.Patch("/metric", h.service.UpdateMetric)
	authRouter.Delete("/metric", h.service.DeleteMetric)
	authRouter.Delete("/category", h.service.DeleteCategory)
	authRouter.Patch("/category", h.service.UpdateCategory)
	authRouter.Delete("/filter", h.service.DeleteFilter)
	authRouter.Patch("/filter", h.service.UpdateFilterName)
	authRouter.Post("/filter", h.service.CreateFilter)
	authRouter.Patch("/metric-unit", h.service.UpdateMetricUnit)

	authRouter.Get("/billing", h.service.ManageBilling)
	authRouter.Post("/subscribe", h.service.Subscribe)
	////

	// PUBLIC API ENDPOINT
	publicRouter.Use(publicCors)
	publicRouter.Post("/v1/{metric_identifier}", h.service.CreateMetricEventV1)

	////

	privateRouter.Mount("/", authRouter)
	h.router.Mount("/", privateRouter)
	h.router.Mount("/event", publicRouter)
}
