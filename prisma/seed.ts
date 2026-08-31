/**
 * ClinicFlow seed script (TASK-004)
 * Seeds: 2 Plans, 5 default FeatureFlag keys, 1 demo Tenant ("Riverside PT")
 *        with 1 owner + 1 therapist + 2 patients + 3 appointment types + 2 rooms.
 * Run: `bun prisma/seed.ts`
 */
import { PrismaClient, UserRole, UserStatus, TenantStatus } from '@prisma/client'
import argon2 from 'argon2'
import { nanoid } from 'nanoid'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ClinicFlow...')

  // ---- Plans ----
  const therapistPlan = await db.plan.upsert({
    where: { key: 'therapist' },
    update: {},
    create: {
      key: 'therapist',
      name: 'Therapist Seat',
      priceCents: 4900,
      interval: 'month',
    },
  })
  const supportPlan = await db.plan.upsert({
    where: { key: 'support' },
    update: {},
    create: {
      key: 'support',
      name: 'Support Staff Seat',
      priceCents: 1900,
      interval: 'month',
    },
  })
  const portalPlan = await db.plan.upsert({
    where: { key: 'portal' },
    update: {},
    create: {
      key: 'portal',
      name: 'Patient Portal (Free)',
      priceCents: 0,
      interval: 'month',
    },
  })
  console.log(`  ✓ Plans: ${therapistPlan.name}, ${supportPlan.name}, ${portalPlan.name}`)

  // ---- Demo tenant ----
  const tenant = await db.tenant.upsert({
    where: { slug: 'riverside-pt' },
    update: {},
    create: {
      name: 'Riverside Physical Therapy',
      slug: 'riverside-pt',
      status: TenantStatus.TRIALING,
    },
  })
  console.log(`  ✓ Tenant: ${tenant.name} (${tenant.id})`)

  // ---- Default feature flags (all ON for demo) ----
  const flagKeys = ['patient_portal', 'stripe_billing', 'claims_submission', 'outcome_measures', 'exercise_library']
  for (const key of flagKeys) {
    await db.featureFlag.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key } },
      update: {},
      create: { tenantId: tenant.id, key, enabled: true },
    })
  }
  console.log(`  ✓ Feature flags: ${flagKeys.length} enabled`)

  // ---- Users ----
  const passwordHash = await argon2.hash('clinicflow-demo-2024')

  const owner = await db.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@riversidept.example' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'owner@riversidept.example',
      passwordHash,
      name: 'Dr. Sarah Mitchell',
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
  })

  const therapist = await db.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'pt@riversidept.example' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'pt@riversidept.example',
      passwordHash,
      name: 'James Chen, DPT',
      role: UserRole.THERAPIST,
      status: UserStatus.ACTIVE,
    },
  })

  const frontDesk = await db.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'front@riversidept.example' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'front@riversidept.example',
      passwordHash,
      name: 'Maria Rodriguez',
      role: UserRole.FRONT_DESK,
      status: UserStatus.ACTIVE,
    },
  })
  console.log(`  ✓ Users: ${owner.name} (owner), ${therapist.name} (therapist), ${frontDesk.name} (front desk)`)

  // ---- Subscription (2 therapist + 1 support seat) ----
  await db.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      planId: therapistPlan.id,
      therapistSeats: 2,
      supportSeats: 1,
      status: 'TRIALING',
    },
  })
  console.log(`  ✓ Subscription: 2 therapist + 1 support seats (trialing)`)

  // ---- Appointment types ----
  const apptTypes = await Promise.all([
    db.appointmentType.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: 'evaluation' } },
      update: {},
      create: { tenantId: tenant.id, key: 'evaluation', name: 'Initial Evaluation', durationMin: 60, color: '#0d9488' },
    }),
    db.appointmentType.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: 'treatment' } },
      update: {},
      create: { tenantId: tenant.id, key: 'treatment', name: 'Treatment Visit', durationMin: 45, color: '#0891b2' },
    }),
    db.appointmentType.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: 're_evaluation' } },
      update: {},
      create: { tenantId: tenant.id, key: 're_evaluation', name: 'Re-Evaluation', durationMin: 30, color: '#7c3aed' },
    }),
  ])
  console.log(`  ✓ Appointment types: ${apptTypes.map(t => t.name).join(', ')}`)

  // ---- Rooms ----
  const rooms = await Promise.all([
    db.room.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Treatment Room 1' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Treatment Room 1', code: 'TR-1' },
    }),
    db.room.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Treatment Room 2' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Treatment Room 2', code: 'TR-2' },
    }),
  ])
  console.log(`  ✓ Rooms: ${rooms.map(r => r.name).join(', ')}`)

  // ---- Therapist availability (Mon-Fri 8am-5pm) ----
  for (const weekday of [1, 2, 3, 4, 5]) {
    await db.availability.create({
      data: {
        tenantId: tenant.id,
        userId: therapist.id,
        weekday,
        startMin: 8 * 60, // 08:00
        endMin: 17 * 60,  // 17:00
      },
    }).catch(() => {}) // ignore duplicates on re-seed
  }
  console.log(`  ✓ Availability: ${therapist.name} Mon-Fri 08:00-17:00`)

  // ---- Patients ----
  const patient1 = await db.patient.upsert({
    where: { id: 'demo-patient-1' },
    update: { tenantId: tenant.id },
    create: {
      id: 'demo-patient-1',
      tenantId: tenant.id,
      firstName: 'Emily',
      lastName: 'Johnson',
      email: 'emily.johnson@example.com',
      phone: '(555) 123-4567',
      dateOfBirth: new Date('1988-04-12'),
      sex: 'F',
      mrn: 'RP-0001',
      status: 'active',
      medicalHistory: JSON.stringify({
        conditions: ['Chronic lower back pain', 'Hip impingement'],
        medications: ['Ibuprofen PRN'],
        allergies: ['Penicillin'],
      }),
    },
  })

  const patient2 = await db.patient.upsert({
    where: { id: 'demo-patient-2' },
    update: { tenantId: tenant.id },
    create: {
      id: 'demo-patient-2',
      tenantId: tenant.id,
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'robert.williams@example.com',
      phone: '(555) 234-5678',
      dateOfBirth: new Date('1975-09-23'),
      sex: 'M',
      mrn: 'RP-0002',
      status: 'active',
      medicalHistory: JSON.stringify({
        conditions: ['Post-op ACL reconstruction (R)'],
        medications: [],
        allergies: [],
      }),
    },
  })
  console.log(`  ✓ Patients: ${patient1.firstName} ${patient1.lastName}, ${patient2.firstName} ${patient2.lastName}`)

  // ---- Insurance plans ----
  await db.insurancePlan.create({
    data: {
      tenantId: tenant.id,
      patientId: patient1.id,
      payerName: 'Blue Cross Blue Shield',
      memberId: 'BCB123456789',
      groupNumber: 'GRP-001',
      payerId: 'BCBS',
      isPrimary: true,
    },
  }).catch(() => {})

  await db.insurancePlan.create({
    data: {
      tenantId: tenant.id,
      patientId: patient2.id,
      payerName: 'Aetna',
      memberId: 'AET987654321',
      groupNumber: 'GRP-002',
      payerId: 'AETNA',
      isPrimary: true,
    },
  }).catch(() => {})
  console.log(`  ✓ Insurance plans: BCBS, Aetna`)

  // ---- Fee schedule (common PT CPT codes) ----
  const feeSchedule = [
    { payer: 'BCBS', cpt: '97161', rate: 12500 }, // eval low complexity
    { payer: 'BCBS', cpt: '97110', rate: 7500 },  // therapeutic exercise
    { payer: 'BCBS', cpt: '97140', rate: 8500 },  // manual therapy
    { payer: 'BCBS', cpt: '97530', rate: 8000 },  // therapeutic activities
    { payer: 'AETNA', cpt: '97161', rate: 12000 },
    { payer: 'AETNA', cpt: '97110', rate: 7200 },
    { payer: 'AETNA', cpt: '97140', rate: 8200 },
    { payer: 'AETNA', cpt: '97530', rate: 7800 },
  ]
  for (const f of feeSchedule) {
    await db.feeSchedule.create({
      data: {
        tenantId: tenant.id,
        payerName: f.payer,
        cptCode: f.cpt,
        rateCents: f.rate,
      },
    }).catch(() => {})
  }
  console.log(`  ✓ Fee schedule: ${feeSchedule.length} CPT code rates seeded`)

  // ---- Exercises (sample library) ----
  const exercises = [
    { name: 'Quad Set', description: 'Tighten thigh muscle, hold 5 sec', sets: 3, reps: 10, holdSec: 5 },
    { name: 'Straight Leg Raise', description: 'Lift leg keeping knee straight', sets: 3, reps: 12 },
    { name: 'Hamstring Stretch', description: 'Seated, reach for toes', sets: 3, reps: 4, holdSec: 30 },
    { name: 'Clamshell', description: 'Side-lying hip external rotation', sets: 3, reps: 15 },
    { name: 'Wall Sit', description: 'Back against wall, knees at 90°', sets: 3, reps: 1, holdSec: 30 },
    { name: 'Heel Slide', description: 'Slide heel toward buttocks', sets: 3, reps: 10 },
  ]
  for (const ex of exercises) {
    await db.exercise.create({
      data: { tenantId: tenant.id, ...ex }
    }).catch(() => {})
  }
  console.log(`  ✓ Exercise library: ${exercises.length} exercises seeded`)

  console.log('\n✅ Seed complete.')
  console.log('   Demo login: owner@riversidept.example / clinicflow-demo-2024')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
