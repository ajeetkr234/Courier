import { corsHeaders, json } from '../_shared/http.ts';
import { admin, userClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const authorization = req.headers.get('authorization') || '';
    if (!authorization) return json({ error: 'Authentication required' }, 401);
    const client = userClient(authorization);
    const { data: authData } = await client.auth.getUser();
    if (!authData.user) return json({ error: 'Invalid session' }, 401);
    const sellerId = authData.user.app_metadata?.seller_id;
    if (!sellerId) return json({ error: 'Seller claim missing' }, 403);

    const body = await req.json();
    const idempotencyKey = String(body.idempotencyKey || '');
    if (!idempotencyKey || !body.orderId || !body.courierId) return json({ error: 'orderId, courierId and idempotencyKey are required' }, 400);
    const { data: existing } = await admin.from('provider_operation_logs').select('response_reference,status').eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing?.status === 'SUCCEEDED') return json(existing.response_reference);

    const [{ data: seller }, { data: order }, { data: courier }, { data: wallet }, { data: credentials }] = await Promise.all([
      admin.from('sellers').select('id,status').eq('id', sellerId).single(),
      admin.from('orders').select('*').eq('id', body.orderId).eq('seller_id', sellerId).single(),
      admin.from('couriers').select('*').eq('id', body.courierId).eq('is_active', true).single(),
      admin.from('wallets').select('balance').eq('seller_id', sellerId).single(),
      admin.from('courier_credentials').select('*').eq('courier_id', body.courierId).eq('is_active', true).maybeSingle(),
    ]);
    if (seller?.status !== 'ACTIVE') return json({ error: 'Seller verification is not active' }, 403);
    if (!order || !courier) return json({ error: 'Order or courier is unavailable' }, 404);
    if (!['NEW','CONFIRMED'].includes(order.current_status)) return json({ error: `Order cannot ship from ${order.current_status}` }, 409);
    const charge = Number(body.shippingCost || 0) + Number(body.codCharge || 0);
    if (!wallet || Number(wallet.balance) < charge) return json({ error: 'Insufficient wallet balance' }, 409);
    if (!credentials) return json({ error: 'Courier credentials are not configured' }, 503);

    const secret = Deno.env.get(credentials.secret_name);
    if (!secret) return json({ error: 'Courier credential secret is unavailable' }, 503);
    await admin.from('provider_operation_logs').upsert({ seller_id: sellerId, provider: courier.code, operation: 'CREATE_SHIPMENT', idempotency_key: idempotencyKey, status: 'PENDING', attempt_count: 1, request_reference: { orderId: order.id } });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response: Response;
    try {
      response = await fetch(`${credentials.base_url}/shipments`, { method: 'POST', signal: controller.signal, headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify({ order, service_code: body.serviceCode }) });
    } finally { clearTimeout(timeout); }
    const provider = await response.json();
    if (!response.ok || !provider.awb_number) throw new Error(provider.message || `Courier returned ${response.status}`);

    const { data, error } = await admin.rpc('finalize_shipment_booking', {
      p_seller_id: sellerId, p_order_id: order.id, p_courier_id: courier.id,
      p_awb_number: provider.awb_number, p_carrier_shipment_id: provider.shipment_id || null,
      p_label_url: provider.label_url || null, p_shipping_cost: Number(body.shippingCost || 0),
      p_cod_charge: Number(body.codCharge || 0), p_idempotency_key: idempotencyKey,
    });
    if (error) throw error;
    await admin.from('provider_operation_logs').update({ status: 'SUCCEEDED', response_reference: data, updated_at: new Date().toISOString() }).eq('idempotency_key', idempotencyKey);
    return json(data, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Shipment booking failed' }, 502);
  }
});
