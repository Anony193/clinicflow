/**
 * DSAR (Data Subject Access Request) API (HIPAA/GDPR)
 * POST /api/compliance/dsar — export or delete all patient data
 * GET  /api/compliance/dsar — get data retention info
 */

import { NextRequest, NextResponse } from 'next/server';
import { baseDb } from '@/lib/db';
import { resolveSession } from '@/lib/auth-session';
import { logAudit } from '@/server/lib/audit';

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { patientId, action } = await req.json();
  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  // SECURITY: Verify the patient belongs to the requesting user's tenant
  // (prevents cross-tenant PHI leak via DSAR)
  const patientCheck = await baseDb.patient.findUnique({
    where: { id: patientId },
    select: { tenantId: true },
  });
  if (!patientCheck || patientCheck.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Patient not found in your clinic' }, { status: 404 });
  }

  const isOwner = session.role === 'OWNER';
  const patient = await baseDb.patient.findUnique({
    where: { id: patientId },
    include: {
      insurancePlans: true,
      appointments: { include: { appointmentType: true, therapist: { select: { name: true } } } },
      soapNotes: true,
      treatmentPlans: { include: { prescriptions: { include: { exercise: true } } } },
      claims: { include: { payments: true } },
      outcomeMeasures: true,
      messages: true,
    },
  });

  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  if (action === 'delete') {
    if (!isOwner) return NextResponse.json({ error: 'Only owners can delete' }, { status: 403 });
    await baseDb.patient.delete({ where: { id: patientId } });
    await logAudit({ actorId: session.userId, action: 'dsar.delete', entity: 'Patient', entityId: patientId, phi: true });
    return NextResponse.json({ ok: true, message: 'Patient data deleted (right to erasure)' });
  }

  // Export
  await logAudit({ actorId: session.userId, action: 'dsar.export', entity: 'Patient', entityId: patientId, phi: true });

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    patient: { id: patient.id, firstName: patient.firstName, lastName: patient.lastName, email: patient.email },
    appointmentCount: patient.appointments.length,
    soapNoteCount: patient.soapNotes.length,
    claimCount: patient.claims.length,
    data: patient,
  });
}

export async function GET() {
  return NextResponse.json({
    dataRetentionDays: 2555, // 7 years
    dsarResponseWindow: '30 days',
    description: 'Patients have the right to access, export, and delete their data.',
    endpoints: {
      export: 'POST /api/compliance/dsar { patientId, action: "export" }',
      delete: 'POST /api/compliance/dsar { patientId, action: "delete" }',
    },
  });
}
