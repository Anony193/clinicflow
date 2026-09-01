/**
 * Outcome Measures Router (TASK-026, DOC0 §(b).5)
 *
 * Built-in scoring for standard PT outcome measures:
 *   DASH (Disabilities of the Arm, Shoulder, and Hand) — 30 items, 0-100 (higher = more disability)
 *   Oswestry Disability Index — 10 sections, 0-100 (higher = more disability)
 *   KOOS (Knee Injury and Osteoarthritis Outcome Score) — 42 items, 0-100 (higher = better function)
 *   QuickDASH — 11 items (abbreviated DASH)
 *   NRS (Numeric Pain Rating Scale) — 0-10
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { logAudit, logPhiAccess } from '@/server/lib/audit';
import {
  recordOutcomeMeasureSchema,
  listOutcomeMeasuresSchema,
  trendOutcomeMeasuresSchema,
} from '@/server/schemas/outcome-measure';

type MeasureRow = {
  id: string;
  patientId: string;
  type: string;
  score: number;
  maxScore: number;
  percent: number;
  responses: string | null;
  takenAt: Date;
  createdAt: Date;
};

function serializeMeasure(m: MeasureRow) {
  return {
    id: m.id,
    patientId: m.patientId,
    type: m.type,
    score: m.score,
    maxScore: m.maxScore,
    percent: m.percent,
    responses: m.responses ? JSON.parse(m.responses) : {},
    takenAt: m.takenAt.toISOString(),
    createdAt: m.createdAt.toISOString(),
  };
}

/**
 * Calculate the score for an outcome measure.
 * DASH: (sum of responses / number of items - 1) * 100, range 0-100
 * QuickDASH: same formula, 11 items
 * Oswestry: (sum of section scores / 5) * 100, range 0-100
 * KOOS: 100 - (sum of items - number of items) / (5 * number of items) * 100
 * NRS: the raw 0-10 score
 */
function calculateScore(type: string, responses: Record<string, number>): { score: number; maxScore: number; percent: number } {
  const values = Object.values(responses);
  const count = values.length;

  switch (type) {
    case 'DASH':
    case 'QuickDASH': {
      // DASH: each item scored 1-5. Score = ((sum - count) / (4 * count)) * 100
      // Official DASH formula: ((sum of responses - number of items) / (4 * number of items)) * 100
      const sum = values.reduce((a, b) => a + b, 0);
      const score = count > 0 ? Math.round(((sum - count) / (4 * count)) * 100) : 0;
      return { score, maxScore: 100, percent: score };
    }
    case 'Oswestry': {
      // Oswestry: 10 sections, each 0-5. Score = (sum / 50) * 100
      const sum = values.reduce((a, b) => a + b, 0);
      const score = Math.round((sum / 50) * 100);
      return { score, maxScore: 100, percent: score };
    }
    case 'KOOS': {
      // KOOS: each item 0-4. Score = 100 - ((sum / (4 * count)) * 100)
      const sum = values.reduce((a, b) => a + b, 0);
      const score = count > 0 ? Math.round(100 - (sum / (4 * count)) * 100) : 0;
      return { score, maxScore: 100, percent: score };
    }
    case 'NRS': {
      // NRS: 0-10 pain scale
      const score = values[0] ?? 0;
      return { score, maxScore: 10, percent: Math.round((score / 10) * 100) };
    }
    default:
      return { score: 0, maxScore: 100, percent: 0 };
  }
}

export const outcomeMeasuresRouter = router({
  list: protectedProcedure
    .input(listOutcomeMeasuresSchema)
    .query(async ({ ctx, input }) => {
      const { patientId, type, cursor, limit } = input;
      const measures = await db.outcomeMeasure.findMany({
        where: {
          patientId,
          ...(type && { type }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { takenAt: 'desc' },
      });
      const hasMore = measures.length > limit;
      const items = hasMore ? measures.slice(0, limit) : measures;
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'OutcomeMeasure',
        entityId: 'list',
        action: 'outcome_measure.list',
        metadata: { patientId, count: items.length },
      });
      return {
        items: items.map(serializeMeasure),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  trend: protectedProcedure
    .input(trendOutcomeMeasuresSchema)
    .query(async ({ ctx, input }) => {
      const measures = await db.outcomeMeasure.findMany({
        where: {
          patientId: input.patientId,
          type: input.type,
        },
        orderBy: { takenAt: 'asc' },
        take: 20,
      });
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'OutcomeMeasure',
        entityId: 'trend',
        action: 'outcome_measure.trend',
        metadata: { patientId: input.patientId, type: input.type, count: measures.length },
      });
      return {
        type: input.type,
        dataPoints: measures.map((m) => ({
          takenAt: m.takenAt.toISOString(),
          score: m.score,
          percent: m.percent,
        })),
      };
    }),

  record: idempotentProcedure
    .input(recordOutcomeMeasureSchema)
    .mutation(async ({ ctx, input }) => {
      const { score, maxScore, percent } = calculateScore(input.type, input.responses);

      const measure = await db.outcomeMeasure.create({
        data: {
          patientId: input.patientId,
          type: input.type,
          score,
          maxScore,
          percent,
          responses: JSON.stringify(input.responses),
          takenAt: new Date(input.takenAt),
        } as Parameters<typeof db.outcomeMeasure.create>[0]['data'],
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'outcome_measure.record',
        entity: 'OutcomeMeasure',
        entityId: measure.id,
        phi: true,
        metadata: { type: input.type, score, percent },
      });

      return serializeMeasure(measure as unknown as MeasureRow);
    }),
});
