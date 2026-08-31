/**
 * Stats Router — protected procedure
 *
 * Verifies tenant isolation is working: queries tenant-scoped models
 * and returns counts. The Prisma extension automatically filters by
 * the current tenant's tenantId (set via AsyncLocalStorage).
 *
 * If two tenants call this with different tenantIds, each sees only
 * their own counts — the core guarantee of Constraint #2.
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/server/trpc';

export const statsRouter = router({
  /** GET /api/trpc/stats.overview — returns patient/appointment/claim counts */
  overview: protectedProcedure
    .output(
      z.object({
        patients: z.number(),
        appointments: z.number(),
        claims: z.number(),
        tenantId: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const [patients, appointments, claims] = await Promise.all([
        ctx.db.patient.count(),
        ctx.db.appointment.count(),
        ctx.db.claim.count(),
      ]);

      return {
        patients,
        appointments,
        claims,
        tenantId: ctx.tenantId,
      };
    }),
});
