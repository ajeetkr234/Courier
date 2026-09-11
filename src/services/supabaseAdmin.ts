import { supabase, isMockMode } from '../lib/supabase';
import { Seller, RateCard, UserProfile } from '../types';

/**
 * Fetch all sellers from Supabase for Admin governance
 */
export async function fetchSellersFromSupabase(): Promise<Seller[]> {
  if (isMockMode) return [];
  try {
    const { data, error } = await supabase.from('sellers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      company_name: s.company_name,
      brand_name: s.brand_name || s.company_name,
      gstin: s.gstin,
      pan: s.pan,
      status: s.status,
      rate_card_id: s.rate_card_id,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  } catch (err) {
    console.error('Failed to fetch sellers from Supabase:', err);
    return [];
  }
}

/**
 * Update seller account status in Supabase
 */
export async function updateSellerStatusInSupabase(sellerId: string, status: Seller['status']): Promise<void> {
  if (isMockMode) return;
  try {
    const { error } = await supabase
      .from('sellers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sellerId);
    if (error) console.error('Error updating seller status in Supabase:', error);
  } catch (err) {
    console.error('Failed to update seller status in Supabase:', err);
  }
}

/**
 * Update seller KYC approval or rejection
 */
export async function updateSellerKYCInSupabase(sellerId: string, isApproved: boolean, reason?: string): Promise<void> {
  if (isMockMode) return;
  try {
    const newStatus: Seller['status'] = isApproved ? 'ACTIVE' : 'REJECTED';
    await supabase
      .from('sellers')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sellerId);

    await supabase
      .from('seller_kyc')
      .upsert({
        seller_id: sellerId,
        verified_at: isApproved ? new Date().toISOString() : null,
        rejection_reason: isApproved ? null : (reason || 'Document verification failed'),
      });
  } catch (err) {
    console.error('Failed to update seller KYC in Supabase:', err);
  }
}

/**
 * Toggle Courier Active status in Supabase
 */
export async function toggleCourierInSupabase(courierId: string, isActive: boolean): Promise<void> {
  if (isMockMode) return;
  try {
    const { error } = await supabase
      .from('couriers')
      .update({ is_active: isActive })
      .eq('id', courierId);
    if (error) console.error('Error toggling courier status in Supabase:', error);
  } catch (err) {
    console.error('Failed to toggle courier in Supabase:', err);
  }
}

/**
 * Create or save Rate Card in Supabase
 */
export async function saveRateCardInSupabase(cardData: Omit<RateCard, 'id' | 'created_at'>): Promise<RateCard> {
  const now = new Date().toISOString();
  if (!isMockMode) {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .insert({
          name: cardData.name,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          ...cardData,
          id: data.id,
          name: data.name,
          created_at: data.created_at || now,
        };
      }
    } catch (err) {
      console.error('Failed to save rate card in Supabase:', err);
    }
  }

  return {
    ...cardData,
    id: `rc-${Date.now()}`,
    created_at: now,
  };
}

/**
 * Add or invite Team Member in Supabase
 */
export async function addTeamMemberInSupabase(
  sellerId: string,
  member: Omit<UserProfile, 'id'>
): Promise<UserProfile> {
  if (!isMockMode) {
    try {
      const { data, error } = await supabase
        .from('seller_team_members')
        .insert({
          seller_id: sellerId,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          is_active: true,
        })
        .select()
        .single();

      if (data) {
        return {
          id: data.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          seller_id: sellerId,
          is_active: true,
        };
      }
      if (error) throw error;
    } catch (err) {
      console.warn('Could not insert seller_user row into Supabase:', err);
    }
  }

  return {
    ...member,
    id: `u-${Date.now()}`,
    seller_id: sellerId,
    is_active: true,
  };
}
