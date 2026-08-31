/**
 * Audit Logging (TASK-014, DOC1 §7.5 AuditEvent, Constraint #12)
 *
 * DOC1 §7.5: "The audit event table is append-only and is never deleted,
 * which provides the audit trail that enterprise procurement requires."
 *
 * CONSTRAINT #12: PHI access MUST be logged (who, what, when). BAAs in place.
 *
 * PHI-flagged entities (DOC0 §(e)): Patient, SoapNote, Claim, Encounter,
 * OutcomeMeasure — every read of these creates an AuditEvent with phi=true.
 *
 * Usage:
 *   await logAudit({
 *     actorId: ctx.user.userId,
 *     action: 'patient.create',
 *     entity: 'Patient',
 *     entityId: patient.id,
 *     phi: true,
 *     metadata: { firstName, lastName },
 *   });
 *
 * The AuditEvent is append-only — no update or delete is exposed.
 * An ESLint rule (TASK-018) will forbid db.auditEvent.update/delete.
 */

import { db } from '@/lib/db';
import { getTenantId } from '@/lib/context/tenant-context';

/** Entities that contain PHI — every access must be logged with phi=true. */
export const PHI_ENTITIES = new Set([
  'Patient',
  'SoapNote',
  'Claim',
  'Encounter',
  'OutcomeMeasure',
  'TreatmentPlan',
  'ExercisePrescription',
  'InsurancePlan',
  'Message',
  'IntakeForm',
  'Statement',
  'PaymentPlan',
]);

export interface AuditLogParams {
  /** The user performing the action (null for system events). */
  actorId?: string | null;
  /** The action, e.g., "patient.create", "soap_note.update", "claim.submit". */
  action: string;
  /** The entity type, e.g., "Patient", "SoapNote". */
  entity: string;
  /** The entity ID (if applicable). */
  entityId?: string | null;
  /** Whether this access touches PHI (auto-set to true for PHI_ENTITIES). */
  phi?: boolean;
  /** Additional metadata (JSON-serialized). */
  metadata?: Record<string, unknown>;
  /** IP address (from request, if available). */
  ip?: string | null;
  /** User agent (from request, if available). */
  userAgent?: string | null;
}

/**
 * Log an audit event. Append-only — creates a new AuditEvent record.
 *
 * The tenantId is auto-injected from the AsyncLocalStorage context.
 * If no tenant context is active, the event is not logged (fail-silent
 * for audit to avoid breaking requests, but this should not happen
 * in practice because audit is called within protected procedures).
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  const tenantId = getTenantId();
  if (!tenantId) {
    // No tenant context — can't log. This is a programming error.
    console.warn('AUDIT_LOG_SKIP: no tenant context for action', params.action);
    return;
  }

  // Auto-set phi=true for PHI entities if not explicitly specified
  const phi = params.phi ?? PHI_ENTITIES.has(params.entity);

  try {
    await db.auditEvent.create({
      data: {
        tenantId,
        actorId: params.actorId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        phi,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging must never break the request — log and continue.
    // In production, this would alert the on-call (DOC4 §7 SRE).
    console.error('AUDIT_LOG_FAILED:', error);
  }
}

/**
 * Log a PHI access event (read of a PHI entity).
 * Shortcut for logAudit({ phi: true, action: '<entity>.read', ... }).
 */
export async function logPhiAccess(params: {
  actorId?: string | null;
  entity: string;
  entityId: string;
  action?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await logAudit({
    ...params,
    action: params.action ?? `${params.entity.toLowerCase()}.read`,
    phi: true,
  });
}
