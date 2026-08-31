# ============================================================
# PROJECT INSTRUCTIONS — AI BUILDER PLAYBOOK
# ============================================================
# This file is the FIRST thing the AI builder reads when it opens
# this project. It tells the AI:
#   1. What the 7 foundational documents are
#   2. How to read them (the consumption protocol)
#   3. What process to follow (the three-phase model)
#   4. What rules and constraints to obey
#   5. How to start the build
#
# PLACE THIS FILE AT THE PROJECT ROOT as:
#   - CLAUDE.md  (for Claude Code)
#   - AGENTS.md  (for multi-agent systems like z.ai autoclaw)
#   - .cursorrules  (for Cursor)
#
# The 7 foundational .docx files go in the docs/ folder.
# ============================================================

# PROJECT CONTEXT — AI BUILDER PLAYBOOK

## What This Project Is

This project is built according to a 7-document AI Builder Playbook.
The 7 documents are the complete specification for building production-grade
software systems that meet real-world standards. Before starting ANY task,
the AI builder MUST read the relevant sections of these documents.

The 7 documents are NOT optional reading. They are the specification.
The AI builder does NOT improvise. It implements against the documented
specification. It does NOT skip verification. It runs the gate after
every task.

---

## THE 7 FOUNDATIONAL DOCUMENTS

All 7 documents are in the `docs/` folder. Read them in this order:

### Document 1 — THE WHAT (Foundation)
**File:** `docs/1_Production-Ready_Full-Stack_Systems_Complete_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- Architecture, data models, SDLC, 8 system categories
- Each system has: planning, SDLC, architecture, data model, process flows, security, UI/UX, roadmap, business viability
- Common engineering standards (architecture, security, accessibility, API, observability, monitoring, DR, deployment, i18n, vendor selection)
- Risk register, action items, team composition, cost estimation
- 89 pages, 50 references, 15 tables, 2 figures

**Read these sections based on what you are building:**
- Building a SaaS? Read Section 7 (Multi-Tenant SaaS Platform)
- Building E-Commerce? Read Section 8 (E-Commerce and Marketplace)
- Building a CRM? Read Section 9 (CRM Platform)
- Building an ERP? Read Section 10 (ERP System)
- Building Analytics? Read Section 11 (Real-Time Analytics Dashboard)
- Building an AI App? Read Section 12 (AI-Powered Application)
- Building a Booking System? Read Section 13 (Booking and Scheduling)
- Building an LMS? Read Section 14 (Learning Management System)
- Building a School System? Read Sections 7, 9, 10, 11, 12, 14 (it is a combination)
- Also ALWAYS read: Section 4 (SDLC), Section 5 (Common Standards), Section 17 (Risk Register + Action Items)

### Document 2 — THE HOW (Prompt Guide)
**File:** `docs/2_Prompting_AI_Builder_Agents_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- The three-phase model: Context Loading → Analysis → Implementation
- The master prompt template
- Professional UI/UX standards (how to avoid AI-flag work)
- Typography scale, motion design, elevation, color systems, landing page anatomy
- 35 pages, 25 references, 9 tables, 6 code blocks

**Always read:**
- Section 4: The Prompt Architecture (three-phase model)
- Section 8: Professional UI/UX Standards (eliminate AI-flag work)

### Document 3 — THE WHICH (Stack Guide)
**File:** `docs/3_Technical_Stack_Integration_Guide_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- Database selection (PostgreSQL vs MySQL vs MongoDB vs SQLite)
- Cache, queue, search, storage selection
- Authentication platform selection (Clerk vs Auth0 vs Supabase vs custom)
- API style selection (tRPC vs REST vs GraphQL vs gRPC)
- The type-safe toolchain (Zod + Prisma + tRPC + TanStack Query)
- The integration contract code pattern
- Error handling, pagination, optimistic updates
- 26 pages, 21 references, 5 tables, 1 code block

**Always read:**
- Section 4: Database Selection (PostgreSQL with RLS recommended)
- Section 7: API Style (tRPC for internal, REST+OpenAPI for public)
- Section 8: The Type-Safe Toolchain (the code block showing the contract)

### Document 4 — THE DISCIPLINES (Operational Excellence)
**File:** `docs/4_System_Analysis_Quality_Operational_Excellence_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- Requirements engineering (use cases, BDD/Gherkin, traceability matrix)
- Testing strategy (8 test types: unit, integration, E2E, contract, performance, security, accessibility, visual regression)
- DevOps and Infrastructure as Code (Pulumi/Terraform, CI/CD pipeline design)
- SRE and incident response (on-call, alerting, blameless postmortems)
- Threat modeling (STRIDE framework)
- Compliance operationalization (SOC 2, GDPR, HIPAA as continuous practice)
- Performance engineering (budgets, capacity planning, profiling)
- Architecture Decision Records (ADR template)
- Go-to-market and launch (beta, feature flags, gradual rollout, analytics)
- Unit economics (CAC, LTV, COGS, gross margin, payback period, NRR, churn)
- 27 pages, 24 references, 4 tables

