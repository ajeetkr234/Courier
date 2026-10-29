import { corsHeaders, hmacHex, json, safeEqual } from '../_shared/http.ts';
import { admin } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(req.url);
  const provider = (url.searchParams.get('provider') || 'razorpay').toLowerCase();
  if (!['razorpay', 'cashfree', 'stripe'].includes(provider)) {
    return json({ error: 'Unsupported payment provider' }, 400);
  }

  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ||
    req.headers.get('x-webhook-signature') ||
    req.headers.get('stripe-signature') || '';
  const timestamp = req.headers.get('x-webhook-timestamp') || '';
  const eventId = req.headers.get('x-event-id') || req.headers.get('x-razorpay-event-id') || '';

  const secret = Deno.env.get(`PAYMENT_WEBHOOK_SECRET_${provider.toUpperCase()}`) ||
    Deno.env.get('PAYMENT_WEBHOOK_SECRET');

  if (!secret) {
    return json({ error: 'Payment webhook secret is not configured' }, 503);
  }

  if (!signature) {
    return json({ error: 'Missing webhook signature' }, 401);
  }

  // Replay prevention: verify timestamp freshness if timestamp header is provided (within 5 minutes)
  if (timestamp) {
    const eventTime = Date.parse(timestamp);
    if (isNaN(eventTime) || Math.abs(Date.now() - eventTime) > 300000) {
      return json({ error: 'Webhook timestamp expired or invalid' }, 401);
    }
  }

  // Cryptographic signature verification using constant-time comparison
  const expectedSignature = await hmacHex(secret, timestamp ? `${timestamp}.${raw}` : raw);
  if (!safeEqual(signature, expectedSignature)) {
    return json({ error: 'Invalid webhook signature' }, 401);
  }

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: 'Malformed JSON payload' }, 400);
  }

  // Parse payment entity from provider-specific payload
  // Razorpay format: { event: 'payment.captured', payload: { payment: { entity: { id, amount, currency, status, notes: { seller_id } } } } }
  // Generic format: { event: 'payment.captured', payment_id: '...', amount: 1000, currency: 'INR', status: 'captured', seller_id: '...' }
  const rzpPayment = payload?.payload?.payment?.entity;
  const paymentId = String(rzpPayment?.id || payload?.payment_id || payload?.id || '');
  const orderId = String(rzpPayment?.order_id || payload?.order_id || '');
  const status = String(rzpPayment?.status || payload?.status || '').toLowerCase();
  const currency = String(rzpPayment?.currency || payload?.currency || 'INR').toUpperCase();
  const rawAmount = rzpPayment?.amount !== undefined ? Number(rzpPayment.amount) / 100 : Number(payload?.amount || 0);
  const sellerId = rzpPayment?.notes?.seller_id || payload?.notes?.seller_id || payload?.seller_id;
  const resolvedEventId = eventId || String(payload?.event_id || payload?.id || paymentId);

  if (!paymentId) {
    return json({ error: 'Payment identifier missing from payload' }, 422);
  }

  // Validate status is captured/paid
  if (!['captured', 'paid', 'succeeded', 'payment.captured'].includes(status) &&
      !['captured', 'paid', 'succeeded', 'payment.captured'].includes(String(payload?.event || '').toLowerCase())) {
    return json({ accepted: true, message: `Ignoring non-capture event: ${status || payload?.event}` });
  }

  // Validate currency
  if (currency !== 'INR') {
    return json({ error: `Unsupported currency: ${currency}. Only INR is accepted.` }, 422);
  }

  // Validate amount
  if (isNaN(rawAmount) || rawAmount < 100 || rawAmount > 1000000) {
    return json({ error: 'Payment amount must be between ₹100 and ₹1,000,000' }, 422);
  }

  // Validate seller ID from server-stored metadata
  if (!sellerId || typeof sellerId !== 'string') {
    return json({ error: 'Payment does not contain a verified seller_id in metadata' }, 422);
  }

  // Idempotent record in inbound_webhook_events
  const payloadHash = await hmacHex(secret, raw);
  const { error: insertError } = await admin.from('inbound_webhook_events').insert({
    provider: `payment_${provider}`,
    provider_event_id: resolvedEventId,
    payload_hash: payloadHash,
    event_type: payload?.event || 'payment.captured',
    payload,
  });

  if (insertError?.code === '23505') {
    // Unique constraint violation on duplicate event delivery
    return json({ accepted: true, duplicate: true });
  }
  if (insertError) {
    return json({ error: insertError.message }, 500);
  }

  // Invoke atomic database credit via service_role RPC
  const { data: creditResult, error: creditError } = await admin.rpc('process_verified_payment_credit', {
    p_provider: provider,
    p_provider_payment_id: paymentId,
    p_provider_order_id: orderId || null,
    p_seller_id: sellerId,
    p_paid_amount: rawAmount,
    p_currency: currency,
    p_raw_payload: payload,
  });

  if (creditError) {
    await admin.from('inbound_webhook_events').update({
      status: 'FAILED',
      error_message: creditError.message,
      processed_at: new Date().toISOString(),
    }).eq('provider_event_id', resolvedEventId).eq('provider', `payment_${provider}`);

    return json({ error: creditError.message }, 409);
  }

  await admin.from('inbound_webhook_events').update({
    status: 'PROCESSED',
    processed_at: new Date().toISOString(),
  }).eq('provider_event_id', resolvedEventId).eq('provider', `payment_${provider}`);

  return json({
    accepted: true,
    result: creditResult,
  }, 200);
});
