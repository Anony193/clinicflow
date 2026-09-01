/**
 * Billing Port Selector (ADR-0002)
 * - mock (default): sandbox
 * - stripe: production
 */

import type { BillingPort } from '@/lib/ports/billing';
import { MockBillingAdapter } from '@/lib/ports/billing.mock';

const adapterName = process.env.BILLING_ADAPTER ?? 'mock';

let adapter: BillingPort | null = null;

// For sandbox, eagerly create the mock adapter
if (adapterName === 'mock') {
  adapter = new MockBillingAdapter();
}

// For production, the stripe adapter is lazily loaded on first use
// (avoids importing the stripe SDK in sandbox)
async function getStripeAdapter(): Promise<BillingPort> {
  if (adapter) return adapter;
  const { StripeBillingAdapter } = await import('@/lib/ports/billing.stripe');
  adapter = new StripeBillingAdapter();
  return adapter;
}

export const billing: BillingPort = {
  async createCustomer(p) {
    if (adapterName === 'stripe') return (await getStripeAdapter()).createCustomer(p);
    return adapter!.createCustomer(p);
  },
  async createSubscription(p) {
    if (adapterName === 'stripe') return (await getStripeAdapter()).createSubscription(p);
    return adapter!.createSubscription(p);
  },
  async updateSeats(p) {
    if (adapterName === 'stripe') return (await getStripeAdapter()).updateSeats(p);
    return adapter!.updateSeats(p);
  },
  async cancelSubscription(p) {
    if (adapterName === 'stripe') return (await getStripeAdapter()).cancelSubscription(p);
    return adapter!.cancelSubscription(p);
  },
  async createPaymentIntent(p) {
    if (adapterName === 'stripe') return (await getStripeAdapter()).createPaymentIntent(p);
    return adapter!.createPaymentIntent(p);
  },
  async parseWebhook(p, s) {
    if (adapterName === 'stripe') return (await getStripeAdapter()).parseWebhook(p, s);
    return adapter!.parseWebhook(p, s);
  },
};
