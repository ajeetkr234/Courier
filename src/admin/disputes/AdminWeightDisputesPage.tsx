import React, { useState } from 'react';
import { 
  Scale, CheckCircle2, XCircle, AlertTriangle, Eye, ArrowRight, 
  Ruler, Image, ShieldCheck, Filter, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { WeightDiscrepancy } from '../../types';
import { toast } from 'sonner';

export const AdminWeightDisputesPage: React.FC = () => {
  const { weightDiscrepancies, arbitrateWeightDispute, loadSupabaseData } = usePlatformStore();
  const [selectedDispute, setSelectedDispute] = useState<WeightDiscrepancy | null>(null);
  const [arbitrationNotes, setArbitrationNotes] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DISPUTED' | 'RESOLVED'>('ALL');

  const filtered = weightDiscrepancies.filter((w) => {
    if (filter === 'DISPUTED') return w.status === 'DISPUTED';
    if (filter === 'RESOLVED') return w.status === 'RESOLVED';
    return true;
  });

  const handleArbitrate = (outcome: 'SELLER_REFUNDED' | 'COURIER_UPHELD') => {
    if (!selectedDispute) return;
    arbitrateWeightDispute(selectedDispute.id, outcome, arbitrationNotes || (outcome === 'SELLER_REFUNDED' ? 'Approved based on photographic scale evidence' : 'Rejected after carrier sort-hub scan review'));
    toast.success(
      outcome === 'SELLER_REFUNDED' 
        ? `Dispute approved! Refunded ₹${selectedDispute.excess_charge} back to seller wallet.`
        : `Dispute rejected. Courier volumetric audit upheld.`
    );
    setSelectedDispute(null);
    setArbitrationNotes('');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Scale className="h-6 w-6 text-indigo-400" /> Weight Dispute Arbitration Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review packaging scale &amp; dimension photographic evidence submitted by sellers and approve instant wallet refunds
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {(['ALL', 'DISPUTED', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab} ({tab === 'ALL' ? weightDiscrepancies.length : weightDiscrepancies.filter(w => w.status === tab).length})
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-mono">Arbitration Mode Active</span>
      </div>

      {/* Disputes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">AWB &amp; Courier</th>
                <th className="p-3.5">Declared Weight</th>
                <th className="p-3.5">Carrier Scanned</th>
                <th className="p-3.5">Excess Charge</th>
                <th className="p-3.5">Evidence Status</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((wd) => (
                <tr key={wd.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-indigo-400 block">
                      {wd.shipment?.awb_number || wd.shipment_id}
                    </span>
                    <span className="text-[10px] uppercase text-slate-400">
                      {wd.shipment?.courier_name || 'Carrier Partner'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">
                    {wd.declared_weight_kg} kg
                  </td>
                  <td className="p-3.5 font-mono text-rose-400 font-bold">
                    {wd.charged_weight_kg} kg
                  </td>
                  <td className="p-3.5 font-mono text-amber-300 font-bold text-sm">
                    ₹{wd.excess_charge}
                  </td>
                  <td className="p-3.5">
                    {wd.evidence_scale_url ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                        Dual Photos Uploaded
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">No Photo Proof</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      wd.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : wd.status === 'DISPUTED'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {wd.status === 'DISPUTED' ? 'Awaiting Decision' : wd.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedDispute(wd);
                        setArbitrationNotes(wd.admin_arbitration_notes || '');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Arbitrate Evidence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arbitration Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title={`Arbitrate Weight Dispute — AWB ${selectedDispute.shipment?.awb_number || selectedDispute.shipment_id}`}
          subtitle="Cross-examine seller package photos against carrier automation volumetric scan"
        >
          <div className="space-y-4 text-slate-900 text-xs">
            {/* Dual Evidence Photos Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block text-[11px]">Seller Weighing Scale Photo</span>
                <img
                  src={selectedDispute.evidence_scale_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80"}
                  alt="Scale Proof"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block text-[11px]">Measuring Tape Dimensions</span>
                <img
                  src={selectedDispute.evidence_tape_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80"}
                  alt="Tape Proof"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
            </div>

            {/* Comparison Audit Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Seller Declared Physical Weight:</span>
                <strong className="text-emerald-700 font-mono text-xs">{selectedDispute.declared_weight_kg} kg</strong>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Carrier Sorter Automated Scan:</span>
                <strong className="text-rose-700 font-mono text-xs">{selectedDispute.charged_weight_kg} kg</strong>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5">
                <span className="text-slate-900">Refundable Held Escrow Amount:</span>
                <strong className="text-indigo-700 font-mono text-sm">₹{selectedDispute.excess_charge}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Ruling &amp; Notes</label>
              <textarea
                rows={2}
                value={arbitrationNotes}
                onChange={(e) => setArbitrationNotes(e.target.value)}
                placeholder="State basis of ruling (e.g. Dimensions confirmed on tape, carrier camera logged flyer overflow)..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold"
                onClick={() => handleArbitrate('COURIER_UPHELD')}
              >
                Reject Dispute (Uphold Carrier)
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => handleArbitrate('SELLER_REFUNDED')}
              >
                Approve &amp; Refund ₹{selectedDispute.excess_charge} to Wallet
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
