import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, ShieldCheck,
  History, Clock, CheckCircle2, XCircle, Search, Receipt,
  AlertCircle, FileText, Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { LedgerEntry, WalletRechargeRequest } from '../../types';
import { toast } from 'sonner';
import { fetchWalletRechargeRequests } from '../../services/supabaseFinance';

export const WalletPage: React.FC = () => {
  const { walletBalance, ledgerEntries, creditWallet, loadSupabaseData, isLoadingData } = usePlatformStore();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeRequests, setRechargeRequests] = useState<WalletRechargeRequest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'RECHARGES' | 'LEDGER'>('RECHARGES');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const historySectionRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    loadSupabaseData();
    try {
      const requests = await fetchWalletRechargeRequests();
      setRechargeRequests(requests);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadSupabaseData();
      const requests = await fetchWalletRechargeRequests();
      setRechargeRequests(requests);
      toast.success('Wallet records and recharge history refreshed.');
    } catch {
      toast.error('Unable to refresh wallet data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount) || 0;
    if (amount <= 0) {
      toast.error('Enter a valid recharge amount greater than 0.');
      return;
    }

    setIsRecharging(true);
    try {
      const paymentRef = paymentReference.trim().toUpperCase();
      if (paymentRef.length < 6) {
        toast.error('Enter a valid bank UTR or payment reference (minimum 6 characters).');
        return;
      }
      await creditWallet(amount, paymentRef);
      const updated = await fetchWalletRechargeRequests();
      setRechargeRequests(updated);
      toast.success(`Recharge request for ₹${amount.toLocaleString('en-IN')} submitted. View status in Recharge History below.`);
      setRechargeAmount('');
      setPaymentReference('');
      setIsRechargeModalOpen(false);

      // Auto-switch to Recharge History tab and scroll to view
      setActiveTab('RECHARGES');
      setStatusFilter('ALL');
      setTimeout(() => {
        historySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wallet recharge could not be saved.');
    } finally {
      setIsRecharging(false);
    }
  };

  const pendingCount = rechargeRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = rechargeRequests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = rechargeRequests.filter((r) => r.status === 'REJECTED').length;

  const filteredRecharges = useMemo(() => {
    return rechargeRequests.filter((req) => {
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        req.payment_reference.toLowerCase().includes(q) ||
        req.amount.toString().includes(q) ||
        (req.review_note && req.review_note.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [rechargeRequests, statusFilter, searchTerm]);

  const filteredLedger = useMemo(() => {
    if (!searchTerm.trim()) return ledgerEntries;
    const q = searchTerm.trim().toLowerCase();
    return ledgerEntries.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.reference_id?.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
    );
  }, [ledgerEntries, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-indigo-600" /> Prepaid Wallet Balance
          </span>
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-black text-emerald-600 font-display">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h1>
            <span className="text-xs text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Active &amp; Verified
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Automatic shipping freight deductions apply against this balance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={activeTab === 'RECHARGES' ? 'primary' : 'outline'}
            size="lg"
            leftIcon={<History className="w-5 h-5" />}
            onClick={() => {
              setActiveTab('RECHARGES');
              historySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-bold text-xs sm:text-sm shadow-xs"
          >
            Recharge History
            {rechargeRequests.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'RECHARGES' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {rechargeRequests.length}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingCount} pending
              </span>
            )}
          </Button>

          <Button
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setIsRechargeModalOpen(true)}
            className="font-bold text-xs sm:text-sm shadow-sm"
          >
            Recharge Wallet
          </Button>
        </div>
      </div>

      {/* Financial Records & Recharge History Section */}
      <div ref={historySectionRef} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Navigation Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('RECHARGES')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'RECHARGES'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Recharge History</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'RECHARGES' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {rechargeRequests.length}
              </span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'RECHARGES' ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingCount} pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'LEDGER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Immutable Financial Ledger</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'LEDGER' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {ledgerEntries.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'RECHARGES' ? 'Search reference or amount...' : 'Search transaction ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing || isLoadingData}
              className="text-xs font-bold shrink-0"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingData ? 'animate-spin text-indigo-600' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* RECHARGES TAB CONTENT */}
        {activeTab === 'RECHARGES' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Filter by:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({rechargeRequests.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>

            {/* Recharge History Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Payment Reference</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">GST Deducted (18%)</th>
                    <th className="p-3.5">Wallet Credit</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Submitted On</th>
                    <th className="p-3.5 text-right">Admin Verification Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRecharges.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-700 text-sm">No recharge requests found</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {searchTerm
                            ? 'No recharge requests matched your search query.'
                            : 'Submit a recharge request above to top up your prepaid shipping wallet.'}
                        </p>
                        {!searchTerm && (
                          <Button size="sm" className="mt-4 text-xs font-bold" onClick={() => setIsRechargeModalOpen(true)}>
                            Recharge Wallet Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRecharges.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-slate-900">{request.payment_reference}</div>
                          <div className="text-[10px] text-slate-400">ID: {request.id.slice(0, 16)}...</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">
                          ₹{(request.paid_amount ?? request.amount + request.gst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          ₹{request.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 font-mono font-extrabold text-indigo-700">
                          ₹{request.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              request.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : request.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {request.status === 'APPROVED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : request.status === 'REJECTED' ? (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            )}
                            {request.status === 'APPROVED'
                              ? 'Approved & Credited'
                              : request.status === 'REJECTED'
                              ? 'Rejected'
                              : 'Pending Approval'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 text-xs">
                          {new Date(request.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right text-xs">
                          {request.review_note ? (
                            <span className="text-slate-700 italic font-medium">{request.review_note}</span>
                          ) : request.status === 'APPROVED' ? (
                            <span className="text-emerald-600 font-semibold">Credited to wallet balance</span>
                          ) : request.status === 'REJECTED' ? (
                            <span className="text-rose-600 font-semibold">Verification failed</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">Awaiting Super Admin review</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LEDGER TAB CONTENT */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-4 animate-fadeIn">
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
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-700 text-sm">No ledger transactions recorded yet</p>
                        <p className="text-xs text-slate-500 mt-1">Recharge your wallet or ship orders to generate ledger activity.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((tx: LedgerEntry) => (
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
                              +₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-rose-700 font-mono flex items-center justify-end gap-1 font-extrabold">
                              -₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <ArrowDownLeft className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      <Modal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        title="Recharge Wallet Balance"
        subtitle="Payment gateway is not configured yet. Submit a recharge request for Super Admin verification and approval."
      >
        <form onSubmit={handleRecharge} className="space-y-4">
          <Input
            label="Total Amount Paid (₹)"
            type="number"
            min="100"
            step="1"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            placeholder="e.g. 5000"
            required
          />

          <Input
            label="Bank UTR / Payment Reference"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Enter the reference from your bank payment"
            minLength={6}
            required
          />

          <div className="grid grid-cols-3 gap-2">
            {['1000', '5000', '10000'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setRechargeAmount(amt)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  rechargeAmount === amt
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-100 hover:border-indigo-500 text-slate-800 border-slate-300'
                }`}
              >
                + ₹{amt}
              </button>
            ))}
          </div>

          {/* Live GST Tax Breakdown Pill */}
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1.5 border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Total Amount Paid:</span>
              <strong className="text-white">₹{(parseFloat(rechargeAmount) || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST Deducted (18%):</span>
              <strong className="text-white">₹{((parseFloat(rechargeAmount) || 0) * 0.18).toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-emerald-400 text-sm font-bold pt-1.5 border-t border-slate-800">
              <span>Wallet Credit After GST:</span>
              <strong className="text-emerald-400">₹{((parseFloat(rechargeAmount) || 0) * 0.82).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsRechargeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isRecharging} disabled={isRecharging}>
              Submit for Admin Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
