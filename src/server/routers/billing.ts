/**
 * Billing Router (TASK-029, DOC0 §(b).6, Constraints #8/#13)
 *
 * Subscription billing: create/update/cancel subscriptions.
 * Uses the billing port (mock in sandbox, Stripe in production).
 * Every external call is circuit-breaker-wrapped (Constraint #13).
 *
 * The webhook handler (separate route) is idempotent by event ID (Constraint #8).
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@/server/trpc';
import { billing } from '@/lib/ports/billing-index';
import { circuitBreakers } from '@/lib/ports/circuit-breaker';
import { db } from '@/lib/db';
import { baseDb } from '@/lib/db';
import { logAudit } from '@/server/lib/audit';
import { TRPCError } from '@trpc/server';

export const billingRouter = router({
  /**
   * Get the current subscription for the tenant.
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.subscription.findUnique({
      where: { tenantId: ctx.tenantId },
      include: { plan: true },
    });
    if (!subscription) {
      return null;
    }
    return {
      id: subscription.id,
      planName: subscription.plan.name,
      therapistSeats: subscription.therapistSeats,
      supportSeats: subscription.supportSeats,
      status: subscription.status,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }),

  /**
   * Create a subscription for the tenant.
   * Calls Stripe (via circuit breaker) and stores the subscription record.
   */
  createSubscription: protectedProcedure
    .input(
      z.object({
        therapistSeats: z.number().int().min(0),
        supportSeats: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if subscription already exists
      const existing = await db.subscription.findUnique({
        where: { tenantId: ctx.tenantId },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Subscription already exists. Use updateSeats instead.',
        });
      }

      // Get the therapist plan (price ID would come from the Plan table in production)
      const plan = await db.plan.findUnique({ where: { key: 'therapist' } });
      const supportPlan = await db.plan.findUnique({ where: { key: 'support' } });
      if (!plan || !supportPlan) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Plans not configured' });
      }

      // Get the tenant for customer creation
      const tenant = await db.tenant.findUnique({ where: { id: ctx.tenantId } });
      if (!tenant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant not found' });
      }

      // Create a Stripe customer (circuit-breaker-wrapped, Constraint #13)
      const customer = await circuitBreakers.stripe.run(() =>
        billing.createCustomer({
          tenantId: ctx.tenantId,
          email: ctx.user.email,
          name: tenant.name,
        }),
      );

      // Create the subscription (circuit-breaker-wrapped)
      const subscription = await circuitBreakers.stripe.run(() =>
        billing.createSubscription({
          customerId: customer.customerId,
          therapistPriceId: plan.stripePriceId ?? 'price_therapist_mock',
          supportPriceId: supportPlan.stripePriceId ?? 'price_support_mock',
          therapistSeats: input.therapistSeats,
          supportSeats: input.supportSeats,
        }),
      );

      // Store the subscription record
      const record = await db.subscription.create({
        data: {
          tenantId: ctx.tenantId,
          planId: plan.id,
          stripeSubscriptionId: subscription.subscriptionId,
          stripeCustomerId: customer.customerId,
          therapistSeats: input.therapistSeats,
          supportSeats: input.supportSeats,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(subscription.currentPeriodEnd),
        },
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'billing.createSubscription',
        entity: 'Subscription',
        entityId: record.id,
        metadata: {
          therapistSeats: input.therapistSeats,
          supportSeats: input.supportSeats,
          stripeSubId: subscription.subscriptionId,
        },
      });

      return {
        id: record.id,
        status: record.status,
        therapistSeats: record.therapistSeats,
        supportSeats: record.supportSeats,
        currentPeriodEnd: record.currentPeriodEnd?.toISOString() ?? null,
      };
    }),

  /**
   * Update seat count (proration handled by Stripe).
   */
  updateSeats: protectedProcedure
    .input(
      z.object({
        therapistSeats: z.number().int().min(0),
        supportSeats: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await db.subscription.findUnique({
        where: { tenantId: ctx.tenantId },
      });
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No subscription found' });
      }

      // Call Stripe (circuit-breaker-wrapped)
      const result = await circuitBreakers.stripe.run(() =>
        billing.updateSeats({
          subscriptionId: subscription.stripeSubscriptionId!,
          therapistSeats: input.therapistSeats,
          supportSeats: input.supportSeats,
        }),
      );

      // Update the record
      const updated = await db.subscription.update({
        where: { id: subscription.id },
        data: {
          therapistSeats: input.therapistSeats,
          supportSeats: input.supportSeats,
        },
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'billing.updateSeats',
        entity: 'Subscription',
        entityId: subscription.id,
        metadata: { therapistSeats: input.therapistSeats, supportSeats: input.supportSeats },
      });

      return { status: result.status, therapistSeats: updated.therapistSeats, supportSeats: updated.supportSeats };
    }),

  /**
   * Cancel subscription at period end.
   */
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.subscription.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No subscription found' });
    }

    const result = await circuitBreakers.stripe.run(() =>
      billing.cancelSubscription({
        subscriptionId: subscription.stripeSubscriptionId!,
        cancelAtPeriodEnd: true,
      }),
    );

    await db.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    await logAudit({
      actorId: ctx.user.userId,
      action: 'billing.cancel',
      entity: 'Subscription',
      entityId: subscription.id,
    });

    return { status: result.status, cancelAtPeriodEnd: true };
  }),

  /**
   * Get seat usage (active users by role).
   */
  usage: protectedProcedure.query(async ({ ctx }) => {
    const therapists = await db.user.count({
      where: { tenantId: ctx.tenantId, role: 'THERAPIST', status: 'ACTIVE' },
    });
    const support = await db.user.count({
      where: {
        tenantId: ctx.tenantId,
        role: { in: ['FRONT_DESK', 'BILLING_MANAGER'] },
        status: 'ACTIVE',
      },
    });
    const subscription = await db.subscription.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    return {
      therapistsUsed: therapists,
      supportUsed: support,
      therapistSeats: subscription?.therapistSeats ?? 0,
      supportSeats: subscription?.supportSeats ?? 0,
    };
  }),
});
