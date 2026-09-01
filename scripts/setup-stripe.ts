#!/usr/bin/env bun
/**
 * ClinicFlow — Stripe Setup Script
 *
 * Creates Stripe products + prices for ClinicFlow subscriptions:
 *   - Therapist Seat: $49/month
 *   - Support Staff Seat: $19/month
 *   - Patient Portal: Free ($0/month, for reference)
 *
 * Also creates a webhook endpoint and returns the signing secret.
 *
 * Usage:
 *   1. Get your Stripe TEST MODE secret key from https://dashboard.stripe.com/test/apikeys
 *   2. Run: STRIPE_SECRET_KEY=sk_test_xxx bun scripts/setup-stripe.ts
 *   3. Copy the output to your .env file
 *
 * To switch to LIVE mode:
 *   - Use your LIVE secret key (sk_live_xxx)
 *   - Re-run this script
 *   - Update the webhook endpoint to your production URL
 */

import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error('❌ STRIPE_SECRET_KEY is required');
  console.error('   Get your test key from: https://dashboard.stripe.com/test/apikeys');
  console.error('   Run: STRIPE_SECRET_KEY=sk_test_xxx bun scripts/setup-stripe.ts');
  process.exit(1);
}

const stripe = new Stripe(apiKey, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
});

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-domain.com/api/webhooks/stripe';

async function main() {
  console.log('🔧 Setting up Stripe for ClinicFlow...\n');

  // ─── 1. Create Products ──────────────────────────────────
  console.log('1. Creating products...');

  const therapistProduct = await stripe.products.create({
    name: 'ClinicFlow — Therapist Seat',
    description: 'Full clinical documentation, SOAP notes, outcome measures, exercise prescription. Per therapist per month.',
  });
  console.log(`   ✅ Therapist product: ${therapistProduct.id}`);

  const supportProduct = await stripe.products.create({
    name: 'ClinicFlow — Support Staff Seat',
    description: 'Scheduling, billing, claims, payment posting. Per support staff per month.',
  });
  console.log(`   ✅ Support product: ${supportProduct.id}`);

  const portalProduct = await stripe.products.create({
    name: 'ClinicFlow — Patient Portal (Free)',
    description: 'Self-service booking, secure messaging, bill pay, intake forms. Free for all clinics.',
  });
  console.log(`   ✅ Portal product: ${portalProduct.id}`);

  // ─── 2. Create Prices ────────────────────────────────────
  console.log('\n2. Creating prices...');

  const therapistPrice = await stripe.prices.create({
    product: therapistProduct.id,
    unit_amount: 4900, // $49.00
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Therapist Seat — Monthly',
  });
  console.log(`   ✅ Therapist price: ${therapistPrice.id} ($49/month)`);

  const supportPrice = await stripe.prices.create({
    product: supportProduct.id,
    unit_amount: 1900, // $19.00
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Support Staff Seat — Monthly',
  });
  console.log(`   ✅ Support price: ${supportPrice.id} ($19/month)`);

  const portalPrice = await stripe.prices.create({
    product: portalProduct.id,
    unit_amount: 0, // Free
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Patient Portal — Free',
  });
  console.log(`   ✅ Portal price: ${portalPrice.id} (Free)`);

  // ─── 3. Create Webhook Endpoint ──────────────────────────
  console.log('\n3. Creating webhook endpoint...');

  let webhookSecret = '';
  try {
    const webhook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: [
        'invoice.paid',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'checkout.session.completed',
        'payment_intent.payment_failed',
      ],
      description: 'ClinicFlow webhook — subscription billing + patient payments',
    });
    webhookSecret = webhook.secret;
    console.log(`   ✅ Webhook endpoint: ${webhook.url}`);
    console.log(`   ✅ Webhook signing secret: ${webhookSecret}`);
  } catch (error) {
    console.log(`   ⚠️  Could not create webhook (URL may not be live yet): ${error}`);
    console.log('   You can create it manually at: https://dashboard.stripe.com/webhooks');
    console.log('   Events to listen for:');
    console.log('     - invoice.paid');
    console.log('     - customer.subscription.updated');
    console.log('     - customer.subscription.deleted');
    console.log('     - checkout.session.completed');
    console.log('     - payment_intent.payment_failed');
  }

  // ─── 4. Output .env configuration ────────────────────────
  console.log('\n==========================================');
  console.log('✅ Stripe setup complete!');
  console.log('==========================================');
  console.log('\nAdd these to your .env file:\n');
  console.log(`# Stripe Configuration`);
  console.log(`BILLING_ADAPTER=stripe`);
  console.log(`STRIPE_SECRET_KEY=${apiKey}`);
  if (webhookSecret) {
    console.log(`STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
  }
  console.log(`STRIPE_THERAPIST_PRICE_ID=${therapistPrice.id}`);
  console.log(`STRIPE_SUPPORT_PRICE_ID=${supportPrice.id}`);
  console.log(`STRIPE_PORTAL_PRICE_ID=${portalPrice.id}`);
  console.log('');

  // Also update the database seed with the price IDs
  console.log('To update the database with these price IDs, run:');
  console.log(`  bun -e "`);
  console.log(`    const { PrismaClient } = require('@prisma/client');`);
  console.log(`    const db = new PrismaClient();`);
  console.log(`    (async () => {`);
  console.log(`      await db.plan.update({ where: { key: 'therapist' }, data: { stripePriceId: '${therapistPrice.id}' } });`);
  console.log(`      await db.plan.update({ where: { key: 'support' }, data: { stripePriceId: '${supportPrice.id}' } });`);
  console.log(`      await db.plan.update({ where: { key: 'portal' }, data: { stripePriceId: '${portalPrice.id}' } });`);
  console.log(`      await db.\$disconnect();`);
  console.log(`    })();`);
  console.log(`  "`);
}

main().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});
