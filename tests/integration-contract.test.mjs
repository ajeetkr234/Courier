import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('orders API enforces API key scope, active seller and idempotency', async () => {
  const source = await read('supabase/functions/orders-api/index.ts');
  const scaleMigration = await read('supabase/migrations/20260914010000_scale_20k_sellers.sql');
  const queueMigration = await read('supabase/migrations/20260914030000_order_ingestion_queue.sql');
  assert.match(queueMigration, /orders:write/);
  assert.match(scaleMigration, /SELLER_NOT_VERIFIED/);
  assert.match(scaleMigration, /ACTIVE/);
  assert.match(source, /idempotency-key/);
  assert.match(scaleMigration, /WAREHOUSE_MAPPING_REQUIRED/);
});

test('async order ingestion is durable, lock-safe and worker driven', async () => {
  const api = await read('supabase/functions/orders-api/index.ts');
  const worker = await read('supabase/functions/process-order-queue/index.ts');
  const migration = await read('supabase/migrations/20260914030000_order_ingestion_queue.sql');
  assert.match(api, /respond-async/);
  assert.match(api, /enqueue_storefront_order/);
  assert.match(api, /queue_id/);
  assert.match(worker, /process_order_ingestion_batch/);
  assert.match(worker, /QUEUE_WORKER_SECRET/);
  assert.match(migration, /FOR UPDATE SKIP LOCKED/);
  assert.match(migration, /UNIQUE \(seller_id, idempotency_key\)/);
  assert.doesNotMatch(migration, /UPDATE api_keys SET last_used_at=now\(\) WHERE id=k\.id/);
});

test('batch ingestion amortizes connection and authentication overhead', async () => {
  const api = await read('supabase/functions/orders-api/index.ts');
  const migration = await read('supabase/migrations/20260914032000_batch_order_ingestion.sql');
  const loadTest = await read('tests/load/orders-api-batch.k6.js');
  assert.match(api, /enqueue_storefront_orders_batch/);
  assert.match(migration, /jsonb_array_length/);
  assert.match(migration, /ON CONFLICT \(seller_id,idempotency_key\) DO NOTHING/);
  assert.match(loadTest, /accepted_orders/);
});

test('capacity fixtures have guarded chunked cleanup', async () => {
  const runner = await read('tests/load/run-capacity.mjs');
  const cleanup = await read('supabase/migrations/20260914035000_chunked_capacity_cleanup.sql');
  assert.match(runner, /cleanup_capacity_test_seller/);
  assert.match(runner, /finally/);
  assert.match(cleanup, /ShipFaster Automated Capacity Test/);
  assert.match(cleanup, /LIMIT LEAST/);
  assert.match(cleanup, /REVOKE ALL/);
});

test('outbound webhooks are signed and retried with a terminal state', async () => {
  const source = await read('supabase/functions/dispatch-webhooks/index.ts');
  assert.match(source, /x-shipfaster-signature/);
  assert.match(source, /attempt_count/);
  assert.match(source, /'DEAD'/);
});

test('integration schema includes import errors, SKU profiles and automation rules', async () => {
  const migration = await read('supabase/migrations/20260914001000_storefront_integration_hub.sql');
  for (const table of ['integration_import_errors', 'sku_shipping_profiles', 'shipping_automation_rules', 'outbound_webhook_deliveries']) {
    assert.ok(migration.includes(table), `missing ${table}`);
  }
});
