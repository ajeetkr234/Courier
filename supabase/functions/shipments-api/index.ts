import { authenticateApiKey, apiError } from '../_shared/api-key.ts';
import { admin } from '../_shared/supabase.ts';
import { corsHeaders, json } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const principal = await authenticateApiKey(req, req.method === 'GET' ? 'orders:read' : 'shipments:write');
    if (req.method === 'GET') {
      const url = new URL(req.url), id = url.searchParams.get('id'), awb = url.searchParams.get('awb');
      let query = admin.from('shipments').select('*,couriers(name,code),orders(external_order_id,shipping_address)').eq('seller_id', principal.sellerId);
      if (id) query = query.eq('id', id); else if (awb) query = query.eq('awb_number', awb); else query = query.order('created_at', { ascending: false }).limit(100);
      const { data, error } = await query; if (error) throw error;
      return json({ shipments: data || [] });
    }
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    const body = await req.json();
    const orderId = String(body.order_id || ''), courierId = String(body.courier_id || ''), quoteId = String(body.quote_id || '');
    const idempotencyKey = req.headers.get('idempotency-key') || String(body.idempotency_key || '');
    if (!orderId || !courierId || !quoteId || !idempotencyKey) throw new Error('VALIDATION:order_id, courier_id, quote_id and Idempotency-Key are required');
    const { data: existing } = await admin.from('provider_operation_logs').select('response_reference,status').eq('seller_id', principal.sellerId).eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing?.status === 'SUCCEEDED') return json(existing.response_reference);
    const [{ data: order }, { data: courier }, { data: wallet }, { data: credentials }, { data: slab }] = await Promise.all([
      admin.from('orders').select('*,warehouses(pincode)').eq('id', orderId).eq('seller_id', principal.sellerId).maybeSingle(),
      admin.from('couriers').select('*').eq('id', courierId).eq('is_active', true).maybeSingle(),
      admin.from('wallets').select('balance').eq('seller_id', principal.sellerId).maybeSingle(),
      admin.from('courier_credentials').select('*').eq('courier_id', courierId).eq('is_active', true).maybeSingle(),
      admin.from('rate_slabs').select('*').eq('id', quoteId).eq('courier_id', courierId).maybeSingle(),
    ]);
    if (!order || !courier || !slab) throw new Error('NOT_FOUND:Order, courier, or rate quote not found');
    if (!['NEW', 'CONFIRMED'].includes(order.current_status)) throw new Error(`CONFLICT:Order cannot ship from ${order.current_status}`);
    const pickup = String(order.warehouses?.pincode || ''), delivery = String(order.shipping_address?.pincode || '');
    const expectedZone = pickup.slice(0, 3) === delivery.slice(0, 3) ? 'LOCAL' : pickup[0] === delivery[0] ? 'ZONAL' : 'NATIONAL';
    if (String(slab.zone).toUpperCase() !== expectedZone) throw new Error('CONFLICT:Selected quote is not valid for this route');
    const step = Math.max(Number(slab.additional_weight_step_kg), 0.001);
    const extraSteps = Math.max(0, Math.ceil((Number(order.weight_kg) - Number(slab.base_weight_kg)) / step));
    const baseRate = Number(slab.base_freight_rate) + extraSteps * Number(slab.additional_freight_rate);
    const codCharge = order.payment_type === 'COD' ? Math.max(Number(slab.cod_flat_fee), Number(order.total_amount) * Number(slab.cod_percent_fee) / 100) : 0;
    const taxAmount = (baseRate + codCharge) * 0.18;
    const shippingCost = baseRate + taxAmount, charge = shippingCost + codCharge;
    if (!wallet || Number(wallet.balance) < charge) throw new Error('CONFLICT:Insufficient wallet balance');
    if (!credentials) throw new Error('CONFLICT:Courier credentials are not configured');
    const secret = Deno.env.get(credentials.secret_name); if (!secret) throw new Error('CONFLICT:Courier credential secret is unavailable');

    await admin.from('provider_operation_logs').upsert({ seller_id: principal.sellerId, provider: courier.code, operation: 'CREATE_SHIPMENT', idempotency_key: idempotencyKey, status: 'PENDING', attempt_count: 1, request_reference: { orderId } });
    const response = await fetch(`${credentials.base_url}/shipments`, { method: 'POST', headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify({ order, service_code: body.service_code }), signal: AbortSignal.timeout(15000) });
    const provider = await response.json();
    if (!response.ok || !provider.awb_number) throw new Error(`CONFLICT:${provider.message || `Courier returned ${response.status}`}`);
    const { data, error } = await admin.rpc('finalize_shipment_booking', { p_seller_id: principal.sellerId, p_order_id: orderId, p_courier_id: courierId, p_awb_number: provider.awb_number, p_carrier_shipment_id: provider.shipment_id || null, p_label_url: provider.label_url || null, p_shipping_cost: shippingCost, p_cod_charge: codCharge, p_idempotency_key: idempotencyKey });
    if (error) throw error;
    await admin.from('provider_operation_logs').update({ status: 'SUCCEEDED', response_reference: data, updated_at: new Date().toISOString() }).eq('seller_id', principal.sellerId).eq('idempotency_key', idempotencyKey);
    return json(data, 201);
  } catch (error) { const failure = apiError(error); return json(failure.body, failure.status); }
});
