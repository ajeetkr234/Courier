import { supabase, isMockMode } from '../lib/supabase';
import { Courier, RateCard } from '../types';

export const DEFAULT_SEED_COURIERS: Courier[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    code: 'delhivery',
    name: 'Delhivery Surface & Air',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 180,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    code: 'xpressbees',
    name: 'Xpressbees Express',
    logo_url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 220,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    code: 'ecom',
    name: 'Ecom Express',
    logo_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 195,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    code: 'bluedart',
    name: 'Blue Dart Air',
    logo_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 150,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    code: 'shadowfax',
    name: 'Shadowfax Hyperlocal',
    logo_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 210,
  },
];

/**
 * Fetch all active couriers from Supabase.
 */
export async function fetchCouriersFromSupabase(): Promise<Courier[]> {
  try {
    const { data, error } = await supabase
      .from('couriers')
      .select('*')
      .order('name');

    if (error) throw error;

    if (!data || data.length === 0) return [];

    return data.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      logo_url: c.logo_url,
      is_active: c.is_active ?? true,
      api_health: 'HEALTHY',
      avg_latency_ms: 190,
    }));
  } catch (err) {
    console.warn('Failed to load couriers from Supabase:', err);
    return [];
  }
}

/**
 * Auto seed couriers into Supabase if empty
 */
export async function autoSeedCouriers(): Promise<void> {
  try {
    const records = DEFAULT_SEED_COURIERS.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      logo_url: c.logo_url,
      is_active: c.is_active,
    }));

    await supabase.from('couriers').upsert(records, { onConflict: 'code' });
  } catch (e) {
    console.error('Auto seed error:', e);
  }
}

/**
 * Fetch rate cards from Supabase.
 */
export async function fetchRateCardsFromSupabase(): Promise<RateCard[]> {
  try {
    const { data, error } = await supabase
      .from('rate_cards')
      .select('*, rate_slabs(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((rc) => ({
      id: rc.id,
      name: rc.name,
      courier_id: rc.courier_id || 'a0000000-0000-0000-0000-000000000001',
      courier_name: rc.courier_name || 'Delhivery Direct',
      plan_tier: (rc.plan_tier as any) || 'STANDARD',
      cod_percent: Number(rc.cod_percent || 1.8),
      cod_flat_min: Number(rc.cod_flat_min || 20),
      rto_multiplier: Number(rc.rto_multiplier || 1.0),
      zones: (rc.rate_slabs || []).map((slab: any) => ({
        zone_code: slab.zone,
        zone_name: `Zone ${slab.zone}`,
        base_weight_kg: Number(slab.base_weight_kg || 0.5),
        base_rate: Number(slab.base_freight_rate || 40),
        additional_weight_slab_kg: Number(slab.additional_weight_step_kg || 0.5),
        additional_rate: Number(slab.additional_freight_rate || 30),
      })),
      created_at: rc.created_at,
    }));
  } catch (err) {
    console.warn('Failed to load rate cards from Supabase:', err);
    return [];
  }
}
