import { hmacHex, json, safeEqual } from '../_shared/http.ts';
import { admin } from '../_shared/supabase.ts';

const statusMap: Record<string, string> = {
  manifested: 'CREATED', pickup_scheduled: 'PICKUP_SCHEDULED', picked_up: 'PICKED_UP',
  in_transit: 'IN_TRANSIT', out_for_delivery: 'OUT_FOR_DELIVERY', delivered: 'DELIVERED',
  ndr: 'NDR', rto_initiated: 'RTO_INITIATED', rto_in_transit: 'RTO_IN_TRANSIT',
  rto_delivered: 'RTO_DELIVERED', lost: 'LOST', cancelled: 'CANCELLED',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const provider = new URL(req.url).searchParams.get('provider')?.toLowerCase() || '';
  const raw = await req.text();
  const timestamp = req.headers.get('x-webhook-timestamp') || '';
  const signature = (req.headers.get('x-webhook-signature') || '').replace(/^sha256=/, '');
  const eventId = req.headers.get('x-event-id') || '';
  const secret = Deno.env.get(`COURIER_WEBHOOK_SECRET_${provider.toUpperCase()}`);
  if (!provider || !secret || !timestamp || !signature || !eventId) return json({ error: 'Missing webhook authentication' }, 401);
  if (Math.abs(Date.now() - Date.parse(timestamp)) > 300000) return json({ error: 'Expired webhook' }, 401);
  if (!safeEqual(signature, await hmacHex(secret, `${timestamp}.${raw}`))) return json({ error: 'Invalid signature' }, 401);
  const hash = await hmacHex(secret, raw);
  const payload = JSON.parse(raw);
  const { error: insertError } = await admin.from('inbound_webhook_events').insert({ provider, provider_event_id: eventId, payload_hash: hash, event_type: payload.event, payload });
  if (insertError?.code === '23505') return json({ accepted: true, duplicate: true });
  if (insertError) return json({ error: insertError.message }, 500);
  const normalized = statusMap[String(payload.status || '').toLowerCase()];
  const { data: shipment } = await admin.from('shipments').select('id').eq('awb_number', payload.awb_number).maybeSingle();
  if (!shipment || !normalized) return json({ error: 'Unknown AWB or status' }, 422);
  const { error } = await admin.rpc('apply_shipment_status', { p_shipment_id: shipment.id, p_status: normalized, p_raw_status: payload.status, p_message: payload.message || null, p_location: payload.location || null, p_event_time: payload.event_time || new Date().toISOString(), p_recipient_name: payload.recipient_name || null, p_pod_object_path: payload.pod_object_path || null });
  await admin.from('inbound_webhook_events').update({ status: error ? 'FAILED' : 'PROCESSED', error_message: error?.message, processed_at: new Date().toISOString() }).eq('provider_event_id', eventId).eq('provider', provider);
  return error ? json({ error: error.message }, 409) : json({ accepted: true });
});
