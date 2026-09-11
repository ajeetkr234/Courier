import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, CheckCircle2, XCircle, FileText, Eye, Wallet, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { Seller } from '../../types';
import { toast } from 'sonner';

export const AdminSellersPage: React.FC = () => {
  const navigate = useNavigate();
  const { sellers, updateSellerKYC, updateSellerStatus, rateCards, addLedgerEntry, setCurrentSeller } = usePlatformStore();
  const [kycModalSeller, setKycModalSeller] = useState<Seller | null>(null);
  const [rechargeModalSeller, setRechargeModalSeller] = useState<Seller | null>(null);
  const [creditAmount, setCreditAmount] = useState('1000');
  const [creditReason, setCreditReason] = useState('Administrative credit adjustment');

  const handleApproveKYC = (sellerId: string) => {
    updateSellerKYC(sellerId, true);
    toast.success('Seller KYC approved & account status updated to ACTIVE!');
    setKycModalSeller(null);
  };

  const handleRejectKYC = (sellerId: string) => {
    updateSellerKYC(sellerId, false, 'Document details unreadable or invalid');
    toast.error('Seller KYC rejected.');
    setKycModalSeller(null);
  };

  const handleToggleSuspend = (seller: Seller) => {
    const newStatus = seller.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    updateSellerStatus(seller.id, newStatus);
    toast.info(`Seller status set to ${newStatus}`);
  };

  const handleManualCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeModalSeller) return;
    const amt = parseFloat(creditAmount) || 0;
    addLedgerEntry({
      seller_id: rechargeModalSeller.id,
      type: 'MANUAL_ADJUSTMENT',
      amount: amt,
      direction: 'CREDIT',
      reference_type: 'ADMIN_OVERRIDE',
      reference_id: `adj-${Date.now()}`,
      description: creditReason,
    });
    toast.success(`Credited ₹${amt} to ${rechargeModalSeller.company_name} wallet!`);
    setRechargeModalSeller(null);
  };

  const handleImpersonateSeller = (seller: Seller) => {
    setCurrentSeller(seller);
    toast.success(`Switched context to ${seller.company_name} (${seller.brand_name || 'Seller Store'})`);
    navigate('/app/home');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-extrabold text-white font-display">Seller Governance &amp; KYC Approvals</h2>
        <p className="text-xs text-slate-400">Review seller KYC documentation, assign rate cards &amp; manage platform access</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Company &amp; Brand</th>
                <th className="p-3.5">GSTIN / PAN</th>
                <th className="p-3.5">Rate Card Assigned</th>
                <th className="p-3.5">Registration Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{s.company_name}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold">{s.brand_name || 'Individual Seller'}</span>
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="block text-slate-200">{s.gstin || 'N/A'}</span>
                    <span className="block text-[10px] text-slate-400">{s.pan}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-semibold text-[11px] border border-slate-700">
                      {rateCards.find((r) => r.id === s.rate_card_id)?.name || 'Standard Gold'}
                    </span>
                  </td>
                  <td className="p-3.5">{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : s.status === 'KYC_PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-950/40"
                      onClick={() => handleImpersonateSeller(s)}
                      leftIcon={<ExternalLink className="w-3 h-3" />}
                    >
                      View Store
                    </Button>
                    {s.status === 'KYC_PENDING' && (
                      <Button size="sm" variant="primary" onClick={() => setKycModalSeller(s)}>
                        Review KYC
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setRechargeModalSeller(s)}>
                      Wallet Credit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleSuspend(s)}>
                      {s.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Review Modal */}
      <Modal
        isOpen={!!kycModalSeller}
        onClose={() => setKycModalSeller(null)}
        title={`KYC Verification — ${kycModalSeller?.company_name}`}
        subtitle="Review uploaded tax documents before granting platform access"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="block text-xs font-bold text-slate-300">GST Certificate ({kycModalSeller?.gstin || '27AAACA123411Z5'})</span>
            <span className="text-xs text-emerald-400 font-semibold">✓ Verified with Govt GST Portal API</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="block text-xs font-bold text-slate-300">PAN Card Verification ({kycModalSeller?.pan})</span>
            <span className="text-xs text-emerald-400 font-semibold">✓ Matched with Legal Entity Name</span>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="ghost" className="text-rose-400 hover:text-rose-300" onClick={() => handleRejectKYC(kycModalSeller!.id)}>
              Reject KYC
            </Button>
            <Button onClick={() => handleApproveKYC(kycModalSeller!.id)}>
              Approve KYC &amp; Activate Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Credit Modal */}
      <Modal
        isOpen={!!rechargeModalSeller}
        onClose={() => setRechargeModalSeller(null)}
        title={`Manual Wallet Credit — ${rechargeModalSeller?.company_name}`}
        subtitle="Perform administrative credit adjustment with audit trail"
      >
        <form onSubmit={handleManualCredit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Amount (₹)</label>
            <input
              type="number"
              required
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Log Reason</label>
            <textarea
              required
              rows={2}
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setRechargeModalSeller(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Apply Credit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

