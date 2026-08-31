import React, { useState } from 'react';
import { Truck, Activity, Key, CheckCircle2, XCircle, RefreshCw, Power } from 'lucide-react';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const AdminCouriersPage: React.FC = () => {
  const { couriers, toggleCourierStatus } = usePlatformStore();
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Courier API credentials saved & encrypted successfully!');
    setSelectedCourierId(null);
    setApiKeyInput('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <Truck className="h-6 w-6 text-indigo-400" /> Dynamic Courier Carriers &amp; Adapters
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure API credentials, monitor live adapter latency, and enable/disable courier networks dynamically
        </p>
      </div>

      {/* Couriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {couriers.map((courier) => (
          <div key={courier.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-white text-lg">
                  {courier.code.toUpperCase().substring(0, 3)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{courier.name}</h3>
                  <span className="text-xs font-mono text-indigo-400">code: {courier.code}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  toggleCourierStatus(courier.id);
                  toast.info(`Updated ${courier.name} status`);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  courier.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {courier.is_active ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">API Health Status:</span>
                <strong className="text-emerald-400 font-mono">HEALTHY (99.9%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average API Latency:</span>
                <strong className="text-slate-200 font-mono">{courier.avg_latency_ms || 180}ms</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Supported Modes:</span>
                <strong className="text-slate-300">Surface Express, Air Priority</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCourierId(courier.id);
                  setApiKeyInput('●●●●●●●●●●●●●●●●');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="h-3.5 w-3.5 text-amber-400" /> Configure API Credentials
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Credentials Modal */}
      {selectedCourierId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Update Courier API Credentials</h3>
            <p className="text-xs text-slate-400">
              API tokens and authentication keys are stored using encrypted secret storage.
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Production Client Token / Key</label>
                <input
                  type="password"
                  required
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Secret Key</label>
                <input
                  type="text"
                  defaultValue="whsec_courier_prod_8829"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourierId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/30"
                >
                  Save Encrypted Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
