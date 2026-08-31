/**
 * Prisma Tenant Extension — Application-layer Row-Level Security
 *
 * Governing ADR: ADR-0001 (tenant isolation under SQLite)
 * Constraint #1: tenant_id on every tenant-scoped table
 * Constraint #2: cross-tenant access tests must return zero rows
 *
 * This extension intercepts EVERY Prisma operation on tenant-scoped models
 * and:
 *   1. FAIL-CLOSED: raises TENANT_CONTEXT_REQUIRED if no tenant context
 *      is set (unless bypass mode is active)
 *   2. INJECTS tenantId into every WHERE clause (reads, updates, deletes)
 *   3. INJECTS tenantId into every CREATE data block (from context, never
 *      from client input — overrides any client-provided tenantId)
 *   4. STRIPS tenantId from UPDATE data (a record's tenant cannot change)
 *
 * In production (PostgreSQL), this is replaced by native RLS policies:
 *   CREATE POLICY tenant_isolation ON "Patient"
 *     USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
 *
 * The cross-tenant isolation test suite (TASK-047) is the safety net.
 */

import { Prisma } from '@prisma/client';
import { getTenantId, isBypassActive } from '@/lib/context/tenant-context';

/**
 * Models that carry a tenantId column and require tenant isolation.
 * Excluded: Tenant (is the tenant), Plan (global catalog), TaskLedger (global).
 */
const TENANT_SCOPED_MODELS = new Set<string>([
  // Platform tables (DOC1 §7.5 Table 2)
  'User', 'Session', 'Subscription', 'Invoice', 'AuditEvent',
  'FeatureFlag', 'Integration',
  // ClinicFlow domain entities
  'Patient', 'Appointment', 'AppointmentType', 'SoapNote', 'TreatmentPlan',
  'Exercise', 'ExercisePrescription', 'InsurancePlan', 'FeeSchedule', 'Claim',
  'Payment', 'Statement', 'PaymentPlan', 'Encounter', 'OutcomeMeasure',
  'Room', 'Resource', 'Availability', 'Waitlist', 'Message', 'Notification',
  'Reminder', 'Report', 'IntakeForm',
  // Infrastructure tables
  'Outbox', 'Lock', 'IdempotencyRecord',
]);

/** Read operations — inject tenantId into args.where */
const READ_OPS = new Set([
  'findMany', 'findFirst', 'findUnique', 'findUniqueOrThrow',
  'findFirstOrThrow', 'count', 'aggregate', 'groupBy',
]);

/** Create operations — inject tenantId into args.data */
const CREATE_OPS = new Set(['create', 'createMany', 'createManyAndReturn']);

/** Update operations — inject tenantId into args.where, strip from args.data */
const UPDATE_OPS = new Set(['update', 'updateMany']);

/** Upsert — inject into where + create, strip from update */
const UPSERT_OPS = new Set(['upsert']);

/** Delete operations — inject tenantId into args.where */
const DELETE_OPS = new Set(['delete', 'deleteMany']);

/** Operations that have a `where` clause */
const WHERE_OPS = new Set([...READ_OPS, ...UPDATE_OPS, ...DELETE_OPS, ...UPSERT_OPS]);

export const tenantExtension = Prisma.defineExtension({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        // Non-tenant-scoped models pass through unmodified
        if (!TENANT_SCOPED_MODELS.has(model as string)) {
          return query(args);
        }

        // Bypass mode (auth lookups, admin operations) — skip tenant filtering
        if (isBypassActive()) {
          return query(args);
        }

        // Fail-closed: require a tenant context for tenant-scoped models
        const tenantId = getTenantId();
        if (!tenantId) {
          const error = new Error(
            `TENANT_CONTEXT_REQUIRED: Model "${model}" is tenant-scoped but no ` +
            `tenant context is active. Use runInTenantContext() or bypassTenantCheck() ` +
            `for auth/admin operations.`,
          );
          error.name = 'TENANT_CONTEXT_REQUIRED';
          throw error;
        }

        // Cast args to a permissive type for runtime introspection.
        // Prisma's $allOperations args is a huge union — we narrow by `operation` at runtime.
        const a = args as any;

        // --- Inject tenantId based on operation type ---

        // Read / Update / Delete / Upsert → inject into WHERE
        if (WHERE_OPS.has(operation)) {
          a.where = { ...(a.where ?? {}), tenantId };
        }

        // Create → inject into DATA (overrides any client-provided tenantId)
        if (CREATE_OPS.has(operation)) {
          if (operation === 'createMany' || operation === 'createManyAndReturn') {
            if (Array.isArray(a.data)) {
              a.data = a.data.map((d: Record<string, unknown>) => ({
                ...d,
                tenantId,
              }));
            }
          } else {
            a.data = { ...(a.data ?? {}), tenantId };
          }
        }

        // Update → STRIP tenantId from data (a record's tenant cannot change)
        if (UPDATE_OPS.has(operation)) {
          if (a.data) {
            const { tenantId: _strip, ...rest } = a.data as Record<string, unknown>;
            a.data = rest;
          }
        }

        // Upsert → inject into create, strip from update
        if (UPSERT_OPS.has(operation)) {
          a.create = { ...(a.create ?? {}), tenantId };
          if (a.update) {
            const { tenantId: _strip, ...rest } = a.update as Record<string, unknown>;
            a.update = rest;
          }
        }

        return query(a);
      },
    },
  },
});
