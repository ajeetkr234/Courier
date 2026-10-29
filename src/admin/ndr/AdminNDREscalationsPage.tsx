import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Phone, CheckCircle2, Clock, 
  Send, ExternalLink, Filter, Search, ShieldCheck, ArrowRight, XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { NDREscalation } from '../../types';
import { toast } from 'sonner';

export const AdminNDREscalationsPage: React.FC = () => {
  const { ndrEscalations, resolveAdminNDREscalation } = usePlatformStore();

  const [selectedEscalation, setSelectedEscalation] = useState<NDREscalation | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('ALL');

  const filtered = ndrEscalations.filter((e) => {
    if (filter === 'OPEN') return e.carrier_escalation_status === 'OPEN';
    if (filter === 'INVESTIGATING') return e.carrier_escalation_status === 'INVESTIGATING';
    if (filter === 'RESOLVED') return e.carrier_escalation_status === 'RESOLVED_REATTEMPT' || e.carrier_escalation_status === 'PENALIZED';
    return true;
  });

  const handleAction = (status: NDREscalation['carrier_escalation_status'], label: string) => {
    if (!selectedEscalation) return;
    resolveAdminNDREscalation(selectedEscalation.id, status, adminNotes || label);
    toast.success(`Escalation updated to: ${status}. Carrier operational payload sent!`);
    setSelectedEscalation(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" /> Carrier NDR Escalation &amp; Fake Attempt Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin operations queue to audit fake delivery attempts reported by sellers, penalize courier SLA violations, and enforce destination hub re-attempts
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Escalations</span>
          <strong className="text-xl font-mono text-white block">{ndrEscalations.length} Cases</strong>
          <span className="text-[11px] text-indigo-400">From verified sellers</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-400">Open Actions</span>
          <strong className="text-xl font-mono text-rose-400 block">
            {ndrEscalations.filter(e => e.carrier_escalation_status === 'OPEN').length} Unresolved
          </strong>
          <span className="text-[11px] text-slate-400">Hub response pending</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Re-attempts Forced</span>
          <strong className="text-xl font-mono text-emerald-400 block">
            {ndrEscalations.filter(e => e.carrier_escalation_status === 'RESOLVED_REATTEMPT').length} AWBs
          </strong>
          <span className="text-[11px] text-slate-400">Saved from premature RTO</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400">Carrier Penalties</span>
          <strong className="text-xl font-mono text-amber-400 block">
            {ndrEscalations.filter(e => e.carrier_escalation_status === 'PENALIZED').length} Cases
          </strong>
          <span className="text-[11px] text-slate-400">Carrier penalties recorded</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab} ({tab === 'ALL' ? ndrEscalations.length : ndrEscalations.filter(e => tab === 'RESOLVED' ? (e.carrier_escalation_status === 'RESOLVED_REATTEMPT' || e.carrier_escalation_status === 'PENALIZED') : e.carrier_escalation_status === tab).length})
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-mono">Live WebSocket Desk</span>
      </div>

      {/* Escalations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">AWB &amp; Carrier</th>
                <th className="p-3.5">Seller Name</th>
                <th className="p-3.5">Buyer Contact</th>
                <th className="p-3.5">Escalated Reason</th>
                <th className="p-3.5">Evidence Notes</th>
                <th className="p-3.5">Carrier Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((esc) => (
                <tr key={esc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-indigo-400 block">{esc.awb_number}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{esc.courier_code}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{esc.seller_name || 'Apex Retail'}</span>
                    <span className="text-[10px] text-slate-400">ID: {esc.seller_id.slice(0, 8)}...</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-slate-200 block">{esc.customer_name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{esc.customer_phone}</span>
                  </td>
                  <td className="p-3.5 max-w-[200px]">
                    <span className="font-semibold text-rose-300 block leading-tight">{esc.reason}</span>
                  </td>
                  <td className="p-3.5 max-w-[220px]">
                    <p className="text-[11px] text-slate-400 truncate" title={esc.evidence_notes}>
                      {esc.evidence_notes}
                    </p>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      esc.carrier_escalation_status === 'OPEN'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                        : esc.carrier_escalation_status === 'INVESTIGATING'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : esc.carrier_escalation_status === 'PENALIZED'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {esc.carrier_escalation_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedEscalation(esc);
                        setAdminNotes(esc.admin_notes || '');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Arbitrate Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arbitration Modal */}
      {selectedEscalation && (
        <Modal
          isOpen={!!selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
          title={`Arbitrate Fake NDR — AWB ${selectedEscalation.awb_number}`}
          subtitle="Direct carrier hub dispatch and penalty enforcement"
        >
          <div className="space-y-4 text-slate-900 text-xs">
            <div className="p-3.5 bg-slate-100 rounded-xl space-y-1">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">Seller Claim &amp; Evidence</span>
              <p className="text-slate-800 font-medium">{selectedEscalation.reason}</p>
              <p className="text-slate-600 text-[11px] italic">"{selectedEscalation.evidence_notes}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Operations Notes</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log carrier branch dispatch notes or penalty justification..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 pt-2">
              <Button
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold"
                onClick={() => handleAction('INVESTIGATING', 'Contacted Hub Supervisor')}
              >
                Mark Investigating
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                onClick={() => handleAction('PENALIZED', 'Carrier fined ₹250 for fake OTP / missed visit')}
              >
                Penalize Carrier
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => handleAction('RESOLVED_REATTEMPT', 'Forced Hub Priority Reattempt for tomorrow')}
              >
                Force Re-attempt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
