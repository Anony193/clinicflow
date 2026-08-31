+-----------------------------------------------------------------------+
| > B U S I N E S S P R O F E S S I O N A L R E S E A R C H             |
| >                                                                     |
| > **The Prompt Template Library**                                     |
| >                                                                     |
| > **and Usage Guide**                                                 |
| >                                                                     |
| > The Seventh Foundational Document: How to Upload the Six Documents  |
| > to an AI Builder and the Copy-Paste Prompts for Each System Type,   |
| > Including School Management, Business SaaS, E-Commerce, and         |
| > Advanced Combinations                                               |
| >                                                                     |
| > Document Type: In-Depth Research Report                             |
| >                                                                     |
| > Style: Business Professional                                        |
| >                                                                     |
| > Scope: Practical Prompt Templates for Every System Type             |
| >                                                                     |
| > Prepared by: Super Z Research                                       |
| >                                                                     |
| > Date: August 27, 2026                                               |
| >                                                                     |
| > Confidential --- For Strategic Planning 2026 Edition                |
+-----------------------------------------------------------------------+

**Table of Contents**

[1. Executive Summary [1](#_Toc100000)](#_Toc100000)

[2. Opening Hook and Thesis [2](#_Toc100001)](#_Toc100001)

[3. Background and Context [2](#_Toc100002)](#_Toc100002)

> [3.1 How to Upload and Load the Six Documents
> [2](#_Toc100003)](#_Toc100003)
>
> [3.2 The CLAUDE.md or AGENTS.md File [2](#_Toc100004)](#_Toc100004)
>
> [3.3 The First Message to the AI Builder
> [3](#_Toc100005)](#_Toc100005)

[4. The Master Prompt Template [3](#_Toc100006)](#_Toc100006)

[5. System-Specific Prompt Templates [3](#_Toc100007)](#_Toc100007)

> [5.1 School Management System (Complete Private School)
> [4](#_Toc100008)](#_Toc100008)
>
> [5.2 Business SaaS System (Multi-Tenant)
> [4](#_Toc100009)](#_Toc100009)
>
> [5.3 E-Commerce and Marketplace System [4](#_Toc100010)](#_Toc100010)
>
> [5.4 CRM Platform (Vertical) [4](#_Toc100011)](#_Toc100011)
>
> [5.5 ERP System (Vertical) [4](#_Toc100012)](#_Toc100012)
>
> [5.6 Real-Time Analytics Dashboard [4](#_Toc100013)](#_Toc100013)
>
> [5.7 AI-Powered Application [4](#_Toc100014)](#_Toc100014)
>
> [5.8 Booking and Scheduling SaaS [5](#_Toc100015)](#_Toc100015)
>
> [5.9 Learning Management System (LMS) [5](#_Toc100016)](#_Toc100016)

[6. Advanced Combination Prompts: Integrated Platforms
[5](#_Toc100017)](#_Toc100017)

> [6.1 The Smart School Platform (School + LMS + CRM + Analytics + AI)
> [5](#_Toc100018)](#_Toc100018)
>
> [6.2 The Intelligent Business Platform (SaaS + Analytics + AI)
> [5](#_Toc100019)](#_Toc100019)

[7. The Build Strategy: Sequencing and Verification
[5](#_Toc100020)](#_Toc100020)

> [7.1 The Prompt Sequence [6](#_Toc100021)](#_Toc100021)
>
> [7.2 The Verification Strategy [6](#_Toc100022)](#_Toc100022)
>
> [7.3 The Failure Handling [6](#_Toc100023)](#_Toc100023)
>
> [7.4 The Complete Build Workflow [6](#_Toc100024)](#_Toc100024)

[8. Counterarguments and Limitations [7](#_Toc100025)](#_Toc100025)

[9. Conclusion and Strategic Implications [7](#_Toc100026)](#_Toc100026)

[10. References [8](#_Toc100027)](#_Toc100027)

*Note: This Table of Contents is generated via field codes. To ensure
page number accuracy after editing, please right-click the TOC and
select \"Update Field.\"*

[]{#_Toc100000 .anchor}**1. Executive Summary**

This report is the seventh and most practical foundational document in
the AI builder playbook. The six existing documents specify the
architecture, the prompting, the stack, the operational disciplines, the
scalability, and the multi-agent collaboration; this seventh document
specifies how a builder takes those six documents, uploads them to an AI
builder agent, whether Claude Code, Cursor, OpenAI Codex, or a
multi-agent system, and issues the specific prompts that direct the
agent to build the desired system. The document is organized as a
practical guide with copy-paste prompt templates for each system type,
including the School Management System, the Business SaaS, the
E-Commerce system, and the advanced combinations that integrate multiple
systems into a single platform.

The central value of this document is that it converts the six-document
playbook from a reference into an actionable sequence of prompts. A
builder who has the six documents but does not know how to load them
into the AI builder, or what to say to the builder to start the build,
will not benefit from the documents regardless of their quality. This
document provides the loading instructions, the master prompt template
that the builder fills in for any system, the system-specific prompts
for each of the eight system categories, and the advanced combination
prompts that integrate multiple systems into a platform such as a smart
school. The prompts are written to be copied, pasted, and adapted, with
the bracketed sections clearly marked for the builder\'s specific
requirements.

[]{#_Toc100001 .anchor}**2. Opening Hook and Thesis**

The user\'s question is the practical question that every builder
arrives at after the specification is complete: how do I take these
documents and use them with an AI builder to actually build the system?
The question is not about the architecture or the stack or the patterns,
which the six documents cover; it is about the operational reality of
sitting in front of Claude Code or Cursor or a multi-agent system, with
the six documents in hand, and knowing what to type to start the build.
The gap between having a specification and being able to direct an AI
builder to implement it is the gap that this document fills.

The thesis is that the effective use of the six documents with an AI
builder requires three things: the documents must be loaded into the
builder\'s context in the right way, the first prompt must follow a
structured template that establishes the builder\'s role and the
consumption protocol, and the subsequent prompts must be system-specific
and must direct the builder through the three-phase model of context
loading, analysis, and implementation. This document provides the
loading instructions, the master template, and the system-specific
prompts, and it is the document that a builder uses at the keyboard to
direct the AI builder to produce the system.

[]{#_Toc100002 .anchor}**3. Background and Context**

[]{#_Toc100003 .anchor}**3.1 How to Upload and Load the Six Documents**

The six documents are in the Word format, and they must be loaded into
the AI builder\'s context before the build begins. The loading method
depends on the AI builder being used, and the three dominant methods are
the project file upload, the context file, and the paste. For Claude
Code, the documents are placed in the project directory and referenced
in the CLAUDE.md file, which is the context file that Claude Code reads
at the start of every session; the builder creates a CLAUDE.md that
lists the six documents and instructs Claude Code to read the relevant
sections before starting any task. For Cursor, the documents are
uploaded to the project\'s context, or the relevant sections are pasted
into the conversation, or the documents are placed in the project
directory and referenced with the at-file syntax. For OpenAI Codex and
the multi-agent systems, the documents are uploaded as project files or
are loaded through the system\'s document ingestion mechanism.

The recommended approach, regardless of the AI builder, is to create a
project directory that contains the six documents and a context file
that lists them. The context file, whether it is CLAUDE.md for Claude
Code, AGENTS.md for the multi-agent systems, or the cursor rules for
Cursor, should contain the following: the list of the six documents with
their file paths, the instruction to read the relevant sections before
starting any task, the three-phase model of context loading, analysis,
and implementation, and the verification gate that must be run after
every task. The context file is the entry point that the AI builder
reads first, and it is the file that directs the builder to the six
documents and to the prompt architecture that governs the build.

[]{#_Toc100004 .anchor}**3.2 The CLAUDE.md or AGENTS.md File**

The following is the content of the CLAUDE.md or AGENTS.md file that the
builder places in the project directory. This file is the first thing
the AI builder reads, and it directs the builder to the six documents
and to the prompt architecture.

+-----------------------------------------------------------------------+
| \# Project Context --- AI Builder Playbook                            |
|                                                                       |
| \## Foundational Documents (read before starting any task)            |
|                                                                       |
| This project is built according to the six-document AI builder        |
| playbook.                                                             |
|                                                                       |
| Before starting any task, read the relevant sections of these         |
| documents:                                                            |
|                                                                       |
| 1\. docs/01_Foundation_Systems.docx                                   |
|                                                                       |
| \- Architecture, data models, SDLC, 8 system categories               |
|                                                                       |
| \- Read: the section for the system you are building                  |
|                                                                       |
| 2\. docs/02_Prompting_AI_Builder_Agents.docx                          |
|                                                                       |
| \- Three-phase model: Context Loading -\> Analysis -\> Implementation |
|                                                                       |
| \- Read: the master prompt template and the three-phase model         |
|                                                                       |
| 3\. docs/03_Technical_Stack_Integration_Guide.docx                    |
|                                                                       |
| \- Database, cache, queue, search, storage, auth selection            |
|                                                                       |
| \- Read: the stack selection for your system                          |
|                                                                       |
| 4\. docs/04_System_Analysis_Quality_Operational_Excellence.docx       |
|                                                                       |
| \- Requirements, testing, DevOps, SRE, security, compliance           |
|                                                                       |
| \- Read: the requirements engineering and testing strategy            |
|                                                                       |
| 5\. docs/05_Scalability_Concurrency_MultiDatabase.docx                |
|                                                                       |
| \- Load balancing, concurrency, idempotency, Saga, multi-DB           |
|                                                                       |
| \- Read: the scalability and concurrency patterns                     |
|                                                                       |
| 6\. docs/06_MultiAgent_Collaboration_FaultTolerance.docx              |
|                                                                       |
| \- Multi-agent orchestration, durable execution, continuity           |
|                                                                       |
| \- Read: if using multi-agent mode                                    |
|                                                                       |
| \## Build Rules                                                       |
|                                                                       |
| \- Follow the three-phase model for every task.                       |
|                                                                       |
| \- Run the verification gate after every task.                        |
|                                                                       |
| \- Do not proceed past a failed gate.                                 |
|                                                                       |
| \- Do not improvise; implement against the documented specification.  |
|                                                                       |
| \- Use the type-safe toolchain: Zod + Prisma/Drizzle + tRPC +         |
| TanStack Query.                                                       |
|                                                                       |
| \- Use PostgreSQL with Row-Level Security for multi-tenant isolation. |
|                                                                       |
| \- Use Redis for cache, sessions, and distributed locks.              |
|                                                                       |
| \- Implement idempotency for every write endpoint.                    |
|                                                                       |
| \- Write tests for every feature; enforce WCAG 2.2 AA.                |
|                                                                       |
| \- Document every significant decision in an ADR.                     |
|                                                                       |
| \## Current Build                                                     |
|                                                                       |
| \- System: \[SPECIFY: e.g., School Management System\]                |
|                                                                       |
| \- Stack: Next.js 16, PostgreSQL 16, Redis 7, Tailwind CSS 4, tRPC    |
|                                                                       |
| \- Phase: \[SPECIFY: Context Loading / Analysis / Implementation\]    |
+-----------------------------------------------------------------------+

[]{#_Toc100005 .anchor}**3.3 The First Message to the AI Builder**

After the documents are loaded and the context file is in place, the
builder issues the first message to the AI builder. The first message is
the prompt that starts the build, and it follows the master prompt
template that the next section presents. The first message establishes
the builder\'s role, specifies the system to build, directs the builder
to consume the relevant document sections, and begins the three-phase
model. The first message is the most consequential prompt in the build,
because it sets the context and the expectations for everything that
follows, and a poorly constructed first message will produce a build
that drifts from the specification.

[]{#_Toc100006 .anchor}**4. The Master Prompt Template**

The master prompt template is the fill-in-the-blank prompt that the
builder uses to start any system build. The template follows the
three-phase model from the second document and incorporates the document
consumption protocol from the fifth document. The builder replaces the
bracketed sections with the specific content for the system being built,
and the result is a complete first prompt that directs the AI builder to
consume the documents, to synthesize its understanding, and to produce
the task list that the implementation will follow.

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| \[SYSTEM_TYPE, e.g., School Management System\] according to the      |
| six-document                                                          |
|                                                                       |
| AI builder playbook. You do not improvise; you implement against the  |
|                                                                       |
| documented specification. You do not skip verification; you run the   |
| gate                                                                  |
|                                                                       |
| after every task.                                                     |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[SYSTEM_NAME, e.g., Greenfield Academy Management System\]  |
|                                                                       |
| \- Type: \[SYSTEM_TYPE, e.g., vertical ERP for a private school\]     |
|                                                                       |
| \- Target users: \[USERS, e.g., administrators, teachers, parents,    |
| students\]                                                            |
|                                                                       |
| \- Primary problem solved: \[PROBLEM, e.g., manual processes in       |
| school admin\]                                                        |
|                                                                       |
| \- Vertical: \[VERTICAL, e.g., private K-12 education, 500-2000       |
| students\]                                                            |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read the following sections from the foundational documents:          |
|                                                                       |
| \- Doc 1 (Foundation): Section \[X\] on \[SYSTEM_TYPE\] --- the data  |
| model,                                                                |
|                                                                       |
| the process flows, the reference architecture.                        |
|                                                                       |
| \- Doc 2 (Prompt Guide): The three-phase model and the master prompt  |
| template.                                                             |
|                                                                       |
| \- Doc 3 (Stack Guide): The database, cache, auth, and API style      |
| selection                                                             |
|                                                                       |
| for \[SYSTEM_TYPE\].                                                  |
|                                                                       |
| \- Doc 4 (Operational Excellence): The requirements engineering and   |
| the                                                                   |
|                                                                       |
| testing strategy.                                                     |
|                                                                       |
| \- Doc 5 (Scalability): The concurrency patterns and the              |
| multi-database                                                        |
|                                                                       |
| architecture for \[SYSTEM_TYPE\].                                     |
|                                                                       |
| \- Doc 6 (Multi-Agent): If using multi-agent mode, the orchestration  |
| pattern.                                                              |
|                                                                       |
| Produce a SYNTHESIS document that demonstrates your understanding:    |
|                                                                       |
| \(a\) The system\'s problem statement and ideal customer profile.     |
|                                                                       |
| \(b\) The functional and non-functional requirements.                 |
|                                                                       |
| \(c\) The reference architecture and the data model.                  |
|                                                                       |
| \(d\) The security controls and the testing strategy.                 |
|                                                                       |
| \(e\) The scalability, concurrency, and multi-database patterns.      |
|                                                                       |
| \(f\) The implementation roadmap (phases and milestones).             |
|                                                                       |
| The builder reviews the synthesis and confirms it before you proceed. |
|                                                                       |
| PHASE 2 --- BUILD PLANNING:                                           |
|                                                                       |
| Decompose the build into atomic tasks. Each task must have:           |
|                                                                       |
| \- A defined input and output.                                        |
|                                                                       |
| \- An acceptance criterion.                                           |
|                                                                       |
| \- A verification gate (test, lint, type check, accessibility check). |
|                                                                       |
| Produce the task list. The builder reviews and approves it.           |
|                                                                       |
| PHASE 3 --- IMPLEMENTATION:                                           |
|                                                                       |
| For each task:                                                        |
|                                                                       |
| 1\. Implement the task.                                               |
|                                                                       |
| 2\. Run the verification gate.                                        |
|                                                                       |
| 3\. If the gate passes, proceed to the next task.                     |
|                                                                       |
| 4\. If the gate fails, fix and re-run (max 3 retries, then escalate). |
|                                                                       |
| TARGET STACK:                                                         |
|                                                                       |
| \- Frontend: Next.js 16 (App Router), Tailwind CSS 4, Radix UI,       |
| Framer Motion                                                         |
|                                                                       |
| \- Backend: tRPC (type-safe API), Prisma or Drizzle (ORM)             |
|                                                                       |
| \- Database: PostgreSQL 16 with Row-Level Security                    |
|                                                                       |
| \- Cache: Redis 7 (sessions, cache, distributed locks)                |
|                                                                       |
| \- Queue: Inngest or SQS (background jobs, durable execution)         |
|                                                                       |
| \- Search: PostgreSQL FTS or Meilisearch                              |
|                                                                       |
| \- Storage: S3 or Cloudflare R2                                       |
|                                                                       |
| \- Auth: \[Clerk for fast start, or custom session+RLS for control\]  |
|                                                                       |
| \- Testing: Vitest (unit), Playwright (E2E), axe-core (a11y), k6      |
| (load)                                                                |
|                                                                       |
| \- CI/CD: GitHub Actions                                              |
|                                                                       |
| \- IaC: Pulumi or Terraform                                           |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- Do not write any code until the synthesis (Phase 1) is approved.   |
|                                                                       |
| \- Do not proceed past a failed verification gate.                    |
|                                                                       |
| \- Implement idempotency for every write endpoint.                    |
|                                                                       |
| \- Implement optimistic locking for every concurrent-update entity.   |
|                                                                       |
| \- Enforce WCAG 2.2 AA on every user-facing page.                     |
|                                                                       |
| \- Do not produce AI-flag UI; follow the professional UI/UX standards |
|                                                                       |
| from Doc 2 (typography scale, motion principles, elevation system).   |
|                                                                       |
| Begin with Phase 1. Read the documents and produce the synthesis.     |
+-----------------------------------------------------------------------+

The master template is the starting point for every build, and the
system-specific prompts that follow are instances of this template,
filled in with the content for each system type. The builder uses the
master template as the reference and the system-specific prompts as the
starting points, adapting them to the specific requirements of the
build.

[]{#_Toc100007 .anchor}**5. System-Specific Prompt Templates**

This section provides the copy-paste prompt templates for each of the
eight system categories, plus the advanced combination prompts that
integrate multiple systems. Each template is a complete first prompt
that the builder issues to the AI builder, and each is an instance of
the master template filled in with the system-specific content. The
builder adapts the bracketed sections to the specific requirements, and
the prompt directs the AI builder to consume the relevant document
sections, to synthesize its understanding, and to produce the task list.

[]{#_Toc100008 .anchor}**5.1 School Management System (Complete Private
School)**

The School Management System is the most comprehensive of the
system-specific prompts, because it is a vertical ERP that integrates
the academic, financial, operational, and communication functions of a
school. The prompt directs the AI builder to construct a system that
covers the entire school, with the seven modules documented in the
second document\'s use case, and with the advanced systems that a modern
smart school requires, including the library management, the transport
management, the AI-powered features, and the analytics dashboard.

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a complete        |
|                                                                       |
| production-grade School Management System for a private school. This  |
| is a                                                                  |
|                                                                       |
| vertical ERP that covers the entire school\'s operations.             |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[SCHOOL_NAME, e.g., Greenfield Academy Management System\]  |
|                                                                       |
| \- Type: Vertical ERP for private K-12 education (single school or    |
| small group)                                                          |
|                                                                       |
| \- Target users: Administrators, teachers, parents, students, finance |
| staff,                                                                |
|                                                                       |
| librarians, transport managers                                        |
|                                                                       |
| \- Primary problem: Manual processes (paper attendance, handwritten   |
| gradebooks,                                                           |
|                                                                       |
| cash fee collection, phone-tree announcements, manual scheduling)     |
|                                                                       |
| \- School size: \[e.g., 500-2000 students, 50-200 staff\]             |
|                                                                       |
| \- Goal: Make the school smarter, faster, and more innovative than    |
| traditional                                                           |
|                                                                       |
| MODULES TO IMPLEMENT (7 core + 4 advanced):                           |
|                                                                       |
| CORE MODULES:                                                         |
|                                                                       |
| 1\. Admissions --- applicant tracking, online applications, document  |
| upload,                                                               |
|                                                                       |
| interview scheduling, admission decisions                             |
|                                                                       |
| 2\. Student Information --- demographics, guardians, medical records, |
|                                                                       |
| emergency contacts, academic history                                  |
|                                                                       |
| 3\. Academic --- courses, sections, enrollment, scheduling,           |
| attendance,                                                           |
|                                                                       |
| gradebook, transcripts, report cards                                  |
|                                                                       |
| 4\. Financial --- fee structures, invoicing, online payments,         |
| scholarships,                                                         |
|                                                                       |
| financial aid, expense tracking                                       |
|                                                                       |
| 5\. Communication --- announcements, messaging                        |
| (teacher-parent-student),                                             |
|                                                                       |
| notifications (email, SMS, push), event calendar                      |
|                                                                       |
| 6\. Reporting --- transcripts, report cards, attendance reports,      |
| financial                                                             |
|                                                                       |
| reports, custom report builder                                        |
|                                                                       |
| 7\. Administration --- users, roles, permissions, school settings,    |
|                                                                       |
| academic year/term management                                         |
|                                                                       |
| ADVANCED MODULES (to make the school \"smart\"):                      |
|                                                                       |
| 8\. Library Management --- catalog, circulation (checkout/return),    |
| reservations,                                                         |
|                                                                       |
| fines, ISBN lookup, digital resources                                 |
|                                                                       |
| 9\. Transport Management --- bus routes, stops, student assignment,   |
| driver                                                                |
|                                                                       |
| tracking, parent pickup notifications, GPS tracking                   |
|                                                                       |
| 10\. Health & Medical --- health records, medication tracking,        |
| immunization                                                          |
|                                                                       |
| tracking, clinic visits, allergy alerts                               |
|                                                                       |
| 11\. AI-Powered Features --- automated attendance analytics, early    |
| warning                                                               |
|                                                                       |
| system for at-risk students, automated report card comments,          |
|                                                                       |
| chatbot for parent queries, predictive enrollment                     |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 10 (ERP) for the financial module pattern and       |
| shared data                                                           |
|                                                                       |
| backbone; Section 14 (LMS) for the academic module pattern; Section 7 |
|                                                                       |
| (Multi-Tenant SaaS) if serving multiple schools.                      |
|                                                                       |
| \- Doc 2: The school management system use case (Section 5) with the  |
| prompt                                                                |
|                                                                       |
| sequence and the manual-to-digital process mapping.                   |
|                                                                       |
| \- Doc 3: The database selection (PostgreSQL for transactional,       |
| ClickHouse                                                            |
|                                                                       |
| if analytics-heavy), the auth selection (Clerk or custom), the tRPC   |
|                                                                       |
| integration contract.                                                 |
|                                                                       |
| \- Doc 4: The requirements engineering (use cases for each module),   |
| the                                                                   |
|                                                                       |
| testing strategy (including FERPA compliance testing), the threat     |
|                                                                       |
| modeling (STRIDE for student data).                                   |
|                                                                       |
| \- Doc 5: The concurrency patterns (distributed lock for schedule     |
| conflicts,                                                            |
|                                                                       |
| idempotency for fee payments), the multi-database architecture        |
|                                                                       |
| (PostgreSQL for records, Redis for sessions, S3 for documents).       |
|                                                                       |
| \- Doc 6: The durable execution for long-running processes (report    |
| card                                                                  |
|                                                                       |
| generation, bulk notifications).                                      |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The complete data model for all 11 modules (entities,           |
| relationships).                                                       |
|                                                                       |
| \(b\) The process flows for: admissions, attendance, fee payment,     |
| grading,                                                              |
|                                                                       |
| library circulation, transport assignment, report card generation.    |
|                                                                       |
| \(c\) The FERPA compliance controls (student data access, audit       |
| logging).                                                             |
|                                                                       |
| \(d\) The WCAG 2.2 AA accessibility plan (for all user types          |
| including                                                             |
|                                                                       |
| parents with disabilities).                                           |
|                                                                       |
| \(e\) The AI features integration plan (which model, which data,      |
| which                                                                 |
|                                                                       |
| guardrails, which evaluation harness).                                |
|                                                                       |
| \(f\) The implementation roadmap (12-18 months, phased by module).    |
|                                                                       |
| ACCEPTANCE CRITERIA FOR THE SYNTHESIS:                                |
|                                                                       |
| \- All 11 modules are covered with their entities and relationships.  |
|                                                                       |
| \- FERPA is identified as the applicable regulation.                  |
|                                                                       |
| \- The AI features have guardrails and an evaluation harness.         |
|                                                                       |
| \- The roadmap is phased with dependencies identified.                |
|                                                                       |
| VERIFICATION GATE:                                                    |
|                                                                       |
| \- Builder reviews the synthesis and confirms it matches the          |
| documents.                                                            |
|                                                                       |
| \- No code is written in this phase.                                  |
|                                                                       |
| TARGET STACK:                                                         |
|                                                                       |
| \- Next.js 16, PostgreSQL 16 with RLS, Redis 7, tRPC, Prisma          |
|                                                                       |
| \- Auth: Clerk (for fast start) or custom session+RLS                 |
|                                                                       |
| \- Queue: Inngest (for report generation, bulk notifications)         |
|                                                                       |
| \- Storage: S3 (for student documents, report cards)                  |
|                                                                       |
| \- AI: OpenAI or Anthropic via unified gateway (for AI features)      |
|                                                                       |
| \- Testing: Vitest, Playwright, axe-core, k6                          |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- Student data is FERPA-protected; enforce RLS and audit logging.    |
|                                                                       |
| \- Fee payments must be idempotent (prevent double charges).          |
|                                                                       |
| \- Schedule conflicts must be detected before publication.            |
|                                                                       |
| \- Report cards must be accessible to screen readers.                 |
|                                                                       |
| \- The system must handle concurrent grade entry by multiple          |
| teachers.                                                             |
|                                                                       |
| Begin with Phase 1. Read the documents and produce the synthesis.     |
+-----------------------------------------------------------------------+

[]{#_Toc100009 .anchor}**5.2 Business SaaS System (Multi-Tenant)**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| multi-tenant Business SaaS platform for \[VERTICAL, e.g., physical    |
| therapy                                                               |
|                                                                       |
| practice management / legal practice management / field service       |
| management\].                                                         |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[PRODUCT_NAME\]                                             |
|                                                                       |
| \- Type: Multi-tenant B2B SaaS                                        |
|                                                                       |
| \- Vertical: \[VERTICAL\]                                             |
|                                                                       |
| \- Target users: \[PRIMARY_USERS\]                                    |
|                                                                       |
| \- Primary problem: \[THE SPECIFIC WORKFLOW INEFFICIENCY\]            |
|                                                                       |
| \- Monetization: Per-seat subscription (\$X/seat/month)               |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 7 (Multi-Tenant SaaS) --- the data model (Tenant,   |
| User,                                                                 |
|                                                                       |
| Role, Session, Subscription), the tenant isolation (PostgreSQL RLS),  |
|                                                                       |
| the process flows (tenant provisioning, auth, billing).               |
|                                                                       |
| \- Doc 2: The B2B SaaS use case (Section 6) with the tenant isolation |
| prompt.                                                               |
|                                                                       |
| \- Doc 3: The database (PostgreSQL with RLS), cache (Redis), auth     |
| (Clerk),                                                              |
|                                                                       |
| API style (tRPC), ORM (Prisma or Drizzle).                            |
|                                                                       |
| \- Doc 4: The requirements engineering, testing strategy, SOC 2       |
| compliance.                                                           |
|                                                                       |
| \- Doc 5: The scalability (load balancing, rate limiting),            |
| concurrency                                                           |
|                                                                       |
| (optimistic locking, idempotency), multi-database (PostgreSQL + Redis |
|                                                                       |
| \+ S3).                                                               |
|                                                                       |
| \- Doc 6: The durable execution for subscription billing, the         |
| graceful                                                              |
|                                                                       |
| degradation for agent failures.                                       |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The problem statement, ICP, functional and non-functional       |
| requirements.                                                         |
|                                                                       |
| \(b\) The data model with tenant_id on every tenant-scoped table and  |
| the                                                                   |
|                                                                       |
| RLS policy.                                                           |
|                                                                       |
| \(c\) The subscription billing flow (Stripe integration, idempotent   |
| webhooks).                                                            |
|                                                                       |
| \(d\) The SOC 2 compliance controls (audit logging, access reviews).  |
|                                                                       |
| \(e\) The implementation roadmap (12-18 months).                      |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- Every tenant-scoped table has tenant_id and the RLS policy.        |
|                                                                       |
| \- Cross-tenant access tests must pass (return zero rows).            |
|                                                                       |
| \- The subscription billing is idempotent.                            |
|                                                                       |
| \- WCAG 2.2 AA on every page.                                         |
|                                                                       |
| \- Rate limiting on the API.                                          |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100010 .anchor}**5.3 E-Commerce and Marketplace System**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| E-Commerce system for \[VERTICAL, e.g., specialty food / industrial   |
| parts /                                                               |
|                                                                       |
| handcrafted goods\]. \[Optional: This is a marketplace with multiple  |
| sellers.\]                                                            |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[STORE_NAME\]                                               |
|                                                                       |
| \- Type: \[Single-merchant store / Multi-seller marketplace\]         |
|                                                                       |
| \- Vertical: \[VERTICAL\]                                             |
|                                                                       |
| \- Target users: \[Shoppers, merchants/admins\]                       |
|                                                                       |
| \- Primary problem: \[THE SPECIFIC COMMERCE INEFFICIENCY\]            |
|                                                                       |
| \- Monetization: \[Transaction fee + subscription / pure              |
| subscription\]                                                        |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 8 (E-Commerce) --- the data model (Product,         |
| ProductVariant,                                                       |
|                                                                       |
| Order, OrderItem, Payment, Shipment), the order state machine, the    |
|                                                                       |
| process flows (checkout, fulfillment, returns).                       |
|                                                                       |
| \- Doc 2: The e-commerce use case.                                    |
|                                                                       |
| \- Doc 3: The database (PostgreSQL), search (Meilisearch for product  |
|                                                                       |
| search), storage (S3 for product images), auth (Clerk), payment       |
|                                                                       |
| (Stripe tokenization for PCI-DSS SAQ-A).                              |
|                                                                       |
| \- Doc 4: The testing strategy (order state machine tests, PCI        |
| penetration                                                           |
|                                                                       |
| test), the threat modeling (STRIDE for payment flow).                 |
|                                                                       |
| \- Doc 5: The concurrency (distributed lock for inventory,            |
| idempotency                                                           |
|                                                                       |
| for checkout), the scalability (load balancing for flash sales).      |
|                                                                       |
| \- Doc 6: The durable execution for order fulfillment.                |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The product catalog data model with variants and inventory.     |
|                                                                       |
| \(b\) The order state machine (pending -\> paid -\> fulfilling -\>    |
| shipped                                                               |
|                                                                       |
| -\> delivered; cancelled; refunded).                                  |
|                                                                       |
| \(c\) The checkout flow with idempotency (prevent duplicate orders).  |
|                                                                       |
| \(d\) The PCI-DSS compliance (tokenization, no raw card data).        |
|                                                                       |
| \(e\) The search integration (Meilisearch for typo-tolerant product   |
| search).                                                              |
|                                                                       |
| \(f\) The implementation roadmap (9-15 months).                       |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The checkout is idempotent (idempotency key from client).          |
|                                                                       |
| \- The inventory reservation uses a distributed lock or optimistic    |
| locking.                                                              |
|                                                                       |
| \- The payment flow never touches raw card data (tokenization).       |
|                                                                       |
| \- The order state machine transitions are tested exhaustively.       |
|                                                                       |
| \- WCAG 2.2 AA on the checkout flow (conversion-critical).            |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100011 .anchor}**5.4 CRM Platform (Vertical)**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| CRM for \[VERTICAL, e.g., wedding photographers / real estate agents  |
| /                                                                     |
|                                                                       |
| financial advisors\].                                                 |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[CRM_NAME\]                                                 |
|                                                                       |
| \- Type: Vertical CRM (per-seat subscription)                         |
|                                                                       |
| \- Vertical: \[VERTICAL\]                                             |
|                                                                       |
| \- Target users: \[Sales professionals in the vertical\]              |
|                                                                       |
| \- Primary problem: \[THE SPECIFIC RELATIONSHIP-MANAGEMENT            |
| INEFFICIENCY\]                                                        |
|                                                                       |
| \- Monetization: Per-seat subscription (\$X/seat/month)               |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 9 (CRM) --- the data model (Lead, Contact, Account, |
|                                                                       |
| Opportunity, Activity, Stage), the lead-to-contact conversion, the    |
|                                                                       |
| 360-degree customer view.                                             |
|                                                                       |
| \- Doc 3: The database (PostgreSQL), search (PostgreSQL FTS for       |
| contact                                                               |
|                                                                       |
| search), auth (Clerk), API (tRPC).                                    |
|                                                                       |
| \- Doc 4: The requirements engineering, the testing strategy, the     |
| GDPR                                                                  |
|                                                                       |
| compliance (data subject access requests).                            |
|                                                                       |
| \- Doc 5: The concurrency (optimistic locking for opportunity         |
| updates),                                                             |
|                                                                       |
| the multi-database (PostgreSQL + Redis for hot-path caching).         |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The data model with the lead-to-contact conversion flow.        |
|                                                                       |
| \(b\) The pipeline and stage state machine.                           |
|                                                                       |
| \(c\) The activity tracking (calls, emails, meetings).                |
|                                                                       |
| \(d\) The workflow automation engine (lead assignment, follow-up      |
| reminders).                                                           |
|                                                                       |
| \(e\) The reporting and forecasting.                                  |
|                                                                       |
| \(f\) The GDPR compliance (data export, data deletion, consent        |
| management).                                                          |
|                                                                       |
| \(g\) The implementation roadmap (12-18 months).                      |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The lead-to-contact conversion is transactional and tested.        |
|                                                                       |
| \- The opportunity stage transitions are governed by a state machine. |
|                                                                       |
| \- The GDPR data subject access request process is implemented and    |
| tested.                                                               |
|                                                                       |
| \- WCAG 2.2 AA on the list views and record pages.                    |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100012 .anchor}**5.5 ERP System (Vertical)**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| ERP for \[VERTICAL, e.g., construction / field services /             |
| nonprofit\].                                                          |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[ERP_NAME\]                                                 |
|                                                                       |
| \- Type: Vertical ERP (module license + implementation services)      |
|                                                                       |
| \- Vertical: \[VERTICAL\]                                             |
|                                                                       |
| \- Target users: \[Finance, operations, HR, executives\]              |
|                                                                       |
| \- Primary problem: \[THE SPECIFIC OPERATIONAL FRAGMENTATION\]        |
|                                                                       |
| \- Monetization: Module license + implementation + support            |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 10 (ERP) --- the data model (Account, JournalEntry, |
|                                                                       |
| JournalLine, Period, Item, InventoryItem, PurchaseOrder, SalesOrder,  |
|                                                                       |
| Employee), the double-entry general ledger, the period close.         |
|                                                                       |
| \- Doc 3: The database (PostgreSQL for ACID and RLS), the             |
| multi-database                                                        |
|                                                                       |
| architecture.                                                         |
|                                                                       |
| \- Doc 4: The requirements engineering, the testing strategy (period  |
| close                                                                 |
|                                                                       |
| testing, audit trail verification), the SOX compliance.               |
|                                                                       |
| \- Doc 5: The concurrency (optimistic locking for journal entries),   |
| the                                                                   |
|                                                                       |
| data consistency (Saga for cross-module transactions).                |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The data model with the double-entry general ledger.            |
|                                                                       |
| \(b\) The period close controls (no posting after close).             |
|                                                                       |
| \(c\) The procure-to-pay, order-to-cash, and record-to-report flows.  |
|                                                                       |
| \(d\) The SOX compliance (segregation of duties, audit trail).        |
|                                                                       |
| \(e\) The multi-module integration (financial, supply chain, HR).     |
|                                                                       |
| \(f\) The implementation roadmap (18-36 months).                      |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The double-entry constraint is enforced (debits = credits).        |
|                                                                       |
| \- The period close prevents posting after close.                     |
|                                                                       |
| \- The segregation of duties is enforced.                             |
|                                                                       |
| \- The audit trail is complete and immutable.                         |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100013 .anchor}**5.6 Real-Time Analytics Dashboard**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| real-time analytics dashboard for \[DOMAIN, e.g., application         |
| performance                                                           |
|                                                                       |
| monitoring / product analytics / financial observability\].           |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[DASHBOARD_NAME\]                                           |
|                                                                       |
| \- Type: Real-time analytics SaaS (per-seat + usage-based pricing)    |
|                                                                       |
| \- Domain: \[DOMAIN\]                                                 |
|                                                                       |
| \- Target users: \[Operations, product, or business teams\]           |
|                                                                       |
| \- Primary problem: \[THE SPECIFIC ANALYTICS LATENCY\]                |
|                                                                       |
| \- Monetization: Per-seat + usage-based (data volume)                 |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 11 (Real-Time Analytics) --- the data model (Event, |
| Metric,                                                               |
|                                                                       |
| Dashboard, Widget, Alert), the Kafka + ClickHouse + WebSocket         |
| pipeline.                                                             |
|                                                                       |
| \- Doc 3: The multi-database (PostgreSQL for metadata, ClickHouse for |
|                                                                       |
| events, Redis for caching).                                           |
|                                                                       |
| \- Doc 4: The performance engineering, the testing strategy.          |
|                                                                       |
| \- Doc 5: The scalability (load balancing, auto-scaling), the         |
| multi-database                                                        |
|                                                                       |
| architecture (polyglot persistence).                                  |
|                                                                       |
| \- Doc 6: The durable execution for alert evaluation.                 |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The event ingestion pipeline (Kafka -\> ClickHouse).            |
|                                                                       |
| \(b\) The metric computation (materialized views vs query-time).      |
|                                                                       |
| \(c\) The WebSocket push for real-time dashboard updates.             |
|                                                                       |
| \(d\) The alerting and the SLO definition.                            |
|                                                                       |
| \(e\) The access control and the data-level permissions.              |
|                                                                       |
| \(f\) The implementation roadmap (9-15 months).                       |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The dashboard update latency is below 2 seconds end-to-end.        |
|                                                                       |
| \- The query latency is below 200ms at p95.                           |
|                                                                       |
| \- The alerting is driven by SLO error budgets.                       |
|                                                                       |
| \- The data retention respects the data-minimization principle.       |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100014 .anchor}**5.7 AI-Powered Application**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| AI-powered application for \[WORKFLOW, e.g., customer support /       |
| content                                                               |
|                                                                       |
| generation / document analysis\].                                     |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[APP_NAME\]                                                 |
|                                                                       |
| \- Type: AI-powered SaaS (subscription + per-interaction)             |
|                                                                       |
| \- Workflow: \[THE SPECIFIC CUSTOMER-FACING WORKFLOW\]                |
|                                                                       |
| \- Target users: \[END_USERS\]                                        |
|                                                                       |
| \- Primary problem: \[THE HIGH-VOLUME REPETITIVE INTERACTION\]        |
|                                                                       |
| \- Monetization: Subscription + per-interaction (model cost           |
| passthrough)                                                          |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 12 (AI-Powered Application) --- the data model      |
|                                                                       |
| (Conversation, Message, Document, Chunk, Embedding, ModelCall,        |
|                                                                       |
| Retrieval, Feedback, GuardrailEvent), the RAG pipeline.               |
|                                                                       |
| \- Doc 3: The database (PostgreSQL with pgvector for embeddings), the |
|                                                                       |
| vector search, the LLM provider selection (unified gateway).          |
|                                                                       |
| \- Doc 4: The threat modeling (OWASP Top 10 for LLMs), the evaluation |
|                                                                       |
| harness, the guardrail design.                                        |
|                                                                       |
| \- Doc 5: The concurrency (idempotency for model calls), the          |
| scalability                                                           |
|                                                                       |
| (rate limiting, circuit breaker for model provider).                  |
|                                                                       |
| \- Doc 6: The durable execution for conversation flows, the graceful  |
|                                                                       |
| degradation (fallback model, human handoff).                          |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The conversation flow with input and output guardrails.         |
|                                                                       |
| \(b\) The RAG pipeline (chunking, embedding, retrieval, reranking).   |
|                                                                       |
| \(c\) The prompt management and the evaluation harness.               |
|                                                                       |
| \(d\) The human-handoff flow.                                         |
|                                                                       |
| \(e\) The guardrails (prompt injection, toxic content,                |
| hallucination).                                                       |
|                                                                       |
| \(f\) The unit economics (cost per interaction, pricing model).       |
|                                                                       |
| \(g\) The implementation roadmap (6-12 months).                       |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The time to first token is below 2 seconds at p95.                 |
|                                                                       |
| \- The guardrails are tested and verified.                            |
|                                                                       |
| \- The evaluation harness runs in CI.                                 |
|                                                                       |
| \- The human-handoff path is always available.                        |
|                                                                       |
| \- The AI disclosure is present (users know they are talking to an    |
| AI).                                                                  |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100015 .anchor}**5.8 Booking and Scheduling SaaS**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| booking and scheduling SaaS for \[VERTICAL, e.g., tattoo studios /    |
| music                                                                 |
|                                                                       |
| teachers / dental clinics / fitness studios\].                        |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[BOOKING_NAME\]                                             |
|                                                                       |
| \- Type: Booking SaaS (per-seat + per-booking fee)                    |
|                                                                       |
| \- Vertical: \[VERTICAL\]                                             |
|                                                                       |
| \- Target users: \[Service providers and their customers\]            |
|                                                                       |
| \- Primary problem: \[No-shows, double-bookings, manual scheduling\]  |
|                                                                       |
| \- Monetization: Per-seat + per-booking fee + payment processing      |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 13 (Booking and Scheduling) --- the data model      |
| (Provider,                                                            |
|                                                                       |
| Service, AvailabilityRule, AvailabilityException, Slot, Booking,      |
|                                                                       |
| Customer, Reminder, Resource), the calendar engine.                   |
|                                                                       |
| \- Doc 3: The database (PostgreSQL), cache (Redis for distributed     |
| lock                                                                  |
|                                                                       |
| and slot cache), auth (Clerk), payment (Stripe).                      |
|                                                                       |
| \- Doc 4: The testing strategy (time-zone testing, concurrency        |
| testing                                                               |
|                                                                       |
| for double-booking).                                                  |
|                                                                       |
| \- Doc 5: The concurrency (distributed lock for slot booking,         |
| idempotency                                                           |
|                                                                       |
| for payment), the multi-database (PostgreSQL + Redis).                |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The availability computation (rules + exceptions -\> slots).    |
|                                                                       |
| \(b\) The booking flow with distributed lock (prevent                 |
| double-booking).                                                      |
|                                                                       |
| \(c\) The reminder system (email, SMS, push).                         |
|                                                                       |
| \(d\) The rescheduling and cancellation flow.                         |
|                                                                       |
| \(e\) The payment integration (deposits, full payment, refunds).      |
|                                                                       |
| \(f\) The time-zone handling (correct across DST transitions).        |
|                                                                       |
| \(g\) The implementation roadmap (6-12 months).                       |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The distributed lock prevents double-booking.                      |
|                                                                       |
| \- The booking flow is idempotent.                                    |
|                                                                       |
| \- The time-zone handling is correct across DST.                      |
|                                                                       |
| \- The booking flow is WCAG 2.2 AA (mobile-first,                     |
| conversion-critical).                                                 |
|                                                                       |
| \- \[If healthcare: HIPAA compliance for intake forms.\]              |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100016 .anchor}**5.9 Learning Management System (LMS)**

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a                 |
| production-grade                                                      |
|                                                                       |
| LMS for \[MARKET, e.g., enterprise compliance training / higher       |
| education /                                                           |
|                                                                       |
| professional certification\].                                         |
|                                                                       |
| THE SYSTEM TO BUILD:                                                  |
|                                                                       |
| \- Name: \[LMS_NAME\]                                                 |
|                                                                       |
| \- Type: LMS (per-learner license)                                    |
|                                                                       |
| \- Market: \[ENTERPRISE_L&D or ACADEMIC\]                             |
|                                                                       |
| \- Target users: \[Learners, instructors, administrators\]            |
|                                                                       |
| \- Primary problem: \[Manual training tracking, low completion        |
| rates\]                                                               |
|                                                                       |
| \- Monetization: Per-learner license                                  |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from the foundational documents:                                 |
|                                                                       |
| \- Doc 1: Section 14 (LMS) --- the data model (Course, Module,        |
| Lesson,                                                               |
|                                                                       |
| Enrollment, Learner, Attempt, Assessment, Question, Response,         |
|                                                                       |
| Certificate), the SCORM/xAPI content runtime.                         |
|                                                                       |
| \- Doc 3: The database (PostgreSQL), storage (S3 for content          |
| packages),                                                            |
|                                                                       |
| CDN for content delivery, auth (Clerk or SAML SSO).                   |
|                                                                       |
| \- Doc 4: The testing strategy (SCORM conformance, concurrent         |
| assessment),                                                          |
|                                                                       |
| the accessibility (WCAG 2.2 AA, Section 508).                         |
|                                                                       |
| \- Doc 5: The scalability (concurrent assessment-taking), the         |
| multi-database                                                        |
|                                                                       |
| (PostgreSQL + Redis + S3 + CDN).                                      |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The course authoring and content management.                    |
|                                                                       |
| \(b\) The enrollment and progress tracking.                           |
|                                                                       |
| \(c\) The assessment engine (question banks, randomization,           |
| auto-grading).                                                        |
|                                                                       |
| \(d\) The SCORM/xAPI content runtime.                                 |
|                                                                       |
| \(e\) The certification and compliance reporting.                     |
|                                                                       |
| \(f\) The concurrent assessment architecture (thousands of            |
| simultaneous                                                          |
|                                                                       |
| test-takers).                                                         |
|                                                                       |
| \(g\) The implementation roadmap (12-24 months).                      |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The assessment engine handles concurrent test-takers.              |
|                                                                       |
| \- The SCORM/xAPI content plays correctly.                            |
|                                                                       |
| \- The accessibility is WCAG 2.2 AA (and Section 508 if US            |
| government).                                                          |
|                                                                       |
| \- \[If minors: FERPA compliance.\]                                   |
|                                                                       |
| \- The certification is verifiable.                                   |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100017 .anchor}**6. Advanced Combination Prompts: Integrated
Platforms**

The system-specific prompts in the previous section build individual
systems, but the most powerful applications are the integrated platforms
that combine multiple systems into a single product. The School
Management System is the primary example, because it is a vertical ERP
that integrates the academic, financial, communication, and reporting
functions, and because it can be extended with the LMS for the academic
content, the CRM for the admissions and alumni relations, the analytics
dashboard for the operational visibility, and the AI-powered application
for the smart features. This section provides the combination prompts
that direct the AI builder to build these integrated platforms.

[]{#_Toc100018 .anchor}**6.1 The Smart School Platform (School + LMS +
CRM + Analytics + AI)**

The Smart School Platform is the most comprehensive combination,
integrating the School Management System with the LMS, the CRM, the
analytics dashboard, and the AI-powered application into a single
platform that makes the school smarter, faster, and more innovative than
a traditional school. The platform is built as a modular system, with
each module consuming the relevant sections of the foundational
documents, and with the shared data backbone that connects them. The
following prompt directs the AI builder to build the Smart School
Platform.

+-----------------------------------------------------------------------+
| ROLE: You are a senior full-stack engineer building a Smart School    |
|                                                                       |
| Platform that integrates five systems into a single, unified platform |
|                                                                       |
| for a private school. This is the most comprehensive build in the     |
|                                                                       |
| playbook.                                                             |
|                                                                       |
| THE PLATFORM TO BUILD:                                                |
|                                                                       |
| \- Name: \[SCHOOL_NAME Smart Platform\]                               |
|                                                                       |
| \- Type: Integrated education platform (School ERP + LMS + CRM +      |
|                                                                       |
| Analytics + AI)                                                       |
|                                                                       |
| \- Target users: Administrators, teachers, parents, students, alumni, |
|                                                                       |
| finance staff, admissions staff                                       |
|                                                                       |
| \- Primary problem: Fragmented systems, manual processes, lack of     |
|                                                                       |
| real-time visibility, no AI assistance                                |
|                                                                       |
| \- Goal: A single platform that runs the entire school, from          |
| admissions                                                            |
|                                                                       |
| to alumni, with AI-powered insights and real-time analytics           |
|                                                                       |
| THE FIVE INTEGRATED MODULES:                                          |
|                                                                       |
| 1\. SCHOOL MANAGEMENT (Core ERP):                                     |
|                                                                       |
| \- Admissions, Student Information, Academic, Financial,              |
|                                                                       |
| Communication, Reporting, Administration                              |
|                                                                       |
| \- From Doc 1: Section 10 (ERP) + Section 14 (LMS) data models        |
|                                                                       |
| \- Manual processes replaced: paper attendance, handwritten           |
| gradebooks,                                                           |
|                                                                       |
| cash fees, phone-tree announcements                                   |
|                                                                       |
| 2\. LEARNING MANAGEMENT (LMS):                                        |
|                                                                       |
| \- Course content, lessons, assessments, progress tracking,           |
|                                                                       |
| certifications, SCORM/xAPI content                                    |
|                                                                       |
| \- From Doc 1: Section 14 (LMS) data model                            |
|                                                                       |
| \- Enables: online assignments, digital assessments, self-paced       |
| learning                                                              |
|                                                                       |
| 3\. CRM (Admissions + Alumni):                                        |
|                                                                       |
| \- Lead tracking (prospective students), contact management,          |
|                                                                       |
| opportunity management (enrollment pipeline), alumni relations        |
|                                                                       |
| \- From Doc 1: Section 9 (CRM) data model                             |
|                                                                       |
| \- Enables: structured admissions process, alumni engagement          |
|                                                                       |
| 4\. ANALYTICS DASHBOARD:                                              |
|                                                                       |
| \- Real-time dashboards for: attendance trends, academic performance, |
|                                                                       |
| financial health, enrollment funnel, teacher performance              |
|                                                                       |
| \- From Doc 1: Section 11 (Analytics) data model                      |
|                                                                       |
| \- Enables: data-driven decisions, early warning for at-risk students |
|                                                                       |
| 5\. AI-POWERED FEATURES:                                              |
|                                                                       |
| \- Automated attendance analytics (predict absenteeism patterns)      |
|                                                                       |
| \- Early warning system (identify at-risk students before they fail)  |
|                                                                       |
| \- Automated report card comments (teacher-assisted, not replaced)    |
|                                                                       |
| \- Parent query chatbot (answers common questions 24/7)               |
|                                                                       |
| \- Predictive enrollment (forecast next year\'s enrollment)           |
|                                                                       |
| \- From Doc 1: Section 12 (AI) data model                             |
|                                                                       |
| \- Enables: proactive intervention, personalized learning insights    |
|                                                                       |
| PHASE 1 --- DOCUMENT CONSUMPTION:                                     |
|                                                                       |
| Read from ALL six foundational documents:                             |
|                                                                       |
| \- Doc 1: Sections 7 (SaaS), 9 (CRM), 10 (ERP), 11 (Analytics),       |
|                                                                       |
| 12 (AI), 14 (LMS) --- the data models for all five modules.           |
|                                                                       |
| \- Doc 2: The school use case (Section 5) with the 7 core modules.    |
|                                                                       |
| \- Doc 3: The multi-database architecture (PostgreSQL for records,    |
|                                                                       |
| ClickHouse for analytics, Redis for cache, S3 for documents,          |
|                                                                       |
| pgvector for AI embeddings).                                          |
|                                                                       |
| \- Doc 4: The requirements engineering (use cases for all 5 modules), |
|                                                                       |
| the testing strategy (FERPA, WCAG 2.2 AA, SCORM conformance),         |
|                                                                       |
| the threat modeling (STRIDE for student data).                        |
|                                                                       |
| \- Doc 5: The concurrency (distributed lock for scheduling,           |
| idempotency                                                           |
|                                                                       |
| for payments), the multi-database (polyglot persistence with central  |
|                                                                       |
| data hub for student records), the scalability (load balancing for    |
|                                                                       |
| concurrent access).                                                   |
|                                                                       |
| \- Doc 6: The durable execution for long-running processes (report    |
| card                                                                  |
|                                                                       |
| generation, bulk notifications, AI model calls).                      |
|                                                                       |
| Produce a SYNTHESIS that includes:                                    |
|                                                                       |
| \(a\) The unified data model with the shared entities (Student, User, |
|                                                                       |
| School, AcademicYear) that connect all five modules.                  |
|                                                                       |
| \(b\) The process flows for the primary journeys:                     |
|                                                                       |
| \- Admissions journey (CRM lead -\> applicant -\> enrolled student)   |
|                                                                       |
| \- Daily operations (attendance -\> grading -\> parent notification)  |
|                                                                       |
| \- Financial journey (fee structure -\> invoice -\> payment -\>       |
| receipt)                                                              |
|                                                                       |
| \- Academic journey (enrollment -\> assessment -\> report card)       |
|                                                                       |
| \- AI journey (data collection -\> model inference -\> insight        |
| delivery)                                                             |
|                                                                       |
| \(c\) The multi-database architecture:                                |
|                                                                       |
| \- PostgreSQL: student records, financial, academic (source of truth) |
|                                                                       |
| \- ClickHouse: analytics events, attendance trends, performance       |
| metrics                                                               |
|                                                                       |
| \- Redis: sessions, cache, distributed locks, slot cache              |
|                                                                       |
| \- S3: documents, report cards, content packages                      |
|                                                                       |
| \- pgvector: AI embeddings for the smart features                     |
|                                                                       |
| \(d\) The central data hub for student records (role-based access:    |
|                                                                       |
| teacher sees their students, parent sees their children,              |
|                                                                       |
| admin sees all, auditor sees read-only).                              |
|                                                                       |
| \(e\) The FERPA compliance controls.                                  |
|                                                                       |
| \(f\) The AI guardrails (input/output filtering, evaluation harness,  |
|                                                                       |
| human handoff for sensitive decisions).                               |
|                                                                       |
| \(g\) The implementation roadmap (18-24 months, phased):              |
|                                                                       |
| \- Phase 1 (months 1-6): Core School Management (7 modules)           |
|                                                                       |
| \- Phase 2 (months 4-12): LMS integration (content, assessments)      |
|                                                                       |
| \- Phase 3 (months 8-15): CRM integration (admissions, alumni)        |
|                                                                       |
| \- Phase 4 (months 12-18): Analytics dashboard (real-time visibility) |
|                                                                       |
| \- Phase 5 (months 15-21): AI features (smart insights, chatbot)      |
|                                                                       |
| \- Phase 6 (months 18-24): Integration, hardening, launch             |
|                                                                       |
| CONSTRAINTS:                                                          |
|                                                                       |
| \- The Student entity is the shared backbone across all five modules. |
|                                                                       |
| \- The central data hub enforces role-based access to student data.   |
|                                                                       |
| \- FERPA compliance is non-negotiable.                                |
|                                                                       |
| \- The AI features have guardrails and an evaluation harness.         |
|                                                                       |
| \- The analytics dashboard updates in real-time (WebSocket).          |
|                                                                       |
| \- The system handles concurrent access by all user types.            |
|                                                                       |
| \- WCAG 2.2 AA on every page (parents, teachers, students).           |
|                                                                       |
| Begin with Phase 1. Read the documents and produce the synthesis.     |
+-----------------------------------------------------------------------+

[]{#_Toc100019 .anchor}**6.2 The Intelligent Business Platform (SaaS +
Analytics + AI)**

+-----------------------------------------------------------------------+
| ROLE: You are building an Intelligent Business Platform that combines |
|                                                                       |
| a multi-tenant SaaS with real-time analytics and AI-powered insights. |
|                                                                       |
| THE PLATFORM:                                                         |
|                                                                       |
| \- \[SAAS_FEATURE\] + \[ANALYTICS_DASHBOARD\] + \[AI_ASSISTANT\]      |
|                                                                       |
| \- Example: Project management SaaS + real-time productivity          |
| analytics +                                                           |
|                                                                       |
| AI assistant that drafts reports and predicts project risks           |
|                                                                       |
| Read from the docs:                                                   |
|                                                                       |
| \- Doc 1: Section 7 (SaaS) + Section 11 (Analytics) + Section 12 (AI) |
|                                                                       |
| \- Doc 3: Multi-database (PostgreSQL + ClickHouse + pgvector + Redis) |
|                                                                       |
| \- Doc 5: Scalability and multi-database architecture                 |
|                                                                       |
| \- Doc 6: Durable execution for AI model calls                        |
|                                                                       |
| Produce a synthesis covering:                                         |
|                                                                       |
| \(a\) The unified data model connecting the SaaS, analytics, and AI   |
| modules.                                                              |
|                                                                       |
| \(b\) The real-time analytics pipeline (events -\> ClickHouse -\>     |
| dashboard).                                                           |
|                                                                       |
| \(c\) The AI assistant integration (RAG on business data,             |
| guardrails).                                                          |
|                                                                       |
| \(d\) The multi-tenant isolation across all three modules.            |
|                                                                       |
| \(e\) The implementation roadmap (12-18 months).                      |
|                                                                       |
| Begin with Phase 1.                                                   |
+-----------------------------------------------------------------------+

[]{#_Toc100020 .anchor}**7. The Build Strategy: Sequencing and
Verification**

The build strategy is the plan that governs the sequence of prompts and
the verification of outputs, and it is the strategy that converts the
prompt templates into a working system. The strategy follows the
three-phase model from the second document, with the document
consumption protocol from the fifth document, and it is adapted to the
specific system being built. This section specifies the strategy, the
sequencing, and the verification, and it is the section that the builder
uses to plan the build from the first prompt to the final verification.

[]{#_Toc100021 .anchor}**7.1 The Prompt Sequence**

The prompt sequence is the order in which the builder issues the prompts
to the AI builder, and it follows the three-phase model. The first
prompt is the system-specific prompt from the previous sections, which
directs the AI builder to consume the documents and to produce the
synthesis. The builder reviews the synthesis, corrects any
misunderstanding, and approves it. The second prompt directs the AI
builder to produce the task list, which the builder reviews and
approves. The subsequent prompts, one per task, direct the AI builder to
implement each task, to run the verification gate, and to report the
result. The sequence continues until all tasks are complete and the
system meets the documented standard.

[]{#_Toc100022 .anchor}**7.2 The Verification Strategy**

The verification strategy is the set of checks that the builder runs
after each task to verify that the output meets the specification. The
strategy is documented in the fourth document\'s testing strategy
section, and it includes the unit tests, the integration tests, the
end-to-end tests, the contract tests, the security tests, the
accessibility tests, and the performance tests. The builder does not
accept a task as complete until the verification gate passes, and the
builder does not allow the AI builder to proceed past a failed gate. The
verification is the discipline that ensures the quality of the build,
and it is the discipline that distinguishes a directed build from an
undirected generation.

[]{#_Toc100023 .anchor}**7.3 The Failure Handling**

The failure handling is the process that the builder follows when a task
fails the verification gate, and it follows the graceful degradation
model from the sixth document. The first response to a failure is the
retry, where the AI builder is directed to fix the failure and to re-run
the gate, with a maximum of three retries. If the retry fails, the
builder escalates, either by taking over the task manually (the solo
builder takeover) or by re-prompting the AI builder with a more specific
instruction. If the AI builder is unavailable, the builder continues
with the solo execution, reading the pending tasks from the shared task
ledger and implementing them one by one. The failure handling is the
discipline that ensures the build continues regardless of the failures,
and it is the discipline that prevents the data loss and the
work-in-progress loss that a careless failure handling would produce.

[]{#_Toc100024 .anchor}**7.4 The Complete Build Workflow**

**Table 1: The Complete Build Workflow from First Prompt to Launch**

  -----------------------------------------------------------------------
  **Step**          **Action**        **Builder\'s      **AI Builder\'s
                                      Role**            Role**
  ----------------- ----------------- ----------------- -----------------
  1                 Upload the 6      Prepare the files ---
                    documents to the                    
                    project directory                   

  2                 Create CLAUDE.md  Write the context ---
                    / AGENTS.md       file              
                    context file                        

  3                 Issue the         Issue the prompt  Consume
                    system-specific                     documents,
                    first prompt                        produce synthesis

  4                 Review the        Review, correct,  Wait for approval
                    synthesis         approve           

  5                 Direct the AI     Issue the prompt  Decompose into
                    builder to                          tasks
                    produce the task                    
                    list                                

  6                 Review and        Review, approve   Wait for approval
                    approve the task                    
                    list                                

  7                 For each task:    Issue the prompt  Implement, run
                    issue the                           verification gate
                    implementation                      
                    prompt                              

  8                 Review the output Review, accept or Fix if rejected,
                    and the gate      reject            re-run gate
                    result                              

  9                 On failure: retry Escalate or take  Fix and retry
                    (max 3), then     over              
                    escalate                            

  10                After all tasks:  Run the suite     Fix any failures
                    run the full                        
                    verification                        
                    suite                               

  11                Deploy to         Deploy and test   Fix any failures
                    staging, run                        
                    integration tests                   

  12                Deploy to         Deploy and        Fix any
                    production with   monitor           production issues
                    gradual rollout                     
  -----------------------------------------------------------------------

*Table 1: The complete build workflow from the first prompt to the
production launch. The builder\'s role is the review and the approval;
the AI builder\'s role is the consumption, the implementation, and the
verification, directed by the prompts.*

[]{#_Toc100025 .anchor}**8. Counterarguments and Limitations**

The recommendations in this report are subject to several
counterarguments and limitations. The first counterargument is that the
prompt templates are too long and too detailed, and that an AI builder
can produce a working system with a shorter, simpler prompt. This
argument is valid for a prototype, where the goal is to test an idea
rather than to build a production system. The argument fails for a
commercial system, because the detail in the prompt is the detail that
prevents the AI builder from improvising, from hallucinating components,
and from producing the AI-flag work that fails the credibility test. The
prompt length is the investment in the quality of the output, and the
return on the investment is the difference between a system that meets
the real-world standard and a system that does not.

The second counterargument is that the system-specific prompts are
redundant, because the master template can be adapted to any system by
the builder. This argument has merit, and the master template is indeed
the foundation. The system-specific prompts are provided because they
save the builder the effort of adapting the master template for each
system, and because they ensure that the system-specific content, the
data model, the process flows, and the constraints, are correctly
specified. A builder who is familiar with the master template can adapt
it, but a builder who is starting will benefit from the system-specific
prompts as the starting points.

The third counterargument is that the advanced combination prompts,
particularly the Smart School Platform, are too ambitious for a single
build, and that a builder who attempts them will fail. This argument is
valid in the sense that the Smart School Platform is a large build, but
the argument misses the point. The combination prompt is not a single
build; it is a phased build, with the implementation roadmap specifying
the phases and the dependencies. The builder executes the phases
sequentially, with each phase producing a working subset of the
platform, and the combination prompt is the prompt that directs the
overall build, not the prompt that builds everything at once. The
recommendation is to use the combination prompt as the master plan and
to execute the phases as the individual builds.

A limitation is that the prompt templates are written for the 2026 AI
builders, and the builders and the models are evolving rapidly. A
builder using the templates in a later period should verify that the
recommendations, particularly the stack selection and the tool
recommendations, are still current, and should adapt the templates to
the specific capabilities of the builder and the model being used. The
templates are the starting point, not the final word, and the builder\'s
judgment is the ultimate guide.

[]{#_Toc100026 .anchor}**9. Conclusion and Strategic Implications**

The question that opened this report was how a builder takes the six
documents and uses them with an AI builder to construct the desired
system, and what to prompt to start the build. The document has provided
the loading instructions, the master prompt template, the
system-specific prompts for each of the eight system categories, the
advanced combination prompts for the integrated platforms, and the build
strategy that governs the sequencing and the verification. The central
value is that the document converts the six-document playbook from a
reference into an actionable sequence of prompts, and it is the document
that a builder uses at the keyboard to direct the AI builder to produce
the system.

The strategic implication is that the seven documents, the foundation,
the prompt guide, the stack guide, the operational excellence guide, the
scalability guide, the multi-agent guide, and this prompt template
library, together constitute the complete playbook that a builder uses
to direct an AI builder to construct a production-grade system. The
first six documents are the specification; this seventh document is the
operation. A builder who loads the six documents as context, who uses
the loading instructions and the context file from this document, and
who issues the system-specific prompts from this document, will direct
the AI builder to produce a system that meets the real-world standard,
that does not exhibit the integration conflicts, that does not fail the
security audits, and that generates the revenue that justifies the
build.

The closing recommendation is therefore the following. A builder who
intends to direct an AI builder to construct a production-grade system
should place the seven documents in the project directory, should create
the context file that lists them, should select the system-specific
prompt that matches the system being built, should adapt the bracketed
sections to the specific requirements, and should issue the prompt as
the first message to the AI builder. The builder should follow the
three-phase model, should review and approve each phase\'s output, and
should enforce the verification gate after every task. The discipline of
the seven documents and the prompt architecture is the discipline that
produces a system that meets the real-world standard, and this document
is the seventh that makes the playbook actionable.

[]{#_Toc100027 .anchor}**10. References**

The following sources informed the analysis presented in this report.
Sources are listed in the order of first citation. All URLs were
accessible at the time of writing; readers verifying specific claims
should consult the cited source directly.

**\[1\]** Builder.io. How I Use Claude Code (+ My Best Tips).
[[https://www.builder.io/blog/claude-code]{.underline}](https://www.builder.io/blog/claude-code)

**\[2\]** Cursor Forum. How Are People Handling Context Across Different
AI Coding Tools?
[[https://forum.cursor.com/t/how-are-people-handling-context-across-different-ai-coding-tools/159891]{.underline}](https://forum.cursor.com/t/how-are-people-handling-context-across-different-ai-coding-tools/159891)

**\[3\]** Hannah Stulberg (Substack). CLAUDE.md Guide: How to Write
Context Files.
[[https://hannahstulberg.substack.com/p/claude-code-for-everything-the-best-personal-assistant-remembers-everything-about-you]{.underline}](https://hannahstulberg.substack.com/p/claude-code-for-everything-the-best-personal-assistant-remembers-everything-about-you)

**\[4\]** Reddit / ClaudeAI. Best Way to Use Claude Projects for Coding.
[[https://www.reddit.com/r/ClaudeAI/comments/1efy6yf/best_way_to_use_claude_projects_for_coding_one]{.underline}](https://www.reddit.com/r/ClaudeAI/comments/1efy6yf/best_way_to_use_claude_projects_for_coding_one)

**\[5\]** Addy Osmani (Medium). My LLM Coding Workflow Going into 2026.
[[https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e]{.underline}](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)

**\[6\]** SurePrompts. The Complete Guide to Prompting AI Coding Agents
(2026).
[[https://sureprompts.com/blog/the-complete-guide-to-prompting-ai-coding-agents-2026]{.underline}](https://sureprompts.com/blog/the-complete-guide-to-prompting-ai-coding-agents-2026)

**\[7\]** Tezeract. School Management Software Development (May 2026).
[[https://tezeract.ai]{.underline}](https://tezeract.ai)

**\[8\]** ProjectWorlds. AI Powered Smart School --- School Management
System (March 2026).
[[https://projectworlds.com]{.underline}](https://projectworlds.com)

**\[9\]** AgileSoftLabs. Complete Guide to AI School Management Systems
2026.
[[https://www.agilesoftlabs.com]{.underline}](https://www.agilesoftlabs.com)

**\[10\]** SmartSchoolERP. Smart School ERP Latest Version --- Advanced
AI & Smart Features (January 2026).
[[https://www.smartschoolerp.com]{.underline}](https://www.smartschoolerp.com)

**\[11\]** Anthropic. Effective Context Engineering for AI Agents.
[[https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents]{.underline}](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
