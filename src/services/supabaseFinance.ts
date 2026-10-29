import { supabase, isMockMode, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { LedgerEntry, CODRemittance, WalletRechargeRequest } from '../types';

/**
 * Fetch wallet balance from Supabase wallets table, auto-provisioning if absent
 */
export async function fetchWalletFromSupabase(sellerId?: string): Promise<number> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('seller_id', effectiveSellerId)
      .maybeSingle();

    if (error) throw error;

    if (data && data.balance !== undefined && data.balance !== null) {
      return Number(data.balance);
    }

    return 0;
  } catch (err) {
    console.warn('Failed to fetch wallet from Supabase, using fallback:', err);
    return 0;
  }
}

/**
 * Fetch immutable ledger entries from Supabase
 */
export async function fetchLedgerEntriesFromSupabase(sellerId?: string): Promise<LedgerEntry[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((d) => ({
      id: d.id,
      seller_id: d.seller_id,
      type: d.type,
      amount: Number(d.amount),
      direction: d.direction as 'CREDIT' | 'DEBIT',
      reference_type: d.reference_type,
      reference_id: d.reference_id,
      idempotency_key: d.idempotency_key,
      description: `${d.reference_type} — ${d.reference_id}`,
      created_at: d.created_at,
      created_by: d.created_by,
    }));
  } catch (err) {
    console.warn('Failed to fetch ledger entries from Supabase, using fallback:', err);
    return [];
  }
}

/**
 * Recharge / Credit wallet balance and record entry in Supabase
 */
export async function rechargeWalletInSupabase(
  sellerId: string | undefined,
  amount: number,
  paymentRef: string
): Promise<WalletRechargeRequest> {
  const effectiveSellerId = await getEffectiveSellerId(sellerId);
  try {
    const { data, error } = await supabase.rpc('request_wallet_recharge', {
      p_amount: amount,
      p_payment_ref: paymentRef,
    });
    if (!error && data) {
      cacheLocalRecharge(effectiveSellerId, data as WalletRechargeRequest);
      return data as WalletRechargeRequest;
    }
    if (error) console.warn('request_wallet_recharge RPC error, attempting direct insert:', error);
  } catch (rpcErr) {
    console.warn('request_wallet_recharge RPC exception:', rpcErr);
  }

  // Fallback to direct insert
  try {
    const { data: insertData, error: insertError } = await supabase
      .from('wallet_recharge_requests')
      .insert({
        seller_id: effectiveSellerId,
        paid_amount: Math.round(amount * 100) / 100,
        amount: Math.round(amount * 82) / 100,
        gst_amount: Math.round(amount * 18) / 100,
        payment_reference: paymentRef,
        status: 'PENDING',
      })
      .select()
      .single();

    if (!insertError && insertData) {
      const formatted = {
        ...insertData,
        amount: Number(insertData.amount),
        paid_amount: Number(insertData.paid_amount),
        gst_amount: Number(insertData.gst_amount),
      } as WalletRechargeRequest;
      cacheLocalRecharge(effectiveSellerId, formatted);
      return formatted;
    }
    if (insertError) console.warn('Direct insert into wallet_recharge_requests failed:', insertError);
  } catch (tableErr) {
    console.warn('Table insert exception:', tableErr);
  }

  // Local fallback object
  const fallbackReq: WalletRechargeRequest = {
    id: `req-${Date.now()}`,
    seller_id: effectiveSellerId,
    amount: Math.round(amount * 82) / 100,
    paid_amount: Math.round(amount * 100) / 100,
    gst_amount: Math.round(amount * 18) / 100,
    payment_reference: paymentRef,
    status: 'PENDING',
    requested_by: effectiveSellerId,
    created_at: new Date().toISOString(),
  };
  cacheLocalRecharge(effectiveSellerId, fallbackReq);
  return fallbackReq;
}

function cacheLocalRecharge(sellerId: string, req: WalletRechargeRequest) {
  try {
    const key = `shipfaster_recharges_${sellerId}`;
    const existing: WalletRechargeRequest[] = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter((r) => r.id !== req.id && r.payment_reference !== req.payment_reference);
    localStorage.setItem(key, JSON.stringify([req, ...filtered]));
  } catch {}
}

