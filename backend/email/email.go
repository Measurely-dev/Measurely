package email

import (
	"bytes"
	"errors"
	"os"
	"text/template"

	"gopkg.in/gomail.v2"
)

type Email struct {
	dialer *gomail.Dialer
}

type MailFields struct {
	To          string
	Subject     string
	Content     string
	Link        string
	ButtonTitle string
}

func NewEmail() (*Email, error) {
	dialer := gomail.NewDialer("smtp.gmail.com", 587, "Info@measurely.dev", os.Getenv("APP_PWD"))

	email := Email{
		dialer: dialer,
	}

	if dialer == nil {
		return nil, errors.New("failed to initialize smtp dialer")
	}

	return &email, nil
}

func (e *Email) SendEmail(fields MailFields) error {
	t, err := template.ParseFiles("template.html")
	if err != nil {
		return err
	}

	buffer := new(bytes.Buffer)

	if err := t.Execute(buffer, fields); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "Info@measurely.dev")
	m.SetHeader("To", fields.To)
	m.SetHeader("Subject", fields.Subject)
	m.SetBody("text/html", buffer.String())

	// Send the email to Bob, Cora and Dan.
	if err := e.dialer.DialAndSend(m); err != nil {
		return err
	}
	return nil
}
