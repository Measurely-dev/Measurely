package main

import (
	"Measurely/handler"
	"Measurely/service"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/measurely-dev/measurely-go"
)

func main() {
	if _, exists := os.LookupEnv("RAILWAY_ENVIRONMENT"); !exists {
		env_err := godotenv.Load()
		if env_err != nil {
			log.Println(env_err)
			log.Fatal("Error loading .env file")
		}
	}

	if os.Getenv("ENV") == "production" {
		measurely.Init(os.Getenv("MEASURELY_API_KEY"))
	}

	service := service.New()
	service.SetupBasicPlans()

	handler := handler.New(&service)

  go service.IntegrationWorker()

	PORT := ":8080"
	log.Println("Server started on port ", PORT)
	err := handler.Start(PORT)
	if err != nil {
		log.Fatalln(err)
	}
}
