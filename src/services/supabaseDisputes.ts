import { supabase, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { WeightDiscrepancy } from '../types';

/**
 * Fetch weight discrepancies from Supabase for this seller
 */
export async function fetchWeightDisputesFromSupabase(sellerId?: string): Promise<WeightDiscrepancy[]> {
  try {
    let query = supabase
      .from('weight_discrepancies')
      .select('*, shipments(*)')
      .order('created_at', { ascending: false });

    if (sellerId) {
      query = query.eq('seller_id', await getEffectiveSellerId(sellerId));
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.app_metadata?.role?.startsWith('PLATFORM_')) {
        query = query.eq('seller_id', await getEffectiveSellerId());
      }
    }
    const { data, error } = await query;

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
      evidence_scale_url: w.evidence_scale_url || undefined,
      evidence_tape_url: w.evidence_tape_url || undefined,
      sku_master_weight: w.sku_master_weight == null ? undefined : Number(w.sku_master_weight),
      admin_arbitration_notes: w.admin_arbitration_notes || undefined,
      resolution_outcome: w.resolution_outcome || undefined,
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
  evidence?: { evidenceUrl?: string; scaleUrl?: string; tapeUrl?: string; skuMasterWeight?: number; notes?: string }
): Promise<void> {
  if (!isValidUUID(disputeId)) throw new Error('Invalid weight dispute id');
  const { data: current, error: readError } = await supabase
    .from('weight_discrepancies').select('evidence_urls').eq('id', disputeId).single();
  if (readError) throw new Error(readError.message);
  const addedUrls = [evidence?.evidenceUrl, evidence?.scaleUrl, evidence?.tapeUrl].filter(Boolean) as string[];
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    evidence_urls: [...(current?.evidence_urls || []), ...addedUrls],
  };
  if (evidence?.scaleUrl) updatePayload.evidence_scale_url = evidence.scaleUrl;
  if (evidence?.tapeUrl) updatePayload.evidence_tape_url = evidence.tapeUrl;
  if (evidence?.skuMasterWeight != null) updatePayload.sku_master_weight = evidence.skuMasterWeight;
  if (evidence?.notes) updatePayload.admin_arbitration_notes = evidence.notes;
  const { error } = await supabase.from('weight_discrepancies').update(updatePayload).eq('id', disputeId);
  if (error) throw new Error(error.message);
}

export async function arbitrateWeightDisputeInSupabase(
  disputeId: string,
  outcome: 'SELLER_REFUNDED' | 'COURIER_UPHELD',
  notes: string,
): Promise<void> {
  const { error } = await supabase.rpc('arbitrate_weight_dispute', {
    p_dispute_id: disputeId, p_outcome: outcome, p_notes: notes,
  });
  if (error) throw new Error(error.message);
}
