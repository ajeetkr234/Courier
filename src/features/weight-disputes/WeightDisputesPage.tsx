import React, { useState } from 'react';
import { 
  Scale, Clock, AlertTriangle, UploadCloud, CheckCircle2, XCircle, 
  Image, Ruler, FileText, Check, ShieldCheck, HelpCircle, Eye, ArrowRight 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import { usePlatformStore } from '../../services/store';
import { WeightDiscrepancy } from '../../types';
import { toast } from 'sonner';

export const WeightDisputesPage: React.FC = () => {
  const { 
    weightDiscrepancies, 
    resolveWeightDispute, 
    contestWeightDisputeWithProof, 
    loadSupabaseData 
  } = usePlatformStore();

  const [selectedDispute, setSelectedDispute] = useState<WeightDiscrepancy | null>(null);
  const [scalePhotoName, setScalePhotoName] = useState<string | null>(null);
  const [tapePhotoName, setTapePhotoName] = useState<string | null>(null);
  const [skuWeightInput, setSkuWeightInput] = useState<string>('0.95');
  const [disputeNotes, setDisputeNotes] = useState<string>('');
  const [previewEvidenceDispute, setPreviewEvidenceDispute] = useState<WeightDiscrepancy | null>(null);

  React.useEffect(() => {
    loadSupabaseData();
  }, []);

  const handleAcceptDispute = (id: string) => {
    resolveWeightDispute(id, 'ACCEPTED');
    toast.info('Weight discrepancy accepted. Excess charge debited from wallet.');
  };

  const handleOpenContestModal = (wd: WeightDiscrepancy) => {
    setSelectedDispute(wd);
    setScalePhotoName(null);
    setTapePhotoName(null);
    setSkuWeightInput(wd.declared_weight_kg.toString());
    setDisputeNotes(`Package packed in standard tamper-proof courier bag. Dimensions measured before dispatch.`);
  };

  const handleRaiseDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    contestWeightDisputeWithProof(selectedDispute.id, {
      scaleUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      tapeUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      skuMasterWeight: parseFloat(skuWeightInput) || selectedDispute.declared_weight_kg,
      notes: disputeNotes,
    });

    toast.success(`Weight dispute for AWB ${selectedDispute.shipment?.awb_number || selectedDispute.shipment_id} submitted to Super Admin Arbitration Desk!`);
    setSelectedDispute(null);
  };

  const pendingDisputes = weightDiscrepancies.filter(w => w.status === 'PENDING');
  const disputedCount = weightDiscrepancies.filter(w => w.status === 'DISPUTED');
  const resolvedRefunded = weightDiscrepancies.filter(w => w.status === 'RESOLVED');

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Subheader */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" /> Weight Discrepancy &amp; Dispute Desk
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit automated volumetric scans from courier sort hubs and contest invalid excess weight debits with photo proof
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
            7-Day Auto-Freeze Protection
          </span>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Discrepancies"
          value={pendingDisputes.length.toString()}
          subtitle="Action required within SLA"
          variant="amber"
        />
        <StatCard
          title="Under Arbitration"
          value={disputedCount.length.toString()}
          subtitle="Awaiting Super Admin decision"
          variant="indigo"
        />
        <StatCard
          title="Disputes Won &amp; Refunded"
          value={`₹${(resolvedRefunded.length * 95 + 1450).toLocaleString('en-IN')}`}
          subtitle="Credited back to shipping wallet"
          variant="emerald"
        />
        <StatCard
          title="Dispute Success Rate"
          value="78.5%"
          subtitle="Platform seller average"
          variant="emerald"
        />
      </div>

      {/* Weight Disputes List */}
      <div className="space-y-4">
        {weightDiscrepancies.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Zero Weight Discrepancies</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All volumetric weight scans from carrier automation centers match your declared package weights. Any carrier audits will appear here.
            </p>
          </div>
        ) : (
          weightDiscrepancies.map((wd) => (
            <div 
              key={wd.id} 
              className={`bg-white p-6 rounded-2xl border shadow-xs space-y-4 transition-all ${
                wd.status === 'PENDING' 
                  ? 'border-amber-300 ring-2 ring-amber-50' 
                  : wd.status === 'DISPUTED' 
                  ? 'border-indigo-200' 
                  : 'border-emerald-200'
              }`}
            >
              {/* Dispute Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-base text-slate-900">
                      AWB #{wd.shipment?.awb_number || wd.shipment_id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                      wd.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : wd.status === 'DISPUTED'
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {wd.status === 'DISPUTED' ? 'Under Admin Arbitration' : wd.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                      {wd.shipment?.courier_name || 'Delhivery Surface'}
                    </span>
                  </div>
                  
                  {wd.status === 'PENDING' ? (
                    <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> 
                      Deadline before auto-debit: <strong className="text-rose-700 font-black">38 Hours Remaining</strong>
                    </p>
                  ) : wd.status === 'DISPUTED' ? (
                    <p className="text-xs text-indigo-700 font-bold mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Evidence submitted. Super Admin arbitrator is cross-checking hub sorter camera logs.
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolved: Excess charge credited back to shipping wallet.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {wd.status === 'PENDING' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs font-bold text-slate-700" 
                        onClick={() => handleAcceptDispute(wd.id)}
                      >
                        Accept Charge (₹{wd.excess_charge})
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs" 
                        onClick={() => handleOpenContestModal(wd)}
                      >
                        Contest with Proof
                      </Button>
                    </>
                  )}

                  {wd.status === 'DISPUTED' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setPreviewEvidenceDispute(wd)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                      className="text-xs font-bold text-indigo-700 border-indigo-200"
                    >
                      View Submitted Proof
                    </Button>
                  )}
                </div>
              </div>

              {/* Visual Dual-Bar Comparison Audit Graphic */}
              <div className="p-4 rounded-xl bg-slate-950 text-white space-y-2 font-mono text-xs shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Volumetric Audit Analysis
                </span>
                <div className="space-y-2 pt-1">
                  {/* Declared Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">Seller Declared: {wd.declared_weight_kg} kg</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (wd.declared_weight_kg / 2.5) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Billed Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-rose-400 font-bold">
                        Courier Billed: {wd.charged_weight_kg} kg (+{(wd.charged_weight_kg - wd.declared_weight_kg).toFixed(2)} kg excess)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (wd.charged_weight_kg / 2.5) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block font-bold uppercase text-[10px]">Seller Declared</span>
                  <span className="text-slate-900 font-black text-sm font-mono">{wd.declared_weight_kg} Kg</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="text-rose-800 block font-bold uppercase text-[10px]">Courier Billed Weight</span>
                  <span className="text-rose-700 font-black text-sm font-mono">{wd.charged_weight_kg} Kg</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-amber-800 block font-bold uppercase text-[10px]">Excess Held in Escrow</span>
                  <span className="text-amber-700 font-black text-sm font-mono">₹{wd.excess_charge}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contest Dispute Modal */}
      <Modal
        isOpen={!!selectedDispute}
        onClose={() => setSelectedDispute(null)}
        title={`Contest Weight Discrepancy — AWB ${selectedDispute?.shipment?.awb_number || selectedDispute?.shipment_id}`}
        subtitle="Submit photographic evidence from packing station to initiate arbitration"
      >
        <form onSubmit={handleRaiseDisputeSubmit} className="space-y-4 text-slate-900">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1 text-indigo-900">
            <span className="font-extrabold block">Carrier Evidence Guidelines:</span>
            <p>Upload clear photos showing the parcel on a digital weighing scale and a measuring tape along length, width, and height.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Scale Photo Input */}
            <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 text-center space-y-1.5 cursor-pointer transition-all block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setScalePhotoName(e.target.files?.[0]?.name || 'weight_scale_proof.jpg')}
              />
              <Scale className="w-6 h-6 text-indigo-600 mx-auto" />
              <span className="block text-xs font-bold text-slate-800">
                {scalePhotoName ? `✓ ${scalePhotoName}` : '1. Photo on Weighing Scale'}
              </span>
              <span className="text-[10px] text-slate-500 block">Shows digital readout</span>
            </label>

            {/* Measuring Tape Photo Input */}
            <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 text-center space-y-1.5 cursor-pointer transition-all block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setTapePhotoName(e.target.files?.[0]?.name || 'dimensions_tape_proof.jpg')}
              />
              <Ruler className="w-6 h-6 text-indigo-600 mx-auto" />
              <span className="block text-xs font-bold text-slate-800">
                {tapePhotoName ? `✓ ${tapePhotoName}` : '2. Photo with Measuring Tape'}
              </span>
              <span className="text-[10px] text-slate-500 block">Shows L x W x H dimensions</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Master SKU Weight (Kg)</label>
            <input
              type="number"
              step="0.01"
              value={skuWeightInput}
              onChange={(e) => setSkuWeightInput(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes for Carrier Arbitration Team</label>
            <textarea
              rows={2}
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              placeholder="e.g. Standard flyer box used. Carrier volumetric calculation exceeds physical box dimensions."
              className="w-full text-xs font-medium p-3 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setSelectedDispute(null)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Submit Dispute to Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Submitted Proof Modal */}
      <Modal
        isOpen={!!previewEvidenceDispute}
        onClose={() => setPreviewEvidenceDispute(null)}
        title={`Arbitration Evidence — AWB ${previewEvidenceDispute?.shipment?.awb_number}`}
        subtitle="Photographs and measurement proof under review by Super Admin ops"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">Weighing Scale Proof</span>
              <img 
                src={previewEvidenceDispute?.evidence_scale_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80"} 
                alt="Scale Proof" 
                className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">Measuring Tape Proof</span>
              <img 
                src={previewEvidenceDispute?.evidence_tape_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80"} 
                alt="Tape Proof" 
                className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Arbitration Notes</span>
            <p className="text-slate-800 font-medium">
              {previewEvidenceDispute?.admin_arbitration_notes || 'Evidence photos uploaded by seller packaging station.'}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setPreviewEvidenceDispute(null)}>Close Preview</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
