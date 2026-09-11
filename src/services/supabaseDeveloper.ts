import { supabase, isMockMode, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { APIKey, WebhookEndpoint } from '../types';

/**
 * Fetch API keys from Supabase for this seller
 */
export async function fetchAPIKeysFromSupabase(sellerId?: string): Promise<APIKey[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((k: any) => ({
      id: k.id,
      seller_id: k.seller_id,
      name: k.name,
      key_prefix: k.key_prefix,
      secret_key_masked: `${k.key_prefix}••••${k.key_hash ? k.key_hash.slice(-4) : '9981'}`,
      scopes: k.scopes || ['orders:read', 'orders:write', 'rates:read', 'shipments:write'],
      is_active: k.is_active ?? true,
      last_used_at: k.last_used_at,
      created_at: k.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch API keys from Supabase:', err);
    return [];
  }
}

/**
 * Create a new API Key in Supabase
 */
export async function createAPIKeyInSupabase(
  sellerId: string | undefined,
  name: string,
  scopes: string[]
): Promise<APIKey> {
  const effectiveSellerId = await getEffectiveSellerId(sellerId);
  const prefix = `pk_live_${Math.random().toString(36).substring(2, 6)}_`;
  const rawSecret = `${prefix}${Math.random().toString(36).substring(2, 16)}`;
  const keyHash = `hash_${Math.random().toString(36).substring(2, 18)}`;
  const masked = `${prefix}••••${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  if (!isMockMode) {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          seller_id: effectiveSellerId,
          name,
          key_prefix: prefix,
          key_hash: keyHash,
          scopes,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          seller_id: data.seller_id,
          name: data.name,
          key_prefix: data.key_prefix,
          secret_key_masked: masked,
          scopes: data.scopes,
          is_active: data.is_active,
          created_at: data.created_at,
        };
      }
    } catch (e) {
      console.error('Failed to insert API key to Supabase:', e);
    }
  }

  return {
    id: `key-${Date.now()}`,
    seller_id: effectiveSellerId,
    name,
    key_prefix: prefix,
    secret_key_masked: masked,
    scopes,
    is_active: true,
    created_at: now,
  };
}

/**
 * Revoke or disable an API Key in Supabase
 */
export async function revokeAPIKeyInSupabase(keyId: string): Promise<void> {
  if (isMockMode) return;
  try {
    if (isValidUUID(keyId)) {
      await supabase.from('api_keys').update({ is_active: false }).eq('id', keyId);
    }
  } catch (err) {
    console.error('Failed to revoke API key in Supabase:', err);
  }
}

/**
 * Fetch Webhook Endpoints from Supabase
 */
export async function fetchWebhooksFromSupabase(sellerId?: string): Promise<WebhookEndpoint[]> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('seller_id', effectiveSellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((w: any) => ({
      id: w.id,
      seller_id: w.seller_id,
      url: w.url,
      secret: w.secret,
      subscribed_events: w.subscribed_events || [],
      is_active: w.is_active ?? true,
      created_at: w.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch webhooks from Supabase:', err);
    return [];
  }
}

/**
 * Create a new Webhook Endpoint in Supabase
 */
export async function createWebhookInSupabase(
  sellerId: string | undefined,
  url: string,
  events: string[]
): Promise<WebhookEndpoint> {
  const effectiveSellerId = await getEffectiveSellerId(sellerId);
  const secret = `whsec_${Math.random().toString(36).substring(2, 14)}`;
  const now = new Date().toISOString();

  if (!isMockMode) {
    try {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .insert({
          seller_id: effectiveSellerId,
          url,
          secret,
          subscribed_events: events,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          seller_id: data.seller_id,
          url: data.url,
          secret: data.secret,
          subscribed_events: data.subscribed_events,
          is_active: data.is_active,
          created_at: data.created_at,
        };
      }
    } catch (e) {
      console.error('Failed to create webhook in Supabase:', e);
    }
  }

  return {
    id: `whk-${Date.now()}`,
    seller_id: effectiveSellerId,
    url,
    secret,
    subscribed_events: events,
    is_active: true,
    created_at: now,
  };
}

/**
 * Toggle a Webhook's active status in Supabase
 */
export async function toggleWebhookInSupabase(webhookId: string, isActive: boolean): Promise<void> {
  if (isMockMode) return;
  try {
    if (isValidUUID(webhookId)) {
      await supabase.from('webhook_endpoints').update({ is_active: isActive }).eq('id', webhookId);
    }
  } catch (err) {
    console.error('Failed to toggle webhook status in Supabase:', err);
  }
}
