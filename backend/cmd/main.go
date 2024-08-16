package main

import (
	"log"
	"os"

	"Measurely/handler"
	"Measurely/service"

	"github.com/joho/godotenv"
)

func main() {

	if _, exists := os.LookupEnv("RAILWAY_ENVIRONMENT"); !exists {
		env_err := godotenv.Load()
		if env_err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	service := service.New()
	service.SetupSharedVariables()

	handler := handler.New(&service)

	PORT := ":8080"
	log.Println("Server started on port ", PORT)
	err := handler.Start(PORT)
	if err != nil {
		log.Fatalln(err)
	}
}
