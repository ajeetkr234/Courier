import React, { useState } from 'react';
import { Layers, Plus, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePlatformStore } from '../../services/store';
import { RateCard, RateCardZone } from '../../types';
import { toast } from 'sonner';

export const AdminRateCardsPage: React.FC = () => {
  const { rateCards, couriers, saveRateCard } = usePlatformStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [courierId, setCourierId] = useState(couriers[0]?.id || 'c-delhivery');
  const [planTier, setPlanTier] = useState<RateCard['plan_tier']>('STANDARD');
  const [codPercent, setCodPercent] = useState('1.8');
  const [codFlatMin, setCodFlatMin] = useState('20');
  const [rtoMultiplier, setRtoMultiplier] = useState('1.0');

  const handleCreateRateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Please enter a rate card name');
      return;
    }

    const courier = couriers.find((c) => c.id === courierId);
    const zones: RateCardZone[] = [
      { zone_code: 'A', zone_name: 'Within City', base_weight_kg: 0.5, base_rate: 35, additional_weight_slab_kg: 0.5, additional_rate: 20 },
      { zone_code: 'B', zone_name: 'Regional Zone', base_weight_kg: 0.5, base_rate: 45, additional_weight_slab_kg: 0.5, additional_rate: 25 },
      { zone_code: 'C', zone_name: 'Metro to Metro', base_weight_kg: 0.5, base_rate: 55, additional_weight_slab_kg: 0.5, additional_rate: 32 },
      { zone_code: 'D', zone_name: 'Rest of India', base_weight_kg: 0.5, base_rate: 65, additional_weight_slab_kg: 0.5, additional_rate: 40 },
      { zone_code: 'E', zone_name: 'Special / NE / J&K', base_weight_kg: 0.5, base_rate: 90, additional_weight_slab_kg: 0.5, additional_rate: 60 },
    ];

    saveRateCard({
      name,
      courier_id: courierId,
      courier_name: courier?.name || 'Delhivery Direct',
      plan_tier: planTier,
      cod_percent: parseFloat(codPercent) || 1.8,
      cod_flat_min: parseFloat(codFlatMin) || 20,
      rto_multiplier: parseFloat(rtoMultiplier) || 1.0,
      zones,
    });

    toast.success(`Rate Card "${name}" created and ready to assign to sellers!`);
    setName('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" /> Platform Rate Card Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build dynamic rate matrices for Zone A-E, weight slab increments, COD fee percentages, and RTO charges
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create New Rate Card
        </button>
      </div>

      {/* Existing Rate Cards List */}
      <div className="space-y-4">
        {rateCards.map((rc) => (
          <div key={rc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-lg">{rc.name}</h3>
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {rc.plan_tier} PLAN
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Courier Partner: <strong className="text-slate-200">{rc.courier_name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">COD Fee Rule</span>
                  <strong className="text-emerald-400">{rc.cod_percent}% (Min ₹{rc.cod_flat_min})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">RTO Multiplier</span>
                  <strong className="text-cyan-400">{rc.rto_multiplier}x Forward Rate</strong>
                </div>
              </div>
            </div>

            {/* Zones Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Zone Code</th>
                    <th className="p-3">Zone Description</th>
                    <th className="p-3">Base Weight</th>
                    <th className="p-3">Base Rate (₹)</th>
                    <th className="p-3">Additional Slab</th>
                    <th className="p-3">Add-on Rate (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {rc.zones.map((zone) => (
                    <tr key={zone.zone_code} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-indigo-400">Zone {zone.zone_code}</td>
                      <td className="p-3 text-slate-200 font-semibold">{zone.zone_name}</td>
                      <td className="p-3 text-slate-400">{zone.base_weight_kg} kg</td>
                      <td className="p-3 font-bold text-emerald-400">₹{zone.base_rate}</td>
                      <td className="p-3 text-slate-400">+{zone.additional_weight_slab_kg} kg</td>
                      <td className="p-3 font-bold text-slate-300">₹{zone.additional_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Custom Rate Card</h3>

            <form onSubmit={handleCreateRateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rate Card Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enterprise Platinum Rate Card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Courier Partner</label>
                  <select
                    value={courierId}
                    onChange={(e) => setCourierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Tier</label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">COD % Charge</label>
                  <input
                    type="number"
                    step="0.1"
                    value={codPercent}
                    onChange={(e) => setCodPercent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">COD Flat Min (₹)</label>
                  <input
                    type="number"
                    value={codFlatMin}
                    onChange={(e) => setCodFlatMin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">RTO Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    value={rtoMultiplier}
                    onChange={(e) => setRtoMultiplier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/30"
                >
                  Save &amp; Activate Rate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
