package service

import (
	"Measurely/types"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

const MAX_SIZE = 500 * 1024

func (s *Service) UploadProjectImage(w http.ResponseWriter, r *http.Request) {
	// Retrieve the token from the request context
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	// Parse the project ID from the URL parameters
	projectid, err := uuid.Parse(chi.URLParam(r, "projectid"))
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	// Fetch the project from the database
	project, err := s.db.GetProject(projectid, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			log.Println("Error fetching project:", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
		}
		return
	}

	// Parse the multipart form data, limiting the size of the upload
	if err := r.ParseMultipartForm(MAX_SIZE); err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Retrieve the uploaded file
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Generate a file name based on the project ID and the uploaded file's name
	fileName := projectid.String() + header.Filename

	// Upload the file to S3
	_, err = s.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    aws.String(fileName),
		Body:   file,
	})
	if err != nil {
		log.Println("Error uploading file:", err)
		http.Error(w, "Failed to upload file", http.StatusInternalServerError)
		return
	}

	// Prepare the response with the file's URL
	var response struct {
		URL string `json:"url"`
	}

	if os.Getenv("ENV") == "production" {
		response.URL = fmt.Sprintf("https://media.measurely.dev/%s", fileName)
	} else {
		response.URL = fmt.Sprintf("%s/%s/%s", os.Getenv("S3_ENDPOINT"), os.Getenv("S3_BUCKET_NAME"), fileName)
	}

	// Marshal the response and handle potential errors
	responseBytes, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// If the project already has an image, delete the old one
	if project.Image != "" {
		if _, err := s.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
			Key:    aws.String(project.Image),
		}); err != nil {
			log.Printf("Failed to delete old project image: %s\n", err)
		}
	}

	// Update the project image URL in the database
	if err := s.db.UpdateProjectImage(projectid, response.URL); err != nil {
		log.Printf("Failed to update project image in the database: %s\n", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Set the response headers and write the response body
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBytes)
}
