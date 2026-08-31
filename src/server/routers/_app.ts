/**
 * Root App Router — combines all sub-routers
 *
 * Type-safe contract (DOC3 §8): the frontend types are inferred from
 * this router via createTRPCReact<AppRouter>() — zero codegen.
 */
import { router } from '@/server/trpc';
import { healthRouter } from '@/server/routers/health';
import { statsRouter } from '@/server/routers/stats';
import { patientsRouter } from '@/server/routers/patients';
import { appointmentsRouter } from '@/server/routers/appointments';
import { soapNotesRouter } from '@/server/routers/soap-notes';

export const appRouter = router({
  health: healthRouter,
  stats: statsRouter,
  patients: patientsRouter,
  appointments: appointmentsRouter,
  soapNotes: soapNotesRouter,
});

/** The AppRouter type — imported by the frontend for type inference */
export type AppRouter = typeof appRouter;
