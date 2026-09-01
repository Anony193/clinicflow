#!/usr/bin/env bash
# ============================================================
# ClinicFlow — Neon Database Setup Script
#
# Sets up a Neon PostgreSQL database with:
#   - Connection pooling (built-in)
#   - pgvector extension
#   - pg_trgm extension (fuzzy search)
#   - RLS policies on every tenant-scoped table
#
# Usage:
#   export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/clinicflow?sslmode=require"
#   export DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/clinicflow?sslmode=require"
#   bash scripts/db-setup-neon.sh
# ============================================================

set -euo pipefail

echo "=========================================="
echo "ClinicFlow — Neon Database Setup"
echo "=========================================="

# Check required env vars
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  echo "   Get your connection string from: https://neon.tech"
  echo "   Format: postgresql://user:pass@ep-xxx.neon.tech/clinicflow?sslmode=require"
  exit 1
fi

if [ -z "$DIRECT_URL" ]; then
  echo "⚠️  DIRECT_URL is not set — using DATABASE_URL as fallback"
  export DIRECT_URL="$DATABASE_URL"
fi

echo ""
echo "1. Swapping to production schema (PostgreSQL)..."
cp prisma/schema.production.prisma prisma/schema.prisma
echo "   ✅ schema.prisma is now PostgreSQL"

echo ""
echo "2. Generating Prisma client..."
bun run db:generate
echo "   ✅ Prisma client generated"

echo ""
echo "3. Pushing schema to Neon..."
bun run db:push
echo "   ✅ Schema pushed"

echo ""
echo "4. Applying RLS policies..."
psql "$DIRECT_URL" -f prisma/sql/rls-policies.sql
echo "   ✅ RLS policies applied"

echo ""
echo "5. Running seed..."
bun prisma/seed.ts
echo "   ✅ Seed data inserted"

echo ""
echo "=========================================="
echo "✅ Neon database setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  - Verify RLS: psql $DIRECT_URL -c \"SELECT tablename, rowsecurity FROM pg_tables WHERE rowsecurity = true;\""
echo "  - Run the app: bun run dev"
echo "  - Run isolation tests: bun run test:isolation"
