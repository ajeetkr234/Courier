import React, { useState } from 'react';
import { 
  AlertTriangle, Phone, MapPin, RefreshCw, RotateCcw, CheckCircle2, Clock, MessageSquare, Wand2 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_NDR_CASES } from '../../lib/mockData';
import { NDRCase } from '../../types';
import { toast } from 'sonner';

export const NDRResolutionPage: React.FC = () => {
  const [ndrCases, setNdrCases] = useState<NDRCase[]>(MOCK_NDR_CASES);
  const [selectedCase, setSelectedCase] = useState<NDRCase | null>(null);
  const [actionType, setActionType] = useState<'REATTEMPT' | 'ADDRESS_UPDATE' | 'RTO'>('REATTEMPT');

  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleSendWhatsApp = (awb: string, phone: string) => {
    toast.success(`WhatsApp verification SLA link sent to ${phone}! (AWB: ${awb})`);
  };

  const handleExecuteAction = () => {
    if (!selectedCase) return;
    toast.success(`NDR Action '${actionType}' submitted to courier network!`);
    setNdrCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, status: 'REATTEMPT_REQUESTED' } : c));
    setSelectedCase(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">NDR Resolution Hub</h2>
        <p className="text-xs text-slate-500 font-medium">Resolve non-delivery reports before shipments turn into expensive RTO returns</p>
      </div>

      {/* NDR Active Cases List */}
      <div className="grid grid-cols-1 gap-4">
        {ndrCases.map((ndr) => (
          <div key={ndr.id} className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-slate-900">{ndr.shipment?.awb_number || 'DEL1928374650'}</span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-200">
                    Attempt #{ndr.attempt_count} Failed
                  </span>
                </div>
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Reason: {ndr.reason}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50" leftIcon={<MessageSquare className="w-3.5 h-3.5" />} onClick={() => handleSendWhatsApp(ndr.shipment?.awb_number || 'DEL192', '+91 98765 11111')}>
                  WhatsApp SLA Link
                </Button>
                <Button size="sm" variant="primary" className="text-xs font-bold" onClick={() => {
                  setSelectedCase(ndr);
                  setActionType('REATTEMPT');
                }}>
                  Schedule Reattempt
                </Button>
                <Button size="sm" variant="outline" className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => {
                  setSelectedCase(ndr);
                  setActionType('RTO');
                }}>
                  Initiate RTO
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-bold uppercase text-[10px]">Customer Name</span>
                <span className="text-slate-900 font-bold block">{ndr.shipment?.order?.customer?.name || 'Rohan Joshi'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold uppercase text-[10px]">Phone Number</span>
                <span className="text-slate-900 font-mono font-bold block">{ndr.shipment?.order?.customer?.phone || '+91 98765 11111'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold uppercase text-[10px]">Last Attempt Date</span>
                <span className="text-slate-900 font-bold block">{new Date(ndr.created_at).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NDR Action Execution Modal */}
      <Modal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        title={`Execute NDR Action — AWB ${selectedCase?.shipment?.awb_number}`}
        subtitle="Provide updated customer instructions for courier executive"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActionType('REATTEMPT')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                actionType === 'REATTEMPT' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Same Address Reattempt
            </button>
            <button
              onClick={() => setActionType('ADDRESS_UPDATE')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                actionType === 'ADDRESS_UPDATE' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Update Phone / Address
            </button>
            <button
              onClick={() => setActionType('RTO')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                actionType === 'RTO' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Initiate RTO Return
            </button>
          </div>

          {actionType === 'ADDRESS_UPDATE' && (
            <div className="space-y-3 pt-2">
              <Input label="New Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 98765 00000" />
              <Input label="Updated Delivery Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Flat 402, New Wing, Block B" />

              {/* AI Auto-Suggestion Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> AI Suggested Address Enhancements:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAddress((prev) => (prev ? `${prev}, Near Metro Gate 3` : 'Near Metro Gate 3'))}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    + Add Landmark: Near Metro Gate 3
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAddress((prev) => (prev ? `${prev}, Contact Receiver First` : 'Contact Receiver First'))}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    + Note: Call Receiver First
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedCase(null)}>Cancel</Button>
            <Button onClick={handleExecuteAction}>Submit NDR Instructions</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

