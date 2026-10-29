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
const adminEmail = process.env.TEST_ADMIN_EMAIL || env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD || env.TEST_ADMIN_PASSWORD;

if (!url || !key) {
  console.error('Error: Supabase URL and anonymous key must be configured in environment or .env');
  process.exit(1);
}

const targetHostname = new URL(url).hostname.toLowerCase();
if (targetHostname === KNOWN_PRODUCTION_HOST) {
  console.error(`Refusal: Destructive cleanup cannot be run against known production project (${KNOWN_PRODUCTION_HOST}).`);
  process.exit(1);
}

if (!process.argv.includes('--confirm-destructive-cleanup')) {
  console.error('Safety Check Failed: cleanup-approved-storage permanently deletes storage objects.');
  console.error('Pass --confirm-destructive-cleanup to explicitly execute this script against test/staging.');
  process.exit(1);
}

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

const sellerIds = [
  '32d724db-23c4-4cba-a76f-f78e4022194e',
  'b4b6b40a-1f60-48a4-808a-2609098d3b9c',
  '7d49cbc5-8ea3-4395-8cb4-e6ed2251d41b',
  '4f4162bd-39d7-43c4-8ce3-c991bab46693',
  'e0aedcd6-3c1f-4194-8a5a-d422f6cb18fa'
];
const buckets = ['kyc-documents', 'return-evidence', 'claim-evidence', 'support-attachments', 'handover-proofs'];
const removed = {};

async function collect(bucket, prefix) {
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) {
    if (/not found/i.test(error.message)) return [];
    throw error;
  }
  const paths = [];
  for (const item of data || []) {
    const path = `${prefix}/${item.name}`;
    if (item.id) paths.push(path);
    else paths.push(...(await collect(bucket, path)));
  }
  return paths;
}

for (const bucket of buckets) {
  const paths = [];
  for (const sellerId of sellerIds) {
    paths.push(...(await collect(bucket, sellerId)));
  }
  if (paths.length) {
    const { error } = await client.storage.from(bucket).remove(paths);
    if (error) throw error;
  }
  removed[bucket] = paths.length;
}

console.log('Cleanup completed successfully:');
console.log(JSON.stringify(removed, null, 2));
await client.auth.signOut();
