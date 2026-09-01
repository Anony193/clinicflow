/**
 * Exercise Handout (TASK-027)
 * GET /api/handout/[prescriptionId] — printable HTML handout
 */

import { NextRequest, NextResponse } from 'next/server';
import { baseDb } from '@/lib/db';
import { resolveSession } from '@/lib/auth-session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ prescriptionId: string }> },
) {
  const session = await resolveSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prescriptionId } = await params;
  const prescription = await baseDb.exercisePrescription.findUnique({
    where: { id: prescriptionId },
    include: {
      exercise: true,
      patient: { select: { firstName: true, lastName: true } },
    },
  });

  if (!prescription) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Generate printable HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Exercise Handout — ${prescription.exercise.name}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 2rem auto; padding: 2rem; }
    h1 { color: #0d9488; }
    .patient { background: #f0fdfa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
    .exercise { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    .params { display: flex; gap: 2rem; margin: 1rem 0; }
    .param { text-align: center; }
    .param .value { font-size: 2rem; font-weight: bold; color: #0d9488; }
    .param .label { font-size: 0.8rem; color: #666; }
    .notes { background: #fefce8; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
    @media print { body { margin: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 2rem;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #0d9488; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Handout</button>
  </div>
  <h1>Exercise Prescription</h1>
  <div class="patient">
    <strong>Patient:</strong> ${prescription.patient.firstName} ${prescription.patient.lastName}<br>
    <strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}
  </div>
  <div class="exercise">
    <h2>${prescription.exercise.name}</h2>
    ${prescription.exercise.description ? `<p>${prescription.exercise.description}</p>` : ''}
    <div class="params">
      ${prescription.sets ? `<div class="param"><div class="value">${prescription.sets}</div><div class="label">Sets</div></div>` : ''}
      ${prescription.reps ? `<div class="param"><div class="value">${prescription.reps}</div><div class="label">Reps</div></div>` : ''}
      ${prescription.holdSec ? `<div class="param"><div class="value">${prescription.holdSec}s</div><div class="label">Hold</div></div>` : ''}
      ${prescription.frequency ? `<div class="param"><div class="value">${prescription.frequency}</div><div class="label">Frequency</div></div>` : ''}
    </div>
    ${prescription.notes ? `<div class="notes"><strong>Notes:</strong> ${prescription.notes}</div>` : ''}
  </div>
  <p style="margin-top: 2rem; font-size: 0.8rem; color: #666;">
    This handout is for educational purposes only. Stop if you experience pain and contact your therapist.
  </p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
