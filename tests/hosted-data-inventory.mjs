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
      })
  );
}

const url = process.env.STAGING_SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = process.env.STAGING_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Error: Supabase URL and anonymous key must be configured in environment or .env');
  process.exit(1);
}

const targetHostname = new URL(url).hostname.toLowerCase();
if (targetHostname === KNOWN_PRODUCTION_HOST) {
  console.error(`Refusal: Inventory inspection cannot be executed against known production project (${KNOWN_PRODUCTION_HOST}).`);
  process.exit(1);
}

const adminEmail = process.env.TEST_ADMIN_EMAIL || env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD || env.TEST_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('Error: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are required.');
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { error: loginError } = await client.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
if (loginError) {
  console.error('Authentication failed for test administrator.');
  process.exit(1);
}

const { data: sellers, error } = await client.from('sellers').select('id,company_name,brand_name,status,created_at').order('created_at');
if (error) {
  console.error(`Error querying sellers: ${error.message}`);
  process.exit(1);
}

const output = [];
for (const seller of sellers) {
  const counts = {};
  for (const table of ['warehouses', 'orders', 'shipments', 'support_tickets', 'audit_logs']) {
    const { count, error: countError } = await client.from(table).select('*', { count: 'exact', head: true }).eq('seller_id', seller.id);
    counts[table] = countError ? `error: ${countError.message}` : count;
  }
  output.push({ ...seller, counts });
}

console.log(JSON.stringify(output, null, 2));
await client.auth.signOut();
