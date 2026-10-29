import { supabase, supabaseUrl, supabaseAnonKey, isMockMode, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { Shipment, ShipmentStatus, PickupRequest } from '../types';

async function functionErrorMessage(error: unknown, fallback: string): Promise<string> {
  const functionError = error as { message?: string; context?: Response };
  let message = functionError.message || fallback;
  if (functionError.context) {
    try {
      const payload = await functionError.context.clone().json() as { error?: string; message?: string };
      message = payload.error || payload.message || message;
    } catch { /* retain SDK error */ }
  }
  return message;
}

/**
 * Fetch all shipments for the current seller from Supabase, joined with courier & order details
 */
export async function fetchShipmentsFromSupabase(sellerId?: string): Promise<Shipment[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    let query = supabase
      .from('shipments')
      .select('*, couriers(*), orders(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (isValidUUID(effectiveSellerId)) {
      query = query.eq('seller_id', effectiveSellerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((s: any) => ({
      id: s.id,
      seller_id: s.seller_id,
      order_id: s.order_id,
      order: s.orders
        ? {
            id: s.orders.id,
            seller_id: s.orders.seller_id,
            warehouse_id: s.orders.warehouse_id,
            customer_id: s.orders.customer_id,
            source: s.orders.source,
            payment_type: s.orders.payment_type,
            cod_amount: Number(s.orders.cod_amount || 0),
            total_amount: Number(s.orders.total_amount || 0),
            weight_kg: Number(s.orders.weight_kg || 0.5),
            shipping_address: s.orders.shipping_address,
            current_status: s.orders.current_status,
            created_at: s.orders.created_at,
            updated_at: s.orders.updated_at,
          }
        : undefined,
      courier_id: s.courier_id,
      courier_name: s.couriers?.name || 'Courier Partner',
      courier_code: s.couriers?.code || 'delhivery',
      awb_number: s.awb_number,
      label_url: s.label_url || undefined,
      status: s.status as ShipmentStatus,
      pickup_date: s.pickup_date,
      shipping_cost: Number(s.shipping_cost || 48.00),
      cod_charge: Number(s.cod_charge || 0.00),
      total_freight_charge: Number(s.total_freight_charge || 48.00),
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  } catch (err) {
    console.error('Failed to fetch shipments from Supabase:', err);
    return [];
  }
}

/**
 * Create a new shipment in Supabase linked to order, courier, and wallet debit
 */
export async function createShipmentInSupabase(
  orderId: string,
  courierId: string,
  courierName: string,
  courierCode: string,
  shippingCost: number,
  codCharge: number,
  _fallbackSellerId?: string
): Promise<Shipment> {
  if (!isValidUUID(orderId)) {
    throw new Error('A valid live order is required to create a shipment');
  }
  if (!isValidUUID(courierId)) throw new Error('A valid courier is required');
  const idempotencyKey = `shipment:${orderId}:${courierId}`;
  const { data, error } = await supabase.functions.invoke('book-shipment', {
    body: { orderId, courierId, shippingCost, codCharge, idempotencyKey },
  });
  if (error) {
    let message = error.message || 'Courier booking failed';
    const response = (error as { context?: Response }).context;
    if (response) {
      try {
        const payload = await response.clone().json() as { error?: string; message?: string };
        message = payload.error || payload.message || message;
      } catch {
        // Keep the SDK error when the Edge Function did not return JSON.
      }
    }
    throw new Error(message);
  }
  if (!data?.awb_number) throw new Error(data?.error || 'Courier did not return an AWB');
  return { ...data, courier_name: courierName, courier_code: courierCode } as Shipment;
}

export async function updateShipmentStatusInSupabase(
  shipmentId: string,
  status: ShipmentStatus,
  message?: string,
  location?: string
): Promise<void> {
  if (!isValidUUID(shipmentId)) return;
  const { error } = await supabase.rpc('apply_shipment_status', {
    p_shipment_id: shipmentId, p_status: status, p_raw_status: status,
    p_message: message || `Shipment status updated to ${status.replace(/_/g, ' ')}`,
    p_location: location || 'Carrier network', p_event_time: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

/**
 * Schedule a carrier pickup request in Supabase
 */
export async function schedulePickupInSupabase(
  courierId: string,
  warehouseId: string,
  pickupDate: string,
  count: number,
  fallbackSellerId?: string
): Promise<PickupRequest> {
  const effectiveSellerId = await getEffectiveSellerId(fallbackSellerId);
  if (!isValidUUID(warehouseId) || !isValidUUID(courierId)) throw new Error('A saved warehouse and courier are required');
  const { data, error } = await supabase.functions.invoke('manage-pickup', {
    body: { action: 'schedule', warehouseId, courierId, pickupDate, expectedPackageCount: count },
  });
  if (error) throw new Error(await functionErrorMessage(error, 'Pickup scheduling failed'));
  if (!data?.pickup) throw new Error(data?.error || 'Courier did not confirm the pickup');
  return { ...data.pickup, seller_id: effectiveSellerId } as PickupRequest;
}

/**
 * Fetch pickup requests from Supabase
 */
export async function fetchPickupsFromSupabase(sellerId?: string): Promise<PickupRequest[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((p) => ({
      id: p.id,
      seller_id: p.seller_id,
      warehouse_id: p.warehouse_id,
      courier_id: p.courier_id,
      pickup_date: p.pickup_date,
      status: p.status as any,
      pickup_reference: p.pickup_reference,
      expected_package_count: 5,
      created_at: p.created_at,
    }));
  } catch (e) {
    console.warn('Failed to fetch pickups from Supabase, using local fallback:', e);
    return [];
  }
}

/**
 * Realtime subscription to shipments
 */
export function subscribeToShipments(sellerId: string | undefined, onUpdate: () => void): () => void {
  if (isMockMode) return () => {};

  const channel = supabase
    .channel('realtime:shipments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Live public tracking from Supabase database
 */
export async function fetchPublicTrackingFromSupabase(query: string): Promise<any | null> {
  if (isMockMode) return null;
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/public-tracking?q=${encodeURIComponent(trimmed)}`, {
      headers: { apikey: supabaseAnonKey },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Tracking lookup failed (${response.status})`);
    return await response.json();
  } catch (err) {
    console.error('Error in fetchPublicTrackingFromSupabase:', err);
    return null;
  }
}
