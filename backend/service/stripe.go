package service

import (
	"Measurely/types"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/stripe/stripe-go/v79"
	bilsession "github.com/stripe/stripe-go/v79/billingportal/session"
	"github.com/stripe/stripe-go/v79/checkout/session"
	"github.com/stripe/stripe-go/v79/subscription"
)

func (s *Service) ManageBilling(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(user.StripeCustomerId),
		ReturnURL: stripe.String(GetOrigin() + "/dashboard"),
	}

	result, err := bilsession.New(params)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(ManageBillingResponse{
		URL: result.URL,
	})
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) Subscribe(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var request struct {
		Plan string `json:"plan"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	plan, exists := s.GetPlan(request.Plan)
	if !exists {
		http.Error(w, "Intokenid plan", http.StatusBadRequest)
		return
	}

	user, err := s.DB.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if user.CurrentPlan == request.Plan {
		http.Error(w, "You are already using this plan", http.StatusNotModified)
		return
	}

	if user.CurrentPlan != "starter" {
		result := subscription.List(&stripe.SubscriptionListParams{
			Customer: stripe.String(user.StripeCustomerId),
		})

		subscriptions := result.SubscriptionList()

		if subscriptions == nil {
			http.Error(w, "no subscriptions found", http.StatusBadRequest)
			return
		}

		if len(subscriptions.Data) == 0 {
			http.Error(w, "no subscriptions found", http.StatusBadRequest)
			return
		}

		_, serr := subscription.Cancel(subscriptions.Data[0].ID, nil)
		if serr != nil {
			log.Println(serr)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

	}

	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(GetOrigin() + "/subscribe/success"),
		CancelURL:  stripe.String(GetOrigin() + "/dashboard"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(plan.Price),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		Customer: stripe.String(user.StripeCustomerId),
		Metadata: map[string]string{"plan": request.Plan},
		ConsentCollection: &stripe.CheckoutSessionConsentCollectionParams{
			PaymentMethodReuseAgreement: &stripe.CheckoutSessionConsentCollectionPaymentMethodReuseAgreementParams{
				Position: stripe.String(string(stripe.CheckoutSessionConsentCollectionPaymentMethodReuseAgreementPositionHidden)),
			},
		},
		CustomText: &stripe.CheckoutSessionCustomTextParams{
			AfterSubmit: &stripe.CheckoutSessionCustomTextAfterSubmitParams{
				Message: stripe.String("You can cancel your subscription at any time in your Measurely dashboard."),
			},
		},
	}

	if request.Plan == "starter" {
		w.WriteHeader(http.StatusOK)

    s.DB.UpdateUserPlan(token.Id, "starter")

		// send email
		s.ScheduleEmail(SendEmailRequest{
			To: user.Email,
			Fields: MailFields{
				Subject: "You are now on the starter plan",
				Content: "You have been downgraded to the starter plan.",

				Link:        os.Getenv("FRONTEND_URL") + "/dashboard",
				ButtonTitle: "View Dashboard",
			},
		})
	} else {
		new_session, err := session.New(params)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error. Failed to create checkout session", http.StatusInternalServerError)
			return
		}

		bytes, jerr := json.Marshal(SubscribeResponse{
			URL: new_session.URL,
		})
		if jerr != nil {
			http.Error(w, jerr.Error(), http.StatusContinue)
			return
		}

		w.Write(bytes)
		w.Header().Set("Content-Type", "application/json")
	}
}

func (s *Service) Webhook(w http.ResponseWriter, req *http.Request) {
	const MaxBodyBytes = int64(65536)
	req.Body = http.MaxBytesReader(w, req.Body, MaxBodyBytes)
	payload, err := io.ReadAll(req.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading request body: %v\n", err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	event := stripe.Event{}

	if err := json.Unmarshal(payload, &event); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to parse webhook body json: %v\n", err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Unmarshal the event data into an appropriate struct depending on its Type
	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing webhook JSON: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		planData, exists := s.GetPlan(session.Metadata["plan"])
		if !exists {
			log.Println("Plan not found")
			http.Error(w, "Plan not found", http.StatusNotFound)
			return
		}

		if session.Customer == nil {
			log.Println("Customer not found")
			http.Error(w, "Customer not found", http.StatusNotFound)
			return
		}

		user, err := s.DB.GetUserByCustomerId(session.Customer.ID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		s.DB.UpdateUserPlan(user.Id, planData.Identifier)

		// send email
		s.ScheduleEmail(SendEmailRequest{
			To: user.Email,
			Fields: MailFields{
				Subject: "Thank you for subscribing!",
				Content: "Your " + planData.Name + " subscription has been successfully created.",

				Link:        os.Getenv("FRONTEND_URL") + "/dashboard",
				ButtonTitle: "View Dashboard",
			},
		})

	case "invoice.payment_succeeded":
		var invoice stripe.Invoice
		err := json.Unmarshal(event.Data.Raw, &invoice)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing webhook JSON: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if invoice.Customer == nil {
			log.Println("Customer not found")
			http.Error(w, "Customer not found", http.StatusNotFound)
			return
		}

		user, err := s.DB.GetUserByCustomerId(invoice.Customer.ID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		// send email
		s.ScheduleEmail(SendEmailRequest{
			To: user.Email,
			Fields: MailFields{
				Subject: "Invoice Paid",
				Content: "Your invoice has been successfully paid." + "Amount Paid: US$" + strconv.FormatFloat(float64(invoice.AmountPaid)/100, 'f', 2, 64),

				Link:        GetOrigin() + "/dashboard",
				ButtonTitle: "View Dashboard",
			},
		})

	case "invoice.payment_failed":
		var invoice stripe.Invoice
		err := json.Unmarshal(event.Data.Raw, &invoice)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing webhook JSON: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if invoice.Customer == nil {
			log.Println("Customer not found")
			http.Error(w, "Customer not found", http.StatusNotFound)
			return
		}

		user, err := s.DB.GetUserByCustomerId(invoice.Customer.ID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		// send email
		s.ScheduleEmail(SendEmailRequest{
			To: user.Email,
			Fields: MailFields{
				Subject: "Invoice Failed",
				Content: "Your invoice payment has failed." + "Amount Due: US$" + strconv.FormatFloat(float64(invoice.AmountDue)/100, 'f', 2, 64),

				Link:        GetOrigin() + "/dashboard",
				ButtonTitle: "View Dashboard",
			},
		})

	default:
	}

	w.WriteHeader(http.StatusOK)
}
