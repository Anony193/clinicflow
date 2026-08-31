/**
 * Health Router — public procedure
 *
 * Verifies the tRPC stack is working end-to-end.
 * Does NOT query tenant-scoped models (no tenant context needed).
 */
import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc';

export const healthRouter = router({
  /** GET /api/trpc/health.check — returns { ok: true, timestamp } */
  check: publicProcedure
    .input(z.void().optional())
    .output(
      z.object({
        ok: z.boolean(),
        timestamp: z.string(),
        version: z.string(),
      }),
    )
    .query(() => {
      return {
        ok: true,
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      };
    }),
});
