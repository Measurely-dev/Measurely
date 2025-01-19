package service

import (
	"Measurely/email"
	"Measurely/types"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/google/uuid"
	"github.com/measurely-dev/measurely-go"
	"github.com/stripe/stripe-go/v79"
	bilsession "github.com/stripe/stripe-go/v79/billingportal/session"
	"github.com/stripe/stripe-go/v79/checkout/session"
	"github.com/stripe/stripe-go/v79/subscription"
)

func (s *Service) ManageBilling(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal error", http.StatusInternalServerError)
		}
		return
	}

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(user.StripeCustomerId),
		ReturnURL: stripe.String(GetOrigin() + "/dashboard"),
	}

	result, err := bilsession.New(params)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error. Failed to create billing portal session", http.StatusInternalServerError)
		return
	}

	bytes, jerr := json.Marshal(struct {
		URL string `json:"url"`
	}{
		URL: result.URL,
	})
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusContinue)
		return
	}

	SetupCacheControl(w, 0)
	w.Write(bytes)
	w.Header().Set("Content-Type", "application/json")
}

func (s *Service) Subscribe(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	var request struct {
		Plan             string    `json:"plan"`
		MaxEvent         int       `json:"max_events"`
		ProjectId        uuid.UUID `json:"project_id"`
		SubscriptionType int       `json:"subscription_type"`
	}

	// Try to unmarshal the request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	plan, exists := s.plans[request.Plan]
	if !exists {
		http.Error(w, "Invalid plan", http.StatusBadRequest)
		return
	}

	project, err := s.db.GetProject(request.ProjectId, token.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Project not found", http.StatusNotFound)
		} else {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
		}
		return
	}

	if project.UserRole != types.TEAM_OWNER {
		http.Error(w, "You do not have the necessary role to perform this action", http.StatusForbidden)
		return
	}

	if project.CurrentPlan == request.Plan {
		http.Error(w, "You are already using this plan", http.StatusNotModified)
		return
	}

	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	var priceid string
	if request.SubscriptionType == types.SUBSCRIPTION_YEARLY {
		priceid = plan.YearlyPriceId
	} else {
		priceid = plan.MonthlyPriceId
	}

	if request.Plan == "starter" {
		request.MaxEvent = s.plans["starter"].MaxEventPerMonth
	}

	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(GetOrigin() + "/dashboard"),
		CancelURL:  stripe.String(GetOrigin() + "/dashboard"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceid),
				Quantity: stripe.Int64(int64(request.MaxEvent)),
			},
		},
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		Customer: stripe.String(user.StripeCustomerId),
		Metadata: map[string]string{"plan": request.Plan, "priceid": priceid, "projectid": project.Id.String(), "maxevent": strconv.Itoa(request.MaxEvent)},
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

		if project.StripeSubscriptionId != "" {
			_, err := subscription.Cancel(project.StripeSubscriptionId, nil)
			if err != nil {
				log.Println("Failed to cancel subscriptions: ", err)
				http.Error(w, "Internal error", http.StatusInternalServerError)
				return
			}
		}

		s.db.UpdateProjectPlan(project.Id, "starter", "", s.plans["starter"].MaxEventPerMonth)
		s.projectsCache.Delete(project.ApiKey)

		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan": "starter"}})
		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: -1, Filters: map[string]string{"plan": project.CurrentPlan}})

		// send email
		go s.email.SendEmail(email.MailFields{
			To:      user.Email,
			Subject: "You are now on the starter plan",
			Content: "You have been downgraded to the starter plan.",

			Link:        os.Getenv("FRONTEND_URL") + "/dashboard",
			ButtonTitle: "View Dashboard",
		})
	} else {
		new_session, err := session.New(params)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error. Failed to create checkout session", http.StatusInternalServerError)
			return
		}

		bytes, jerr := json.Marshal(struct {
			URL string `json:"url"`
		}{
			URL: new_session.URL,
		})
		if jerr != nil {
			http.Error(w, jerr.Error(), http.StatusContinue)
			return
		}

		SetupCacheControl(w, 0)
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

		planData, exists := s.plans[session.Metadata["plan"]]
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

		user, err := s.db.GetUserByCustomerId(session.Customer.ID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		projectid, err := uuid.Parse(session.Metadata["projectid"])
		if err != nil {
			log.Println(err)
			http.Error(w, "Invalid project id", http.StatusBadRequest)
			return
		}

		project, err := s.db.GetProject(projectid, user.Id)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		if project.StripeSubscriptionId != "" {

			_, err := subscription.Cancel(project.StripeSubscriptionId, nil)
			if err != nil {
				log.Println("Failed to cancel subscriptions: ", err)
				http.Error(w, "Internal error", http.StatusInternalServerError)
				return
			}

		}
		s.db.UpdateProjectPlan(project.Id, session.Metadata["plan"], session.Subscription.ID, int(session.LineItems.Data[0].Quantity))
		s.db.UpdateUserInvoiceStatus(user.Id, types.INVOICE_ACTIVE)
		s.projectsCache.Delete(project.ApiKey)

		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan": session.Metadata["plan"]}})
		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: -1, Filters: map[string]string{"plan": project.CurrentPlan}})

		// send email
		go s.email.SendEmail(email.MailFields{
			To:      user.Email,
			Subject: "Thank you for subscribing!",
			Content: "Your " + planData.Name + " subscription has been successfully created.",

			Link:        os.Getenv("FRONTEND_URL") + "/dashboard",
			ButtonTitle: "View Dashboard",
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

		user, err := s.db.GetUserByCustomerId(invoice.Customer.ID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		s.db.ResetProjectsMonthlyEventCount(user.Id)
		s.db.UpdateUserInvoiceStatus(user.Id, types.INVOICE_ACTIVE)

		// send email
		go s.email.SendEmail(email.MailFields{
			To:      user.Email,
			Subject: "Invoice Paid",
			Content: "Your invoice has been successfully paid. Amount Paid: US$" + strconv.FormatFloat(float64(invoice.AmountPaid)/100, 'f', 2, 64),

			Link:        GetOrigin() + "/dashboard",
			ButtonTitle: "View Dashboard",
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

		user, err := s.db.GetUserByCustomerId(invoice.Customer.ID)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		s.db.UpdateUserInvoiceStatus(user.Id, types.INVOICE_FAILED)

		// send email
		go s.email.SendEmail(email.MailFields{
			To:          user.Email,
			Subject:     "Invoice Failed",
			Content:     "Your invoice payment has failed. Amount Due: US$" + strconv.FormatFloat(float64(invoice.AmountDue)/100, 'f', 2, 64) + "<br> Some features will be temporarly locked until this is resolved.",
			Link:        GetOrigin() + "/dashboard",
			ButtonTitle: "View Dashboard",
		})

	default:
	}

	w.WriteHeader(http.StatusOK)
}
