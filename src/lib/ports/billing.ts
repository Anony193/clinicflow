/**
 * Billing Port Interface (TASK-029, ADR-0002, Constraint #8)
 *
 * Abstracts Stripe so the sandbox can use a mock adapter and production
 * uses the real Stripe SDK. Every call is circuit-breaker-wrapped (Constraint #13).
 *
 * Constraint #8: subscription billing MUST be idempotent (Stripe webhook
 * deduplication using the event ID).
 */

export interface BillingPort {
  /** Create a Stripe customer for a tenant */
  createCustomer(params: { tenantId: string; email: string; name: string }): Promise<{
    customerId: string;
  }>;

  /** Create a subscription with per-seat pricing */
  createSubscription(params: {
    customerId: string;
    therapistPriceId: string;
    supportPriceId: string;
    therapistSeats: number;
    supportSeats: number;
  }): Promise<{
    subscriptionId: string;
    status: string;
    currentPeriodEnd: string;
  }>;

  /** Update seat count on an existing subscription (proration handled by Stripe) */
  updateSeats(params: {
    subscriptionId: string;
    therapistSeats: number;
    supportSeats: number;
  }): Promise<{ status: string }>;

  /** Cancel a subscription at period end */
  cancelSubscription(params: {
    subscriptionId: string;
    cancelAtPeriodEnd: boolean;
  }): Promise<{ status: string }>;

  /** Create a payment intent for a patient bill pay */
  createPaymentIntent(params: {
    customerId: string;
    amountCents: number;
    description: string;
  }): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }>;

  /** Verify and parse a Stripe webhook (returns the event type + data) */
  parseWebhook(payload: string, signature: string): Promise<{
    eventId: string;
    eventType: string;
    data: Record<string, unknown>;
  }>;
}
