import { authenticateApiKey, apiError } from '../_shared/api-key.ts';
import { admin } from '../_shared/supabase.ts';
import { corsHeaders, json } from '../_shared/http.ts';

const zoneFor = (pickup: string, delivery: string) => pickup.slice(0, 3) === delivery.slice(0, 3) ? 'LOCAL' : pickup[0] === delivery[0] ? 'ZONAL' : 'NATIONAL';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!['GET', 'POST'].includes(req.method)) return json({ error: 'Method not allowed' }, 405);
  try {
    const principal = await authenticateApiKey(req, 'rates:read');
    const input = req.method === 'POST' ? await req.json() : Object.fromEntries(new URL(req.url).searchParams);
    let pickup = String(input.pickup_pincode || input.pickup_postcode || '').trim();
    let delivery = String(input.delivery_pincode || input.delivery_postcode || '').trim();
    let weight = Number(input.weight_kg || input.weight || 0);
    let paymentType = String(input.payment_type || (String(input.cod) === '1' ? 'COD' : 'PREPAID')).toUpperCase();
    let orderValue = Number(input.order_value || input.declared_value || 0);
    const orderId = input.order_id ? String(input.order_id) : undefined;

    if (orderId) {
      const { data: order } = await admin.from('orders').select('*,warehouses(pincode)').eq('id', orderId).eq('seller_id', principal.sellerId).maybeSingle();
      if (!order) throw new Error('NOT_FOUND:Order not found');
      pickup = order.warehouses?.pincode || pickup;
      delivery = order.shipping_address?.pincode || delivery;
      weight = Number(order.weight_kg);
      paymentType = order.payment_type;
      orderValue = Number(order.total_amount);
    }
    if (!/^\d{6}$/.test(pickup) || !/^\d{6}$/.test(delivery) || weight <= 0) throw new Error('VALIDATION:Valid pickup/delivery pincodes and weight are required');
    if (!['COD', 'PREPAID'].includes(paymentType)) throw new Error('VALIDATION:payment_type must be COD or PREPAID');

    const requestedZone = zoneFor(pickup, delivery);
    const { data, error } = await admin.from('rate_slabs').select('*,couriers!inner(id,code,name,is_active)').eq('couriers.is_active', true);
    if (error) throw error;
    const rows = (data || []).filter((row: any) => String(row.zone).toUpperCase() === requestedZone);
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
    const rates = rows.map((row: any) => {
      const step = Math.max(Number(row.additional_weight_step_kg), 0.001);
      const extraSteps = Math.max(0, Math.ceil((weight - Number(row.base_weight_kg)) / step));
      const base = Number(row.base_freight_rate) + extraSteps * Number(row.additional_freight_rate);
      const cod = paymentType === 'COD' ? Math.max(Number(row.cod_flat_fee), orderValue * Number(row.cod_percent_fee) / 100) : 0;
      const tax = (base + cod) * 0.18;
      return { quote_id: row.id, order_id: orderId, courier_id: row.couriers.id, courier_code: row.couriers.code, courier_name: row.couriers.name, zone: requestedZone, base_rate: base, cod_charge: cod, tax_amount: tax, total_rate: base + cod + tax, estimated_days: requestedZone === 'LOCAL' ? 1 : requestedZone === 'ZONAL' ? 3 : 5, expires_at: expiresAt };
    }).sort((a: any, b: any) => a.total_rate - b.total_rate);
    return json({ currency: 'INR', pickup_pincode: pickup, delivery_pincode: delivery, weight_kg: weight, rates });
  } catch (error) { const failure = apiError(error); return json(failure.body, failure.status); }
});
