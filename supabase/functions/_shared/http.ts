export const corsHeaders = {
  'access-control-allow-origin': '*',
  // supabase-js adds x-client-info to Edge Function requests. It must be
  // accepted by the browser preflight or the actual POST is never sent.
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info, idempotency-key, x-integration-account-id, x-webhook-signature, x-webhook-timestamp, x-event-id',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'content-type': 'application/json' } });
}

export async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
