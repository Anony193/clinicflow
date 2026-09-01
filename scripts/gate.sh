#!/usr/bin/env bash
# ============================================================
# ClinicFlow — Verification Gate Script
#
# Runs all gates that must pass before merge (Constraint #10).
# Used by CI/CD and can be run locally: bash scripts/gate.sh
# ============================================================

set -euo pipefail

echo "=========================================="
echo "ClinicFlow — Verification Gate"
echo "=========================================="
echo ""

FAILED=0

run_check() {
  local name="$1"
  local cmd="$2"
  echo "▶ $name..."
  if eval "$cmd" 2>&1 | tail -3; then
    echo "  ✅ PASS"
  else
    echo "  ❌ FAIL"
    FAILED=1
  fi
  echo ""
}

# 1. Lint
run_check "ESLint" "bun run lint"

# 2. Type-check
run_check "TypeScript" "bunx tsc --noEmit"

# 3. Unit tests
run_check "Unit Tests" "bunx vitest run tests/unit/ --reporter=dot"

# 4. Isolation tests
run_check "Cross-Tenant Isolation" "bunx vitest run tests/isolation/ --reporter=dot"

# 5. Build (only if not in CI — CI runs its own build)
if [ "${CI:-}" != "true" ]; then
  run_check "Production Build" "bun run build"
fi

echo "=========================================="
if [ $FAILED -eq 0 ]; then
  echo "✅ ALL GATES PASSED"
else
  echo "❌ SOME GATES FAILED — fix before merge"
fi
echo "=========================================="
exit $FAILED
