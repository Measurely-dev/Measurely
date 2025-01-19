package service

import (
	"Measurely/types"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/client"
)

func (s *Service) IntegrationWorker() {
	tick := time.NewTicker(time.Minute)
	defer tick.Stop()

	for {
		<-tick.C

		metrics, err := s.db.GetAllIntegrationMetrics()
		if err != nil && err != sql.ErrNoRows {
			log.Println("Failed to fetch all integration metrics")
		}

		log.Println(fmt.Sprintf("Starting workers on %d metrics", len(metrics)))
		for _, metric := range metrics {
			if metric.Type == types.STRIPE_METRIC {
				go s.stripeWorker(&metric)
			}
		}
	}
}

func (s *Service) stripeWorker(metric *types.Metric) {
	log.Println("Running stripe worker on:", metric.Name)

	// Initialize Stripe client with the stored Stripe account ID
	stripe.Key = "your_stripe_secret_key" // Replace with your Stripe secret key

	// Determine the start date for fetching data
	var startDate time.Time
	if !metric.LastEventTimestamp.Valid {
		// Fetch all historical data
		startDate = time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC) // Arbitrary old date
	} else {
		// Fetch data from the last event timestamp
		startDate = metric.LastEventTimestamp.V
	}

	// Fetch successful checkouts (PaymentIntents with status 'succeeded')
	s.fetchStripePaymentIntents(metric, startDate)

	// Fetch paid invoices
	s.fetchStripePaidInvoices(metric, startDate)

	// Fetch refunds
	s.fetchStripeRefunds(metric, startDate)

	// Update the LastEventTimestamp with the current time
	now := time.Now().UTC()
	metric.LastEventTimestamp = sql.Null[time.Time]{V: now, Valid: true}
	err := s.db.UpdateMetricLastEventTimestamp(metric.Id, now)
	if err != nil {
		log.Println("Failed to update LastEventTimestamp:", err)
	}
}

func (s *Service) fetchStripePaymentIntents(metric *types.Metric, startDate time.Time) ([]*stripe.PaymentIntent, error) {
	// Initialize a new Stripe client with the user's API key
	sc := &client.API{}
	sc.Init(metric.StripeApiKey.V, nil)

	query := fmt.Sprintf("status:'succeeded' AND created>%d", startDate.Unix())
	params := &stripe.PaymentIntentSearchParams{
		SearchParams: stripe.SearchParams{
			Query: query,
		},
	}

	var paymentIntents []*stripe.PaymentIntent
	i := sc.PaymentIntents.Search(params)
	for i.Next() {
		pi := i.PaymentIntent()
		paymentIntents = append(paymentIntents, pi)
	}

	if err := i.Err(); err != nil {
		return nil, err
	}

	return paymentIntents, nil
}

func (s *Service) fetchStripePaidInvoices(metric *types.Metric, startDate time.Time) ([]*stripe.Invoice, error) {
	// Initialize a new Stripe client with the user's API key
	sc := &client.API{}
	sc.Init(metric.StripeApiKey.V, nil)

	params := &stripe.InvoiceListParams{
		CreatedRange: &stripe.RangeQueryParams{
			GreaterThan: startDate.Unix(),
		},
		Status: stripe.String(string(stripe.InvoiceStatusPaid)),
	}

	var invoices []*stripe.Invoice
	i := sc.Invoices.List(params)
	for i.Next() {
		inv := i.Invoice()
		invoices = append(invoices, inv)
	}

	if err := i.Err(); err != nil {
		return nil, err
	}

	return invoices, nil
}

func (s *Service) fetchStripeRefunds(metric *types.Metric, startDate time.Time) ([]*stripe.Refund, error) {
	// Initialize a new Stripe client with the user's API key
	sc := &client.API{}
	sc.Init(metric.StripeApiKey.V, nil)

	params := &stripe.RefundListParams{
		CreatedRange: &stripe.RangeQueryParams{
			GreaterThan: startDate.Unix(),
		},
	}

	var refunds []*stripe.Refund
	i := sc.Refunds.List(params)
	for i.Next() {
		ref := i.Refund()
		refunds = append(refunds, ref)
	}

	if err := i.Err(); err != nil {
		return nil, err
	}

	return refunds, nil
}
