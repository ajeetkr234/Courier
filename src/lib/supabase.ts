import { createClient } from '@supabase/supabase-js';

const env: Record<string, any> = (typeof import.meta !== 'undefined' && (import.meta as any).env) 
  ? (import.meta as any).env 
  : ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env) ? (globalThis as any).process.env : {});
const rawUrl = env.VITE_SUPABASE_URL || '';
// Strip any trailing /rest/v1 or trailing slashes if present
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export let isMockMode = env.VITE_USE_MOCK_DATA === 'true' || (typeof window !== 'undefined' && window.localStorage?.getItem('shipfaster_mock_mode') === 'true');

export function setMockMode(val: boolean) {
  isMockMode = val;
  if (typeof window !== 'undefined') {
    if (val) window.localStorage?.setItem('shipfaster_mock_mode', 'true');
    else window.localStorage?.removeItem('shipfaster_mock_mode');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id?: string | null): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

export async function getEffectiveSellerId(providedSellerId?: string | null): Promise<string> {
  if (isValidUUID(providedSellerId)) {
    return providedSellerId!;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const claimedSellerId = session?.user.app_metadata?.seller_id;
    if (isValidUUID(claimedSellerId)) return claimedSellerId;
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const cached = window.localStorage?.getItem('shipfaster_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isValidUUID(parsed?.seller?.id)) return parsed.seller.id;
      }
    } catch {}
  }

  return '32d724db-23c4-4cba-a76f-f78e4022194e';
}
