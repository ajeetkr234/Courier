import { corsHeaders, json } from '../_shared/http.ts';
import { admin, userClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const authorization = req.headers.get('authorization') || '';
    const { data: { user } } = await userClient(authorization).auth.getUser();
    const sellerId = user?.app_metadata?.seller_id;
    if (!user || !sellerId) return json({ error: 'Authentication required' }, 401);
    const body = await req.json();
    if (body.action !== 'book') return json({ error: 'Unsupported action' }, 400);

    const { data: order } = await admin.from('orders').select('*,shipments(*,couriers(*))')
      .eq('id', body.originalOrderId).eq('seller_id', sellerId).maybeSingle();
    const shipment = Array.isArray(order?.shipments) ? order.shipments[0] : order?.shipments;
    const courier = Array.isArray(shipment?.couriers) ? shipment.couriers[0] : shipment?.couriers;
    if (!order || order.current_status !== 'DELIVERED') return json({ error: 'Only a delivered seller-owned order can be returned' }, 409);
    if (!shipment || !courier) return json({ error: 'The original shipment courier is unavailable' }, 404);

    const { data: credentials } = await admin.from('courier_credentials').select('*')
      .eq('courier_id', shipment.courier_id).eq('is_active', true).maybeSingle();
    const secret = credentials?.secret_name ? Deno.env.get(credentials.secret_name) : null;
    if (!credentials || !secret) return json({ error: 'Reverse-pickup courier credentials are not configured' }, 503);

    const idempotencyKey = `return:${sellerId}:${order.id}`;
    const { data: existing } = await admin.from('returns').select('*,orders(*)')
      .eq('seller_id', sellerId).eq('original_order_id', order.id).maybeSingle();
    if (existing?.return_awb) return json({ ok: true, return: existing });

    const response = await fetch(`${credentials.base_url}/returns`, {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
      body: JSON.stringify({ original_awb: shipment.awb_number, order, reason: body.reason, pickup_details: body.pickupDetails, resolution_type: body.resolutionType, exchange_item: body.exchangeItem || null }),
    });
    const provider = await response.json().catch(() => ({}));
    if (!response.ok || !provider.awb_number) return json({ error: provider.message || `Courier return booking failed (${response.status})` }, 502);

    const { data: created, error } = await admin.from('returns').insert({
      seller_id: sellerId, original_order_id: order.id, return_reason: body.reason,
      return_awb: provider.awb_number, status: 'PICKUP_SCHEDULED', pickup_details: body.pickupDetails || {},
      resolution_type: body.resolutionType || 'REFUND', provider_reference: provider.return_id || null,
      pickup_reference: provider.pickup_reference || null, updated_at: new Date().toISOString(),
    }).select('*,orders(*)').single();
    if (error) throw error;
    return json({ ok: true, return: created }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Return booking failed' }, 502);
  }
});
