import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const KNOWN_PRODUCTION_HOST = 'ytydhmrcsowhygttdoiw.supabase.co';

let env = {};
const envPath = new URL('../.env', import.meta.url);
if (fs.existsSync(envPath)) {
  env = Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const at = line.indexOf('=');
        return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
}

const url = process.env.STAGING_SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = process.env.STAGING_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Error: Hosted Supabase configuration (URL and anon key) is missing.');
  process.exit(1);
}

const targetHostname = new URL(url).hostname.toLowerCase();
if (targetHostname === KNOWN_PRODUCTION_HOST) {
  console.error(`Refusal: Smoke tests cannot be executed against known production project (${KNOWN_PRODUCTION_HOST}).`);
  process.exit(1);
}

const sellerEmail = process.env.TEST_SELLER_EMAIL || env.TEST_SELLER_EMAIL;
const sellerPassword = process.env.TEST_SELLER_PASSWORD || env.TEST_SELLER_PASSWORD;
const adminEmail = process.env.TEST_ADMIN_EMAIL || env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD || env.TEST_ADMIN_PASSWORD;

if (!sellerEmail || !sellerPassword || !adminEmail || !adminPassword) {
  console.error('Error: TEST_SELLER_EMAIL, TEST_SELLER_PASSWORD, TEST_ADMIN_EMAIL, and TEST_ADMIN_PASSWORD are required.');
  process.exit(1);
}

async function login(email, password) {
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`${email}: ${error.message}`);
  return { client, user: data.user };
}

async function count(client, table) {
  const { count: value, error } = await client.from(table).select('*', { count: 'exact', head: true });
  return error ? { error: error.message } : { count: value ?? 0 };
}

const output = { project: targetHostname, seller: {}, admin: {}, checks: {} };

const seller = await login(sellerEmail, sellerPassword);
const sellerId = seller.user.app_metadata?.seller_id;
const { data: sellerRows, error: sellerRowsError } = await seller.client.from('sellers').select('id,status,company_name,pan');
if (sellerRowsError) throw sellerRowsError;
const { data: warehouses, error: warehouseError } = await seller.client.from('warehouses').select('id,address_verified_at,phone_verified_at');
if (warehouseError) throw warehouseError;
output.seller = {
  role: seller.user.app_metadata?.role,
  sellerIdPresent: Boolean(sellerId),
  visibleSellerRows: sellerRows.length,
  profile: sellerRows[0] || null,
  warehouseCount: warehouses.length,
  verifiedWarehouseCount: warehouses.filter((item) => item.address_verified_at && item.phone_verified_at).length,
  orders: await count(seller.client, 'orders'),
  shipments: await count(seller.client, 'shipments'),
  returns: await count(seller.client, 'returns'),
  supportTickets: await count(seller.client, 'support_tickets'),
};
await seller.client.auth.signOut();

const admin = await login(adminEmail, adminPassword);
output.admin = {
  role: admin.user.app_metadata?.role,
  sellers: await count(admin.client, 'sellers'),
  orders: await count(admin.client, 'orders'),
  shipments: await count(admin.client, 'shipments'),
  ndrEscalations: await count(admin.client, 'ndr_escalations'),
  weightDisputes: await count(admin.client, 'weight_disputes'),
  codRemittances: await count(admin.client, 'cod_remittances'),
  supportTickets: await count(admin.client, 'support_tickets'),
  auditLogs: await count(admin.client, 'audit_logs'),
};
output.checks = {
  sellerTenantIsolation: sellerRows.length === 1 && sellerRows[0]?.id === sellerId,
  sellerIsActive: sellerRows[0]?.status === 'ACTIVE',
  pickupReady: output.seller.verifiedWarehouseCount > 0,
  adminRole: admin.user.app_metadata?.role === 'PLATFORM_ADMIN',
};
await admin.client.auth.signOut();

console.log(JSON.stringify(output, null, 2));
