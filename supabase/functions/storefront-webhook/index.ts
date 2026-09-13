import { hmacHex, json, safeEqual } from '../_shared/http.ts';
import { admin } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const platform = (new URL(req.url).searchParams.get('platform') || '').toUpperCase();
  if (!['SHOPIFY','WOOCOMMERCE'].includes(platform)) return json({ error: 'Unsupported platform' }, 400);
  const raw = await req.text();
  const signature = req.headers.get('x-storefront-signature') || req.headers.get('x-shopify-hmac-sha256') || '';
  const accountId = req.headers.get('x-integration-account-id') || '';
  const eventId = req.headers.get('x-event-id') || req.headers.get('x-shopify-webhook-id') || '';
  const { data: account } = await admin.from('integration_accounts').select('*').eq('id', accountId).eq('platform', platform).eq('status', 'CONNECTED').single();
  if (!account || !eventId) return json({ error: 'Unknown integration' }, 401);
  const secret = Deno.env.get(`STOREFRONT_SECRET_${accountId.replaceAll('-', '_').toUpperCase()}`);
  if (!secret) return json({ error: 'Integration secret unavailable' }, 503);
  const expectedHex = await hmacHex(secret, raw);
  const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedHex.match(/.{2}/g)!.map((x) => parseInt(x, 16)))));
  if (!safeEqual(signature, platform === 'SHOPIFY' ? expectedBase64 : expectedHex)) return json({ error: 'Invalid signature' }, 401);
  const payload = JSON.parse(raw);
  const sourceId = String(payload.id || payload.order_id || '');
  if (!sourceId) return json({ error: 'External order id missing' }, 422);
  const idempotencyKey = `${platform}:${account.id}:${sourceId}`;
  const address = payload.shipping_address || payload.billing || {};
  const { data, error } = await admin.from('orders').upsert({
    seller_id: account.seller_id, external_order_id: sourceId, idempotency_key: idempotencyKey,
    source: platform, payment_type: payload.financial_status === 'paid' ? 'PREPAID' : 'COD',
    cod_amount: payload.financial_status === 'paid' ? 0 : Number(payload.total_price || payload.total || 0),
    total_amount: Number(payload.total_price || payload.total || 0), weight_kg: Number(payload.total_weight || 500) / 1000,
    shipping_address: { name: `${address.first_name || ''} ${address.last_name || ''}`.trim() || address.name, phone: address.phone, address_line1: address.address1 || address.address_1, address_line2: address.address2 || address.address_2, city: address.city, state: address.province || address.state, pincode: address.zip || address.postcode },
    current_status: 'NEW',
  }, { onConflict: 'seller_id,idempotency_key', ignoreDuplicates: true }).select().maybeSingle();
  if (error) return json({ error: error.message }, 409);
  return json({ accepted: true, duplicate: !data });
});