**Always read:**
- Section 4: Requirements Engineering
- Section 5: Testing Strategy (Table 2)
- Section 8: Threat Modeling (STRIDE)
- Section 11: Architecture Decision Records (ADR template)
- Section 13: Unit Economics (Table 3)

### Document 5 — THE SCALE (Scalability & Concurrency)
**File:** `docs/5_Scalability_Concurrency_MultiDatabase_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- The AI Builder's Document Consumption Protocol (5 phases)
- Scalability (load balancing, auto-scaling, rate limiting, caching, circuit breaker)
- Concurrency control (optimistic locking, pessimistic locking, distributed locks with Redis, idempotency with code block, connection pooling)
- Data consistency (Saga pattern, Outbox pattern)
- Multi-database architecture (polyglot persistence, central data hub, RBAC)
- 23 pages, 23 references, 1 table, 2 code blocks

**Always read:**
- Section 4: The Document Consumption Protocol
- Section 6: Concurrency Control (idempotency code block)
- Section 8: Multi-Database Architecture (Table 1)

### Document 6 — THE RESILIENCE (Multi-Agent & Fault Tolerance)
**File:** `docs/6_MultiAgent_Collaboration_FaultTolerance_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- Multi-agent orchestration patterns (supervisor, fan-out, pipeline, debate, swarm)
- Shared task ledger (the single source of truth for all agents)
- Durable execution (Temporal, Inngest, Restate — why checkpointing is not enough)
- Solo builder takeover (when all agents fail, the solo builder continues)
- Agent health monitoring (heartbeats, failover)
- Resumption (bringing agents back online correctly)
- Graceful degradation (6 layers: retry → circuit breaker → fallback → context compaction → bulkhead → solo takeover)
- 20 pages, 23 references, 3 tables, 2 code blocks

**Read if using multi-agent mode:**
- Section 4: Multi-Agent Collaboration Architecture
- Section 5: Fault Tolerance (Durable Execution)
- Section 6: Continuity and Graceful Degradation

### Document 7 — THE ACTION (Prompt Template Library)
**File:** `docs/7_Prompt_Template_Library_Usage_Guide_BusinessProfessional_2026-08-27.docx`
**What it contains:**
- How to upload and load the 6 documents (the CLAUDE.md/AGENTS.md file)
- The master prompt template (fill-in-the-blank)
- 9 system-specific prompts (School, Business SaaS, E-Commerce, CRM, ERP, Analytics, AI, Booking, LMS)
- 2 advanced combination prompts (Smart School Platform, Intelligent Business Platform)
- The complete build workflow (12 steps from first prompt to launch)
- 25 pages, 11 references, 1 table, 12 code blocks

**Always read:**
- Section 4: The Master Prompt Template
- Section 5: The prompt for the system you are building
- Section 7: The Build Strategy (Table 1)

---

## THE PROCESS THE AI BUILDER MUST FOLLOW

### Phase 1: Document Consumption (NO CODE WRITTEN)

Before writing ANY code, the AI builder MUST:

