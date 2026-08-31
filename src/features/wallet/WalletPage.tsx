import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { LedgerEntry } from '../../types';
import { toast } from 'sonner';

export const WalletPage: React.FC = () => {
  const { walletBalance, ledgerEntries, creditWallet } = usePlatformStore();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('5000');

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount) || 0;
    if (amount <= 0) return;

    creditWallet(amount, `Online Payment Gateway Top-up #REC-${Date.now()}`);
    toast.success(`Wallet recharged with ₹${amount.toLocaleString('en-IN')}!`);
    setIsRechargeModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Prepaid Wallet Balance</span>
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-black text-emerald-600 font-display">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h1>
            <span className="text-xs text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active &amp; Verified
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Automatic shipping freight deductions apply against this balance</p>
        </div>

        <Button size="lg" leftIcon={<Plus className="w-5 h-5" />} onClick={() => setIsRechargeModalOpen(true)}>
          Recharge Wallet
        </Button>
      </div>

      {/* Ledger History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Immutable Financial Ledger</h3>
          <span className="text-xs text-slate-500 font-semibold">Server-validated atomic entries ({ledgerEntries.length})</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Reference ID / Note</th>
                <th className="p-3.5">Date &amp; Time</th>
                <th className="p-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ledgerEntries.map((tx: LedgerEntry) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{tx.id}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] uppercase font-bold text-slate-800">
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{tx.reference_id}</td>
                  <td className="p-3.5 text-slate-600">{new Date(tx.created_at).toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-right font-bold text-sm">
                    {tx.direction === 'CREDIT' ? (
                      <span className="text-emerald-700 font-mono flex items-center justify-end gap-1 font-extrabold">
                        +₹{tx.amount.toLocaleString('en-IN')} <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-rose-700 font-mono flex items-center justify-end gap-1 font-extrabold">
                        -₹{tx.amount.toLocaleString('en-IN')} <ArrowDownLeft className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharge Modal */}
      <Modal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        title="Recharge Wallet Balance"
        subtitle="Select amount to credit via UPI, NetBanking, or Razorpay"
      >
        <form onSubmit={handleRecharge} className="space-y-4">
          <Input
            label="Recharge Base Amount (₹)"
            type="number"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-2">
            {['1000', '5000', '10000'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setRechargeAmount(amt)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  rechargeAmount === amt ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 hover:border-indigo-500 text-slate-800 border-slate-300'
                }`}
              >
                + ₹{amt}
              </button>
            ))}
          </div>

          {/* Live GST Tax Breakdown Pill */}
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1.5 border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Wallet Credit Subtotal:</span>
              <strong className="text-white">₹{(parseFloat(rechargeAmount) || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST Tax (18%):</span>
              <strong className="text-white">₹{((parseFloat(rechargeAmount) || 0) * 0.18).toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-emerald-400 text-sm font-bold pt-1.5 border-t border-slate-800">
              <span>Total Payable Amount:</span>
              <strong className="text-emerald-400">₹{((parseFloat(rechargeAmount) || 0) * 1.18).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsRechargeModalOpen(false)}>Cancel</Button>
            <Button type="submit">Proceed to Payment Gateway</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

