/**
 * Messages Router (TASK-039, DOC0 §(b).9)
 *
 * Secure messaging between patients and therapists.
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { logAudit, logPhiAccess } from '@/server/lib/audit';

export const messagesRouter = router({
  list: protectedProcedure
    .input(z.object({ patientId: z.string(), cursor: z.string().optional(), limit: z.number().int().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const messages = await db.message.findMany({
        where: { patientId: input.patientId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { name: true } } },
      });
      const hasMore = messages.length > input.limit;
      const items = hasMore ? messages.slice(0, input.limit) : messages;

      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'Message',
        entityId: 'list',
        action: 'message.list',
        metadata: { patientId: input.patientId },
      });

      return {
        items: items.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.sender.name,
          senderRole: m.senderRole,
          body: m.body,
          readAt: m.readAt?.toISOString() ?? null,
          createdAt: m.createdAt.toISOString(),
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  send: idempotentProcedure
    .input(z.object({ patientId: z.string().min(1), body: z.string().min(1).max(5000) }))
    .mutation(async ({ ctx, input }) => {
      const message = await db.message.create({
        data: {
          patientId: input.patientId,
          senderId: ctx.user.userId,
          senderRole: ctx.user.role,
          body: input.body,
        } as Parameters<typeof db.message.create>[0]['data'],
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'message.send',
        entity: 'Message',
        entityId: message.id,
        phi: true,
        metadata: { patientId: input.patientId },
      });

      return {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      };
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.message.update({
        where: { id: input.id },
        data: { readAt: new Date() },
      });
      return { ok: true };
    }),
});