1. **Identify which system is being built** (from the user's prompt)
2. **Read the relevant sections** from all 7 documents (listed above)
3. **Produce a SYNTHESIS document** that demonstrates understanding:
   - (a) Problem statement and ideal customer profile
   - (b) Functional requirements (the complete feature set)
   - (c) Non-functional requirements (latency, availability, RTO/RPO, compliance)
   - (d) Reference architecture and data model (entities, relationships, RLS)
   - (e) Security controls (OWASP Top Ten, HIPAA/SOC 2/GDPR as applicable)
   - (f) Testing strategy (8 test types with tools and coverage targets)
   - (g) Scalability and concurrency patterns (load balancing, locking, idempotency)
   - (h) Multi-database architecture (polyglot persistence, central data hub)
   - (i) Implementation roadmap (phased, with milestones)
   - (j) Unit economics (CAC, LTV, COGS, gross margin, payback period)
4. **Wait for the builder's approval** before proceeding

The synthesis is the VERIFICATION GATE for Phase 1.
NO CODE IS WRITTEN until the synthesis is approved.

### Phase 2: Build Planning (NO CODE WRITTEN YET)

After the synthesis is approved, the AI builder MUST:

1. **Decompose the build into atomic tasks**
   - Each task has a unique ID (TASK-001, TASK-002, etc.)
   - Each task has a defined input (what it depends on)
   - Each task has a defined output (what it produces)
   - Each task has an acceptance criterion (how we know it is correct)
   - Each task has a verification gate (the specific test to run)
2. **Group tasks by phase** (foundation → domain features → commercial → hardening)
3. **Wait for the builder's approval** before implementing

The task list is the VERIFICATION GATE for Phase 2.
NO CODE IS WRITTEN until the task list is approved.

### Phase 3: Implementation (ONE TASK AT A TIME)

After the task list is approved, the AI builder implements ONE task at a time:

1. **Implement the task** using the type-safe toolchain:
   - Zod schema for input/output validation
   - Prisma for database access (fully typed, no raw SQL)
   - tRPC procedure for the API (type-inferred from backend)
   - TanStack Query on the frontend (loading/error/data states)
   - Tailwind CSS + Radix UI for the UI (accessible, WCAG 2.2 AA)
   - Framer Motion for micro-interactions (150-300ms, easeOutExpo)
2. **Run the verification gate:**
   - `npm test -- --grep [task-specific-test]`
   - `npm run lint`
   - `npm run type-check`
   - `npm run test:a11y` (if frontend — axe-core, zero violations)
   - `npm run build` (production build must succeed)
3. **If ALL gates pass:** Report success with a summary. WAIT for confirmation.
4. **If ANY gate fails:** Fix → re-run → max 3 retries → then ESCALATE.

The AI builder does NOT proceed to the next task until:
- All verification gates pass
- The builder confirms to proceed

---

## BUILD RULES (NON-NEGOTIABLE)

These rules apply to EVERY task, EVERY feature, EVERY file:

### Architecture Rules
1. Use the type-safe toolchain: Zod + Prisma + tRPC + TanStack Query
2. Use PostgreSQL with Row-Level Security for multi-tenant isolation
3. Use Redis for cache, sessions, and distributed locks
4. Use Inngest for durable background jobs
5. Use Clerk for authentication (or custom session+RLS if specified)
6. Every tenant-scoped table MUST have `tenant_id` and the RLS policy

### Concurrency Rules
7. Every write endpoint (POST/PUT/DELETE) MUST implement idempotency
   (idempotency key header, checked in Redis before processing)
8. Every concurrent-update entity MUST have optimistic locking
   (version field, checked in the WHERE clause of updates)
9. Appointment/booking endpoints MUST use a distributed lock
   (Redis SET NX with TTL) to prevent double-booking
10. Use connection pooling (PgBouncer) for database connections

### Security Rules
11. Follow OWASP Top Ten controls (parameterized queries, RLS, RBAC,
    rate limiting, dependency scanning)
12. If handling health data: HIPAA compliance (BAAs, PHI encryption,
    PHI access logging)
13. If handling payment data: PCI-DSS via tokenization (no raw card data)
14. If handling EU user data: GDPR compliance (data subject rights,
    data processing agreements, 30-day DSAR response)
15. Run STRIDE threat modeling for each major feature in the design phase
16. Document every significant decision in an ADR

### Quality Rules
17. Unit tests: Vitest, 70-80% code coverage
18. Integration tests: critical paths 100%
19. E2E tests: Playwright, top 10 user journeys
20. Accessibility: axe-core in CI, ZERO violations (WCAG 2.2 AA)
21. Security scan: Snyk in CI, zero critical/high vulnerabilities
22. Cross-tenant isolation tests: automated tests that attempt
    cross-tenant access MUST return zero rows

### UI/UX Rules (Eliminate AI-Flag Work)
23. Use the Major Third type scale (1.25 ratio): 16px body, 20/25/31/39px headings
24. Use motion: 150-300ms duration, easeOutExpo easing, purposeful (not decorative)
25. Use elevation: 4 levels with defined box-shadow values
26. Use a professional color system: neutral 10-step palette + semantic colors
27. Verify WCAG contrast ratios (4.5:1 for normal text, 3:1 for large text)
28. The UI MUST NOT look AI-generated — follow the typography, motion,
    elevation, and color standards from Document 2 Section 8

### DevOps Rules
29. CI/CD pipeline runs on every commit: lint, type-check, unit tests,
    integration tests, security scan, accessibility audit, build
30. Use canary deployment (5% → 25% → 50% → 100% with automated rollback)
31. Infrastructure as Code: Pulumi (TypeScript)
32. Observability: metrics, logs, traces (Datadog or Grafana Cloud)
33. Alert on SLO error budgets, not raw resource utilization

### Multi-Agent Rules (if applicable)
34. Use the supervisor pattern (one agent decomposes, delegates, assembles)
35. Use a shared task ledger (PostgreSQL, append-only, versioned)
36. Use durable execution (Inngest) for all long-running processes
37. Each agent works on a version control branch; supervisor merges
38. If an agent fails: retry (3x) → circuit breaker → fallback →
    solo builder takeover → resumption when agent returns
39. Heartbeats every 30 seconds; failover after 3 missed heartbeats
40. NO DATA LOSS: the durable execution runtime guarantees this

---

## TARGET TECHNOLOGY STACK (do not deviate without an ADR)

- Frontend: Next.js 16 (App Router), Tailwind CSS 4, Radix UI, Framer Motion, TanStack Query v5
- Backend: tRPC v11, Prisma 5
- Database: PostgreSQL 16 with Row-Level Security
- Cache: Redis 7 (Upstash or Redis Cloud)
- Queue: Inngest (durable execution)
- Storage: Cloudflare R2 or AWS S3
- Auth: Clerk (Pro plan, SAML SSO for enterprise)
- Payment: Stripe (idempotent webhooks, proration)
- Search: PostgreSQL FTS (or Meilisearch for e-commerce)
- Testing: Vitest, Playwright, axe-core, k6, Snyk, Semgrep
- CI/CD: GitHub Actions
- IaC: Pulumi (TypeScript)
- Monitoring: Datadog or Grafana Cloud
- Error tracking: Sentry

---

## HOW TO START

When the user sends a prompt asking to build a system:

1. Identify which system type they want (SaaS, E-Commerce, School, CRM, etc.)
2. Read the relevant sections from the 7 documents (listed above)
3. Produce the synthesis (10 sections a through j)
4. Present the synthesis and ask for approval
5. DO NOT WRITE ANY CODE until the synthesis is approved

The user's first prompt will typically be one of:
- The ClinicFlow test prompt (for a Business SaaS)
- A system-specific prompt from Document 7
- The master prompt template from Document 7 Section 4
- A custom prompt from the user

In all cases, follow the three-phase model:
Phase 1 (Consumption + Synthesis) → Phase 2 (Planning + Task List) → Phase 3 (Implementation + Verification)

---

## CURRENT BUILD STATUS

- System being built: [TO BE SPECIFIED BY THE USER'S PROMPT]
- Phase: [Phase 1 — Document Consumption, or as specified]
- Documents loaded: [List which of the 7 documents have been read]

---

## REMINDER

The AI builder does NOT improvise. It implements against the documented
specification. The AI builder does NOT skip verification. It runs the
gate after every task. The AI builder does NOT produce AI-flag work.
It follows the professional UI/UX standards from Document 2 Section 8.

The 7 documents are the specification. This file is the instruction
manual for how to use them. Follow the process, and the result will be
a production-grade system that meets real-world standards.
