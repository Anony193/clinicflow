/**
 * Mock Billing Adapter (ADR-0002)
 *
 * Sandbox adapter that simulates Stripe without making real API calls.
 * Generates predictable IDs and returns success responses.
 *
 * In production, replace with billing.stripe.ts (uses the stripe SDK).
 * The swap is controlled by the BILLING_ADAPTER env var.
 */

import type { BillingPort } from '@/lib/ports/billing';

export class MockBillingAdapter implements BillingPort {
  private idCounter = 0;

  private generateId(prefix: string): string {
    this.idCounter++;
    return `${prefix}_mock_${Date.now()}_${this.idCounter}`;
  }

  async createCustomer(params: { tenantId: string; email: string; name: string }) {
    return { customerId: this.generateId('cus') };
  }

  async createSubscription(params: {
    customerId: string;
    therapistPriceId: string;
    supportPriceId: string;
    therapistSeats: number;
    supportSeats: number;
  }) {
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);
    return {
      subscriptionId: this.generateId('sub'),
      status: 'active',
      currentPeriodEnd: periodEnd.toISOString(),
    };
  }

  async updateSeats(params: {
    subscriptionId: string;
    therapistSeats: number;
    supportSeats: number;
  }) {
    return { status: 'active' };
  }

  async cancelSubscription(params: { subscriptionId: string; cancelAtPeriodEnd: boolean }) {
    return { status: params.cancelAtPeriodEnd ? 'active' : 'canceled' };
  }

  async createPaymentIntent(params: {
    customerId: string;
    amountCents: number;
    description: string;
  }) {
    return {
      clientSecret: `${this.generateId('pi')}_secret_mock`,
      paymentIntentId: this.generateId('pi'),
    };
  }

  async parseWebhook(payload: string, _signature: string) {
    const event = JSON.parse(payload);
    return {
      eventId: event.id ?? this.generateId('evt'),
      eventType: event.type ?? 'unknown',
      data: event.data?.object ?? {},
    };
  }
}
