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
    if (!['schedule', 'reschedule', 'cancel'].includes(body.action)) return json({ error: 'Unsupported action' }, 400);

    const { data: courier } = await admin.from('couriers').select('*').eq('id', body.courierId).eq('is_active', true).maybeSingle();
    const { data: warehouse } = await admin.from('warehouses').select('*').eq('id', body.warehouseId).eq('seller_id', sellerId).maybeSingle();
    if (!courier || !warehouse) return json({ error: 'Courier or seller warehouse is unavailable' }, 404);
    const { data: credentials } = await admin.from('courier_credentials').select('*').eq('courier_id', courier.id).eq('is_active', true).maybeSingle();
    const secret = credentials?.secret_name ? Deno.env.get(credentials.secret_name) : null;
    if (!credentials || !secret) return json({ error: 'Courier pickup credentials are not configured' }, 503);

    if (body.action !== 'schedule') {
      const { data: pickup } = await admin.from('pickup_requests').select('*').eq('id', body.pickupId).eq('seller_id', sellerId).maybeSingle();
      if (!pickup?.pickup_reference) return json({ error: 'Confirmed pickup not found' }, 404);
      const response = await fetch(`${credentials.base_url}/pickups/${encodeURIComponent(pickup.pickup_reference)}`, {
        method: body.action === 'cancel' ? 'DELETE' : 'PATCH', signal: AbortSignal.timeout(15000),
        headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
        body: body.action === 'cancel' ? undefined : JSON.stringify({ pickup_date: body.pickupDate }),
      });
      if (!response.ok) return json({ error: `Courier pickup ${body.action} failed (${response.status})` }, 502);
      const updates = body.action === 'cancel' ? { status: 'CANCELLED' } : { status: 'SCHEDULED', pickup_date: body.pickupDate };
      const { data: updated, error } = await admin.from('pickup_requests').update(updates).eq('id', pickup.id).select().single();
      if (error) throw error;
      return json({ ok: true, pickup: updated });
    }

    const { data: shipments, error: shipmentError } = await admin.from('shipments')
      .select('id,awb_number,orders!inner(warehouse_id)').eq('seller_id', sellerId).eq('courier_id', courier.id)
      .eq('status', 'CREATED').eq('orders.warehouse_id', warehouse.id).limit(Math.max(1, Number(body.expectedPackageCount || 1)));
    if (shipmentError) throw shipmentError;
    if (!shipments?.length) return json({ error: 'No created shipments are eligible for this pickup' }, 409);
    const response = await fetch(`${credentials.base_url}/pickups`, {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json', 'idempotency-key': `pickup:${sellerId}:${warehouse.id}:${body.pickupDate}` },
      body: JSON.stringify({ pickup_date: body.pickupDate, warehouse, awb_numbers: shipments.map((item) => item.awb_number), package_count: shipments.length }),
    });
    const provider = await response.json().catch(() => ({}));
    if (!response.ok || !provider.pickup_reference) return json({ error: provider.message || `Courier pickup booking failed (${response.status})` }, 502);
    const { data: pickup, error } = await admin.from('pickup_requests').insert({ seller_id: sellerId, warehouse_id: warehouse.id, courier_id: courier.id, pickup_date: body.pickupDate, status: 'SCHEDULED', pickup_reference: provider.pickup_reference, expected_package_count: shipments.length }).select().single();
    if (error) throw error;
    await admin.from('pickup_shipments').insert(shipments.map((item) => ({ pickup_id: pickup.id, shipment_id: item.id })));
    for (const shipment of shipments) await admin.rpc('apply_shipment_status', { p_shipment_id: shipment.id, p_status: 'PICKUP_SCHEDULED', p_raw_status: 'PICKUP_SCHEDULED', p_message: 'Pickup confirmed by courier', p_location: warehouse.city, p_event_time: new Date().toISOString() });
    return json({ ok: true, pickup }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Pickup operation failed' }, 502);
  }
});
