import { supabase, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { ReturnOrder } from '../types';

/**
 * Fetch all return orders from Supabase for this seller
 */
export async function fetchReturnsFromSupabase(sellerId?: string): Promise<ReturnOrder[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('returns')
      .select('*, orders(*)')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((r: any) => ({
      id: r.id,
      seller_id: r.seller_id,
      original_order_id: r.original_order_id,
      original_order: r.orders,
      return_reason: r.return_reason,
      return_awb: r.return_awb,
      reverse_awb_number: r.return_awb,
      reason: r.return_reason,
      status: r.status as any,
      created_at: r.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch returns from Supabase:', err);
    return [];
  }
}

/**
 * Create a new reverse return order in Supabase
 */
export async function createReturnInSupabase(
  originalOrderId: string,
  reason: string,
  isExchange?: boolean,
  exchangeItem?: string,
  fallbackSellerId?: string
): Promise<ReturnOrder> {
  const effectiveSellerId = await getEffectiveSellerId(fallbackSellerId);
  const revAwb = `REV${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const returnAwb = `RET-AWB-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  if (!isValidUUID(originalOrderId)) {
    throw new Error('A valid live order is required to create a return');
  }
  const verifiedOrderId = originalOrderId;

  const finalReason = isExchange && exchangeItem
    ? `${reason} (Exchange for: ${exchangeItem})`
    : reason;

  {
    try {
      const { data, error } = await supabase
        .from('returns')
        .insert({
          seller_id: effectiveSellerId,
          original_order_id: verifiedOrderId,
          return_reason: finalReason,
          return_awb: returnAwb,
          status: 'REQUESTED',
        })
        .select('*, orders(*)')
        .single();

      if (!error && data) {
        return {
          id: data.id,
          seller_id: data.seller_id,
          original_order_id: data.original_order_id,
          original_order: data.orders,
          return_reason: data.return_reason,
          return_awb: data.return_awb,
          reverse_awb_number: revAwb,
          reason: data.return_reason,
          is_exchange: isExchange || false,
          exchange_item_name: exchangeItem,
          status: 'REQUESTED',
          created_at: data.created_at,
        };
      }
    } catch (e) {
      console.error('Failed to create return in Supabase:', e);
    }
  }

  return {
    id: `ret-${Date.now()}`,
    seller_id: effectiveSellerId,
    original_order_id: verifiedOrderId,
    return_reason: finalReason,
    return_awb: returnAwb,
    reverse_awb_number: revAwb,
    reason: finalReason,
    is_exchange: isExchange || false,
    exchange_item_name: exchangeItem,
    status: 'REQUESTED',
    created_at: now,
  };
}