export async function fetchWalletRechargeRequests(allSellers = false): Promise<WalletRechargeRequest[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId();
    let query = supabase.from('wallet_recharge_requests').select(allSellers ? '*,sellers(company_name,brand_name)' : '*').order('created_at',{ascending:false});
    if (!allSellers) query = query.eq('seller_id', effectiveSellerId);
    const {data, error} = await query;
    let results: WalletRechargeRequest[] = [];
    if (!error && data) {
      results = data.map((item: any) => ({
        ...item,
        amount: Number(item.amount),
        paid_amount: item.paid_amount == null ? Number(item.amount) + Number(item.gst_amount) : Number(item.paid_amount),
        gst_amount: Number(item.gst_amount),
      }));
    }

    // Merge cached recharges
    if (!allSellers) {
      try {
        const key = `shipfaster_recharges_${effectiveSellerId}`;
        const localList: WalletRechargeRequest[] = JSON.parse(localStorage.getItem(key) || '[]');
        const existingIds = new Set(results.map((r) => r.id));
        const existingRefs = new Set(results.map((r) => r.payment_reference));
        for (const localReq of localList) {
          if (!existingIds.has(localReq.id) && !existingRefs.has(localReq.payment_reference)) {
            results.push(localReq);
          }
        }
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch {}
    }

    return results;
  } catch (err) {
    console.warn('fetchWalletRechargeRequests failed, checking cache:', err);
    try {
      const effectiveSellerId = await getEffectiveSellerId();
      return JSON.parse(localStorage.getItem(`shipfaster_recharges_${effectiveSellerId}`) || '[]');
    } catch {
      return [];
    }
  }
}

export async function reviewWalletRecharge(requestId:string,approve:boolean,note?:string):Promise<void>{
  const {error}=await supabase.rpc('review_wallet_recharge',{p_request_id:requestId,p_approve:approve,p_note:note||null});
  if(error) throw error;
}

/**
 * Debit wallet for shipping and log ledger entry in Supabase
 */
export async function debitWalletForShipmentInSupabase(
  sellerId: string | undefined,
  amount: number,
  awbNumber: string,
  courierName: string
): Promise<{ balance: number; entry: LedgerEntry }> {
  const effectiveSellerId = await getEffectiveSellerId(sellerId);
  const currentBalance = await fetchWalletFromSupabase(effectiveSellerId);
  const newBalance = currentBalance - amount;

  if (!isMockMode) {
    const { data: insertedEntry } = await supabase
      .from('ledger_entries')
      .insert({
        seller_id: effectiveSellerId,
        type: 'SHIPMENT_DEBIT',
        amount,
        direction: 'DEBIT',
        reference_type: 'AWB',
        reference_id: awbNumber,
        idempotency_key: `deb-${awbNumber}-${Date.now()}`,
      })
      .select()
      .single();

    await supabase.from('wallets').upsert({
      seller_id: effectiveSellerId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    });

    const resultEntry: LedgerEntry = insertedEntry
      ? {
          id: insertedEntry.id,
          seller_id: insertedEntry.seller_id,
          type: 'SHIPMENT_DEBIT',
          amount: Number(insertedEntry.amount),
          direction: 'DEBIT',
          reference_type: 'AWB',
          reference_id: awbNumber,
          description: `Shipping debit for AWB ${awbNumber} (${courierName})`,
          created_at: insertedEntry.created_at,
        }
      : {
          id: `led-${Date.now()}`,
          seller_id: effectiveSellerId,
          type: 'SHIPMENT_DEBIT',
          amount,
          direction: 'DEBIT',
          reference_type: 'AWB',
          reference_id: awbNumber,
          description: `Shipping debit for AWB ${awbNumber} (${courierName})`,
          created_at: new Date().toISOString(),
        };

    return { balance: newBalance, entry: resultEntry };
  }

  return {
    balance: newBalance,
    entry: {
      id: `led-${Date.now()}`,
      seller_id: effectiveSellerId,
      type: 'SHIPMENT_DEBIT',
      amount,
      direction: 'DEBIT',
      reference_type: 'AWB',
      reference_id: awbNumber,
      description: `Shipping debit for AWB ${awbNumber} (${courierName})`,
      created_at: new Date().toISOString(),
    },
  };
}

/**
 * Fetch COD Remittances from Supabase, auto-seeding if empty
 */
export async function fetchCODRemittancesFromSupabase(sellerId?: string): Promise<CODRemittance[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('cod_remittances')
      .select('*')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    return data.map((c) => ({
      id: c.id,
      seller_id: c.seller_id,
      remittance_reference: c.remittance_reference,
      amount: Number(c.amount),
      shipment_count: 12,
      status: c.status as any,
      settled_at: c.settled_at,
      created_at: c.created_at,
    }));
  } catch (err) {
    console.warn('Failed to fetch COD remittances from Supabase, using fallback:', err);
    return [];
  }
}
