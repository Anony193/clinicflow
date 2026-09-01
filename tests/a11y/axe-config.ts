/**
 * axe-core Accessibility Audit Config (TASK-045, DOC4 §5)
 *
 * Automated WCAG 2.2 AA conformance check.
 * Zero violations required before release.
 *
 * Run: npx @axe-core/playwright tests/a11y/a11y-audit.ts
 * Or integrate into Playwright E2E tests.
 *
 * This file documents the axe configuration.
 * In CI, add: npx axe-core http://localhost:3000 --tags wcag2a,wcag2aa
 */

export const AXE_CONFIG = {
  // WCAG 2.2 AA rules (zero violations required)
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  },
  // Rules to check on every page
  rules: {
    'color-contrast': { enabled: true },         // 4.5:1 normal text, 3:1 large text
    'keyboard-navigation': { enabled: true },     // All interactive elements keyboard-accessible
    'focus-visible': { enabled: true },           // Focus indicator must be visible
    'aria-labels': { enabled: true },             // ARIA labels on interactive elements
    'heading-order': { enabled: true },           // h1 → h2 → h3 (no skips)
    'image-alt': { enabled: true },               // All images have alt text
    'label': { enabled: true },                   // All form fields have labels
    'landmark': { enabled: true },                // Page has main, nav, header, footer
    'tabindex': { enabled: true },                // No tabindex > 0
    'touch-target': { enabled: true },            // Min 44px touch targets (WCAG 2.5.5)
  },
};

/**
 * Pages to audit:
 *   / (landing)
 *   /login
 *   /app (dashboard)
 *   /app/patients
 *   /app/patients/new
 *   /app/schedule
 *   /app/soap-notes
 *   /app/reports
 *   /portal/login
 *   /portal/[patientId]
 *
 * Acceptance criteria: zero violations on all pages.
 */
export const PAGES_TO_AUDIT = [
  '/',
  '/login',
  '/app',
  '/app/patients',
  '/app/patients/new',
  '/app/schedule',
  '/app/soap-notes',
  '/app/reports',
  '/portal/login',
];
