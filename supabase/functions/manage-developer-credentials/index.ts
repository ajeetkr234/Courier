import { admin, userClient } from '../_shared/supabase.ts';
import { corsHeaders, json } from '../_shared/http.ts';

const SCOPES = new Set(['orders:read', 'orders:write', 'rates:read', 'shipments:write']);
const hex = (b: Uint8Array) => [...b].map((v) => v.toString(16).padStart(2, '0')).join('');
const randomHex = (n = 32) => { const b = new Uint8Array(n); crypto.getRandomValues(b); return hex(b); };
const sha256 = async (v: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const authorization = req.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);
  const client = userClient(authorization);
  const { data: { user } } = await client.auth.getUser();
  const sellerId = user?.app_metadata?.seller_id;
  if (!user || !sellerId) return json({ error: 'Session is not linked to a seller' }, 403);
  try {
    const body = await req.json();
    if (body.action === 'create_api_key') {
      const name = String(body.name || '').trim();
      const scopes = Array.isArray(body.scopes) ? body.scopes.filter((s: unknown) => typeof s === 'string' && SCOPES.has(s)) : [];
      if (!name || name.length > 80 || !scopes.length) return json({ error: 'Invalid name or scopes' }, 400);
      const prefix = `pk_live_${randomHex(4)}_`, secret = `${prefix}${randomHex()}`;
      const { data, error } = await admin.from('api_keys').insert({ seller_id: sellerId, name, key_prefix: prefix, key_hash: await sha256(secret), scopes, is_active: true }).select().single();
      if (error) throw error;
      return json({ credential: { ...data, secret, secret_key_masked: `${prefix}••••${secret.slice(-4)}` } }, 201);
    }
    if (body.action === 'create_webhook') {
      const url = new URL(String(body.url || ''));
      if (url.protocol !== 'https:') return json({ error: 'Webhook URL must use HTTPS' }, 400);
      const events = Array.isArray(body.events) ? body.events.filter((e: unknown) => typeof e === 'string').slice(0, 20) : [];
      if (!events.length) return json({ error: 'At least one event is required' }, 400);
      const secret = `whsec_${randomHex()}`;
      const { data, error } = await admin.from('webhook_endpoints').insert({ seller_id: sellerId, url: url.toString(), secret, subscribed_events: events, is_active: true }).select().single();
      if (error) throw error;
      return json({ credential: data }, 201);
    }
    return json({ error: 'Unsupported action' }, 400);
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Request failed' }, 400); }
});
