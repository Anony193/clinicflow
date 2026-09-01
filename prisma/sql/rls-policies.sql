-- ============================================================
-- ClinicFlow — Row-Level Security Policies (PostgreSQL)
-- ADR-0001 — the canonical production RLS text
--
-- Apply after running prisma migrate:
--   psql $DATABASE_URL -f prisma/sql/rls-policies.sql
--
-- This enforces tenant isolation at the DATABASE level, so even if
-- the application code omits a WHERE tenant_id = ... clause, the
-- database itself filters results to the current tenant.
--
-- The app sets the tenant context at the start of each transaction:
--   SET LOCAL app.current_tenant_id = '[tenant_id]';
-- ============================================================

-- Enable the extension for UUID type (already enabled by Prisma)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Function to safely get the current tenant ID
-- Returns NULL if not set (which would block all tenant-scoped queries)
-- ============================================================
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- Apply RLS to every tenant-scoped table
-- ============================================================

-- Helper macro: enable RLS + create policy for a table
CREATE OR REPLACE FUNCTION enable_tenant_rls(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
  EXECUTE format('
    CREATE POLICY tenant_isolation ON %I
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id())
  ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Platform tables
SELECT enable_tenant_rls('users');
SELECT enable_tenant_rls('sessions');
SELECT enable_tenant_rls('subscriptions');
SELECT enable_tenant_rls('invoices');
SELECT enable_tenant_rls('audit_events');
SELECT enable_tenant_rls('feature_flags');
SELECT enable_tenant_rls('integrations');

-- Domain entities
SELECT enable_tenant_rls('patients');
SELECT enable_tenant_rls('appointments');
SELECT enable_tenant_rls('appointment_types');
SELECT enable_tenant_rls('soap_notes');
SELECT enable_tenant_rls('treatment_plans');
SELECT enable_tenant_rls('exercises');
SELECT enable_tenant_rls('exercise_prescriptions');
SELECT enable_tenant_rls('insurance_plans');
SELECT enable_tenant_rls('fee_schedules');
SELECT enable_tenant_rls('claims');
SELECT enable_tenant_rls('payments');
SELECT enable_tenant_rls('statements');
SELECT enable_tenant_rls('payment_plans');
SELECT enable_tenant_rls('encounters');
SELECT enable_tenant_rls('outcome_measures');
SELECT enable_tenant_rls('rooms');
SELECT enable_tenant_rls('resources');
SELECT enable_tenant_rls('availability');
SELECT enable_tenant_rls('waitlist');
SELECT enable_tenant_rls('messages');
SELECT enable_tenant_rls('notifications');
SELECT enable_tenant_rls('reminders');
SELECT enable_tenant_rls('reports');
SELECT enable_tenant_rls('intake_forms');

-- Infrastructure tables
SELECT enable_tenant_rls('outbox');
SELECT enable_tenant_rls('locks');
SELECT enable_tenant_rls('idempotency_records');

-- ============================================================
-- AuditEvent: append-only (no UPDATE or DELETE)
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_audit_event_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditEvent is append-only — UPDATE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_audit_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditEvent is append-only — DELETE is not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_audit_event
  BEFORE UPDATE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_event_update();

CREATE TRIGGER no_delete_audit_event
  BEFORE DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_event_delete();

-- ============================================================
-- Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE OR REPLACE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    ', t);
  END LOOP;
END;
$$;

-- ============================================================
-- Full-text search indexes for patient search
-- ============================================================
CREATE INDEX IF NOT EXISTS patients_name_trgm ON patients
  USING GIN (first_name gin_trgm_ops, last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS patients_email_trgm ON patients
  USING GIN (email gin_trgm_ops);

-- ============================================================
-- Verify RLS is enabled
-- ============================================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;
