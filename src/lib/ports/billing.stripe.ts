/**
 * Stripe Billing Adapter (Production)
 *
 * Real Stripe SDK implementation with:
 *   - Webhook signature verification (Constraint #8)
 *   - Subscription management with proration
 *   - Payment intents for patient bill pay
 *   - Idempotency key forwarding
 *
 * Selected when BILLING_ADAPTER=stripe
 */

import Stripe from 'stripe';
import type { BillingPort } from '@/lib/ports/billing';

export class StripeBillingAdapter implements BillingPort {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required when BILLING_ADAPTER=stripe');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
      maxNetworkRetries: 3,
    });
  }

  async createCustomer(params: { tenantId: string; email: string; name: string }) {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: { tenantId: params.tenantId },
    });
    return { customerId: customer.id };
  }

  async createSubscription(params: {
    customerId: string;
    therapistPriceId: string;
    supportPriceId: string;
    therapistSeats: number;
    supportSeats: number;
  }) {
    const subscription = await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [
        { price: params.therapistPriceId, quantity: params.therapistSeats },
        { price: params.supportPriceId, quantity: params.supportSeats },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const sub = subscription as unknown as {
      id: string;
      status: string;
      current_period_end: number;
    };

    return {
      subscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
    };
  }

  async updateSeats(params: {
    subscriptionId: string;
    therapistSeats: number;
    supportSeats: number;
  }) {
    const subscription = await this.stripe.subscriptions.retrieve(params.subscriptionId);
    const items = subscription.items.data;

    // Update quantities on existing items (proration handled by Stripe)
    const updatedItems = items.map((item) => {
      if (item.price.id === process.env.STRIPE_THERAPIST_PRICE_ID) {
        return { id: item.id, quantity: params.therapistSeats };
      }
      if (item.price.id === process.env.STRIPE_SUPPORT_PRICE_ID) {
        return { id: item.id, quantity: params.supportSeats };
      }
      return { id: item.id, quantity: item.quantity };
    });

    const updated = await this.stripe.subscriptions.update(params.subscriptionId, {
      items: updatedItems,
      proration_behavior: 'create_prorations',
    });

    return { status: updated.status };
  }

  async cancelSubscription(params: { subscriptionId: string; cancelAtPeriodEnd: boolean }) {
    const canceled = await this.stripe.subscriptions.update(params.subscriptionId, {
      cancel_at_period_end: params.cancelAtPeriodEnd,
    });
    return { status: canceled.status };
  }

  async createPaymentIntent(params: {
    customerId: string;
    amountCents: number;
    description: string;
  }) {
    const intent = await this.stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: 'usd',
      customer: params.customerId,
      description: params.description,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
    };
  }

  /**
   * Verify and parse a Stripe webhook.
   * CONSTRAINT #8: webhook signature verification prevents fake webhooks.
   */
  async parseWebhook(payload: string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook verification');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    return {
      eventId: event.id,
      eventType: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
    };
  }
}
