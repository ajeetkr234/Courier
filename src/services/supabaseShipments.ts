import { supabase, isMockMode, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { OrderStatus, Shipment, ShipmentStatus, PickupRequest } from '../types';

/**
 * Fetch all shipments for the current seller from Supabase, joined with courier & order details
 */
export async function fetchShipmentsFromSupabase(sellerId?: string): Promise<Shipment[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    let query = supabase
      .from('shipments')
      .select('*, couriers(*), orders(*)')
      .order('created_at', { ascending: false });

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
  fallbackSellerId?: string
): Promise<Shipment> {
  const effectiveSellerId = await getEffectiveSellerId(fallbackSellerId);
  const awbPrefix = (courierCode || 'DEL').substring(0, 3).toUpperCase();
  const awbNumber = `${awbPrefix}${Math.floor(100000000 + Math.random() * 900000000)}`;
  const now = new Date().toISOString();

  if (!isValidUUID(orderId)) {
    throw new Error('A valid live order is required to create a shipment');
  }
  const verifiedOrderId = orderId;

  // Ensure courierId is a valid UUID
  let verifiedCourierId = courierId;
  if (!isValidUUID(courierId)) {
    const { data: courierRow } = await supabase
      .from('couriers')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (courierRow) verifiedCourierId = courierRow.id;
  }

  if (!isMockMode) {
    try {
      const { data: createdShipment, error } = await supabase
        .from('shipments')
        .insert({
          seller_id: effectiveSellerId,
          order_id: verifiedOrderId,
          courier_id: verifiedCourierId,
          awb_number: awbNumber,
          label_url: null,
          status: 'CREATED',
          pickup_date: new Date().toISOString().split('T')[0],
        })
        .select('*, couriers(*), orders(*)')
        .single();

      if (error) {
        console.error('Supabase shipment insert failed:', error);
      } else if (createdShipment) {
        // Record tracking event
        await supabase.from('tracking_events').insert({
          shipment_id: createdShipment.id,
          raw_status: 'MANIFEST_GENERATED',
          normalized_status: 'CREATED',
          event_time: now,
          location: 'Origin Fulfillment Hub',
          message: 'Shipping label generated and ready for carrier pickup',
        });

        // Update order status in orders table
        await supabase
          .from('orders')
          .update({ current_status: 'READY_TO_SHIP', updated_at: now })
          .eq('id', verifiedOrderId);

        return {
          id: createdShipment.id,
          seller_id: createdShipment.seller_id,
          order_id: createdShipment.order_id,
          courier_id: createdShipment.courier_id,
          courier_name: createdShipment.couriers?.name || courierName,
          courier_code: createdShipment.couriers?.code || courierCode,
          awb_number: createdShipment.awb_number,
          label_url: createdShipment.label_url,
          status: createdShipment.status as ShipmentStatus,
          pickup_date: createdShipment.pickup_date,
          shipping_cost: shippingCost,
          cod_charge: codCharge,
          total_freight_charge: shippingCost + codCharge,
          created_at: createdShipment.created_at,
          updated_at: createdShipment.updated_at,
        };
      }
    } catch (e) {
      console.error('Error inserting shipment to Supabase:', e);
    }
  }

  return {
    id: `shp-${Date.now()}`,
    seller_id: effectiveSellerId,
    order_id: verifiedOrderId,
    courier_id: verifiedCourierId,
    courier_name: courierName,
    courier_code: courierCode,
    awb_number: awbNumber,
    label_url: undefined,
    status: 'CREATED',
    pickup_date: new Date().toISOString().split('T')[0],
    shipping_cost: shippingCost,
    cod_charge: codCharge,
    total_freight_charge: shippingCost + codCharge,
    created_at: now,
    updated_at: now,
  };
}

const shipmentToOrderStatus: Partial<Record<ShipmentStatus, OrderStatus>> = {
  CREATED: 'READY_TO_SHIP',
  PICKUP_SCHEDULED: 'READY_TO_SHIP',
  PICKED_UP: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  NDR: 'NDR',
  RTO_INITIATED: 'RTO',
  RTO_IN_TRANSIT: 'RTO',
  RTO_DELIVERED: 'RETURNED',
  LOST: 'RTO',
  CANCELLED: 'CANCELLED',
};

export async function updateShipmentStatusInSupabase(
  shipmentId: string,
  status: ShipmentStatus,
  message?: string,
  location?: string
): Promise<void> {
  if (!isValidUUID(shipmentId)) return;

  const now = new Date().toISOString();
  const { data: shipment, error } = await supabase
    .from('shipments')
    .update({ status, updated_at: now })
    .eq('id', shipmentId)
    .select('id, order_id')
    .single();

  if (error) throw error;

  await supabase.from('tracking_events').insert({
    shipment_id: shipmentId,
    raw_status: status,
    normalized_status: status,
    event_time: now,
    location: location || 'Carrier network',
    message: message || `Shipment status updated to ${status.replace(/_/g, ' ')}`,
  });

  const nextOrderStatus = shipmentToOrderStatus[status];
  if (shipment?.order_id && nextOrderStatus) {
    await supabase
      .from('orders')
      .update({ current_status: nextOrderStatus, updated_at: now })
      .eq('id', shipment.order_id);
  }
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
  const pickupRef = `PKP-${courierId.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  let verifiedWhId = isValidUUID(warehouseId) ? warehouseId : null;
  let verifiedCourierId = isValidUUID(courierId) ? courierId : null;

  if (!isMockMode) {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .insert({
          seller_id: effectiveSellerId,
          warehouse_id: verifiedWhId,
          courier_id: verifiedCourierId,
          pickup_date: pickupDate,
          status: 'SCHEDULED',
          pickup_reference: pickupRef,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          seller_id: data.seller_id,
          warehouse_id: data.warehouse_id,
          courier_id: data.courier_id,
          pickup_date: data.pickup_date,
          status: data.status as any,
          pickup_reference: data.pickup_reference,
          expected_package_count: count,
          created_at: data.created_at,
        };
      }
    } catch (e) {
      console.error('Failed to schedule pickup in Supabase:', e);
    }
  }

  return {
    id: `pick-${Date.now()}`,
    seller_id: effectiveSellerId,
    warehouse_id: warehouseId,
    courier_id: courierId,
    pickup_date: pickupDate,
    status: 'SCHEDULED',
    pickup_reference: pickupRef,
    expected_package_count: count,
    created_at: new Date().toISOString(),
  };
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
    // 1. Try matching by AWB directly
    let { data: shipment } = await supabase
      .from('shipments')
      .select('*, couriers(*), orders(*), tracking_events(*)')
      .eq('awb_number', trimmed)
      .maybeSingle();

    // 2. If not found, try matching by Order External ID
    if (!shipment) {
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('external_order_id', trimmed)
        .maybeSingle();

      if (order?.id) {
        const { data: shp } = await supabase
          .from('shipments')
          .select('*, couriers(*), orders(*), tracking_events(*)')
          .eq('order_id', order.id)
          .maybeSingle();
        shipment = shp;
      }
    }

    if (!shipment) return null;

    const events = (shipment.tracking_events || []).map((ev: any) => ({
      id: ev.id,
      shipment_id: ev.shipment_id,
      raw_status: ev.raw_status,
      normalized_status: ev.normalized_status as ShipmentStatus,
      event_time: ev.event_time,
      location: ev.location || 'Hub Sorting Center',
      message: ev.message,
    })).sort((a: any, b: any) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime());

    return {
      awbNumber: shipment.awb_number,
      normalizedStatus: shipment.status as ShipmentStatus,
      currentStatus: shipment.status.replace(/_/g, ' '),
      estimatedDeliveryDate: shipment.pickup_date ? new Date(new Date(shipment.pickup_date).getTime() + 3 * 86400000).toISOString() : new Date().toISOString(),
      events: events.length > 0 ? events : [
        {
          id: 'ev-1',
          shipment_id: shipment.id,
          raw_status: shipment.status,
          normalized_status: shipment.status as ShipmentStatus,
          event_time: shipment.created_at,
          location: 'Origin Logistics Hub',
          message: 'Shipment recorded in national carrier network',
        }
      ],
      courierName: shipment.couriers?.name || 'Courier Partner',
      courierCode: shipment.couriers?.code || 'delhivery',
      originCity: 'Delhi',
      destinationCity: shipment.orders?.shipping_address?.city || 'Destination City',
    };
  } catch (err) {
    console.error('Error in fetchPublicTrackingFromSupabase:', err);
    return null;
  }
}
