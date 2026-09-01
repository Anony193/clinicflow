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
import { treatmentPlansRouter } from '@/server/routers/treatment-plans';
import { outcomeMeasuresRouter } from '@/server/routers/outcome-measures';
import { exercisesRouter } from '@/server/routers/exercises';
import { billingRouter } from '@/server/routers/billing';
import { claimsRouter } from '@/server/routers/claims';
import { reportsRouter } from '@/server/routers/reports';

export const appRouter = router({
  health: healthRouter,
  stats: statsRouter,
  patients: patientsRouter,
  appointments: appointmentsRouter,
  soapNotes: soapNotesRouter,
  treatmentPlans: treatmentPlansRouter,
  outcomeMeasures: outcomeMeasuresRouter,
  exercises: exercisesRouter,
  billing: billingRouter,
  claims: claimsRouter,
  reports: reportsRouter,
});

/** The AppRouter type — imported by the frontend for type inference */
export type AppRouter = typeof appRouter;
