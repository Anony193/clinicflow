/**
 * Reports Router (TASK-042, DOC0 §(b).8)
 *
 * Clinic performance, therapist productivity, patient outcomes, claim status.
 * Uses Prisma groupBy for aggregation. All data is tenant-scoped (auto-filtered).
 */

import { z } from 'zod';
import { router, protectedProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { logAudit } from '@/server/lib/audit';

export const reportsRouter = router({
  /**
   * Clinic performance overview — visits, revenue, collections, no-show rate.
   */
  clinicPerformance: protectedProcedure
    .input(z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }).optional())
    .query(async ({ ctx }) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const [visits, completedApts, noShows, claims, payments] = await Promise.all([
        db.appointment.count({ where: { startAt: { gte: startOfMonth, lt: endOfMonth }, status: { not: 'CANCELLED' } } }),
        db.appointment.count({ where: { startAt: { gte: startOfMonth, lt: endOfMonth }, status: 'COMPLETED' } }),
        db.appointment.count({ where: { startAt: { gte: startOfMonth, lt: endOfMonth }, status: 'NO_SHOW' } }),
        db.claim.aggregate({ _sum: { chargeAmountCents: true, paidAmountCents: true, balanceCents: true }, _count: true }),
        db.payment.aggregate({ _sum: { amountCents: true }, _count: true }),
      ]);

      const noShowRate = visits > 0 ? Math.round((noShows / visits) * 100) : 0;

      await logAudit({
        actorId: ctx.user.userId,
        action: 'report.clinic_performance',
        entity: 'Report',
        entityId: 'clinic_performance',
      });

      return {
        visitsThisMonth: visits,
        completedVisits: completedApts,
        noShows,
        noShowRate,
        totalChargesCents: claims._sum.chargeAmountCents ?? 0,
        totalCollectedCents: claims._sum.paidAmountCents ?? 0,
        outstandingBalanceCents: claims._sum.balanceCents ?? 0,
        claimCount: claims._count,
        paymentCount: payments._count,
      };
    }),

  /**
   * Therapist productivity — visits per therapist this month.
   */
  therapistProductivity: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const therapists = await db.user.findMany({
      where: { role: 'THERAPIST', status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    const result: Array<{
      therapistId: string;
      therapistName: string;
      visitCount: number;
      completedCount: number;
      soapNoteCount: number;
    }> = [];
    for (const t of therapists) {
      const [visitCount, completedCount, soapNoteCount] = await Promise.all([
        db.appointment.count({ where: { therapistId: t.id, startAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
        db.appointment.count({ where: { therapistId: t.id, startAt: { gte: startOfMonth }, status: 'COMPLETED' } }),
        db.soapNote.count({ where: { therapistId: t.id, createdAt: { gte: startOfMonth } } }),
      ]);
      result.push({ therapistId: t.id, therapistName: t.name, visitCount, completedCount, soapNoteCount });
    }

    await logAudit({
      actorId: ctx.user.userId,
      action: 'report.therapist_productivity',
      entity: 'Report',
      entityId: 'therapist_productivity',
    });

    return { therapists: result };
  }),

  /**
   * Claim status breakdown — counts by status.
   */
  claimStatus: protectedProcedure.query(async ({ ctx }) => {
    const grouped = await db.claim.groupBy({
      by: ['status'],
      _count: true,
      _sum: { chargeAmountCents: true, paidAmountCents: true, balanceCents: true },
    });

    await logAudit({
      actorId: ctx.user.userId,
      action: 'report.claim_status',
      entity: 'Report',
      entityId: 'claim_status',
    });

    return {
      statuses: grouped.map((g) => ({
        status: g.status,
        count: g._count,
        totalChargesCents: g._sum.chargeAmountCents ?? 0,
        totalPaidCents: g._sum.paidAmountCents ?? 0,
        totalBalanceCents: g._sum.balanceCents ?? 0,
      })),
    };
  }),

  /**
   * Patient outcomes summary — average outcome measure scores by type.
   */
  patientOutcomes: protectedProcedure
    .input(z.object({ patientId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.patientId ? { patientId: input.patientId } : {};
      const grouped = await db.outcomeMeasure.groupBy({
        by: ['type'],
        _avg: { score: true, percent: true },
        _count: true,
        _min: { score: true },
        _max: { score: true },
        where,
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'report.patient_outcomes',
        entity: 'Report',
        entityId: 'patient_outcomes',
      });

      return {
        measures: grouped.map((g) => ({
          type: g.type,
          count: g._count,
          avgScore: Math.round(g._avg.score ?? 0),
          avgPercent: Math.round(g._avg.percent ?? 0),
          minScore: g._min.score ?? 0,
          maxScore: g._max.score ?? 0,
        })),
      };
    }),
});
