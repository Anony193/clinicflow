+-----------------------------------------------------------------------+
| > B U S I N E S S P R O F E S S I O N A L T E S T P R O M P T         |
| >                                                                     |
| > **ClinicFlow Test Prompt ---**                                      |
| >                                                                     |
| > **Ready to Copy and Paste**                                         |
| >                                                                     |
| > A Complete, Pre-Filled Prompt for Testing the 7-Document Playbook   |
| > with an AI Builder. All Business Details Decided --- Copy           |
| > Everything in the Code Block and Paste Directly.                    |
| >                                                                     |
| > Document Type: Test Prompt for AI Builder                           |
| >                                                                     |
| > Style: Business Professional                                        |
| >                                                                     |
| > Business: ClinicFlow --- Physical Therapy Practice Management SaaS  |
| >                                                                     |
| > Prepared by: Super Z Research                                       |
| >                                                                     |
| > Date: August 27, 2026                                               |
| >                                                                     |
| > Copy Everything in the Code Block Below 2026 Edition                |
+-----------------------------------------------------------------------+

**Table of Contents**

[1. How to Use This Document [1](#_Toc100000)](#_Toc100000)

[2. The Complete Prompt (Copy Everything Below This Line)
[2](#_Toc100001)](#_Toc100001)

*Note: This Table of Contents is generated via field codes. To ensure
page number accuracy after editing, please right-click the TOC and
select \"Update Field.\"*

[]{#_Toc100000 .anchor}**1. How to Use This Document**

This document contains a single, complete prompt that you can copy and
paste directly into any AI builder (Claude Code, Cursor, OpenAI Codex,
z.ai autoclaw, or any multi-agent system). All business details have
been decided for you. You do not need to fill in any brackets or replace
any placeholders. Simply copy the entire contents of the code block in
Section 2, paste it as your first message to the AI builder, and the
builder will begin the three-phase process of consuming the 7
foundational documents, producing a synthesis, decomposing into tasks,
and implementing with verification gates.

The business chosen for this test prompt is ClinicFlow, a practice
management SaaS platform for independent physical therapy clinics. This
business was selected because it is a concrete, realistic vertical with
a clear buyer, a clear problem, a clear monetization model, and a
moderate complexity that makes it an ideal test case for verifying
whether the AI builder can follow the 7-document process and deliver a
quality result. The prompt specifies the system name, the vertical, the
target users, the problem statement, the functional and non-functional
requirements, the target technology stack, the constraints, and the
three-phase model that the AI builder must follow.

[]{#_Toc100001 .anchor}**2. The Complete Prompt (Copy Everything Below
This Line)**

Copy the entire contents of the code block below, from the first line
(ROLE:) to the last line (produce the synthesis.), and paste it as your
first message to the AI builder. Ensure that the 7 foundational
documents are placed in a docs/ folder in the project directory before
you send the prompt, so the AI builder can read them.

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| multi-tenant Business SaaS platform called ClinicFlow. You are        |
| building                                                              |
|                                                                       |
| this according to the 7-document AI Builder Playbook that has been    |
|                                                                       |
| uploaded to this project\'s docs/ folder. You do not improvise; you   |
|                                                                       |
| implement against the documented specification. You do not skip       |
|                                                                       |
| verification; you run the gate after every task.                      |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: ClinicFlow                                                   |
|                                                                       |
| \- Type: Multi-tenant B2B SaaS platform                               |
|                                                                       |
| \- Vertical: Practice management for independent physical therapy     |
| clinics                                                               |
|                                                                       |
| \- Target users: Clinic owners, physical therapists, front desk       |
| staff,                                                                |
|                                                                       |
| billing managers, and patients (via patient portal)                   |
|                                                                       |
| \- Primary problem: Independent physical therapy clinics (1-10        |
| therapists)                                                           |
|                                                                       |
| currently use 4-5 disconnected tools for scheduling, billing,         |
| clinical                                                              |
|                                                                       |
| documentation, and patient communication. These tools do not share    |
|                                                                       |
| data, causing double entry, missed appointments, delayed insurance    |
|                                                                       |
| claims, and a poor patient experience. There is no purpose-built      |
|                                                                       |
| platform that integrates the clinical workflow (SOAP notes, treatment |
|                                                                       |
| plans, outcome tracking) with the business workflow (scheduling,      |
|                                                                       |
| billing, insurance claims, patient communication) in a single system. |
|                                                                       |
| \- Monetization: Per-seat subscription at \$49/therapist/month +      |
|                                                                       |
| \$19/support-staff/month. The patient portal is free for clinics.     |
|                                                                       |
| Stripe handles subscription billing with usage metering and           |
| proration.                                                            |
|                                                                       |
| \- Expected scale: 50-100 clinics in year 1 (500-1,000 users),        |
|                                                                       |
| 500-1,000 clinics by year 3 (5,000-10,000 users)                      |
|                                                                       |
| \- Target market: United States independent PT clinics, single or     |
|                                                                       |
| multi-location, 1-10 therapists per location                          |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION (Do NOT write any code yet):         |
|                                                                       |
| Read the following sections from the 7 foundational documents in the  |
|                                                                       |
| docs/ folder:                                                         |
|                                                                       |
| FROM DOC 1 (Production-Ready Full-Stack Systems Complete):            |
|                                                                       |
| \- Section 7: Multi-Tenant SaaS Platform --- read the ENTIRE section: |
|                                                                       |
| \- 7.1 Overview and Market Context                                    |
|                                                                       |
| \- 7.2 Planning from Scratch (problem statement, ICP, functional and  |
|                                                                       |
| non-functional requirements, regulatory regime, scope boundaries)     |
|                                                                       |
| \- 7.3 SDLC Application                                               |
|                                                                       |
| \- 7.4 Foundation and Reference Architecture (Next.js + PostgreSQL    |
|                                                                       |
| with Row-Level Security + Redis + the reference architecture          |
|                                                                       |
| diagram at Figure 2)                                                  |
|                                                                       |
| \- 7.5 Data Model (Table 2: Tenant, User, Role, Session,              |
| Subscription,                                                         |
|                                                                       |
| Plan, Invoice, AuditEvent, FeatureFlag, Integration --- with the      |
|                                                                       |
| tenant_id column and RLS policy on every table)                       |
|                                                                       |
| \- 7.6 How It Works (4 process flows: tenant provisioning, user       |
|                                                                       |
| authentication, request lifecycle with tenant context, subscription   |
|                                                                       |
| billing)                                                              |
|                                                                       |
| \- 7.7 Security and Compliance Controls (OWASP Top Ten, SOC 2)        |
|                                                                       |
| \- 7.8 UI/UX and Accessibility (WCAG 2.2 AA, Radix UI + Tailwind CSS) |
|                                                                       |
| \- 7.9 Building Process and Implementation Roadmap (4 phases,         |
|                                                                       |
| 12-18 months)                                                         |
|                                                                       |
| \- 7.10 Business Viability and Sources                                |
|                                                                       |
| \- Section 5: Common Engineering Standards (all subsections           |
| 5.1-5.10):                                                            |
|                                                                       |
| architecture, security, UI/UX, API design, observability, monitoring  |
|                                                                       |
| KPIs (Table 13: SLO targets), disaster recovery, deployment topology, |
|                                                                       |
| internationalization, vendor selection                                |
|                                                                       |
| \- Section 4: The SDLC as Foundation (all 6 phases with artifacts and |
|                                                                       |
| gates)                                                                |
|                                                                       |
| \- Section 15: Cross-System Comparison (Table 10, Table 14 team       |
|                                                                       |
| composition, Table 15 cost estimation)                                |
|                                                                       |
| \- Section 17: Risk Register (Table 11) and Action Items (Table 12)   |
|                                                                       |
| FROM DOC 2 (Prompting AI Builder Agents):                             |
|                                                                       |
| \- Section 4: The Prompt Architecture (three-phase model: context     |
|                                                                       |
| loading, analysis, implementation)                                    |
|                                                                       |
| \- Section 6: Use Case 2 --- B2B SaaS System (the tenant isolation    |
|                                                                       |
| prompt --- this is the critical prompt for ClinicFlow)                |
|                                                                       |
| \- Section 8: Professional UI/UX Standards --- Eliminating AI-Flag    |
| Work:                                                                 |
|                                                                       |
| \- 8.1 Typography Systems (Table 4: Major Third type scale)           |
|                                                                       |
| \- 8.2 Motion Design Principles (12 UX in Motion principles)          |
|                                                                       |
| \- 8.3 Transparency, Layering, and Depth (4 elevation levels)         |
|                                                                       |
| \- 8.4 Color Systems (neutral 10-step palette, semantic colors)       |
|                                                                       |
| \- 8.5 The Landing Page Anatomy (Table 5: 10-section structure)       |
|                                                                       |
| FROM DOC 3 (Technical Stack and Integration Guide):                   |
|                                                                       |
| \- Section 4: Database Selection (Table 1: PostgreSQL vs MySQL vs     |
|                                                                       |
| MongoDB vs SQLite --- PostgreSQL recommended for multi-tenant SaaS)   |
|                                                                       |
| \- Section 4.3: ORM Choice (Table 2: Prisma vs Drizzle --- Prisma     |
|                                                                       |
| recommended for this project)                                         |
|                                                                       |
| \- Section 5: Cache, Queue, Search, Storage Selection:                |
|                                                                       |
| \- 5.1 Cache: Redis 7 (sessions, rate-limit, hot-path cache)          |
|                                                                       |
| \- 5.2 Queue: Inngest (durable execution for billing, notifications)  |
|                                                                       |
| \- 5.3 Search: PostgreSQL FTS (sufficient for in-app search)          |
|                                                                       |
| \- 5.4 Storage: S3 or Cloudflare R2 (patient documents, exports)      |
|                                                                       |
| \- Section 6: Authentication Platform (Table 3: Clerk recommended for |
|                                                                       |
| fast start with SAML SSO for enterprise)                              |
|                                                                       |
| \- Section 7: API Style Selection (Table 4: tRPC for internal         |
|                                                                       |
| communication, REST+OpenAPI for public API)                           |
|                                                                       |
| \- Section 8: The Type-Safe Toolchain (Zod + Prisma + tRPC +          |
|                                                                       |
| TanStack Query --- with the code block showing the integration        |
|                                                                       |
| contract pattern)                                                     |
|                                                                       |
| \- Section 9: Error Handling, Pagination, Optimistic Updates          |
|                                                                       |
| (discriminated union errors, cursor pagination, onMutate pattern)     |
|                                                                       |
| FROM DOC 4 (System Analysis, Quality and Operational Excellence):     |
|                                                                       |
| \- Section 4: Requirements Engineering (use cases, BDD/Gherkin        |
|                                                                       |
| scenarios, Requirements Traceability Matrix)                          |
|                                                                       |
| \- Section 5: Testing Strategy (Table 2: 8 test types --- unit,       |
|                                                                       |
| integration, E2E, contract, performance, security, accessibility,     |
|                                                                       |
| visual regression --- with tools and coverage targets)                |
|                                                                       |
| \- Section 6: DevOps and IaC (Pulumi recommended; CI/CD pipeline with |
|                                                                       |
| 8 stages: source, build, test, security, deploy-staging, integration- |
|                                                                       |
| test, deploy-production, post-deploy-verification)                    |
|                                                                       |
| \- Section 7: SRE and Incident Response (on-call rotation, alerting   |
| on                                                                    |
|                                                                       |
| SLO error budgets, blameless postmortem per Google SRE)               |
|                                                                       |
| \- Section 8: Threat Modeling (STRIDE: Spoofing, Tampering,           |
| Repudiation,                                                          |
|                                                                       |
| Information disclosure, Denial of service, Elevation of privilege)    |
|                                                                       |
| \- Section 9: Compliance Operationalization (SOC 2 continuous         |
| compliance,                                                           |
|                                                                       |
| GDPR data subject rights, HIPAA for patient health information)       |
|                                                                       |
| \- Section 10: Performance Engineering (performance budgets enforced  |
| in                                                                    |
|                                                                       |
| CI, capacity planning, profiling)                                     |
|                                                                       |
| \- Section 11: Architecture Decision Records (ADR template: title,    |
|                                                                       |
| context, decision, status, consequences)                              |
|                                                                       |
| \- Section 12: Go-to-Market and Launch (beta/design partner program,  |
|                                                                       |
| feature flags, gradual rollout, product analytics)                    |
|                                                                       |
| \- Section 13: Unit Economics (Table 3: CAC, LTV, COGS, gross margin, |
|                                                                       |
| payback period, NRR, churn --- with healthy targets)                  |
|                                                                       |
| FROM DOC 5 (Scalability, Concurrency and Multi-Database):             |
|                                                                       |
| \- Section 4: The AI Builder\'s Document Consumption Protocol (5      |
| phases:                                                               |
|                                                                       |
| inventory, loading, synthesis, planning, implementation)              |
|                                                                       |
| \- Section 5: Scalability and Traffic Management:                     |
|                                                                       |
| \- 5.1 Load balancing (AWS ALB or Cloudflare)                         |
|                                                                       |
| \- 5.2 Auto-scaling (CPU/queue-depth triggered)                       |
|                                                                       |
| \- 5.3 Rate limiting (token bucket at API gateway, 429 + Retry-After) |
|                                                                       |
| \- 5.4 Caching strategies (Redis cache-aside for hot-path data)       |
|                                                                       |
| \- 5.5 Circuit breaker (for Stripe, email, SMS calls)                 |
|                                                                       |
| \- Section 6: Concurrency Control:                                    |
|                                                                       |
| \- 6.1 Optimistic locking (version field on every concurrent entity)  |
|                                                                       |
| \- 6.2 Pessimistic locking (SELECT FOR UPDATE for schedule conflicts) |
|                                                                       |
| \- 6.3 Distributed locks with Redis (SET NX with TTL for appointment  |
|                                                                       |
| booking --- prevent double-booking)                                   |
|                                                                       |
| \- 6.4 Idempotency (the middleware pattern with the code block ---    |
|                                                                       |
| idempotency key on every write endpoint)                              |
|                                                                       |
| \- 6.5 Database connection pooling (PgBouncer)                        |
|                                                                       |
| \- Section 7: Data Consistency (Saga pattern for subscription         |
| billing,                                                              |
|                                                                       |
| Outbox pattern for event publication)                                 |
|                                                                       |
| \- Section 8: Multi-Database Architecture (Table 1: polyglot          |
| persistence                                                           |
|                                                                       |
| --- PostgreSQL for transactional, Redis for cache, S3 for documents,  |
|                                                                       |
| central data hub for patient data with RBAC)                          |
|                                                                       |
| FROM DOC 6 (Multi-Agent Collaboration, Fault Tolerance and            |
| Continuity):                                                          |
|                                                                       |
| \- Section 4: Multi-Agent Collaboration Architecture:                 |
|                                                                       |
| \- 4.1 Orchestration patterns (Table 1: supervisor pattern            |
| recommended)                                                          |
|                                                                       |
| \- 4.2 Shared task ledger (PostgreSQL, append-only, versioned)        |
|                                                                       |
| \- 4.3 State sharing (event bus, not direct agent-to-agent messages)  |
|                                                                       |
| \- 4.4 File-level coordination (version control branching)            |
|                                                                       |
| \- Section 5: Fault Tolerance --- Durable Execution:                  |
|                                                                       |
| \- 5.1 Why checkpointing is not enough (durable execution recovers    |
|                                                                       |
| at the failing step, not the boundary)                                |
|                                                                       |
| \- 5.2 Durable execution runtimes (Table 2: Inngest recommended)      |
|                                                                       |
| \- 5.3 Workflow and activity split (deterministic workflow,           |
|                                                                       |
| nondeterministic activities)                                          |
|                                                                       |
| \- 5.4 Idempotent recovery (activities identified by unique key)      |
|                                                                       |
| \- Section 6: Continuity and Graceful Degradation:                    |
|                                                                       |
| \- 6.1 Solo builder takeover (reads pending tasks from ledger)        |
|                                                                       |
| \- 6.2 Agent health monitoring (heartbeats every 30 seconds)          |
|                                                                       |
| \- 6.3 Resumption (agent synchronizes with ledger before resuming)    |
|                                                                       |
| \- 6.4 Graceful degradation layers (Table 3: 6 layers from retry to   |
|                                                                       |
| solo builder takeover)                                                |
|                                                                       |
| FROM DOC 7 (Prompt Template Library and Usage Guide):                 |
|                                                                       |
| \- Section 3.2: The CLAUDE.md or AGENTS.md file (the context file     |
|                                                                       |
| template)                                                             |
|                                                                       |
| \- Section 4: The Master Prompt Template (the fill-in-the-blank       |
|                                                                       |
| template that this prompt is an instance of)                          |
|                                                                       |
| \- Section 5.2: Business SaaS System prompt (the template this prompt |
|                                                                       |
| is based on)                                                          |
|                                                                       |
| \- Section 7: The Build Strategy (Table 1: 12-step workflow from      |
| first                                                                 |
|                                                                       |
| prompt to launch)                                                     |
|                                                                       |
| PRODUCE A SYNTHESIS DOCUMENT that demonstrates your understanding.    |
|                                                                       |
| The synthesis must include ALL of the following sections:             |
|                                                                       |
| \(a\) PROBLEM STATEMENT AND IDEAL CUSTOMER PROFILE:                   |
|                                                                       |
| \- The specific problem ClinicFlow solves for independent physical    |
|                                                                       |
| therapy clinics                                                       |
|                                                                       |
| \- The ideal customer profile: independent PT clinics, 1-10           |
|                                                                       |
| therapists, United States, currently using disconnected tools         |
|                                                                       |
| (scheduling software + billing service + paper documentation +        |
|                                                                       |
| phone/email for patient communication), annual revenue \$500K-        |
|                                                                       |
| \$3M, willingness to pay \$200-\$800/month for an integrated          |
|                                                                       |
| solution                                                              |
|                                                                       |
| \- The competitive landscape: generic practice management tools       |
|                                                                       |
| (Jane, Cliniko) that are not PT-specific, and enterprise PT           |
|                                                                       |
| software (WebPT, Raintree) that is too expensive and complex for      |
|                                                                       |
| independent clinics. ClinicFlow differentiates by being PT-           |
|                                                                       |
| specific, affordable, and integrated.                                 |
|                                                                       |
| \- The gap ClinicFlow fills: purpose-built for independent PT         |
|                                                                       |
| clinics, integrates clinical documentation (SOAP notes) with          |
|                                                                       |
| business operations (scheduling, billing, claims), modern UX,         |
|                                                                       |
| affordable per-seat pricing                                           |
|                                                                       |
| \(b\) FUNCTIONAL REQUIREMENTS (the complete feature set):             |
|                                                                       |
| 1\. Multi-tenant architecture: each clinic is a tenant with isolated  |
|                                                                       |
| data (PostgreSQL RLS on every tenant-scoped table)                    |
|                                                                       |
| 2\. Authentication and authorization:                                 |
|                                                                       |
| \- Email/password, Google SSO, and SAML SSO for enterprise            |
|                                                                       |
| \- Roles: clinic owner (full access), therapist (clinical +           |
|                                                                       |
| scheduling), front desk (scheduling + patient management),            |
|                                                                       |
| billing manager (billing + claims), patient (portal only)             |
|                                                                       |
| 3\. Patient management: patient demographics, insurance information,  |
|                                                                       |
| medical history, treatment plans, consent forms                       |
|                                                                       |
| 4\. Appointment scheduling: therapist availability, room/resource     |
|                                                                       |
| availability, appointment types (evaluation, treatment,               |
|                                                                       |
| re-evaluation), recurring appointments, waitlist, automated           |
|                                                                       |
| reminders (email + SMS), self-service booking via patient portal      |
|                                                                       |
| 5\. Clinical documentation: SOAP notes (Subjective, Objective,        |
|                                                                       |
| Assessment, Plan), treatment notes, outcome measures (e.g., DASH,     |
|                                                                       |
| Oswestry, KOOS), exercise prescription with printable handouts        |
|                                                                       |
| 6\. Billing and insurance: fee schedules, claim generation (CMS-1500  |
|                                                                       |
| format), claim submission to clearinghouse (e.g., Office Ally),       |
|                                                                       |
| payment posting, patient statements, payment plans                    |
|                                                                       |
| 7\. Patient portal: appointment booking, appointment history,         |
|                                                                       |
| exercise programs, secure messaging with therapist, bill pay,         |
|                                                                       |
| intake forms                                                          |
|                                                                       |
| 8\. Reporting and analytics: clinic performance (visits, revenue,     |
|                                                                       |
| collections), therapist productivity, patient outcomes, no-show       |
|                                                                       |
| rates, insurance claim status                                         |
|                                                                       |
| 9\. Communication: in-app messaging, automated reminders, broadcast   |
|                                                                       |
| announcements                                                         |
|                                                                       |
| 10\. Administration: clinic settings, user management, role           |
|                                                                       |
| management, feature flags, audit log, integrations (Stripe,           |
|                                                                       |
| clearinghouse, email/SMS providers)                                   |
|                                                                       |
| \(c\) NON-FUNCTIONAL REQUIREMENTS:                                    |
|                                                                       |
| \- 500 concurrent users per tenant at p95 latency below 300ms for     |
|                                                                       |
| reads and below 800ms for writes                                      |
|                                                                       |
| \- 99.9 percent availability (43 minutes downtime per month)          |
|                                                                       |
| \- Recovery time objective: 4 hours                                   |
|                                                                       |
| \- Recovery point objective: 15 minutes                               |
|                                                                       |
| \- Data retention: 7 years for audit and compliance records           |
|                                                                       |
| \- HIPAA compliance for protected health information (PHI) in patient |
|                                                                       |
| records, clinical documentation, and insurance claims                 |
|                                                                       |
| \- SOC 2 Type II attestation within 18 months of commercial launch    |
|                                                                       |
| \- WCAG 2.2 AA conformance on every user-facing page                  |
|                                                                       |
| \(d\) REFERENCE ARCHITECTURE AND DATA MODEL:                          |
|                                                                       |
| \- Frontend: Next.js 16 (App Router), Tailwind CSS 4, Radix UI        |
|                                                                       |
| primitives, Framer Motion for micro-interactions                      |
|                                                                       |
| \- Backend: tRPC for type-safe internal API, Prisma ORM               |
|                                                                       |
| \- Database: PostgreSQL 16 with Row-Level Security on every           |
|                                                                       |
| tenant-scoped table (the tenant_id column and the policy              |
|                                                                       |
| USING (tenant_id = current_setting(\'app.current_tenant_id\')::uuid)) |
|                                                                       |
| \- Cache: Redis 7 for sessions, rate-limit counters, hot-path data    |
|                                                                       |
| (therapist availability, appointment slots), distributed locks        |
|                                                                       |
| \- Queue: Inngest for durable background jobs (claim submission,      |
|                                                                       |
| reminder sending, report generation)                                  |
|                                                                       |
| \- Storage: S3 or Cloudflare R2 for patient documents, exercise       |
|                                                                       |
| handouts, intake forms, exported reports                              |
|                                                                       |
| \- Auth: Clerk (Pro plan, SAML SSO add-on for enterprise)             |
|                                                                       |
| \- Payment: Stripe (subscription billing, idempotent webhooks,        |
|                                                                       |
| proration, dunning)                                                   |
|                                                                       |
| \- Search: PostgreSQL full-text search (sufficient for patient and    |
|                                                                       |
| appointment search)                                                   |
|                                                                       |
| \- The data model from Doc 1 Section 7.5 (Table 2): Tenant, User,     |
|                                                                       |
| Role, Session, Subscription, Plan, Invoice, AuditEvent,               |
|                                                                       |
| FeatureFlag, Integration --- PLUS the ClinicFlow domain entities:     |
|                                                                       |
| Patient, Appointment, AppointmentType, SoapNote, TreatmentPlan,       |
|                                                                       |
| Exercise, ExercisePrescription, InsurancePlan, Claim, Payment,        |
|                                                                       |
| Encounter, OutcomeMeasure, Room, Resource, Message, Notification,     |
|                                                                       |
| Reminder, Report                                                      |
|                                                                       |
| \- Every domain entity has tenant_id and the RLS policy               |
|                                                                       |
| \(e\) SECURITY CONTROLS (OWASP Top Ten + HIPAA):                      |
|                                                                       |
| \- Broken access control: RLS at database level + RBAC in application |
|                                                                       |
| \- Cryptographic failures: bcrypt/argon2 for passwords, TLS 1.3 for   |
|                                                                       |
| transport, AES-256 for PHI at rest, encrypted credentials via         |
|                                                                       |
| secrets manager                                                       |
|                                                                       |
| \- Injection: parameterized queries via Prisma (no raw SQL)           |
|                                                                       |
| \- Insecure design: STRIDE threat modeling in design phase            |
|                                                                       |
| \- Security misconfiguration: infrastructure as code (Pulumi)         |
|                                                                       |
| \- Vulnerable components: Snyk dependency scanning in CI on every     |
|                                                                       |
| commit, 48-hour patch SLA for critical CVEs                           |
|                                                                       |
| \- Identification and authentication failures: opaque session tokens  |
|                                                                       |
| (not JWT), rate limiting on auth endpoints, account lockout after     |
|                                                                       |
| 5 failed attempts                                                     |
|                                                                       |
| \- HIPAA: Business Associate Agreements (BAAs) with all subprocessors |
|                                                                       |
| (AWS, Clerk, Stripe, Inngest, email/SMS providers), PHI access        |
|                                                                       |
| logging, minimum necessary access, breach notification process        |
|                                                                       |
| \- SOC 2: audit logging (append-only, immutable), access reviews      |
|                                                                       |
| (quarterly), change management (PR review required), vulnerability    |
|                                                                       |
| scanning (continuous)                                                 |
|                                                                       |
| \(f\) TESTING STRATEGY (from Doc 4 Section 5, Table 2):               |
|                                                                       |
| \- Unit tests: Vitest, 70-80% code coverage, every function and       |
|                                                                       |
| module tested in isolation                                            |
|                                                                       |
| \- Integration tests: Vitest + Supertest, critical paths 100%         |
|                                                                       |
| (tenant provisioning, appointment booking, claim generation,          |
|                                                                       |
| payment processing)                                                   |
|                                                                       |
| \- End-to-end tests: Playwright, top 10 user journeys (signup,        |
|                                                                       |
| schedule appointment, write SOAP note, submit claim, patient          |
|                                                                       |
| portal booking, bill pay, report generation, user management,         |
|                                                                       |
| role change, feature flag toggle)                                     |
|                                                                       |
| \- Contract tests: tRPC type inference (zero-step type safety ---     |
|                                                                       |
| the frontend types are inferred from the backend, no codegen)         |
|                                                                       |
| \- Security tests: Snyk (dependencies), OWASP ZAP (DAST), Semgrep     |
|                                                                       |
| (SAST), zero critical or high vulnerabilities                         |
|                                                                       |
| \- Accessibility tests: axe-core in CI, zero violations, manual       |
|                                                                       |
| screen-reader testing with NVDA before each release                   |
|                                                                       |
| \- Load tests: k6, 10x average peak load, p95 latency and throughput  |
|                                                                       |
| targets verified                                                      |
|                                                                       |
| \- Cross-tenant isolation tests: automated tests that attempt to      |
|                                                                       |
| read another tenant\'s data and must return zero rows                 |
|                                                                       |
| \- HIPAA tests: PHI access logging verified, encryption at rest       |
|                                                                       |
| verified, BAA coverage verified                                       |
|                                                                       |
| \(g\) SCALABILITY AND CONCURRENCY PATTERNS (from Doc 5):              |
|                                                                       |
| \- Load balancing: AWS Application Load Balancer                      |
|                                                                       |
| \- Auto-scaling: CPU utilization above 60% triggers scale-up,         |
|                                                                       |
| below 30% triggers scale-down, cooldown 5 minutes                     |
|                                                                       |
| \- Rate limiting: 100 requests/minute per user, 1000/minute per       |
|                                                                       |
| tenant, 429 Too Many Requests + Retry-After header                    |
|                                                                       |
| \- Caching: Redis cache-aside for therapist availability (TTL 60      |
|                                                                       |
| seconds), appointment slots (TTL 30 seconds), user session (TTL       |
|                                                                       |
| 24 hours), clinic settings (TTL 5 minutes)                            |
|                                                                       |
| \- Circuit breaker: for Stripe API (50% failure rate opens circuit,   |
|                                                                       |
| 30-second cooldown), for clearinghouse API, for email/SMS             |
|                                                                       |
| providers                                                             |
|                                                                       |
| \- Optimistic locking: version field on Patient, Appointment,         |
|                                                                       |
| SoapNote, Claim --- concurrent updates detected and rejected          |
|                                                                       |
| \- Pessimistic locking: SELECT FOR UPDATE on appointment slot         |
|                                                                       |
| creation (prevent double-booking)                                     |
|                                                                       |
| \- Distributed lock: Redis SET NX with 30-second TTL on appointment   |
|                                                                       |
| booking (prevent two patients booking the same slot simultaneously)   |
|                                                                       |
| \- Idempotency: idempotency key header on every POST/PUT endpoint     |
|                                                                       |
| (the middleware pattern from Doc 5 Section 6.4 with the code          |
|                                                                       |
| block) --- prevents duplicate appointments, duplicate claims,         |
|                                                                       |
| duplicate payments from network retries                               |
|                                                                       |
| \- Connection pooling: PgBouncer in front of PostgreSQL, pool size    |
|                                                                       |
| 20 per application instance                                           |
|                                                                       |
| \- Saga pattern: for subscription billing (create subscription -\>    |
|                                                                       |
| charge payment -\> activate tenant, with compensating transactions:   |
|                                                                       |
| refund payment -\> cancel subscription)                               |
|                                                                       |
| \- Outbox pattern: for event publication (DB commit + event atomic    |
| ---                                                                   |
|                                                                       |
| the event is written to an outbox table in the same transaction,      |
|                                                                       |
| a relay publishes it to Inngest)                                      |
|                                                                       |
| \(h\) MULTI-DATABASE ARCHITECTURE (from Doc 5 Section 8, Table 1):    |
|                                                                       |
| \- PostgreSQL: transactional data (tenants, users, patients,          |
|                                                                       |
| appointments, SOAP notes, claims, payments) --- the source of truth   |
|                                                                       |
| \- Redis: sessions, cache, distributed locks, rate-limit counters     |
|                                                                       |
| \- S3/R2: patient documents, exercise handouts, intake forms,         |
|                                                                       |
| exported reports (pre-signed URLs for direct upload/download)         |
|                                                                       |
| \- Central data hub: for patient PHI shared across modules (patient   |
|                                                                       |
| demographics, insurance, clinical history), with RBAC enforcing       |
|                                                                       |
| that therapists see only their patients, billing managers see         |
|                                                                       |
| only financial data, and patients see only their own records via      |
|                                                                       |
| the portal                                                            |
|                                                                       |
| \(i\) IMPLEMENTATION ROADMAP (12-18 months, 4 phases):                |
|                                                                       |
| Phase 1 (months 1-3): Foundation                                      |
|                                                                       |
| \- Tenant provisioning flow, authentication (Clerk), tenant-context   |
|                                                                       |
| middleware, RLS policies on all tables, basic CRUD for core           |
|                                                                       |
| entities, CI/CD pipeline (GitHub Actions), Pulumi IaC                 |
|                                                                       |
| Phase 2 (months 4-7): Domain Features                                 |
|                                                                       |
| \- Patient management, appointment scheduling (with distributed       |
|                                                                       |
| lock and idempotency), clinical documentation (SOAP notes,            |
|                                                                       |
| treatment plans, outcome measures), exercise prescription             |
|                                                                       |
| Phase 3 (months 8-11): Commercial Layer                               |
|                                                                       |
| \- Subscription billing (Stripe, idempotent webhooks, proration,      |
|                                                                       |
| dunning), insurance claim generation and submission, patient          |
|                                                                       |
| statements, payment posting, feature flags, audit logging             |
|                                                                       |
| Phase 4 (months 12-15): Hardening and Launch                          |
|                                                                       |
| \- Patient portal (self-service booking, messaging, bill pay),        |
|                                                                       |
| reporting and analytics, observability stack (Datadog), load          |
|                                                                       |
| testing (k6), penetration testing (external), accessibility           |
|                                                                       |
| audit (axe-core + manual), HIPAA compliance review, SOC 2             |
|                                                                       |
| preparation, beta with 5-10 design partner clinics, gradual           |
|                                                                       |
| rollout                                                               |
|                                                                       |
| \(j\) UNIT ECONOMICS (from Doc 4 Section 13, Table 3):                |
|                                                                       |
| \- ARPU (Average Revenue Per User): \$150/month per clinic (average   |
|                                                                       |
| 2 therapists at \$49 + 2 support staff at \$19 = \$134, rounded up    |
|                                                                       |
| with premium features)                                                |
|                                                                       |
| \- CAC target: below \$500 per clinic (content marketing, PT          |
|                                                                       |
| community engagement, referrals)                                      |
|                                                                       |
| \- LTV target: above \$4,500 (30x CAC ratio: \$150/month x 30 months  |
|                                                                       |
| average lifetime = \$4,500)                                           |
|                                                                       |
| \- LTV:CAC ratio: 9:1 (target is 3:1 or higher --- this is healthy)   |
|                                                                       |
| \- COGS per clinic: \$30/month (hosting \$10, Stripe fees \$5, email/ |
|                                                                       |
| SMS \$5, support allocation \$10)                                     |
|                                                                       |
| \- Gross margin: 80% (target is 70% or higher --- this is healthy)    |
|                                                                       |
| \- Payback period: 4 months (target is 12 months or less --- this is  |
|                                                                       |
| healthy)                                                              |
|                                                                       |
| \- Net Revenue Retention: 110% target (expansion via additional       |
|                                                                       |
| seats and premium features)                                           |
|                                                                       |
| \- Monthly churn: below 3% (SMB SaaS benchmark)                       |
|                                                                       |
| VERIFICATION GATE FOR PHASE 1:                                        |
|                                                                       |
| \- The builder reviews the synthesis and confirms it matches the 7    |
|                                                                       |
| documents.                                                            |
|                                                                       |
| \- All 10 sections (a through j) are present and complete.            |
|                                                                       |
| \- The data model includes tenant_id and RLS on every tenant-scoped   |
|                                                                       |
| table.                                                                |
|                                                                       |
| \- The testing strategy includes cross-tenant isolation tests.        |
|                                                                       |
| \- The unit economics targets are healthy (LTV:CAC \>= 3, gross       |
| margin                                                                |
|                                                                       |
| \>= 70%, payback \<= 12 months).                                      |
|                                                                       |
| \- The HIPAA compliance controls are specified (BAAs, PHI logging,    |
|                                                                       |
| encryption at rest).                                                  |
|                                                                       |
| \- NO CODE IS WRITTEN IN THIS PHASE.                                  |
|                                                                       |
| Once the synthesis is approved by the builder, proceed to PHASE 2:    |
|                                                                       |
| PHASE 2 --- BUILD PLANNING:                                           |
|                                                                       |
| Decompose the ClinicFlow build into atomic tasks. Each task must      |
| have:                                                                 |
|                                                                       |
| \- A unique task ID (e.g., TASK-001, TASK-002)                        |
|                                                                       |
| \- A defined input (what it depends on)                               |
|                                                                       |
| \- A defined output (what it produces)                                |
|                                                                       |
| \- An acceptance criterion (how we know it is done correctly)         |
|                                                                       |
| \- A verification gate (the specific test or check to run)            |
|                                                                       |
| Group tasks by phase:                                                 |
|                                                                       |
| \- Phase 1 tasks (months 1-3): foundation (schema, auth, RLS,         |
|                                                                       |
| middleware, CI/CD, IaC)                                               |
|                                                                       |
| \- Phase 2 tasks (months 4-7): domain features (patients,             |
| appointments,                                                         |
|                                                                       |
| SOAP notes, exercises)                                                |
|                                                                       |
| \- Phase 3 tasks (months 8-11): commercial layer (billing, claims,    |
|                                                                       |
| feature flags, audit log)                                             |
|                                                                       |
| \- Phase 4 tasks (months 12-15): hardening and launch (patient        |
| portal,                                                               |
|                                                                       |
| reporting, testing, beta, rollout)                                    |
|                                                                       |
| Produce the complete task list. The builder reviews and approves it   |
|                                                                       |
| before any implementation begins.                                     |
|                                                                       |
| PHASE 3 --- IMPLEMENTATION (one task at a time):                      |
|                                                                       |
| For each task:                                                        |
|                                                                       |
| 1\. Implement the task following the type-safe toolchain:             |
|                                                                       |
| \- Zod schema for input and output validation                         |
|                                                                       |
| \- Prisma for database access (fully typed, no raw SQL)               |
|                                                                       |
| \- tRPC procedure for the API (type-inferred from the backend)        |
|                                                                       |
| \- TanStack Query on the frontend (loading, error, data states,       |
|                                                                       |
| cache invalidation on mutation success)                               |
|                                                                       |
| \- Tailwind CSS 4 + Radix UI for the UI (accessible, WCAG 2.2 AA)     |
|                                                                       |
| \- Framer Motion for micro-interactions (150-300ms, easeOutExpo)      |
|                                                                       |
| 2\. Run the verification gate:                                        |
|                                                                       |
| \- npm test \-- \--grep \[task-specific-test\]                        |
|                                                                       |
| \- npm run lint                                                       |
|                                                                       |
| \- npm run type-check                                                 |
|                                                                       |
| \- npm run test:a11y (if frontend --- axe-core, zero violations)      |
|                                                                       |
| \- npm run build (production build must succeed)                      |
|                                                                       |
| 3\. If ALL gates pass, report success with a one-paragraph summary of |
|                                                                       |
| what was implemented and what was verified. Wait for the builder\'s   |
|                                                                       |
| confirmation before proceeding to the next task.                      |
|                                                                       |
| 4\. If ANY gate fails:                                                |
|                                                                       |
| \- Fix the issue                                                      |
|                                                                       |
| \- Re-run the gate                                                    |
|                                                                       |
| \- Maximum 3 retries                                                  |
|                                                                       |
| \- If still failing after 3 retries, STOP and escalate to the builder |
|                                                                       |
| with a detailed error report (what failed, what was tried, what       |
|                                                                       |
| the builder should decide)                                            |
|                                                                       |
| CONSTRAINTS (non-negotiable --- violating any of these is a critical  |
|                                                                       |
| defect):                                                              |
|                                                                       |
| 1\. Every tenant-scoped table MUST have tenant_id and the RLS policy  |
|                                                                       |
| USING (tenant_id = current_setting(\'app.current_tenant_id\')::uuid). |
|                                                                       |
| 2\. Cross-tenant access tests MUST pass (automated tests that attempt |
|                                                                       |
| to read another tenant\'s data return zero rows).                     |
|                                                                       |
| 3\. Every write endpoint (POST, PUT, DELETE) MUST implement           |
| idempotency                                                           |
|                                                                       |
| using the idempotency key middleware (the pattern from Doc 5          |
|                                                                       |
| Section 6.4 with the code block).                                     |
|                                                                       |
| 4\. Every concurrent-update entity (Patient, Appointment, SoapNote,   |
|                                                                       |
| Claim) MUST have optimistic locking (version field, checked in the    |
|                                                                       |
| WHERE clause of updates).                                             |
|                                                                       |
| 5\. Appointment booking MUST use a distributed lock (Redis SET NX     |
| with                                                                  |
|                                                                       |
| TTL) to prevent double-booking the same slot.                         |
|                                                                       |
| 6\. Every user-facing page MUST conform to WCAG 2.2 AA (axe-core      |
| reports                                                               |
|                                                                       |
| zero violations).                                                     |
|                                                                       |
| 7\. The UI MUST NOT look AI-generated. Follow the typography scale    |
|                                                                       |
| (Major Third 1.25 ratio from Doc 2 Section 8.1 Table 4), the motion   |
|                                                                       |
| principles (150-300ms duration, easeOutExpo easing, from Doc 2        |
|                                                                       |
| Section 8.2), the elevation system (4 levels with defined             |
| box-shadows,                                                          |
|                                                                       |
| from Doc 2 Section 8.3), and the professional color system (neutral   |
|                                                                       |
| 10-step palette, semantic colors, WCAG contrast verified, from Doc 2  |
|                                                                       |
| Section 8.4).                                                         |
|                                                                       |
| 8\. The subscription billing MUST be idempotent (Stripe webhook       |
|                                                                       |
| deduplication using the event ID).                                    |
|                                                                       |
| 9\. Every significant architectural decision MUST be documented in an |
|                                                                       |
| ADR (Architecture Decision Record) with the template: title, context, |
|                                                                       |
| decision, status, consequences (from Doc 4 Section 11).               |
|                                                                       |
| 10\. The CI/CD pipeline MUST run on every commit: lint, type-check,   |
|                                                                       |
| unit tests, integration tests, security scan (Snyk), accessibility    |
|                                                                       |
| audit (axe-core), build --- and all must pass before merge.           |
|                                                                       |
| 11\. The deployment MUST use canary strategy (5% traffic for 15       |
| minutes,                                                              |
|                                                                       |
| then 25% for 15 minutes, then 50% for 15 minutes, then 100%) with     |
|                                                                       |
| automated rollback if error rate exceeds 1% or p95 latency exceeds    |
|                                                                       |
| 500ms.                                                                |
|                                                                       |
| 12\. PHI (Protected Health Information) MUST be encrypted at rest     |
|                                                                       |
| (AES-256) and in transit (TLS 1.3). PHI access MUST be logged         |
|                                                                       |
| (who, what, when). BAAs MUST be in place with all subprocessors.      |
|                                                                       |
| 13\. The system MUST handle the failure of any external service       |
|                                                                       |
| (Stripe, clearinghouse, email/SMS) gracefully using the circuit       |
|                                                                       |
| breaker pattern (from Doc 5 Section 5.5).                             |
|                                                                       |
| 14\. If this is a multi-agent build, the shared task ledger (from Doc |
| 6                                                                     |
|                                                                       |
| Section 4.2) MUST be used for all task assignments and state          |
|                                                                       |
| updates, and the durable execution runtime (Inngest, from Doc 6       |
|                                                                       |
| Section 5.2) MUST be used for all long-running processes.             |
|                                                                       |
| TARGET STACK (confirmed --- do not deviate without an ADR):           |
|                                                                       |
| \- Frontend: Next.js 16 (App Router), Tailwind CSS 4, Radix UI,       |
|                                                                       |
| Framer Motion, TanStack Query v5                                      |
|                                                                       |
| \- Backend: tRPC v11, Prisma 5 (with PostgreSQL adapter)              |
|                                                                       |
| \- Database: PostgreSQL 16 with Row-Level Security and pgvector (for  |
|                                                                       |
| future AI features)                                                   |
|                                                                       |
| \- Cache: Redis 7 (via Upstash or Redis Cloud for managed service)    |
|                                                                       |
| \- Queue: Inngest (durable execution, automatic retries, state        |
|                                                                       |
| persistence)                                                          |
|                                                                       |
| \- Storage: Cloudflare R2 (zero egress fees, S3-compatible API)       |
|                                                                       |
| \- Auth: Clerk (Pro plan, SAML SSO add-on for enterprise tiers)       |
|                                                                       |
| \- Payment: Stripe (subscriptions, webhooks, idempotent, proration)   |
|                                                                       |
| \- Clearinghouse: Office Ally API (for insurance claim submission)    |
|                                                                       |
| \- Email: Resend or Postmark (transactional email)                    |
|                                                                       |
| \- SMS: Twilio (appointment reminders)                                |
|                                                                       |
| \- Search: PostgreSQL full-text search (tsvector, trigram)            |
|                                                                       |
| \- Testing: Vitest (unit), Playwright (E2E), axe-core                 |
| (accessibility),                                                      |
|                                                                       |
| k6 (load), Snyk (security), Semgrep (SAST)                            |
|                                                                       |
| \- CI/CD: GitHub Actions (lint, type-check, test, security, a11y,     |
| build,                                                                |
|                                                                       |
| deploy)                                                               |
|                                                                       |
| \- IaC: Pulumi (TypeScript --- infrastructure as code for AWS)        |
|                                                                       |
| \- Monitoring: Datadog (metrics, logs, traces, APM)                   |
|                                                                       |
| \- Error tracking: Sentry                                             |
|                                                                       |
| \- Status page: Statuspage.io                                         |
|                                                                       |
| BEGIN NOW:                                                            |
|                                                                       |
| Start with Phase 1. Read the relevant sections from the 7 documents   |
|                                                                       |
| in the docs/ folder, then produce the synthesis document (sections a  |
|                                                                       |
| through j). Do NOT write any code until the synthesis is reviewed and |
|                                                                       |
| approved by the builder. Confirm that you have read the documents by  |
|                                                                       |
| listing the sections you loaded before presenting the synthesis.      |
+-----------------------------------------------------------------------+
