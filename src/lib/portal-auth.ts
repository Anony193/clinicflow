/**
 * Patient Portal Auth (TASK-038)
 *
 * Patients authenticate via a portal-specific session.
 * For the sandbox demo, we use a simple email-based lookup that creates
 * a patient session. In production, this would be magic links or
 * patient-specific credentials.
 *
 * The portal session is separate from the staff session (different cookie,
 * different tenant context resolution).
 */

import { baseDb } from '@/lib/db';
import { nanoid } from 'nanoid';

export const PORTAL_COOKIE = 'clinicflow-portal';

export interface PortalSession {
  patientId: string;
  tenantId: string;
  patientName: string;
}

/**
 * Resolve a portal session from a request.
 * Reads the portal cookie → Session table → patient.
 */
export async function resolvePortalSession(req: Request): Promise<PortalSession | null> {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const token = cookieHeader.match(new RegExp(`${PORTAL_COOKIE}=([^;]+)`))?.[1];

  if (!token) return null;

  // Look up the patient by a portal token (stored in consentFormUrl field for demo)
  // In production, this would be a dedicated PatientSession table
  const patient = await baseDb.patient.findFirst({
    where: {
      consentFormUrl: `portal:${token}`,
      status: 'active',
    },
  });

  if (!patient) return null;

  return {
    patientId: patient.id,
    tenantId: patient.tenantId,
    patientName: `${patient.firstName} ${patient.lastName}`,
  };
}

/**
 * Create a portal session for a patient.
 * Generates a token and stores it on the patient record.
 */
export async function createPortalSession(patientId: string): Promise<string> {
  const token = nanoid(48);
  await baseDb.patient.update({
    where: { id: patientId },
    data: { consentFormUrl: `portal:${token}` },
  });
  return token;
}

/**
 * Login a patient to the portal by email.
 * Looks up the patient by email across all tenants (baseDb).
 */
export async function loginPortalPatient(email: string): Promise<{ token: string; session: PortalSession } | null> {
  const patient = await baseDb.patient.findFirst({
    where: { email: email.toLowerCase(), status: 'active' },
  });

  if (!patient) return null;

  const token = await createPortalSession(patient.id);

  return {
    token,
    session: {
      patientId: patient.id,
      tenantId: patient.tenantId,
      patientName: `${patient.firstName} ${patient.lastName}`,
    },
  };
}
