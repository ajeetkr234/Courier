import { json } from '../_shared/http.ts';
import { admin } from '../_shared/supabase.ts';

const statusMap: Record<string, string> = {
  manifested: 'CREATED', pickup_scheduled: 'PICKUP_SCHEDULED', picked_up: 'PICKED_UP',
  in_transit: 'IN_TRANSIT', out_for_delivery: 'OUT_FOR_DELIVERY', delivered: 'DELIVERED',
  ndr: 'NDR', rto_initiated: 'RTO_INITIATED', rto_in_transit: 'RTO_IN_TRANSIT',
  rto_delivered: 'RTO_DELIVERED', lost: 'LOST', cancelled: 'CANCELLED',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST' || req.headers.get('authorization') !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const { data: shipments, error } = await admin.from('shipments')
    .select('id,awb_number,status,couriers!inner(code,id,courier_credentials!inner(base_url,secret_name,is_active))')
    .not('status', 'in', '(DELIVERED,RTO_DELIVERED,CANCELLED)').lt('updated_at', new Date(Date.now()-30*60_000).toISOString()).limit(100);
  if (error) return json({ error: error.message }, 500);
  const results = [];
  for (const shipment of shipments || []) {
    const courier = Array.isArray(shipment.couriers) ? shipment.couriers[0] : shipment.couriers;
    const credentials = Array.isArray(courier?.courier_credentials) ? courier.courier_credentials[0] : courier?.courier_credentials;
    const secret = credentials && Deno.env.get(credentials.secret_name);
    if (!credentials?.is_active || !secret) continue;
    try {
      const response = await fetch(`${credentials.base_url}/tracking/${encodeURIComponent(shipment.awb_number)}`, { headers: { authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(10000) });
      const payload = await response.json();
      const normalized = statusMap[String(payload.status || '').toLowerCase()];
      if (response.ok && normalized && normalized !== shipment.status) {
        const { error: applyError } = await admin.rpc('apply_shipment_status', { p_shipment_id: shipment.id, p_status: normalized, p_raw_status: payload.status, p_message: payload.message || 'Status recovered by polling', p_location: payload.location || null, p_event_time: payload.event_time || new Date().toISOString(), p_recipient_name: payload.recipient_name || null, p_pod_object_path: payload.pod_object_path || null });
        if (applyError) throw applyError;
      }
      results.push({ awb: shipment.awb_number, ok: true });
    } catch (pollError) {
      results.push({ awb: shipment.awb_number, ok: false, error: pollError instanceof Error ? pollError.message : 'Polling failed' });
    }
  }
  return json({ checked: results.length, results });
});
