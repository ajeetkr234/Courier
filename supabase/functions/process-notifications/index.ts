import { admin } from '../_shared/supabase.ts';
import { json } from '../_shared/http.ts';

const interpolate = (payload: any) => `Hi ${payload.customer_name || 'Customer'}, your ShipFaster order ${payload.external_order_id || payload.order_id} is now ${String(payload.status).replaceAll('_', ' ')}. Track: ${payload.tracking_url}`;

async function sendWhatsApp(job: any) {
  const token = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN'), phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneNumberId) throw new Error('Meta WhatsApp credentials are not configured');
  const version = Deno.env.get('META_GRAPH_API_VERSION') || 'v21.0';
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: job.destination, type: 'template', template: {
      name: job.payload.whatsapp_template_name || 'shipment_update', language: { code: job.payload.whatsapp_language_code || 'en' },
      components: [{ type: 'body', parameters: [
        { type: 'text', text: job.payload.customer_name || 'Customer' },
        { type: 'text', text: job.payload.external_order_id || job.payload.order_id },
        { type: 'text', text: String(job.payload.status).replaceAll('_', ' ') },
        { type: 'text', text: job.payload.tracking_url },
      ] }],
    } }), signal: AbortSignal.timeout(12000),
  });
  const data = await response.json(); if (!response.ok) throw new Error(data?.error?.message || `Meta returned ${response.status}`);
  return { provider: 'META_WHATSAPP', id: data.messages?.[0]?.id };
}

async function sendSms(job: any) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID'), token = Deno.env.get('TWILIO_AUTH_TOKEN'), from = Deno.env.get('TWILIO_SMS_FROM');
  if (!sid || !token || !from) throw new Error('Twilio SMS credentials are not configured');
  const form = new URLSearchParams({ To: job.destination, From: from, Body: interpolate(job.payload) });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', headers: { authorization: `Basic ${btoa(`${sid}:${token}`)}`, 'content-type': 'application/x-www-form-urlencoded' }, body: form, signal: AbortSignal.timeout(12000) });
  const data = await response.json(); if (!response.ok) throw new Error(data.message || `Twilio returned ${response.status}`);
  return { provider: 'TWILIO', id: data.sid };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const secret = Deno.env.get('NOTIFICATION_WORKER_SECRET');
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);
  const input = await req.json().catch(() => ({}));
  const { data: jobs, error } = await admin.rpc('claim_notification_attempts', { p_limit: Math.min(Number(input.batch_size || 100), 200) });
  if (error) return json({ error: error.message }, 500);
  const results = await Promise.all((jobs || []).map(async (job: any) => {
    try {
      const result = job.channel === 'WHATSAPP' ? await sendWhatsApp(job) : await sendSms(job);
      await admin.from('notification_attempts').update({ status: 'DELIVERED', provider: result.provider, provider_message_id: result.id, delivered_at: new Date().toISOString(), error_message: null, updated_at: new Date().toISOString() }).eq('id', job.id);
      return true;
    } catch (failure) {
      const terminal = job.attempt_count >= 5;
      await admin.from('notification_attempts').update({ status: terminal ? 'SKIPPED' : 'FAILED', error_message: failure instanceof Error ? failure.message : 'Delivery failed', next_retry_at: new Date(Date.now() + Math.pow(4, job.attempt_count) * 60_000).toISOString(), updated_at: new Date().toISOString() }).eq('id', job.id);
      return false;
    }
  }));
  return json({ processed: results.length, delivered: results.filter(Boolean).length, failed: results.filter((value) => !value).length });
});
