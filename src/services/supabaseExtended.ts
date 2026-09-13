import { supabase, isValidUUID } from '../lib/supabase';
import {
  BrandedTrackingConfig,
  CODPayoutBatch,
  IntegrationAccount,
  NDREscalation,
  ReconciliationRecord,
  SellerBankAccount,
  UserProfile,
} from '../types';

let hasNotifiedMissingTable = false;

async function selectMany<T>(table: string, sellerId?: string): Promise<T[]> {
  try {
    let query = supabase.from(table).select('*').order('created_at', { ascending: false });
    if (sellerId) query = query.eq('seller_id', sellerId);
    const { data, error } = await query;
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        if (!hasNotifiedMissingTable) {
          hasNotifiedMissingTable = true;
          console.info(
            '%c[ShipFaster] Notice: Supabase live panel tables (supabase/migrations/20260911000000_live_panel_data.sql) need to be run in your Supabase SQL Editor. Using local fallback data in the meantime.',
            'color: #6366f1; font-weight: bold;'
          );
        }
      } else {
        console.warn(`Could not load ${table}:`, error.message);
      }
      return [];
    }
    return (data || []) as T[];
  } catch {
    return [];
  }
}

export const fetchTeamMembers = (sellerId?: string) => selectMany<UserProfile>('seller_team_members', sellerId);
export const fetchIntegrations = (sellerId?: string) => selectMany<IntegrationAccount>('integration_accounts', sellerId);
export const fetchReconciliations = (sellerId?: string) => selectMany<ReconciliationRecord>('reconciliation_records', sellerId);
export const fetchNDREscalations = (sellerId?: string) => selectMany<NDREscalation>('ndr_escalations', sellerId);
export const fetchCODPayoutBatches = (sellerId?: string) => selectMany<CODPayoutBatch>('cod_payout_batches', sellerId);

export async function fetchSellerBankAccount(sellerId?: string): Promise<SellerBankAccount | null> {
  if (!sellerId) return null;
  try {
    const { data, error } = await supabase.from('seller_bank_accounts').select('*').eq('seller_id', sellerId)
      .order('is_primary', { ascending: false }).limit(1).maybeSingle();
    if (error && error.code !== 'PGRST205' && !error.message?.includes('schema cache')) {
      console.warn('Could not load seller bank account:', error.message);
    }
    return (data as SellerBankAccount | null) || null;
  } catch {
    return null;
  }
}

export async function fetchBrandedTrackingConfig(sellerId?: string): Promise<BrandedTrackingConfig | null> {
  if (!sellerId) return null;
  try {
    const { data, error } = await supabase.from('branded_tracking_configs').select('*').eq('seller_id', sellerId).maybeSingle();
    if (error && error.code !== 'PGRST205' && !error.message?.includes('schema cache')) {
      console.warn('Could not load branded tracking config:', error.message);
    }
    return (data as BrandedTrackingConfig | null) || null;
  } catch {
    return null;
  }
}

export async function saveBankAccount(account: SellerBankAccount): Promise<SellerBankAccount | null> {
  const payload = { ...account, id: account.id.startsWith('bank-') ? undefined : account.id };
  const { data, error } = await supabase.from('seller_bank_accounts').upsert(payload).select().single();
  if (error) console.error('Could not save bank account:', error.message);
  return (data as SellerBankAccount | null) || null;
}

export async function saveBrandedTrackingConfig(config: BrandedTrackingConfig): Promise<void> {
  const { error } = await supabase.from('branded_tracking_configs').upsert(config, { onConflict: 'seller_id' });
  if (error) console.error('Could not save branded tracking config:', error.message);
}

export async function saveNDREscalation(escalation: NDREscalation): Promise<NDREscalation | null> {
  const payload = {
    ...escalation,
    id: escalation.id.startsWith('esc-') ? undefined : escalation.id,
    ndr_case_id: isValidUUID(escalation.ndr_case_id) ? escalation.ndr_case_id : undefined,
  };
  const { data, error } = await supabase.from('ndr_escalations').insert(payload).select().single();
  if (error) console.error('Could not save NDR escalation:', error.message);
  return (data as NDREscalation | null) || null;
}

export async function updateNDREscalation(id: string, status: NDREscalation['carrier_escalation_status'], adminNotes?: string): Promise<void> {
  const { error } = await supabase.from('ndr_escalations').update({ carrier_escalation_status: status, admin_notes: adminNotes, resolved_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('Could not update NDR escalation:', error.message);
}

export async function saveCODPayoutBatch(batch: CODPayoutBatch): Promise<CODPayoutBatch | null> {
  const payload = { ...batch, id: batch.id.startsWith('batch-') ? undefined : batch.id };
  const { data, error } = await supabase.from('cod_payout_batches').insert(payload).select().single();
  if (error) console.error('Could not save COD payout batch:', error.message);
  return (data as CODPayoutBatch | null) || null;
}

export async function updateReconciliation(id: string, status: ReconciliationRecord['status'], notes?: string): Promise<void> {
  const { error } = await supabase.from('reconciliation_records').update({ status, notes }).eq('id', id);
  if (error) console.error('Could not update reconciliation:', error.message);
}

export async function toggleIntegration(id: string, enabled: boolean): Promise<void> {
  const { error } = await supabase.from('integration_accounts').update({ auto_sync_orders: enabled, last_synced_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('Could not update integration:', error.message);
}

export async function toggleTeamMember(id: string, enabled: boolean): Promise<void> {
  const { error } = await supabase.from('seller_team_members').update({ is_active: enabled }).eq('id', id);
  if (error) console.error('Could not update team member:', error.message);
}
