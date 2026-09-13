import { corsHeaders, json } from '../_shared/http.ts';
import { admin } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const query = new URL(req.url).searchParams.get('q')?.trim();
  if (!query || query.length > 80) return json({ error: 'Valid tracking reference required' }, 400);
  let { data: shipment } = await admin.from('shipments').select('id,awb_number,status,courier_id,order_id,created_at,updated_at,couriers(name,code),orders(external_order_id,shipping_address)').eq('awb_number', query).maybeSingle();
  if (!shipment) {
    const { data: order } = await admin.from('orders').select('id').eq('external_order_id', query).maybeSingle();
    if (order) ({ data: shipment } = await admin.from('shipments').select('id,awb_number,status,courier_id,order_id,created_at,updated_at,couriers(name,code),orders(external_order_id,shipping_address)').eq('order_id', order.id).maybeSingle());
  }
  if (!shipment) return json({ error: 'Tracking reference not found' }, 404);
  const { data: events } = await admin.from('tracking_events').select('normalized_status,event_time,location,message').eq('shipment_id', shipment.id).order('event_time', { ascending: false }).limit(50);
  const address = (shipment.orders as any)?.shipping_address || {};
  return json({ awbNumber: shipment.awb_number, normalizedStatus: shipment.status, currentStatus: String(shipment.status).replaceAll('_',' '), courierName: (shipment.couriers as any)?.name, courierCode: (shipment.couriers as any)?.code, destinationCity: address.city, events: events || [] });
});
