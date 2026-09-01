/**
 * Billing Port Selector (ADR-0002)
 *
 * Selects the billing adapter based on BILLING_ADAPTER env var.
 * Defaults to mock in the sandbox; stripe in production.
 */

import type { BillingPort } from '@/lib/ports/billing';
import { MockBillingAdapter } from '@/lib/ports/billing.mock';

const adapterName = process.env.BILLING_ADAPTER ?? 'mock';

let adapter: BillingPort | null = null;

function getAdapter(): BillingPort {
  if (adapter) return adapter;
  switch (adapterName) {
    case 'mock':
      adapter = new MockBillingAdapter();
      break;
    case 'stripe':
      throw new Error(
        'Stripe billing adapter not yet implemented. ' +
          'Use BILLING_ADAPTER=mock for the sandbox, or implement billing.stripe.ts with the stripe SDK.',
      );
    default:
      throw new Error(`Unknown BILLING_ADAPTER: ${adapterName}`);
  }
  return adapter;
}

/** The billing port instance (mock in sandbox, Stripe in production). */
export const billing: BillingPort = {
  createCustomer: (p) => getAdapter().createCustomer(p),
  createSubscription: (p) => getAdapter().createSubscription(p),
  updateSeats: (p) => getAdapter().updateSeats(p),
  cancelSubscription: (p) => getAdapter().cancelSubscription(p),
  createPaymentIntent: (p) => getAdapter().createPaymentIntent(p),
  parseWebhook: (p, s) => getAdapter().parseWebhook(p, s),
};
