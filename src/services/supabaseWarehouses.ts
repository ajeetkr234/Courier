import { supabase, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { Warehouse } from '../types';

/**
 * Fetch warehouses for a seller from Supabase
 */
export async function fetchWarehousesFromSupabase(sellerId?: string): Promise<Warehouse[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    let query = supabase
      .from('warehouses')
      .select('*')
      .order('created_at', { ascending: false });

    if (isValidUUID(effectiveSellerId)) {
      query = query.eq('seller_id', effectiveSellerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((w: any) => ({
      id: w.id,
      seller_id: w.seller_id,
      name: w.name,
      contact_name: w.contact_name,
      phone: w.phone,
      email: w.email,
      address_line1: w.address_line1,
      address_line2: w.address_line2,
      city: w.city,
      state: w.state,
      pincode: w.pincode,
      is_default: Boolean(w.is_default),
      created_at: w.created_at,
    }));
  } catch (err) {
    console.warn('Failed to fetch warehouses from Supabase:', err);
    return [];
  }
}

/**
 * Create a new warehouse in Supabase
 */
export async function createWarehouseInSupabase(
  warehouseData: Omit<Warehouse, 'id' | 'created_at'>,
  fallbackSellerId?: string
): Promise<Warehouse> {
  const effectiveSellerId = await getEffectiveSellerId(fallbackSellerId);
  const now = new Date().toISOString();

  {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          seller_id: effectiveSellerId,
          name: warehouseData.name,
          contact_name: warehouseData.contact_name || (warehouseData as any).contact_person || 'Warehouse Dispatch Incharge',
          phone: warehouseData.phone || '9876543210',
          email: warehouseData.email || 'warehouse@apexretail.store',
          address_line1: warehouseData.address_line1,
          address_line2: warehouseData.address_line2 || null,
          city: warehouseData.city,
          state: warehouseData.state,
          pincode: warehouseData.pincode,
          is_default: warehouseData.is_default ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          seller_id: data.seller_id,
          name: data.name,
          contact_name: data.contact_name,
          phone: data.phone,
          email: data.email,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          is_default: data.is_default,
          created_at: data.created_at,
        };
      }
    } catch (err) {
      console.error('Supabase warehouse creation error:', err);
    }
  }

  return {
    ...warehouseData,
    id: `wh-${Date.now()}`,
    created_at: now,
  };
}
