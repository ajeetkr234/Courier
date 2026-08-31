import React, { useState } from 'react';
import { Key, Globe, Plus, Copy, CheckCircle2, ShieldCheck, FileCode } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { APIKey, WebhookEndpoint } from '../../types';
import { toast } from 'sonner';

export const DeveloperPortalPage: React.FC = () => {
  const { apiKeys, webhooks, createAPIKey, addWebhookEndpoint } = usePlatformStore();

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const [keyName, setKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://api.mybrand.com/webhooks/shipping');

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const newKey = createAPIKey(keyName || 'Production API Key', ['orders:read', 'orders:write', 'rates:read', 'shipments:write']);
    toast.success(`API Key '${newKey.name}' generated! Keep secret key safe.`);
    setKeyName('');
    setIsKeyModalOpen(false);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const newWh = addWebhookEndpoint(webhookUrl, ['shipment.created', 'shipment.delivered', 'shipment.ndr']);
    toast.success('Webhook endpoint saved & signature secret generated!');
    setIsWebhookModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">Developer Portal &amp; Webhooks</h2>
        <p className="text-xs text-slate-500 font-medium">Generate API keys, configure event webhooks &amp; view real-time delivery logs</p>
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
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{k.name}</td>
                  <td className="p-3.5 font-mono font-bold text-indigo-600">{k.secret_key_masked || k.key_prefix + '••••'}</td>
                  <td className="p-3.5 font-bold text-slate-600">{k.scopes.join(', ')}</td>
                  <td className="p-3.5 text-slate-600">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('en-IN') : 'Never'}</td>
                  <td className="p-3.5 text-right">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success('API Key copied to clipboard')}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
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
              {webhooks.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{w.url}</td>
                  <td className="p-3.5 font-mono text-slate-600">{w.secret.slice(0, 10)}••••</td>
                  <td className="p-3.5 font-bold text-indigo-600">{w.subscribed_events.join(', ')}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Key */}
      <Modal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} title="Generate REST API Key">
        <form onSubmit={handleGenerateKey} className="space-y-4">
          <Input label="Key Label Name" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. ERP Integration Key" required />
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsKeyModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Key</Button>
          </div>
        </form>
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

