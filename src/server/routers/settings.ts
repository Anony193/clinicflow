/**
 * Settings Router (TASK-036/037)
 * Audit log viewer + feature flag management (owner-only).
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { setFlag, getAllFlags } from '@/lib/feature-flags';
import { TRPCError } from '@trpc/server';

export const settingsRouter = router({
  /**
   * List audit events (owner-only).
   */
  auditList: protectedProcedure
    .input(z.object({
      phiOnly: z.boolean().optional(),
      entity: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'OWNER') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only clinic owners can view the audit log' });
      }

      const events = await db.auditEvent.findMany({
        where: {
          ...(input.phiOnly && { phi: true }),
          ...(input.entity && { entity: input.entity }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      const hasMore = events.length > input.limit;
      const items = hasMore ? events.slice(0, input.limit) : events;

      return {
        items: items.map((e) => ({
          id: e.id,
          actorId: e.actorId,
          action: e.action,
          entity: e.entity,
          entityId: e.entityId,
          phi: e.phi,
          ip: e.ip,
          metadata: e.metadata,
          createdAt: e.createdAt.toISOString(),
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  /**
   * Get all feature flags for the current tenant.
   */
  getFlags: protectedProcedure.query(async ({ ctx }) => {
    return getAllFlags(ctx.tenantId);
  }),

  /**
   * Toggle a feature flag (owner-only).
   */
  toggleFlag: protectedProcedure
    .input(z.object({ key: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'OWNER') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only clinic owners can toggle feature flags' });
      }
      await setFlag(ctx.tenantId, input.key, input.enabled);
      return { key: input.key, enabled: input.enabled };
    }),
});
