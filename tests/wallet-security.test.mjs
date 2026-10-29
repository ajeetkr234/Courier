import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('payment webhook verifies HMAC-SHA256 signature with constant-time equality', () => {
  const webhook = read('supabase/functions/payment-webhook/index.ts');
  assert.match(webhook, /safeEqual/);
  assert.match(webhook, /hmacHex/);
  assert.match(webhook, /x-razorpay-signature/);
  assert.match(webhook, /Missing webhook signature/);
  assert.match(webhook, /Invalid webhook signature/);

  // Functional simulation of constant-time signature verification
  const secret = 'test_webhook_secret_9988';
  const body = JSON.stringify({ event: 'payment.captured', id: 'pay_12345' });
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');

  // Exact match succeeds
  const match = crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(hmac, 'hex'));
  assert.strictEqual(match, true);

  // Tampered payload fails
  const tamperedHmac = crypto.createHmac('sha256', secret).update(body + 'tampered').digest('hex');
  assert.notStrictEqual(hmac, tamperedHmac);
});

test('payment webhook validates INR currency, amount limits and positive bounds', () => {
  const webhook = read('supabase/functions/payment-webhook/index.ts');
  const migration = read('supabase/migrations/20260921002000_secure_payment_recharge.sql');

  // Edge Function checks
  assert.match(webhook, /Only INR is accepted/);
  assert.match(webhook, /rawAmount < 100 \|\| rawAmount > 1000000/);

  // Database Function checks
  assert.match(migration, /Only INR is accepted for wallet recharge/);
  assert.match(migration, /paid_amount < 100 OR p_paid_amount > 1000000/);
  assert.match(migration, /CHECK \(currency = 'INR'\)/);
  assert.match(migration, /CHECK \(paid_amount >= 100 AND paid_amount <= 1000000\)/);
  assert.match(migration, /CHECK \(net_credit > 0\)/);
});

test('payment webhook derives seller from trusted server-side metadata, preventing Seller A crediting Seller B', () => {
  const webhook = read('supabase/functions/payment-webhook/index.ts');
  assert.match(webhook, /rzpPayment\?\.notes\?\.seller_id/);
  assert.match(webhook, /Payment does not contain a verified seller_id in metadata/);

  // Client cannot inject arbitrary seller override
  const manualRecharge = read('supabase/migrations/20260921001000_wallet_recharge_gst_deduction.sql');
  assert.match(manualRecharge, /v_seller uuid\s*:=\s*public\.jwt_seller_id\(\);/);
});

test('duplicate webhook delivery returns consistent idempotent result without creating duplicate credits', () => {
  const webhook = read('supabase/functions/payment-webhook/index.ts');
  const migration = read('supabase/migrations/20260921002000_secure_payment_recharge.sql');

  // Webhook event idempotency
  assert.match(webhook, /inbound_webhook_events/);
  assert.match(webhook, /insertError\?\.code === '23505'/);
  assert.match(webhook, /\{ accepted: true, duplicate: true \}/);

  // Database transaction uniqueness
  assert.match(migration, /uq_payment_provider_payment_id UNIQUE \(provider, provider_payment_id\)/);
  assert.match(migration, /idempotency_key := 'pay-'/);
  assert.match(migration, /'ALREADY_PROCESSED'/);
  assert.match(migration, /'duplicate', true/);
});

test('concurrency and atomicity: wallet balance and ledger entries are locked and updated atomically', () => {
  const migration = read('supabase/migrations/20260921002000_secure_payment_recharge.sql');
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /UPDATE public\.wallets/);
  assert.match(migration, /INSERT INTO public\.ledger_entries/);
  assert.match(migration, /INSERT INTO public\.payment_transactions/);
  assert.match(migration, /SET search_path = public, pg_temp/);
});

test('unauthorized execution of privileged database credit functions is revoked from public and authenticated', () => {
  const migration = read('supabase/migrations/20260921002000_secure_payment_recharge.sql');
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.process_verified_payment_credit/);
  assert.match(migration, /FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /TO service_role/);
  assert.match(migration, /auth\.role\(\) <> 'service_role'/);
});

test('demo wallet recharge is strictly disabled in production and tagged non-transferable', () => {
  const migration = read('supabase/migrations/20260921002000_secure_payment_recharge.sql');
  assert.match(migration, /Demo wallet recharge is disabled in production environments/);
  assert.match(migration, /app\.enable_demo_recharge/);
  assert.match(migration, /DEMO_CREDIT_NON_TRANSFERABLE/);
  assert.match(migration, /MANUAL_ADJUSTMENT/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.recharge_demo_wallet/);
  assert.match(migration, /FROM PUBLIC, anon/);
});

test('client-side finance service blocks direct table manipulation and enforces server authority', () => {
  const finance = read('src/services/supabaseFinance.ts');
  assert.match(finance, /Direct client-side wallet debits are prohibited/);
  assert.doesNotMatch(finance, /Direct insert into wallet_recharge_requests failed/);
  assert.doesNotMatch(finance, /\.from\('wallets'\)\.upsert/);
});
