import { supabase, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { Warehouse } from '../types';

export const DEFAULT_SEED_WAREHOUSES: Warehouse[] = [];

const LOCAL_WAREHOUSES_KEY = 'shipfaster_custom_warehouses';
const DELETED_WAREHOUSES_KEY = 'shipfaster_deleted_warehouses';

function getDeletedWarehouseIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_WAREHOUSES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoredLocalWarehouses(): Warehouse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_WAREHOUSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read local warehouses:', e);
    return [];
  }
}

export function saveLocalWarehouse(warehouse: Warehouse): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredLocalWarehouses();
    const updated = [warehouse, ...existing.filter((w) => w.id !== warehouse.id)];
    localStorage.setItem(LOCAL_WAREHOUSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist local warehouse:', e);
  }
}

export function getInitialWarehouses(): Warehouse[] {
  const localWh = getStoredLocalWarehouses();
  const deletedIds = new Set(getDeletedWarehouseIds());
  // Merge local custom warehouses with default seed warehouses
  const seedIds = new Set(localWh.map((w) => w.id));
  const merged = [...localWh];
  for (const seed of DEFAULT_SEED_WAREHOUSES) {
    if (!seedIds.has(seed.id) && !deletedIds.has(seed.id)) {
      merged.push(seed);
    }
  }
  return merged;
}

export function updateLocalWarehouse(warehouse: Warehouse): void {
  saveLocalWarehouse(warehouse);
}

export function deleteLocalWarehouse(id: string): void {
  if (typeof window === 'undefined') return;
  const remaining = getStoredLocalWarehouses().filter((warehouse) => warehouse.id !== id);
  localStorage.setItem(LOCAL_WAREHOUSES_KEY, JSON.stringify(remaining));
  const deletedIds = new Set(getDeletedWarehouseIds());
  deletedIds.add(id);
  localStorage.setItem(DELETED_WAREHOUSES_KEY, JSON.stringify([...deletedIds]));
}

export async function updateWarehouseInSupabase(warehouse: Warehouse): Promise<void> {
  if (!isValidUUID(warehouse.id)) return;
  const { error } = await supabase.from('warehouses').update({
    name: warehouse.name,
    contact_name: warehouse.contact_name,
    phone: warehouse.phone,
    address_line1: warehouse.address_line1,
    address_line2: warehouse.address_line2 || null,
    city: warehouse.city,
    state: warehouse.state,
    pincode: warehouse.pincode,
    is_default: warehouse.is_default,
  }).eq('id', warehouse.id);
  if (error) throw error;
}

/**
 * Update identity/address fields before OTP verification. Any change here
 * invalidates the previous verification so the OTP always covers the values
 * that will actually be used for pickup.
 */
export async function updatePickupDetailsInSupabase(warehouse: Warehouse): Promise<Warehouse> {
  if (!isValidUUID(warehouse.id)) throw new Error('Save the pickup warehouse before verifying it.');
  const sellerId = await getEffectiveSellerId(warehouse.seller_id);
  const { data, error } = await supabase
    .from('warehouses')
    .update({
      name: warehouse.name,
      contact_name: warehouse.contact_name,
      phone: warehouse.phone,
      address_line1: warehouse.address_line1,
      address_line2: warehouse.address_line2 || null,
      city: warehouse.city,
      state: warehouse.state,
      pincode: warehouse.pincode,
      address_verified_at: null,
      phone_verified_at: null,
    })
    .eq('id', warehouse.id)
    .eq('seller_id', sellerId)
    .select()
    .single();

  if (error) throw error;
  return {
    ...warehouse,
    ...data,
    address_verified_at: undefined,
    phone_verified_at: undefined,
  } as Warehouse;
}

export async function deleteWarehouseInSupabase(id: string): Promise<void> {
  if (!isValidUUID(id)) return;
  const { error } = await supabase.from('warehouses').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Fetch warehouses for a seller from Supabase, falling back to local + seed hubs
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

    if (data) {
      const fetched: Warehouse[] = data.map((w: any) => ({
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
        address_verified_at: w.address_verified_at || undefined,
        phone_verified_at: w.phone_verified_at || undefined,
        created_at: w.created_at,
      }));

      // Supabase is authoritative in live mode. Merging old optimistic local
      // records creates duplicate warehouses whose IDs do not exist in the DB.
      return fetched;
    }
  } catch (err) {
    console.warn('Failed to fetch warehouses from Supabase (using local & seed hubs):', err);
  }

  // Do not expose unsynced local pickup addresses in the live order workflow.
  return [];
}

/**
 * Create a new warehouse in Supabase and persist to localStorage
 */
export async function createWarehouseInSupabase(
  warehouseData: Omit<Warehouse, 'id' | 'created_at'>,
  fallbackSellerId?: string
): Promise<Warehouse> {
  const now = new Date().toISOString();
  let createdWarehouse: Warehouse = {
    ...warehouseData,
    id: `wh-${Date.now()}`,
    created_at: now,
  };

  try {
    const effectiveSellerId = await getEffectiveSellerId(fallbackSellerId);
    const { data, error } = await supabase
      .from('warehouses')
      .insert({
        seller_id: effectiveSellerId,
        name: warehouseData.name,
        contact_name: warehouseData.contact_name || (warehouseData as any).contact_person,
        phone: warehouseData.phone,
        email: warehouseData.email || '',
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
      createdWarehouse = {
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
        address_verified_at: data.address_verified_at || undefined,
        phone_verified_at: data.phone_verified_at || undefined,
        created_at: data.created_at,
      };
    }
  } catch (err) {
    console.warn('Supabase warehouse creation skipped/failed, using local fallback:', err);
  }

  // Always persist locally
  saveLocalWarehouse(createdWarehouse);
  return createdWarehouse;
}
