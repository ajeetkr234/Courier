import React, { useState } from 'react';
import { Key, Globe, Plus, Copy, MessageCircle, Radio } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { APIKey, WebhookEndpoint } from '../../types';
import { toast } from 'sonner';
import { fetchNotificationSettings, getOrdersApiUrl, getRatesApiUrl, getShipmentsApiUrl, getTrackingApiUrl, NotificationSettings, saveNotificationSettings } from '../../services/integrationHub';

export const DeveloperPortalPage: React.FC = () => {
  const { apiKeys, webhooks, createAPIKey, addWebhookEndpoint, loadSupabaseData, isLoadingData } = usePlatformStore();

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const [keyName, setKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://api.mybrand.com/webhooks/shipping');
  const [newApiSecret, setNewApiSecret] = useState('');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ whatsapp_enabled:false, sms_enabled:false, shipment_updates_enabled:true, tracking_base_url:window.location.origin, whatsapp_template_name:'shipment_update', whatsapp_language_code:'en' });
  const [savingNotifications, setSavingNotifications] = useState(false);

  React.useEffect(() => {
    loadSupabaseData();
    fetchNotificationSettings().then(setNotificationSettings).catch(() => undefined);
  }, []);

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try { await saveNotificationSettings(notificationSettings); toast.success('Buyer notification settings saved'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save notification settings'); }
    finally { setSavingNotifications(false); }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newKey = await createAPIKey(keyName || 'Production API Key', ['orders:read', 'orders:write', 'rates:read', 'shipments:write']);
      setNewApiSecret(newKey.secret || '');
      toast.success(`API Key '${newKey.name}' generated securely.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'API key creation failed');
      return;
    }
    setKeyName('');
    setIsKeyModalOpen(false);
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addWebhookEndpoint(webhookUrl, ['order.created', 'shipment.created', 'shipment.picked_up', 'shipment.in_transit', 'shipment.out_for_delivery', 'shipment.delivered', 'shipment.ndr', 'shipment.rto', 'shipment.cancelled']);
      toast.success('Webhook endpoint and signing secret created securely.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Webhook creation failed');
      return;
    }
    setIsWebhookModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">Developer Portal &amp; Webhooks</h2>
        <p className="text-xs text-slate-500 font-medium">Generate API keys, configure event webhooks &amp; view real-time delivery logs</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><Radio className="h-5 w-5 text-indigo-600"/><div><h3 className="font-black text-slate-900">ShipFaster API endpoints</h3><p className="text-xs text-slate-500">Call these only from your website backend.</p></div></div>
          <div className="space-y-2 font-mono text-[11px]">
            {[
              ['Create / list orders', getOrdersApiUrl()],
              ['Compare courier rates', getRatesApiUrl()],
              ['Book / list shipments', getShipmentsApiUrl()],
              ['Public order tracking', `${getTrackingApiUrl()}?q=AWB_OR_ORDER_ID`],
            ].map(([label,url])=><div key={label} className="rounded-xl bg-slate-950 p-3 text-emerald-300"><span className="block font-sans text-[10px] font-bold text-slate-400 mb-1">{label}</span>{url}</div>)}
          </div>
          <p className="text-xs text-slate-600">Use <code>Authorization: Bearer pk_live_...</code>. Order and shipment creation also require a unique <code>Idempotency-Key</code>.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-emerald-600"/><div><h3 className="font-black text-slate-900">Buyer WhatsApp &amp; SMS</h3><p className="text-xs text-slate-500">Queue tracking updates to the phone saved on each order.</p></div></div>
          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm font-bold"><span>WhatsApp updates</span><input type="checkbox" checked={notificationSettings.whatsapp_enabled} onChange={(e)=>setNotificationSettings({...notificationSettings,whatsapp_enabled:e.target.checked})}/></label>
          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm font-bold"><span>SMS updates</span><input type="checkbox" checked={notificationSettings.sms_enabled} onChange={(e)=>setNotificationSettings({...notificationSettings,sms_enabled:e.target.checked})}/></label>
          <Input label="Public tracking website URL" value={notificationSettings.tracking_base_url} onChange={(e)=>setNotificationSettings({...notificationSettings,tracking_base_url:e.target.value})} placeholder="https://ship.example.com"/>
          <Input label="Approved Meta template name" value={notificationSettings.whatsapp_template_name} onChange={(e)=>setNotificationSettings({...notificationSettings,whatsapp_template_name:e.target.value})}/>
          <Button onClick={handleSaveNotifications} isLoading={savingNotifications} className="w-full">Save notification settings</Button>
          <p className="text-[11px] text-amber-700">Delivery starts after Meta WhatsApp and Twilio credentials are configured in Supabase secrets.</p>
        </section>
      </div>

      {/* API Keys Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">REST API Keys</h3>
          </div>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsKeyModalOpen(true)}>
            Generate New Key
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Key Name</th>
                <th className="p-3.5">Token Masked</th>
                <th className="p-3.5">Scopes</th>
                <th className="p-3.5">Last Used</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No active API keys found. Generate a key to integrate your backend or storefront.
                  </td>
                </tr>
              ) : (
                apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{k.name}</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{k.secret_key_masked || k.key_prefix + '••••'}</td>
                    <td className="p-3.5 font-bold text-slate-600">{k.scopes.join(', ')}</td>
                    <td className="p-3.5 text-slate-600">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td className="p-3.5 text-right">
                      <Button size="sm" variant="outline" className="text-xs" disabled={!k.secret} onClick={() => { if(k.secret) { navigator.clipboard.writeText(k.secret); toast.success('API key copied'); } }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Webhook Subscriptions</h3>
          </div>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsWebhookModalOpen(true)}>
            Add Webhook URL
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Endpoint URL</th>
                <th className="p-3.5">Signing Secret</th>
                <th className="p-3.5">Subscribed Events</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {webhooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    No webhooks registered. Add a webhook URL to receive automated event payloads.
                  </td>
                </tr>
              ) : (
                webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{w.url}</td>
                    <td className="p-3.5 font-mono text-slate-600">{w.secret.slice(0, 10)}••••</td>
                    <td className="p-3.5 font-bold text-indigo-600">{w.subscribed_events.join(', ')}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                        {w.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Key */}
      <Modal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} title="Generate REST API Key">
        <form onSubmit={handleGenerateKey} className="space-y-3 sm:space-y-4">
          <Input label="Key Label Name" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. ERP Integration Key" required />
          <div className="pt-2 sm:pt-4 border-t border-slate-200 flex justify-end gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={() => setIsKeyModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Key</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!newApiSecret} onClose={() => setNewApiSecret('')} title="Save Your API Key Now" subtitle="The complete key is shown only once.">
        <div className="space-y-2 sm:space-y-4">
          <div className="rounded-lg sm:rounded-xl border border-amber-200 bg-amber-50 p-2 sm:p-3 text-[11px] sm:text-xs font-semibold leading-4 text-amber-900">
            Paste it into your backend <code>.env</code> as <code>SHIPFASTER_API_KEY</code>. Never use a <code>VITE_</code> variable.
          </div>
          <div className="max-h-16 overflow-y-auto break-all rounded-lg sm:rounded-xl bg-slate-950 p-2.5 sm:p-4 font-mono text-[10px] sm:text-xs leading-4 text-emerald-300">{newApiSecret}</div>
          <Button size="sm" className="w-full sm:min-h-11" onClick={()=>{navigator.clipboard.writeText(newApiSecret);toast.success('API key copied securely');}}>Copy API Key</Button>
        </div>
      </Modal>

      {/* Modal: Add Webhook */}
      <Modal isOpen={isWebhookModalOpen} onClose={() => setIsWebhookModalOpen(false)} title="Add Webhook Endpoint">
        <form onSubmit={handleSaveWebhook} className="space-y-4">
          <Input label="Webhook URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} required />
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsWebhookModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Endpoint</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

