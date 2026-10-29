import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

const required = ['STAGING_SUPABASE_URL', 'STAGING_SERVICE_ROLE_KEY', 'QUEUE_WORKER_SECRET'];
for (const name of required) if (!process.env[name]) throw new Error(`Missing ${name}`);

const baseUrl = process.env.STAGING_SUPABASE_URL.replace(/\/$/, '');
const serviceKey = process.env.STAGING_SERVICE_ROLE_KEY;
const sellerId = randomUUID(), warehouseId = randomUUID(), integrationId = randomUUID(), apiKeyId = randomUUID();
const apiSecret = `pk_live_capacity_${randomBytes(24).toString('hex')}`;
const keyHash = createHash('sha256').update(apiSecret).digest('hex');
const headers = { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json' };
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

async function rest(table, body) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, { method: 'POST', headers: { ...headers, prefer: 'return=minimal' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${table} fixture failed (${response.status}): ${await response.text()}`);
}
async function cleanup() {
  for (let attempt = 0; attempt < 500; attempt++) {
    const response = await fetch(`${baseUrl}/rest/v1/rpc/cleanup_capacity_test_seller`, { method: 'POST', headers,
      body: JSON.stringify({ p_seller_id: sellerId, p_limit: 2000 }) });
    if (!response.ok) {
      const detail = await response.text();
      if (response.status >= 500) { await sleep(Math.min(5000, 250 * 2 ** Math.min(attempt, 4))); continue; }
      throw new Error(`Fixture cleanup failed (${response.status}): ${detail}`);
    }
    const state = await response.json();
    if (state.seller_deleted) return;
  }
  throw new Error('Fixture cleanup exceeded 500 chunks');
}
async function worker() {
  const response = await fetch(`${baseUrl}/functions/v1/process-order-queue`, { method: 'POST', headers: { 'x-worker-secret': process.env.QUEUE_WORKER_SECRET, 'content-type': 'application/json' }, body: JSON.stringify({ batch_size: 100 }) });
  if (!response.ok) throw new Error(`Worker failed (${response.status}): ${await response.text()}`);
  return response.json();
}
function runK6() {
  const executable = process.env.K6_BIN || 'k6';
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['run', 'tests/load/orders-api-batch.k6.js'], {
      stdio: 'inherit', shell: false, env: { ...process.env,
        ORDERS_API_URL: `${baseUrl}/functions/v1/orders-api`, SHIPFASTER_API_KEY: apiSecret,
        INTEGRATION_ID: integrationId, WAREHOUSE_ID: warehouseId,
        TARGET_RPS: process.env.TARGET_RPS || '20', BATCH_SIZE: process.env.BATCH_SIZE || '10',
        DURATION: process.env.DURATION || '30s' },
    });
    child.once('error', reject); child.once('exit', code => resolve(code ?? 1));
  });
}

let k6Exit = 1;
try {
  await rest('sellers', { id: sellerId, company_name: 'ShipFaster Automated Capacity Test', brand_name: 'Capacity Test', pan: `CAP${randomBytes(3).toString('hex').toUpperCase()}1A`, status: 'ACTIVE' });
  await rest('warehouses', { id: warehouseId, seller_id: sellerId, name: 'Capacity Test Warehouse', contact_name: 'Test Operator', phone: '9876543210', email: 'capacity-test@shipfaster.invalid', address_line1: 'Staging Test Address', city: 'Delhi', state: 'Delhi', pincode: '110001', is_default: true });
  await rest('integration_accounts', { id: integrationId, seller_id: sellerId, platform: 'CUSTOM_API', store_name: 'Capacity Test Store', store_url: 'https://capacity-test.shipfaster.invalid', status: 'CONNECTED', auto_sync_orders: true, sync_tracking: true, default_warehouse_id: warehouseId });
  await rest('api_keys', { id: apiKeyId, seller_id: sellerId, name: 'Automated capacity test', key_hash: keyHash, key_prefix: apiSecret.slice(0, 18), scopes: ['orders:read', 'orders:write'], is_active: true });
  k6Exit = await runK6();

  const deadline = Date.now() + Number(process.env.DRAIN_TIMEOUT_MS || 300000);
  let metrics;
  do {
    try {
      const wave = await Promise.all(Array.from({ length: Number(process.env.WORKER_CONCURRENCY || 8) }, worker));
      metrics = wave.findLast(item => item?.metrics && !item.metrics.error)?.metrics;
      if (!metrics) throw new Error(`No valid metrics in worker wave: ${JSON.stringify(wave)}`);
      process.stdout.write(`Queue metrics: ${JSON.stringify(metrics)}\n`);
      if (!metrics.pending && !metrics.processing) break;
    } catch (error) {
      process.stderr.write(`Transient worker wave failure: ${error instanceof Error ? error.message : String(error)}\n`);
      await sleep(1000);
    }
  } while (Date.now() < deadline);
  if (!metrics || metrics.pending || metrics.processing) throw new Error(`Queue did not drain before timeout: ${JSON.stringify(metrics)}`);
  if (metrics?.dead) throw new Error(`Dead-letter orders detected: ${metrics.dead}`);
  if (k6Exit !== 0) throw new Error(`k6 thresholds failed with exit code ${k6Exit}`);
} finally {
  await cleanup();
}
