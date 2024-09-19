package main

import (
	"Measurely/db"
	"Measurely/types"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/gorilla/securecookie"
	"github.com/joho/godotenv"
)

func main() {
	if _, exists := os.LookupEnv("RAILWAY_ENVIRONMENT"); !exists {
		env_err := godotenv.Load()
		if env_err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	const MAX_SIZE = 500 * 1024

	router := chi.NewRouter()
	router.Use(middleware.StripSlashes)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	db, err := db.NewPostgres(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalln(err)
	}

	hash_key := []byte(os.Getenv("HASH_KEY"))
	block_key := []byte(os.Getenv("BLOCK_KEY"))
	securecookie := securecookie.New(hash_key, block_key)

	Cors := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("ORIGIN")},
		AllowedMethods:   []string{"POST", "GET", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler

	router.Use(Cors)

	fs := http.FileServer(http.Dir("uploads"))
	router.Handle("/uploads/*", http.StripPrefix("/uploads/", fs))

	router.Post("/app-upload", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("measurely-session")
		if err == http.ErrNoCookie {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var auth_cookie types.AuthCookie
		derr := securecookie.Decode("measurely-session", cookie.Value, &auth_cookie)
		if derr != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Get the application from url
		appId, err := uuid.Parse(r.URL.Query().Get("appid"))
		if err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		// Get the application from the database
		if _, err := db.GetApplication(appId, auth_cookie.UserId); err != nil {
			http.Error(w, "Unauthorized or not found", http.StatusUnauthorized)
			return
		}

		// Create the uploads directory if it does not exist
		uploadsDir := "uploads"
		if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
			http.Error(w, "Unable to create uploads directory", http.StatusInternalServerError)
			return
		}

		// Parse the form to retrieve file
		if err := r.ParseMultipartForm(MAX_SIZE); err != nil {
			http.Error(w, "Unable to parse form", http.StatusBadRequest)
			return
		} // 10 MB limit

		// Retrieve file from form
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Unable to get file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		fileName := "app_" + appId.String() // Generate or use a unique name
		outFile, err := os.Create(filepath.Join("uploads", fileName))
		if err != nil {
			log.Println(err)
			http.Error(w, "Unable to create file", http.StatusInternalServerError)
			return
		}
		defer outFile.Close()

		// Copy the uploaded file to the new file
		_, err = io.Copy(outFile, file)
		if err != nil {
			http.Error(w, "Unable to save file", http.StatusInternalServerError)
			return
		}

		// Update the application
		if err := db.UpdateApplicationImage(appId, fileName); err != nil {
			log.Println(err)
			http.Error(w, "Unable to update application", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "File uploaded successfully: %s", fileName)
	})
	router.Post("/user-upload", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("measurely-session")
		if err == http.ErrNoCookie {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var auth_cookie types.AuthCookie
		derr := securecookie.Decode("measurely-session", cookie.Value, &auth_cookie)
		if derr != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Create the uploads directory if it does not exist
		uploadsDir := "uploads"
		if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
			http.Error(w, "Unable to create uploads directory", http.StatusInternalServerError)
			return
		}

		// Parse the form to retrieve file
		if err := r.ParseMultipartForm(MAX_SIZE); err != nil {
			http.Error(w, "Unable to parse form", http.StatusBadRequest)
			return
		} // 10 MB limit

		// Retrieve file from form
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Unable to get file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		fileName := "user_" + auth_cookie.UserId.String() // Generate or use a unique name
		outFile, err := os.Create(filepath.Join("uploads", fileName))
		if err != nil {
			log.Println(err)
			http.Error(w, "Unable to create file", http.StatusInternalServerError)
			return
		}
		defer outFile.Close()

		// Copy the uploaded file to the new file
		_, err = io.Copy(outFile, file)
		if err != nil {
			http.Error(w, "Unable to save file", http.StatusInternalServerError)
			return
		}

		// Update the user
		if err := db.UpdateUserImage(auth_cookie.UserId, fileName); err != nil {
			log.Println(err)
			http.Error(w, "Unable to update user", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "File uploaded successfully: %s", fileName)
	})

	PORT := ":7100"
	log.Println("Server started on port ", PORT)
	http.ListenAndServe(PORT, router)
}
