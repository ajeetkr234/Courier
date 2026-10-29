import React, { useState } from 'react';
import { 
  AlertTriangle, Phone, MapPin, RefreshCw, RotateCcw, CheckCircle2, Clock, 
  MessageSquare, Wand2, ShieldAlert, Smartphone, ArrowRight, Send, Check, 
  ChevronRight, Calendar, UserCheck, HelpCircle, Shield
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import { usePlatformStore } from '../../services/store';
import { NDRCase } from '../../types';
import { toast } from 'sonner';

export const NDRResolutionPage: React.FC = () => {
  const { 
    ndrCases, 
    ndrEscalations, 
    resolveNDR, 
    escalateFakeNDR, 
    loadSupabaseData 
  } = usePlatformStore();

  const [selectedCase, setSelectedCase] = useState<NDRCase | null>(null);
  const [actionType, setActionType] = useState<'REATTEMPT' | 'ADDRESS_UPDATE' | 'RTO'>('REATTEMPT');
  const [timeSlot, setTimeSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('AFTERNOON');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [deliveryRemarks, setDeliveryRemarks] = useState('');

  // Fake Attempt Escalation Modal
  const [fakeAttemptCase, setFakeAttemptCase] = useState<NDRCase | null>(null);
  const [fakeReason, setFakeReason] = useState('Doorbell camera / CCTV confirms no rider visited');
  const [fakeNotes, setFakeNotes] = useState('');

  // WhatsApp / IVR Simulator Drawer
  const [simulatorCase, setSimulatorCase] = useState<NDRCase | null>(null);

  React.useEffect(() => {
    loadSupabaseData();
  }, []);

  const handleOpenEscalateModal = (ndr: NDRCase) => {
    setFakeAttemptCase(ndr);
    setFakeReason('Doorbell camera / CCTV confirms no rider visited');
    setFakeNotes(`Customer ${ndr.shipment?.order?.customer?.name || 'Buyer'} confirmed being at home all day. Driver made zero incoming phone calls before marking failed attempt.`);
  };

  const handleSubmitFakeEscalation = () => {
    if (!fakeAttemptCase) return;
    escalateFakeNDR(fakeAttemptCase.id, fakeReason, fakeNotes);
    toast.success(`Fake Attempt Escalation logged! Routed to Super Admin Control Tower for carrier penalty review.`);
    setFakeAttemptCase(null);
  };

  const handleExecuteAction = () => {
    if (!selectedCase) return;
    resolveNDR(selectedCase.id, actionType, {
      newPhone,
      newAddress,
      timeSlot,
      deliveryRemarks,
    });
    toast.success(`NDR Action '${actionType}' submitted to ${selectedCase.shipment?.courier_name || 'courier'} network!`);
    setSelectedCase(null);
  };

  const escalatedAwbSet = new Set(ndrEscalations.map(e => e.awb_number));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> NDR Resolution &amp; RTO Defense Hub
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time delivery exception management, automated buyer WhatsApp workflows, and fake attempt carrier escalations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200">
            Auto-NDR Bot Active
          </span>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active NDR Cases"
          value={ndrCases.length.toString()}
          subtitle="Awaiting seller/buyer action"
          variant="amber"
        />
        <StatCard
          title="Carrier Fake Attempts"
          value={ndrEscalations.length.toString()}
          subtitle="Escalated to Super Admin"
          variant="rose"
        />
        <StatCard
          title="NDR Recovery Rate"
          value="82.4%"
          subtitle="Deliveries saved from RTO"
          variant="emerald"
        />
        <StatCard
          title="Auto-RTO SLA"
          value="24 Hours"
          subtitle="Countdown before auto return"
          variant="indigo"
        />
      </div>

      {/* NDR Active Cases List */}
      <div className="grid grid-cols-1 gap-4">
        {ndrCases.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">All Clear! No Active NDR Cases</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No delivery exceptions have been reported across your active shipments. Any customer non-delivery reports will appear here in real time.
            </p>
          </div>
        ) : (
          ndrCases.map((ndr) => {
            const isEscalated = escalatedAwbSet.has(ndr.shipment?.awb_number || '');
            return (
              <div 
                key={ndr.id} 
                className={`bg-white p-6 rounded-2xl border transition-all shadow-xs space-y-4 ${
                  isEscalated ? 'border-amber-300 ring-2 ring-amber-100' : 'border-rose-200 hover:border-rose-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-base text-slate-900">
                        AWB #{ndr.shipment?.awb_number || ndr.shipment_id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] border border-rose-200">
                        Attempt #{ndr.attempt_count} Failed
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                        {ndr.shipment?.courier_name || 'Carrier Network'}
                      </span>
                      {isEscalated && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] animate-pulse">
                          Escalated to Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /> Reason: {ndr.reason}
                    </p>
                  </div>

                  {/* Actions Button Group */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => setSimulatorCase(ndr)}
                    >
                      WhatsApp Log
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
                      leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
                      onClick={() => handleOpenEscalateModal(ndr)}
                    >
                      {isEscalated ? 'View Escalation' : 'Escalate Fake Attempt'}
                    </Button>

                    <Button 
                      size="sm" 
                      variant="primary" 
                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700" 
                      onClick={() => {
                        setSelectedCase(ndr);
                        setActionType('REATTEMPT');
                      }}
                    >
                      Schedule Reattempt
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50" 
                      onClick={() => {
                        setSelectedCase(ndr);
                        setActionType('RTO');
                      }}
                    >
                      Initiate RTO
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[10px]">Customer Name</span>
                    <span className="text-slate-900 font-bold block truncate">
                      {ndr.shipment?.order?.customer?.name || ndr.shipment?.order?.shipping_address?.name || 'Customer'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[10px]">Phone Number</span>
                    <span className="text-slate-900 font-mono font-bold block">
                      {ndr.shipment?.order?.customer?.phone || ndr.shipment?.order?.shipping_address?.phone || '+91 98201 12938'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[10px]">Destination City</span>
                    <span className="text-slate-900 font-semibold block">
                      {ndr.shipment?.order?.shipping_address?.city || 'Mumbai'} ({ndr.shipment?.order?.shipping_address?.pincode || '400053'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[10px]">SLA Countdown</span>
                    <span className="text-rose-700 font-black flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> 18h 35m left
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. NDR Reattempt Execution Modal */}
      <Modal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        title={`Execute NDR Action — AWB ${selectedCase?.shipment?.awb_number}`}
        subtitle="Provide updated customer instructions for the courier delivery team"
      >
        <div className="space-y-4 text-slate-900">
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            <button
              onClick={() => setActionType('REATTEMPT')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                actionType === 'REATTEMPT' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Same Address Reattempt
            </button>
            <button
              onClick={() => setActionType('ADDRESS_UPDATE')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                actionType === 'ADDRESS_UPDATE' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Update Phone / Address
            </button>
            <button
              onClick={() => setActionType('RTO')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                actionType === 'RTO' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Initiate RTO Return
            </button>
          </div>

          {actionType !== 'RTO' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Preferred Delivery Time Slot</label>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  {[
                    { id: 'MORNING', label: 'Morning (9 AM - 1 PM)' },
                    { id: 'AFTERNOON', label: 'Afternoon (1 PM - 5 PM)' },
                    { id: 'EVENING', label: 'Evening (5 PM - 8 PM)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTimeSlot(s.id as any)}
                      className={`p-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        timeSlot === s.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {actionType === 'ADDRESS_UPDATE' && (
                <div className="space-y-3">
                  <Input 
                    label="Alternate Buyer Phone Number" 
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)} 
                    placeholder="+91 98765 00000" 
                  />
                  <Input 
                    label="Corrected Landmark / Address Notes" 
                    value={newAddress} 
                    onChange={(e) => setNewAddress(e.target.value)} 
                    placeholder="Flat 402, Near ICICI Bank ATM, 2nd Floor" 
                  />

                  {/* Quick AI Suggestions */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                      <Wand2 className="w-3 h-3" /> Quick Additions:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setNewAddress((prev) => (prev ? `${prev}, Near Metro Gate 3` : 'Near Metro Gate 3'))}
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        + Landmark: Near Metro Station
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryRemarks('Please call customer before arriving at gate')}
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        + Instruction: Call Before Arrival
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Rider Delivery Remarks</label>
                <input
                  type="text"
                  value={deliveryRemarks}
                  onChange={(e) => setDeliveryRemarks(e.target.value)}
                  placeholder="e.g. Leave parcel with security if buyer not in flat"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedCase(null)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={handleExecuteAction}>
              Submit NDR Instructions
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Escalate Fake Delivery Attempt Modal */}
      <Modal
        isOpen={!!fakeAttemptCase}
        onClose={() => setFakeAttemptCase(null)}
        title={`Escalate Fake Attempt — AWB ${fakeAttemptCase?.shipment?.awb_number}`}
        subtitle="This report triggers an urgent carrier penalty review in Super Admin Control Tower"
      >
        <div className="space-y-4 text-slate-900">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
            <span className="font-extrabold block text-amber-950">Carrier Accountability Policy:</span>
            <p>
              When couriers fake delivery attempts without calling or visiting, the platform automatically logs carrier SLA breaches and requests hub re-dispatch.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Dispute Reason</label>
            <select
              value={fakeReason}
              onChange={(e) => setFakeReason(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Doorbell camera / CCTV confirms no rider visited">Doorbell camera / CCTV confirms no rider visited</option>
              <option value="Customer was present all day and received zero calls">Customer was present all day and received zero calls</option>
              <option value="Rider demanded delivery OTP over phone without arriving">Rider demanded delivery OTP over phone without arriving</option>
              <option value="Rider marked premises closed during business hours">Rider marked premises closed during business hours</option>
              <option value="Fake customer rejection reported by field executive">Fake customer rejection reported by field executive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Evidence &amp; Verification Notes</label>
            <textarea
              rows={3}
              value={fakeNotes}
              onChange={(e) => setFakeNotes(e.target.value)}
              placeholder="Describe buyer verification, call logs, or camera evidence..."
              className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setFakeAttemptCase(null)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold" onClick={handleSubmitFakeEscalation}>
              Submit to Super Admin Ops
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. WhatsApp / IVR Live Communication Simulator Modal */}
      <Modal
        isOpen={!!simulatorCase}
        onClose={() => setSimulatorCase(null)}
        title={`Automated Buyer Workflow — ${simulatorCase?.shipment?.order?.customer?.name || 'Customer'}`}
        subtitle="Simulated real-time omnichannel WhatsApp & IVR communication log"
      >
        <div className="space-y-4">
          <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl text-xs space-y-3">
            {/* Phone Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400 font-mono">
              <span className="font-bold text-emerald-400">● WhatsApp Business</span>
              <span>10:45 AM</span>
            </div>

            {/* Outgoing Bot Message */}
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-xs space-y-2 border border-slate-700">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Apex Retail Delivery Bot</span>
              <p className="text-slate-200 text-xs leading-relaxed">
                Hi <strong>{simulatorCase?.shipment?.order?.customer?.name || 'Rahul'}</strong>, your parcel (AWB: <span className="font-mono text-indigo-300">{simulatorCase?.shipment?.awb_number}</span>) could not be delivered today because <em>"{simulatorCase?.reason}"</em>.
              </p>
              <p className="text-slate-300 text-xs">When should our courier partner re-attempt delivery?</p>

              {/* Interactive simulated options */}
              <div className="space-y-1.5 pt-1">
                <div className="p-2 rounded-lg bg-indigo-600 text-white font-bold text-center text-xs">
                  ✓ Option A: Re-attempt Tomorrow
                </div>
                <div className="p-2 rounded-lg bg-slate-700 text-slate-300 font-semibold text-center text-xs">
                  Option B: Update Delivery Landmark
                </div>
                <div className="p-2 rounded-lg bg-slate-700 text-slate-300 font-semibold text-center text-xs">
                  Option C: Cancel Order
                </div>
              </div>
            </div>

            {/* Incoming Customer Reply */}
            <div className="flex justify-end">
              <div className="bg-emerald-900/60 border border-emerald-500/40 p-2.5 rounded-2xl rounded-tr-xs text-emerald-100 text-xs max-w-[85%] space-y-1">
                <p>I was at home all day, delivery person didn't call. Please re-attempt tomorrow after 2 PM!</p>
                <span className="text-[9px] text-emerald-400 block text-right font-mono">10:46 AM • Read</span>
              </div>
            </div>

            {/* Automated Bot Confirmation */}
            <div className="bg-slate-800 p-2.5 rounded-2xl rounded-tl-xs text-slate-300 text-xs border border-slate-700">
              <span className="text-[10px] text-emerald-400 font-bold block">Automated Sync:</span>
              <span>Instructions logged! Priority re-attempt assigned to destination hub.</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setSimulatorCase(null)}>Close Simulator</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
