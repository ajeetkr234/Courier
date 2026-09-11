import { supabase, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { WeightDiscrepancy } from '../types';

/**
 * Fetch weight discrepancies from Supabase for this seller
 */
export async function fetchWeightDisputesFromSupabase(sellerId?: string): Promise<WeightDiscrepancy[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('weight_discrepancies')
      .select('*, shipments(*)')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    return data.map((w: any) => ({
      id: w.id,
      seller_id: w.seller_id,
      shipment_id: w.shipment_id,
      shipment: w.shipments,
      declared_weight_kg: Number(w.declared_weight_kg),
      charged_weight_kg: Number(w.charged_weight_kg),
      excess_charge: Number(w.excess_charge),
      status: w.status as any,
      deadline: w.deadline,
      evidence_urls: w.evidence_urls || [],
      created_at: w.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch weight disputes from Supabase:', err);
    return [];
  }
}

/**
 * Resolve or contest a weight dispute in Supabase
 */
export async function resolveWeightDisputeInSupabase(
  disputeId: string,
  newStatus: string,
  evidenceUrl?: string
): Promise<void> {
  try {
    if (isValidUUID(disputeId)) {
      const updatePayload: any = { status: newStatus };
      if (evidenceUrl) {
        const { data: current } = await supabase
          .from('weight_discrepancies')
          .select('evidence_urls')
          .eq('id', disputeId)
          .single();
        const existingUrls = current?.evidence_urls || [];
        updatePayload.evidence_urls = [...existingUrls, evidenceUrl];
      }

      await supabase
        .from('weight_discrepancies')
        .update(updatePayload)
        .eq('id', disputeId);
    }
  } catch (err) {
    console.error('Failed to update weight dispute in Supabase:', err);
  }
}
