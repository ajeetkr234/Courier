import React, { useState } from 'react';
import { Scale, Clock, AlertTriangle, UploadCloud, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { WeightDiscrepancy } from '../../types';
import { toast } from 'sonner';

export const WeightDisputesPage: React.FC = () => {
  const { weightDiscrepancies, resolveWeightDispute } = usePlatformStore();
  const [selectedDispute, setSelectedDispute] = useState<WeightDiscrepancy | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);

  const handleAcceptDispute = (id: string) => {
    resolveWeightDispute(id, 'ACCEPTED');
    toast.info('Weight discrepancy accepted. Excess charge debited from wallet.');
  };

  const handleRaiseDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDispute) {
      resolveWeightDispute(selectedDispute.id, 'CONTESTED');
      toast.success('Dispute raised with carrier network along with package image evidence!');
      setSelectedDispute(null);
      setEvidenceFile(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">Weight Disputes Resolution Engine</h2>
        <p className="text-xs text-slate-500 font-medium">Review carrier volumetric weight audits and contest improper excess charges with evidence</p>
      </div>

      <div className="space-y-4">
        {weightDiscrepancies.map((wd) => (
          <div key={wd.id} className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-slate-900">AWB {wd.shipment?.awb_number || 'XPB8827364519'}</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200">
                    Status: {wd.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Deadline to respond: <strong className="text-slate-900 font-bold">2 Days Remaining</strong>
                </p>
              </div>

              {wd.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => handleAcceptDispute(wd.id)}>
                    Accept Charge (₹{wd.excess_charge})
                  </Button>
                  <Button size="sm" variant="primary" className="text-xs font-bold" onClick={() => setSelectedDispute(wd)}>
                    Contest Dispute
                  </Button>
                </div>
              )}
            </div>

            {/* Visual Dual-Bar Weight Comparison Graphic */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visual Weight Comparison Audit</span>
              <div className="space-y-2 pt-1">
                {/* Declared Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">Seller Declared: {wd.declared_weight_kg} kg</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (wd.declared_weight_kg / 2) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Billed Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-rose-400 font-bold">Courier Billed: {wd.charged_weight_kg} kg (+{(wd.charged_weight_kg - wd.declared_weight_kg).toFixed(2)} kg excess)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: `${Math.min(100, (wd.charged_weight_kg / 2) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block font-bold uppercase text-[10px]">Seller Declared Weight</span>
                <span className="text-slate-900 font-black text-sm font-mono">{wd.declared_weight_kg} Kg</span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-rose-800 block font-bold uppercase text-[10px]">Courier Billed Weight</span>
                <span className="text-rose-700 font-black text-sm font-mono">{wd.charged_weight_kg} Kg</span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-rose-800 block font-bold uppercase text-[10px]">Excess Deduction</span>
                <span className="text-rose-700 font-black text-sm font-mono">₹{wd.excess_charge}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Evidence Modal */}
      <Modal
        isOpen={!!selectedDispute}
        onClose={() => {
          setSelectedDispute(null);
          setEvidenceFile(null);
        }}
        title="Contest Weight Dispute with Evidence"
        subtitle="Upload package weighing scale photo or dimension proof"
      >
        <form onSubmit={handleRaiseDisputeSubmit} className="space-y-4">
          <div
            onClick={() => setEvidenceFile('weighing_scale_proof.png')}
            className="p-8 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 text-center space-y-2 cursor-pointer transition-all"
          >
            <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto" />
            <span className="block text-xs font-bold text-slate-800">
              {evidenceFile ? `Uploaded: ${evidenceFile}` : 'Click to Upload Image of Parcel on Weighing Machine'}
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">Supported formats: JPG, PNG, PDF</span>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setSelectedDispute(null)}>Cancel</Button>
            <Button type="submit">Submit Evidence to Carrier Audit Team</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


