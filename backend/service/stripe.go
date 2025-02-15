package service

// Package imports
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
	"github.com/stripe/stripe-go/v79/price"
	"github.com/stripe/stripe-go/v79/subscription"
)

// ManageBilling handles requests to manage a user's billing settings
// It creates a Stripe billing portal session and returns the session URL
func (s *Service) ManageBilling(w http.ResponseWriter, r *http.Request) {
	// Verify user authentication
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	// Get user details from database
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

	// Create Stripe billing portal session
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(user.StripeCustomerId),
		ReturnURL: stripe.String(GetOrigin()),
	}

	result, err := bilsession.New(params)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error. Failed to create billing portal session", http.StatusInternalServerError)
		return
	}

	// Return session URL in response
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

// Subscribe handles new subscription requests
// It creates a Stripe checkout session for paid plans or handles starter plan subscriptions
func (s *Service) Subscribe(w http.ResponseWriter, r *http.Request) {
	// Verify user authentication
	token, ok := r.Context().Value(types.TOKEN).(types.Token)
	if !ok {
		http.Error(w, "Authentication error: Invalid token", http.StatusUnauthorized)
		return
	}

	// Define subscription request structure
	var request struct {
		Plan             string    `json:"plan"`
		MaxEvents        int       `json:"max_events"`
		ProjectId        uuid.UUID `json:"project_id"`
		SubscriptionType int       `json:"subscription_type"`
	}

	// Parse request body
	jerr := json.NewDecoder(r.Body).Decode(&request)
	if jerr != nil {
		http.Error(w, jerr.Error(), http.StatusBadRequest)
		return
	}

	// Validate plan exists
	plan, exists := s.plans[request.Plan]
	if !exists {
		http.Error(w, "Invalid plan", http.StatusBadRequest)
		return
	}

	// Get project details and verify permissions
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

	// Get user details
	user, err := s.db.GetUserById(token.Id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	// Set max events for starter plan
	if request.Plan == "starter" {
		request.MaxEvents = s.plans["starter"].MaxEventPerMonth
	}

	// Handle starter plan subscription
	if request.Plan == "starter" {
		w.WriteHeader(http.StatusOK)

		// Cancel existing subscription if any
		if project.StripeSubscriptionId != "" {
			_, err := subscription.Cancel(project.StripeSubscriptionId, nil)
			if err != nil {
				log.Println("Failed to cancel subscriptions: ", err)
				http.Error(w, "Internal error", http.StatusInternalServerError)
				return
			}
		}

		// Update project plan and metrics
		s.db.UpdateProjectPlan(project.Id, "starter", "", s.plans["starter"].MaxEventPerMonth)
		s.projectsCache.Delete(project.ApiKey)

		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan": "starter"}})
		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: -1, Filters: map[string]string{"plan": project.CurrentPlan}})

		// Notify user via email
		go s.email.SendEmail(email.MailFields{
			To:          user.Email,
			Subject:     "You are now on the starter plan",
			Content:     "You have been downgraded to the starter plan.",
			Link:        GetOrigin(),
			ButtonTitle: "View Dashboard",
		})
	} else {

		calculated_price := CalculateSubscriptionPrice(request.MaxEvents, plan.BasePrice, request.Plan, request.SubscriptionType)

		priceParams := &stripe.PriceParams{
			UnitAmount: stripe.Int64(int64(calculated_price * 100)), // Calculated price
			Currency:   stripe.String(string(stripe.CurrencyUSD)),
			Product:    stripe.String(plan.ProductID), // Product ID
			Recurring: &stripe.PriceRecurringParams{
				Interval: stripe.String(string(stripe.PriceRecurringIntervalMonth)), // Monthly billing
			},
		}

		price, err := price.New(priceParams)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal error. Failed to create checkout session", http.StatusInternalServerError)
			return
		}

		checkoutSessionParams := &stripe.CheckoutSessionParams{
			PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
			LineItems: []*stripe.CheckoutSessionLineItemParams{
				{
					Price:    stripe.String(price.ID), // Use the price created above
					Quantity: stripe.Int64(1),         // Usually 1 for the subscription
				},
			},
			Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)), // Subscription mode
			SuccessURL: stripe.String(GetOrigin()),
			CancelURL:  stripe.String(GetOrigin()),
			Customer:   stripe.String(user.StripeCustomerId),
			Metadata:   map[string]string{"plan": request.Plan, "project_id": project.Id.String(), "max_events": strconv.Itoa(request.MaxEvents)},
		}

		// Create checkout session for paid plans
		new_session, err := session.New(checkoutSessionParams)
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

// Webhook handles Stripe webhook events
// Processes checkout completion, successful payments, and failed payments
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

	// Handle different webhook event types
	switch event.Type {
	case "checkout.session.completed":
		// Process completed checkout session
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

		projectid, err := uuid.Parse(session.Metadata["project_id"])
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

		// Cancel existing subscription if any
		if project.StripeSubscriptionId != "" {
			_, err := subscription.Cancel(project.StripeSubscriptionId, nil)
			if err != nil {
				log.Println("Failed to cancel subscriptions: ", err)
				http.Error(w, "Internal error", http.StatusInternalServerError)
				return
			}
		}

		max_events, err := strconv.Atoi(session.Metadata["max_events"])
		if err != nil {
			log.Println("Failed to parse max_events: ", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		// Update project plan and metrics
		s.db.UpdateProjectPlan(project.Id, session.Metadata["plan"], session.Subscription.ID, max_events)
		s.db.UpdateUserInvoiceStatus(user.Id, types.INVOICE_ACTIVE)
		s.projectsCache.Delete(project.ApiKey)

		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: 1, Filters: map[string]string{"plan": session.Metadata["plan"]}})
		go measurely.Capture(metricIds["projects"], measurely.CapturePayload{Value: -1, Filters: map[string]string{"plan": project.CurrentPlan}})

		// Notify user via email
		go s.email.SendEmail(email.MailFields{
			To:          user.Email,
			Subject:     "Thank you for subscribing!",
			Content:     "Your " + planData.Name + " subscription has been successfully created.",
			Link:        GetOrigin(),
			ButtonTitle: "View Dashboard",
		})

	case "invoice.payment_succeeded":
		// Process successful payment
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

		// Reset monthly counts and update status
		s.db.ResetProjectsMonthlyEventCount(user.Id)
		s.db.UpdateUserInvoiceStatus(user.Id, types.INVOICE_ACTIVE)

	case "invoice.payment_failed":
		// Process failed payment
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

		// Update invoice status
		s.db.UpdateUserInvoiceStatus(user.Id, types.INVOICE_FAILED)

	default:
	}

	w.WriteHeader(http.StatusOK)
}
