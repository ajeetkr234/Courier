import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('public rate and shipment APIs enforce scoped API-key authentication', () => {
  const auth = read('supabase/functions/_shared/api-key.ts');
  const rates = read('supabase/functions/rates-api/index.ts');
  const shipments = read('supabase/functions/shipments-api/index.ts');
  assert.match(auth, /key_hash/);
  assert.match(rates, /authenticateApiKey\(req, 'rates:read'\)/);
  assert.match(shipments, /authenticateApiKey\(req, req\.method === 'GET' \? 'orders:read' : 'shipments:write'\)/);
});

test('shipment booking recalculates server-side rates and requires idempotency', () => {
  const shipments = read('supabase/functions/shipments-api/index.ts');
  assert.match(shipments, /rate_slabs/);
  assert.match(shipments, /Idempotency-Key are required/);
  assert.doesNotMatch(shipments, /Number\(body\.shipping_cost/);
});

test('shipment events queue deduplicated WhatsApp and SMS deliveries', () => {
  const migration = read('supabase/migrations/20260918000000_shipfaster_public_api_notifications.sql');
  const worker = read('supabase/functions/process-notifications/index.ts');
  assert.match(migration, /ON CONFLICT\(idempotency_key\) DO NOTHING/g);
  assert.match(migration, /shipments_enqueue_notifications/);
  assert.match(worker, /META_WHATSAPP_ACCESS_TOKEN/);
  assert.match(worker, /TWILIO_ACCOUNT_SID/);
  assert.match(worker, /NOTIFICATION_WORKER_SECRET/);
});
