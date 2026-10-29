import { supabase } from '../lib/supabase';
import { Order, OrderStatus } from '../types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id?: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

/**
 * Fetch orders for the current seller from Supabase, joined with items
 */
export async function fetchOrdersFromSupabase(sellerId?: string): Promise<Order[]> {
  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*), warehouses(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (sellerId && isValidUUID(sellerId)) {
      query = query.eq('seller_id', sellerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((o) => ({
      id: o.id,
      seller_id: o.seller_id,
      warehouse_id: o.warehouse_id,
      customer_id: o.customer_id,
      external_order_id: o.external_order_id,
      source: o.source,
      payment_type: o.payment_type,
      cod_amount: Number(o.cod_amount || 0),
      total_amount: Number(o.total_amount || 0),
      weight_kg: Number(o.weight_kg || 0.5),
      length_cm: o.length_cm ? Number(o.length_cm) : undefined,
      width_cm: o.width_cm ? Number(o.width_cm) : undefined,
      height_cm: o.height_cm ? Number(o.height_cm) : undefined,
      shipping_address: o.shipping_address,
      warehouse: o.warehouses
        ? {
            id: o.warehouses.id,
            seller_id: o.warehouses.seller_id,
            name: o.warehouses.name,
            contact_name: o.warehouses.contact_name,
            phone: o.warehouses.phone,
            email: o.warehouses.email,
            address_line1: o.warehouses.address_line1,
            address_line2: o.warehouses.address_line2,
            city: o.warehouses.city,
            state: o.warehouses.state,
            pincode: o.warehouses.pincode,
            is_default: Boolean(o.warehouses.is_default),
            created_at: o.warehouses.created_at,
          }
        : undefined,
      current_status: o.current_status as OrderStatus,
      items: (o.order_items || []).map((it: any) => ({
        id: it.id,
        order_id: it.order_id,
        sku: it.sku,
        name: it.name,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      })),
      created_at: o.created_at,
      updated_at: o.updated_at,
    }));
  } catch (err) {
    console.error('Failed to fetch orders from Supabase:', err);
    return [];
  }
}

/**
 * Create an order and its items in Supabase
 */
export async function createOrderInSupabase(
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
  fallbackSellerId?: string
): Promise<Order> {
  const targetSellerId = isValidUUID(orderData.seller_id)
    ? orderData.seller_id
    : isValidUUID(fallbackSellerId)
    ? fallbackSellerId
    : null;

  // 1. If sellerId is still not a valid UUID, get the first seller in the DB or create one
  let verifiedSellerId = targetSellerId;
  if (!verifiedSellerId) {
    const { data: firstSeller } = await supabase.from('sellers').select('id').limit(1).maybeSingle();
    if (firstSeller) {
      verifiedSellerId = firstSeller.id;
    } else {
      const { data: newSeller } = await supabase
        .from('sellers')
        .insert({ company_name: 'ShipFaster Store', pan: 'DEFAULT1234F', status: 'ACTIVE' })
        .select('id')
        .single();
      verifiedSellerId = newSeller?.id || null;
    }
  }

  if (!verifiedSellerId) throw new Error('Seller profile could not be verified');
  const { data: verifiedSeller, error: sellerError } = await supabase
    .from('sellers')
    .select('id, company_name, pan, status')
    .eq('id', verifiedSellerId)
    .single();
  if (sellerError || !verifiedSeller) throw new Error('Seller profile could not be verified');
  if (!verifiedSeller.company_name?.trim() || !verifiedSeller.pan?.trim()) {
    throw new Error('Complete your seller profile before creating an order');
  }
  if (verifiedSeller.status !== 'ACTIVE') {
    throw new Error('Super Admin verification is required before creating an order');
  }

  // 2. Require a complete seller-owned pickup address. The database repeats
  // this check so API, CSV and future order paths cannot bypass it.
  const warehouseId = isValidUUID(orderData.warehouse_id) ? orderData.warehouse_id : null;
  if (!warehouseId) throw new Error('Select a verified pickup address before creating an order');
  const { data: pickupWarehouse, error: warehouseError } = await supabase
    .from('warehouses')
    .select('id, seller_id, address_line1, city, state, pincode, phone')
    .eq('id', warehouseId)
    .eq('seller_id', verifiedSellerId)
    .maybeSingle();
  const pickupPhone = String(pickupWarehouse?.phone || '').replace(/\D/g, '').slice(-10);
  if (warehouseError || !pickupWarehouse || !pickupWarehouse.address_line1?.trim() || !pickupWarehouse.city?.trim() || !pickupWarehouse.state?.trim() || !/^\d{6}$/.test(pickupWarehouse.pincode || '')) {
    throw new Error('Pickup address is incomplete or not verified. Update it in Settings first.');
  }
  if (!/^[6-9]\d{9}$/.test(pickupPhone)) {
    throw new Error('Pickup mobile number is invalid. Update it in Settings first.');
  }

  // 3. Insert order record
  const { data: createdOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      seller_id: verifiedSellerId,
      warehouse_id: warehouseId,
      customer_id: isValidUUID(orderData.customer_id) ? orderData.customer_id : null,
      external_order_id: orderData.external_order_id || null,
      source: orderData.source || 'MANUAL',
      payment_type: orderData.payment_type,
      cod_amount: orderData.cod_amount,
      total_amount: orderData.total_amount,
      pricing_breakdown: orderData.pricing_breakdown || {},
      weight_kg: orderData.weight_kg,
      length_cm: orderData.length_cm,
      width_cm: orderData.width_cm,
      height_cm: orderData.height_cm,
      shipping_address: orderData.shipping_address,
      current_status: orderData.current_status || 'NEW',
    })
    .select()
    .single();

  if (orderError || !createdOrder) {
    throw new Error(orderError?.message || 'Failed to insert order into Supabase');
  }

  // 4. Insert order items if present
  let savedItems = orderData.items || [];
  if (savedItems.length > 0) {
    const itemsPayload = savedItems.map((it) => ({
      order_id: createdOrder.id,
      sku: it.sku || 'SKU-DEFAULT',
      name: it.name || 'Shipment Item',
      quantity: it.quantity || 1,
      unit_price: it.unit_price || 0,
    }));

    const { data: insertedItems } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select();

    if (insertedItems) {
      savedItems = insertedItems.map((it) => ({
        id: it.id,
        order_id: it.order_id,
        sku: it.sku,
        name: it.name,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
      }));
    }
  }

  // 5. Record initial status event
  await supabase.from('order_status_events').insert({
    order_id: createdOrder.id,
    status: createdOrder.current_status,
    description: 'Order created via ShipFaster Portal',
  });

  return {
    id: createdOrder.id,
    seller_id: createdOrder.seller_id,
    warehouse_id: createdOrder.warehouse_id,
    customer_id: createdOrder.customer_id,
    external_order_id: createdOrder.external_order_id,
    source: createdOrder.source,
    payment_type: createdOrder.payment_type,
    cod_amount: Number(createdOrder.cod_amount),
    total_amount: Number(createdOrder.total_amount),
    pricing_breakdown: createdOrder.pricing_breakdown || undefined,
    weight_kg: Number(createdOrder.weight_kg),
    length_cm: createdOrder.length_cm ? Number(createdOrder.length_cm) : undefined,
    width_cm: createdOrder.width_cm ? Number(createdOrder.width_cm) : undefined,
    height_cm: createdOrder.height_cm ? Number(createdOrder.height_cm) : undefined,
    shipping_address: createdOrder.shipping_address,
    current_status: createdOrder.current_status as OrderStatus,
    items: savedItems,
    created_at: createdOrder.created_at,
    updated_at: createdOrder.updated_at,
  };
}

/**
 * Bulk create orders in Supabase
 */
export async function bulkCreateOrdersInSupabase(
  ordersData: Array<Omit<Order, 'id' | 'created_at' | 'updated_at'>>,
  fallbackSellerId?: string
): Promise<Order[]> {
  const createdOrders: Order[] = [];
  for (const ord of ordersData) {
    try {
      const saved = await createOrderInSupabase(ord, fallbackSellerId);
      createdOrders.push(saved);
    } catch (err) {
      console.error('Failed to import order:', err);
    }
  }
  return createdOrders;
}

/**
 * Update order status and log event in Supabase
 */
export async function updateOrderStatusInSupabase(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.rpc('transition_order_status', {
    p_order_id: orderId,
    p_status: status,
    p_description: `Status updated to ${status}`,
  });
  if (error) throw new Error(error.message);
}

/**
 * Realtime subscription to order updates
 */
export function subscribeToOrders(sellerId: string | undefined, onUpdate: () => void): () => void {
  const channel = supabase
    .channel('realtime:orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
