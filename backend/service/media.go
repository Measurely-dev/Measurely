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

func (s *Service) UploadApplicationImage(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	appid, err := uuid.Parse(chi.URLParam(r, "appid"))
	if err != nil {
		http.Error(w, "invalid application id", http.StatusBadRequest)
		return
	}

	app, err := s.db.GetApplication(appid, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "application not found", http.StatusNotFound)
		} else {
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}

	if err := r.ParseMultipartForm(MAX_SIZE); err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileName := appid.String() + header.Filename

	// Upload the file to R2
	_, err = s.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    aws.String(fileName),
		Body:   file,
	})
	if err != nil {
		log.Println(err)
		http.Error(w, "failed to upload file", http.StatusInternalServerError)
		return
	}

	var response struct {
		URL string `json:"url"`
	}

	if os.Getenv("ENV") == "production" {
		response.URL = fmt.Sprintf("https://media.measurely.dev/%s", fileName)
	} else {
		response.URL = fmt.Sprintf("%s/%s/%s", os.Getenv("S3_ENDPOINT"), os.Getenv("S3_BUCKET_NAME"), fileName)
	}

	byte, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	if app.Image != "" {
		if _, err := s.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
			Key:    aws.String(app.Image),
		}); err != nil {
			log.Printf("Failed to delete old application image : %s\n", err)
		}
	}

	s.db.UpdateApplicationImage(appid, response.URL)

	w.Write(byte)
	w.WriteHeader(http.StatusOK)
}
