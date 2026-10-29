import { admin } from './supabase.ts';

const hex = (bytes: Uint8Array) => [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
const sha256 = async (value: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));

export type ApiPrincipal = { keyId: string; sellerId: string; scopes: string[] };

export async function authenticateApiKey(req: Request, requiredScope: string): Promise<ApiPrincipal> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token.startsWith('pk_live_')) throw new Error('AUTH:Valid ShipFaster API key required');
  const { data: key } = await admin.from('api_keys').select('id,seller_id,scopes').eq('key_hash', await sha256(token)).eq('is_active', true).maybeSingle();
  if (!key) throw new Error('AUTH:Invalid or revoked API key');
  if (!key.scopes?.includes(requiredScope)) throw new Error(`SCOPE:Missing ${requiredScope} scope`);
  const { data: seller } = await admin.from('sellers').select('status,company_name,pan').eq('id', key.seller_id).maybeSingle();
  if (!seller || seller.status !== 'ACTIVE' || !seller.company_name || !seller.pan) throw new Error('SELLER:Verified active seller profile required');
  return { keyId: key.id, sellerId: key.seller_id, scopes: key.scopes };
}

export function apiError(error: unknown): { status: number; body: { error: string; code: string } } {
  const message = error instanceof Error ? error.message : 'Request failed';
  const [prefix, ...rest] = message.split(':');
  const known = ['AUTH', 'SCOPE', 'SELLER', 'VALIDATION', 'NOT_FOUND', 'CONFLICT'];
  const code = known.includes(prefix) ? prefix : 'INTERNAL_ERROR';
  const status = code === 'AUTH' ? 401 : code === 'SCOPE' || code === 'SELLER' ? 403 : code === 'NOT_FOUND' ? 404 : code === 'CONFLICT' ? 409 : code === 'VALIDATION' ? 422 : 500;
  return { status, body: { error: known.includes(prefix) ? rest.join(':') : message, code } };
}
