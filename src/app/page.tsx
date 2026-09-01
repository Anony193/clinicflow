import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  FileText,
  CreditCard,
  Users,
  Activity,
  Stethoscope,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Star,
  Zap,
  Bell,
  MessageSquare,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "ClinicFlow — Practice management built for independent PT clinics",
  description:
    "ClinicFlow unifies scheduling, SOAP notes, billing, and insurance claims in one platform purpose-built for independent physical therapy clinics. Per-seat pricing from $49/therapist/month. Patient portal free.",
  keywords: [
    "physical therapy software",
    "PT clinic management",
    "SOAP notes",
    "CMS-1500 claims",
    "practice management",
    "ClinicFlow",
  ],
  openGraph: {
    title: "ClinicFlow — Practice management for independent PT clinics",
    description:
      "Scheduling, SOAP notes, billing, and claims in one integrated platform. $49/therapist/month. Patient portal free.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-grain">
      <LandingNav />

      <main className="flex-1">
        {/* ============================================================
            1. HERO
            ============================================================ */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden border-b border-border"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background"
          />
          <div className="container-prose py-20 sm:py-28 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div className="flex flex-col gap-6">
                <Badge
                  variant="secondary"
                  className="w-fit gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  Purpose-built for independent PT clinics
                </Badge>
                <h1
                  id="hero-heading"
                  className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl"
                >
                  Run your physical therapy clinic{" "}
                  <span className="text-primary">on one platform</span>, not five.
                </h1>
                <p className="text-md text-muted-foreground leading-relaxed max-w-xl">
                  ClinicFlow unifies scheduling, clinical documentation, billing,
                  and insurance claims into a single HIPAA-ready system —
                  designed for the 1–10 therapist independent practice, not the
                  enterprise.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="motion-base">
                    <Link href="/login" className="gap-2">
                      Start free trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="motion-base">
                    <Link href="#how-it-works">See how it works</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    14-day free trial
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Free patient portal
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="relative rounded-xl border border-border bg-card p-2 elevation-3 motion-slow">
                  <img
                    src="/hero-illustration.png"
                    alt="Illustration of the ClinicFlow platform connecting scheduling, documentation, billing, and patient communication"
                    className="w-full rounded-lg aspect-[16/9] object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. SOCIAL PROOF
            ============================================================ */}
        <section aria-label="Social proof" className="border-b border-border">
          <div className="container-prose py-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                    aria-hidden
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  Built for independent PT clinics
                </span>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  { label: "Per therapist", value: "$49/mo" },
                  { label: "Per support staff", value: "$19/mo" },
                  { label: "Patient portal", value: "Free" },
                  { label: "Free trial", value: "14 days" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. PROBLEM
            ============================================================ */}
        <section
          aria-labelledby="problem-heading"
          className="border-b border-border bg-muted/30"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="outline" className="mb-4 text-xs">
                The problem
              </Badge>
              <h2
                id="problem-heading"
                className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
              >
                Independent PT clinics are drowning in disconnected tools
              </h2>
              <p className="text-md text-muted-foreground">
                The average 1–10 therapist clinic runs on four or five tools
                that don&apos;t talk to each other. The result is wasted time,
                missed revenue, and a frustrating patient experience.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Clock,
                  title: "Double data entry",
                  body: "Patient demographics, visit details, and CPT codes re-keyed across scheduling, documentation, and billing — costing each therapist 30–60 minutes of unpaid admin per day.",
                },
                {
                  icon: CalendarClock,
                  title: "Missed appointments",
                  body: "Reminders live in a tool disconnected from the schedule. No-show rates at independent clinics run 8–12%, directly hitting revenue.",
                },
                {
                  icon: CreditCard,
                  title: "Delayed insurance claims",
                  body: "Documentation completion is not coupled to the billing calendar. Claims lag 3–10 days behind the visit, stretching cash conversion.",
                },
                {
                  icon: MessageSquare,
                  title: "Poor patient experience",
                  body: "Patients call to book, fill out paper intake at the front desk, and can&apos;t find their exercise handouts or pay bills online.",
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="motion-base hover:elevation-2 border-border"
                >
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
                      <item.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <CardTitle className="text-md mt-3">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            4. SOLUTION
            ============================================================ */}
        <section
          aria-labelledby="solution-heading"
          className="border-b border-border"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="outline" className="mb-4 text-xs">
                The solution
              </Badge>
              <h2
                id="solution-heading"
                className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
              >
                One integrated system for the entire clinical workflow
              </h2>
              <p className="text-md text-muted-foreground">
                ClinicFlow connects the clinical side (SOAP notes, treatment
                plans, outcome measures) with the business side (scheduling,
                billing, claims, patient communication) — purpose-built for
                physical therapy.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            5. FEATURES (detailed)
            ============================================================ */}
        <section
          aria-labelledby="features-heading"
          className="border-b border-border bg-muted/30"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2
                id="features-heading"
                className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
              >
                Everything your clinic needs, nothing it doesn&apos;t
              </h2>
              <p className="text-md text-muted-foreground">
                Six integrated modules replace the four or five tools you use
                today — and they actually share data.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: CalendarClock,
                  title: "Appointment scheduling",
                  body: "Therapist & room availability, appointment types, recurring visits, waitlist, and automated email + SMS reminders — all on one calendar.",
                  points: ["Distributed lock prevents double-booking", "Self-service patient portal booking", "Recurring & waitlist automation"],
                },
                {
                  icon: FileText,
                  title: "Clinical documentation",
                  body: "Structured SOAP notes, treatment plans, and PT outcome measures (DASH, Oswestry, KOOS) with built-in scoring and trend tracking.",
                  points: ["Optimistic locking prevents lost edits", "Autosave with version history", "Outcome measure trend charts"],
                },
                {
                  icon: CreditCard,
                  title: "Billing & insurance claims",
                  body: "Fee schedules, CMS-1500 claim generation, clearinghouse submission, payment posting, and patient statements — end to end.",
                  points: ["Idempotent claim submission", "Circuit breaker on clearinghouse", "Payment plans & statements"],
                },
                {
                  icon: Users,
                  title: "Patient management",
                  body: "Demographics, insurance, medical history, consent forms, and treatment plans — one record per patient, shared across modules.",
                  points: ["HIPAA-compliant PHI storage", "Full audit trail of every access", "Consent form upload to R2"],
                },
                {
                  icon: Activity,
                  title: "Outcome measures",
                  body: "Built-in scoring for DASH, Oswestry, and KOOS. Track patient progress over time and demonstrate value to referral sources.",
                  points: ["Standardized PT PROMs", "Automatic score calculation", "Trend visualization"],
                },
                {
                  icon: MessageSquare,
                  title: "Patient portal",
                  body: "Self-service booking, secure messaging with the therapist, exercise programs, bill pay, and intake forms — free for clinics.",
                  points: ["Free for every plan", "Secure PHI messaging", "Online bill pay via Stripe"],
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="motion-base hover:elevation-2 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-md mt-3">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.body}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <ul className="flex flex-col gap-2">
                      {feature.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            6. HOW IT WORKS
            ============================================================ */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          className="border-b border-border"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <h2
                id="how-heading"
                className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
              >
                From intake to paid claim, in one workflow
              </h2>
              <p className="text-md text-muted-foreground">
                Each step feeds the next. No re-keying, no exports, no
                spreadsheet round-trips.
              </p>
            </div>
            <div className="relative">
              {/* vertical connector line */}
              <div
                aria-hidden
                className="absolute left-5 top-2 bottom-2 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
              />
              <ol className="flex flex-col gap-10">
                {[
                  {
                    step: "01",
                    icon: Users,
                    title: "Patient intake",
                    body: "Patient completes intake forms in the portal. Demographics, insurance, and medical history land directly on the patient record — no paper, no re-entry.",
                  },
                  {
                    step: "02",
                    icon: CalendarClock,
                    title: "Book appointment",
                    body: "Front desk or patient books via the portal. The system checks therapist and room availability, acquires a distributed lock, and confirms — no double-booking.",
                  },
                  {
                    step: "03",
                    icon: Bell,
                    title: "Automated reminders",
                    body: "Email + SMS reminders fire 24 hours and 2 hours before the visit, reducing missed appointments.",
                  },
                  {
                    step: "04",
                    icon: Stethoscope,
                    title: "SOAP note & outcomes",
                    body: "Therapist completes the SOAP note in the appointment context. Outcome measures (DASH/KOOS/Oswestry) score automatically and append to the trend.",
                  },
                  {
                    step: "05",
                    icon: FileText,
                    title: "Claim generation",
                    body: "CPT and ICD codes derive from the SOAP note and appointment type. The CMS-1500 claim generates with one click, fee schedule applied.",
                  },
                  {
                    step: "06",
                    icon: CreditCard,
                    title: "Submit & get paid",
                    body: "Claim submits to the clearinghouse via a circuit-breaker-wrapped queue. Payment posting applies remits. Patient statements generate automatically for balances.",
                  },
                ].map((item, idx) => (
                  <li
                    key={item.step}
                    className={`relative flex gap-6 sm:gap-8 ${
                      idx % 2 === 1 ? "sm:flex-row-reverse sm:text-right" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary text-xs font-bold text-primary elevation-1">
                        {item.step}
                      </div>
                    </div>
                    <div
                      className={`flex-1 sm:w-1/2 ${
                        idx % 2 === 1 ? "sm:pl-8" : "sm:pr-8"
                      }`}
                    >
                      <Card className="motion-base hover:elevation-2">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-primary" />
                            <CardTitle className="text-md">{item.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.body}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============================================================
            7. PRICING
            ============================================================ */}
        <section
          aria-labelledby="pricing-heading"
          className="border-b border-border bg-muted/30"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <Badge variant="outline" className="mb-4 text-xs">
                Simple, transparent pricing
              </Badge>
              <h2
                id="pricing-heading"
                className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
              >
                Pay per seat. Patient portal is always free.
              </h2>
              <p className="text-md text-muted-foreground">
                No setup fees, no long contracts. Cancel anytime. Stripe
                handles proration automatically when you add or remove seats.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
              {/* Therapist */}
              <Card className="motion-base hover:elevation-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                <CardHeader>
                  <CardTitle className="text-md">Therapist seat</CardTitle>
                  <CardDescription>For PTs and PTAs</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight">$49</span>
                    <span className="text-sm text-muted-foreground"> /month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {[
                      "Full clinical documentation",
                      "SOAP notes & treatment plans",
                      "Outcome measures (DASH/KOOS/Oswestry)",
                      "Exercise prescription library",
                      "Calendar & scheduling",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full mt-6 motion-base">
                    <Link href="/login">Start free trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Support staff — highlighted */}
              <Card className="motion-base hover:elevation-3 relative overflow-hidden border-primary elevation-2">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                <Badge className="absolute -top-px right-4 rounded-b-sm rounded-t-none">
                  Most flexible
                </Badge>
                <CardHeader>
                  <CardTitle className="text-md">Support staff seat</CardTitle>
                  <CardDescription>For front desk & billing</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight">$19</span>
                    <span className="text-sm text-muted-foreground"> /month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {[
                      "Scheduling & patient management",
                      "Insurance claim generation",
                      "CMS-1500 clearinghouse submission",
                      "Payment posting & statements",
                      "Reporting & analytics",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full mt-6 motion-base">
                    <Link href="/login">Start free trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Patient portal */}
              <Card className="motion-base hover:elevation-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40" />
                <CardHeader>
                  <CardTitle className="text-md">Patient portal</CardTitle>
                  <CardDescription>For your patients</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight">Free</span>
                    <span className="text-sm text-muted-foreground"> always</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {[
                      "Self-service appointment booking",
                      "Secure messaging with therapist",
                      "Exercise programs & handouts",
                      "Online bill pay (Stripe)",
                      "Digital intake forms",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full mt-6 motion-base"
                  >
                    <Link href="/login">Included in every plan</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-8">
              All plans include HIPAA-compliant PHI storage, audit logging, and
              99.9% uptime SLA. BAAs in place with all subprocessors.
            </p>
          </div>
        </section>

        {/* ============================================================
            8. TRUST / SECURITY
            ============================================================ */}
        <section
          aria-labelledby="trust-heading"
          className="border-b border-border"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div>
                <Badge variant="outline" className="mb-4 text-xs">
                  Security & compliance
                </Badge>
                <h2
                  id="trust-heading"
                  className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
                >
                  Built for HIPAA from day one
                </h2>
                <p className="text-md text-muted-foreground mb-6 leading-relaxed">
                  Patient health information is encrypted at rest (AES-256) and
                  in transit (TLS 1.3). Every PHI access is logged. Business
                  Associate Agreements are in place with every subprocessor.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: ShieldCheck, label: "AES-256 at rest" },
                    { icon: ShieldCheck, label: "TLS 1.3 in transit" },
                    { icon: ShieldCheck, label: "PHI access audit log" },
                    { icon: ShieldCheck, label: "BAAs with all subprocessors" },
                    { icon: ShieldCheck, label: "WCAG 2.2 AA conformant" },
                    { icon: ShieldCheck, label: "SOC 2 Type II in progress" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <item.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="elevation-2">
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Architecture highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <span className="font-medium text-foreground">Multi-tenant isolation.</span>{" "}
                    Every query is scoped to your clinic at the database level.
                    Cross-tenant access is impossible by design — verified by
                    automated isolation tests.
                  </p>
                  <Separator />
                  <p>
                    <span className="font-medium text-foreground">Concurrency-safe booking.</span>{" "}
                    A distributed lock and idempotency keys guarantee that two
                    patients can never book the same slot, and network retries
                    never create duplicate appointments.
                  </p>
                  <Separator />
                  <p>
                    <span className="font-medium text-foreground">Durable claims pipeline.</span>{" "}
                    Claims flow through an outbox + durable execution runtime
                    with automatic retry — a clearinghouse outage never loses a
                    claim.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ============================================================
            9. FAQ
            ============================================================ */}
        <section
          aria-labelledby="faq-heading"
          className="border-b border-border bg-muted/30"
        >
          <div className="container-prose py-20 sm:py-24">
            <div className="max-w-2xl mx-auto">
              <h2
                id="faq-heading"
                className="text-2xl font-bold tracking-tight sm:text-2xl mb-10 text-center"
              >
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible className="flex flex-col gap-3">
                {[
                  {
                    q: "Is ClinicFlow really built for physical therapy specifically?",
                    a: "Yes. Unlike horizontal tools (Jane, Cliniko) that serve many disciplines, ClinicFlow ships with PT-specific SOAP templates, the DASH/Oswestry/KOOS outcome measures, common PT CPT codes (97110, 97140, 97161–97164, 97530), and CMS-1500 claim generation. You won't configure a single thing to start charting PT visits.",
                  },
                  {
                    q: "How is this different from WebPT or Raintree?",
                    a: "WebPT and Raintree are built for 10+ therapist hospital-affiliated clinics — they cost $600–$1,500+/month per location and require multi-week onboarding. ClinicFlow is built for the 1–10 therapist independent practice: $49/therapist, $19/support staff, live in under an hour, no enterprise contract.",
                  },
                  {
                    q: "What about my existing data?",
                    a: "We support CSV import of patients, appointments, and fee schedules. For larger migrations (e.g., from WebPT), our team handles the data mapping and import at no cost during onboarding.",
                  },
                  {
                    q: "Is the patient portal really free?",
                    a: "Yes — for every plan, on every tier. There are no per-patient fees, no portal seat fees, no message volume limits within reason. We believe the portal reduces your no-show rate and front-desk load; charging for it would be counterproductive.",
                  },
                  {
                    q: "How do you handle insurance claim submission?",
                    a: "ClinicFlow generates CMS-1500 claims from completed SOAP notes and submits them to your clearinghouse (Office Ally is our default partner, others supported). The submission pipeline is durable — if the clearinghouse is down, claims queue and retry automatically. Claim status (submitted/accepted/paid/denied) syncs back into the patient record.",
                  },
                  {
                    q: "Is my data HIPAA-compliant?",
                    a: "Yes. PHI is encrypted at rest (AES-256) and in transit (TLS 1.3). Every PHI access is logged immutably. We sign Business Associate Agreements with every subprocessor (AWS, Stripe, Clerk, our email/SMS providers). You can export or delete all patient data on request for HIPAA data-subject rights compliance.",
                  },
                  {
                    q: "Can I cancel anytime?",
                    a: "Yes. No long contracts. Cancel from the admin panel and we prorate the unused portion of your billing period via Stripe. You can export all your data (patients, appointments, notes, claims) as CSV or PDF before you go.",
                  },
                ].map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="border border-border rounded-lg px-4 bg-card elevation-1"
                  >
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ============================================================
            10. CTA
            ============================================================ */}
        <section aria-labelledby="cta-heading" className="border-b border-border">
          <div className="container-prose py-20 sm:py-28">
            <Card className="relative overflow-hidden elevation-3 border-primary/20">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background"
              />
              <CardContent className="py-12 sm:py-16 text-center">
                <h2
                  id="cta-heading"
                  className="text-2xl font-bold tracking-tight sm:text-2xl mb-4"
                >
                  Ready to consolidate your clinic&apos;s tools?
                </h2>
                <p className="text-md text-muted-foreground mb-8 max-w-xl mx-auto">
                  Start a 14-day free trial. No credit card required. We&apos;ll
                  migrate your patients and fee schedule at no cost.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <Button asChild size="lg" className="motion-base">
                    <Link href="/login" className="gap-2">
                      Start free trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="motion-base">
                    <Link href="#pricing">View pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
