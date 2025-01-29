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

// IntegrationWorker runs background tasks to sync metrics data from integrations.
// It polls every minute and spawns workers for each integration type.
func (s *Service) IntegrationWorker() {
	tick := time.NewTicker(time.Minute)
	defer tick.Stop()

	for {
		<-tick.C

		metrics, err := s.db.GetAllIntegrationMetrics()
		if err != nil && err != sql.ErrNoRows {
			log.Println("Failed to fetch all integration metrics:", err)
			continue
		}

		log.Printf("Starting workers on %d metrics", len(metrics))
		for _, metric := range metrics {
			if metric.Type == types.STRIPE_METRIC {
				go s.stripeWorker(&metric)
			}
		}
	}
}

// stripeWorker processes a single Stripe metric by fetching payment data
// and updating the last event timestamp.
func (s *Service) stripeWorker(metric *types.Metric) {
	log.Printf("Running stripe worker on: %s", metric.Name)

	if !metric.StripeApiKey.Valid {
		log.Printf("Invalid Stripe API key for metric %s", metric.Id)
		return
	}

	sc := &client.API{}
	sc.Init(metric.StripeApiKey.V, nil)

	// Use year 2000 as default start date if no previous timestamp
	startDate := time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
	if metric.LastEventTimestamp.Valid {
		startDate = metric.LastEventTimestamp.V
	}

	// Fetch all payment-related data
	if _, err := s.fetchStripePaymentIntents(startDate, sc); err != nil {
		log.Printf("Error fetching payment intents: %v", err)
	}
	if _, err := s.fetchStripePaidInvoices(startDate, sc); err != nil {
		log.Printf("Error fetching paid invoices: %v", err)
	}
	if _, err := s.fetchStripeRefunds(startDate, sc); err != nil {
		log.Printf("Error fetching refunds: %v", err)
	}

	now := time.Now().UTC()
	if err := s.db.UpdateMetricLastEventTimestamp(metric.Id, now); err != nil {
		log.Printf("Failed to update LastEventTimestamp: %v", err)
		return
	}
	metric.LastEventTimestamp = sql.Null[time.Time]{V: now, Valid: true}
}

// fetchStripePaymentIntents retrieves successful payment intents after startDate.
// Returns a slice of payment intents and any error encountered.
func (s *Service) fetchStripePaymentIntents(startDate time.Time, sc *client.API) ([]*stripe.PaymentIntent, error) {
	query := fmt.Sprintf("status:'succeeded' AND created>%d", startDate.Unix())
	params := &stripe.PaymentIntentSearchParams{
		SearchParams: stripe.SearchParams{Query: query},
	}

	var paymentIntents []*stripe.PaymentIntent
	iter := sc.PaymentIntents.Search(params)
	for iter.Next() {
		paymentIntents = append(paymentIntents, iter.PaymentIntent())
	}
	return paymentIntents, iter.Err()
}

// fetchStripePaidInvoices retrieves paid invoices created after startDate.
// Returns a slice of invoices and any error encountered.
func (s *Service) fetchStripePaidInvoices(startDate time.Time, sc *client.API) ([]*stripe.Invoice, error) {
	params := &stripe.InvoiceListParams{
		CreatedRange: &stripe.RangeQueryParams{GreaterThan: startDate.Unix()},
		Status:       stripe.String(string(stripe.InvoiceStatusPaid)),
	}

	var invoices []*stripe.Invoice
	iter := sc.Invoices.List(params)
	for iter.Next() {
		invoices = append(invoices, iter.Invoice())
	}
	return invoices, iter.Err()
}

// fetchStripeRefunds retrieves refunds created after startDate.
// Returns a slice of refunds and any error encountered.
func (s *Service) fetchStripeRefunds(startDate time.Time, sc *client.API) ([]*stripe.Refund, error) {
	params := &stripe.RefundListParams{
		CreatedRange: &stripe.RangeQueryParams{GreaterThan: startDate.Unix()},
	}

	var refunds []*stripe.Refund
	iter := sc.Refunds.List(params)
	for iter.Next() {
		refunds = append(refunds, iter.Refund())
	}
	return refunds, iter.Err()
}
