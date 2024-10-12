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
			log.Println(env_err)
			log.Fatal("Error loading .env file")
		}
	}

	log.Println(os.Getenv("ORIGIN"))
	log.Println(os.Getenv("GITHUB_CLIENT_ID"))
	log.Println(os.Getenv("GITHUB_SECRET"))
	log.Println(os.Getenv("DATABASE_URL"))

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
