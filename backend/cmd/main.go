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

	handler := handler.New(&service)

	log.Println("Server started on port 8080")
	err := handler.Start(":8080")
	if err != nil {
		log.Fatalln(err)
	}
}
