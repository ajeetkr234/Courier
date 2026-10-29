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
  fallbackSellerId?: string,
  pickupDetails?: Record<string,string>
): Promise<ReturnOrder> {
  const effectiveSellerId = await getEffectiveSellerId(fallbackSellerId);
  if (!isValidUUID(originalOrderId)) {
    throw new Error('A valid live order is required to create a return');
  }
  const verifiedOrderId = originalOrderId;

  const finalReason = isExchange && exchangeItem
    ? `${reason} (Exchange for: ${exchangeItem})`
    : reason;

  const { data, error } = await supabase.functions.invoke('manage-return', { body: {
    action: 'book', originalOrderId: verifiedOrderId, reason: finalReason,
    resolutionType: isExchange ? 'EXCHANGE' : 'REFUND', exchangeItem, pickupDetails: pickupDetails || {},
  } });
  if (error) {
    let message = error.message || 'Return booking failed';
    const response = (error as { context?: Response }).context;
    if (response) try { const payload = await response.clone().json(); message = payload.error || message; } catch { /* retain SDK error */ }
    throw new Error(message);
  }
  if (!data?.return) throw new Error(data?.error || 'Courier did not confirm the reverse pickup');
  return { ...data.return, seller_id: effectiveSellerId, reason: data.return.return_reason } as ReturnOrder;
}
