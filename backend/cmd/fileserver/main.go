package main

import (
	"Measurely/file"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	if _, exists := os.LookupEnv("RAILWAY_ENVIRONMENT"); !exists {
		env_err := godotenv.Load()
		if env_err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	router := chi.NewRouter()
	router.Use(middleware.StripSlashes)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	Cors := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("ORIGIN")},
		AllowedMethods:   []string{"POST", "GET", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler

	router.Use(Cors)

	file.SetupFileServer(router)

	PORT := ":7100"
	log.Println("Server started on port ", PORT)
	err := http.ListenAndServe(PORT, router)
	if err != nil {
		log.Fatalln(err)
	}
}
