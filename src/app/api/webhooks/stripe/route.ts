/**
 * Stripe Webhook Handler (TASK-029, Constraint #8)
 *
 * CONSTRAINT #8: subscription billing MUST be idempotent (Stripe webhook
 * deduplication using the event ID).
 *
 * Each Stripe event has a unique event ID (evt_xxx). We deduplicate by
 * storing the event ID in the IdempotencyRecord table. Duplicate deliveries
 * return 200 without re-processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { baseDb } from '@/lib/db';
import { billing } from '@/lib/ports/billing-index';
import { circuitBreakers } from '@/lib/ports/circuit-breaker';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') ?? '';

    const event = await billing.parseWebhook(payload, signature);

    // ─── IDEMPOTENCY CHECK (Constraint #8) ───────────────────────
    const eventIdHash = createHash('sha256')
      .update(`stripe-webhook:${event.eventId}`)
      .digest('hex');

    const existing = await baseDb.idempotencyRecord.findUnique({
      where: { keyHash: eventIdHash },
    });

    if (existing && existing.response) {
      // Already processed — return without re-processing
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Store a placeholder — use the first tenant for the FK constraint
    // In production with PostgreSQL, this would use SET LOCAL app.current_tenant_id
    if (!existing) {
      const firstTenant = await baseDb.tenant.findFirst();
      if (!firstTenant) {
        return NextResponse.json({ error: 'No tenant configured' }, { status: 500 });
      }
      await baseDb.idempotencyRecord.create({
        data: {
          tenantId: firstTenant.id,
          keyHash: eventIdHash,
          path: 'stripe-webhook',
          requestHash: event.eventId,
          response: '',
          status: 0,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // ─── PROCESS THE EVENT ───────────────────────────────────────
    await processStripeEvent(event.eventType, event.data);

    // Mark as processed
    await baseDb.idempotencyRecord.update({
      where: { keyHash: eventIdHash },
      data: {
        response: JSON.stringify({ processed: true }),
        status: 200,
      },
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processStripeEvent(
  eventType: string,
  data: Record<string, unknown>,
): Promise<void> {
  switch (eventType) {
    case 'invoice.paid': {
      const customerId = data.customer as string;
      const lines = data.lines as { data?: Array<{ period?: { end?: number } }> } | undefined;
      const periodEnd = lines?.data?.[0]?.period?.end as number | undefined;
      if (customerId && periodEnd) {
        await circuitBreakers.stripe.run(async () => {
          await baseDb.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              currentPeriodEnd: new Date(periodEnd * 1000),
              status: 'ACTIVE' as const,
            },
          });
        });
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscriptionId = data.id as string;
      const status = data.status as string;
      const cancelAtPeriodEnd = data.cancel_at_period_end as boolean;
      if (subscriptionId) {
        await baseDb.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: (status?.toUpperCase() ?? 'ACTIVE') as 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID',
            cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
          },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscriptionId = data.id as string;
      if (subscriptionId) {
        await baseDb.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: 'CANCELED' },
        });
      }
      break;
    }
    default:
      console.log(`[stripe-webhook] Unhandled event type: ${eventType}`);
  }
}
