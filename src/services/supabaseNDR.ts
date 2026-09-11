import { supabase, isMockMode, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { NDRCase } from '../types';

/**
 * Fetch all NDR cases from Supabase for this seller
 */
export async function fetchNDRCasesFromSupabase(sellerId?: string): Promise<NDRCase[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('ndr_cases')
      .select('*, shipments(*, orders(*))')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    return data.map((n: any) => ({
      id: n.id,
      seller_id: n.seller_id,
      shipment_id: n.shipment_id,
      shipment: n.shipments
        ? {
            ...n.shipments,
            order: n.shipments.orders,
          }
        : undefined,
      reason: n.reason,
      attempt_count: n.attempt_count,
      last_attempt_at: n.last_attempt_at,
      status: n.status as any,
      created_at: n.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch NDR cases from Supabase:', err);
    return [];
  }
}

/**
 * Submit an NDR Action (reattempt, address update, RTO) to Supabase
 */
export async function submitNDRActionInSupabase(
  caseId: string,
  actionType: 'REATTEMPT' | 'ADDRESS_UPDATE' | 'PHONE_UPDATE' | 'RTO',
  details?: any
): Promise<void> {
  if (isMockMode) return;

  const newStatus = actionType === 'RTO' ? 'RTO_REQUESTED' : 'REATTEMPT_REQUESTED';

  try {
    if (isValidUUID(caseId)) {
      // 1. Update NDR case status
      await supabase
        .from('ndr_cases')
        .update({ status: newStatus })
        .eq('id', caseId);

      // 2. Insert into ndr_actions
      await supabase.from('ndr_actions').insert({
        ndr_case_id: caseId,
        action_type: actionType,
        action_details: details || {},
        status: 'SUBMITTED',
      });
    }
  } catch (err) {
    console.error('Failed to submit NDR action to Supabase:', err);
  }
}
