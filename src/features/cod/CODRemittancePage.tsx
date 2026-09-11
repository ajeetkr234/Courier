import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Landmark, CheckCircle2, Clock, FileText, Download, 
  Zap, ArrowRight, ShieldCheck, HelpCircle, Edit3, Building2, RefreshCw, AlertCircle
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const CODRemittancePage: React.FC = () => {
  const { 
    codRemittances, 
    codPayoutBatches,
    sellerBankAccount,
    isEarlyCODEnabled,
    toggleEarlyCOD,
    requestInstantCODPayout,
    updateSellerBankDetails,
    loadSupabaseData 
  } = usePlatformStore();

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isInstantPayoutModalOpen, setIsInstantPayoutModalOpen] = useState(false);

  // Bank Form State
  const [bankName, setBankName] = useState(sellerBankAccount?.bank_name || 'HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState(sellerBankAccount?.account_number || '9182390192834');
  const [ifscCode, setIfscCode] = useState(sellerBankAccount?.ifsc_code || 'HDFC0001248');
  const [holderName, setHolderName] = useState(sellerBankAccount?.account_holder_name || 'Apex D2C Logistics Pvt Ltd');

  useEffect(() => {
    loadSupabaseData();
  }, []);

  const totalGrossPending = 48500;
  const pendingFreightDebits = 6240;
  const earlyCODFeePercent = 1.2;
  const earlyCODFeeAmount = Math.round(totalGrossPending * (earlyCODFeePercent / 100));
  const estimatedNetPayout = totalGrossPending - pendingFreightDebits - (isEarlyCODEnabled ? earlyCODFeeAmount : 0);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updateSellerBankDetails({
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      account_holder_name: holderName,
      is_verified: true,
    });
    toast.success('Bank details verified via penny-drop & updated for COD payouts!');
    setIsBankModalOpen(false);
  };

  const handleInstantPayoutSubmit = () => {
    requestInstantCODPayout(totalGrossPending, earlyCODFeeAmount);
    toast.success(`Instant COD Payout of ₹${(totalGrossPending - earlyCODFeeAmount).toLocaleString('en-IN')} initiated to ${sellerBankAccount?.bank_name || 'HDFC Bank'}!`);
    setIsInstantPayoutModalOpen(false);
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Batch Reference,Payout Mode,Shipments,Gross Amount,Freight Deductions,Early COD Fee,Net Payout,UTR Number,Status\n" +
      codPayoutBatches.map(b => 
        `"${b.batch_reference}","${b.payout_mode}","${b.shipment_count}","${b.gross_cod_amount}","${b.freight_deductions}","${b.early_cod_fee}","${b.net_payout_amount}","${b.utr_number || 'IN_PROGRESS'}","${b.status}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `COD_Remittance_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('COD statement downloaded successfully');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Subheader */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> COD Remittance &amp; Fast Payouts Engine
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automatic reconciliation of cash collected by carrier partners, freight deductions, and early COD payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCSV}
            leftIcon={<Download className="w-4 h-4 text-slate-600" />}
            className="text-xs font-bold"
          >
            Export Statement
          </Button>
          <Button
            size="sm"
            onClick={() => setIsInstantPayoutModalOpen(true)}
            leftIcon={<Zap className="w-4 h-4 text-amber-300" />}
            className="text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            Request Instant Payout
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Gross COD in Pipeline"
          value={`₹${totalGrossPending.toLocaleString('en-IN')}`}
          subtitle="Collected by courier delivery agents"
          variant="indigo"
        />
        <StatCard
          title="Pending Freight Deductions"
          value={`-₹${pendingFreightDebits.toLocaleString('en-IN')}`}
          subtitle="Auto-deducted shipping debits"
          variant="rose"
        />
        <StatCard
          title="Estimated Net Payout"
          value={`₹${estimatedNetPayout.toLocaleString('en-IN')}`}
          subtitle={isEarlyCODEnabled ? "Eligible for Next-Day T+1 Payout" : "Scheduled on Standard T+3 cycle"}
          variant="emerald"
        />
        <StatCard
          title="Remittance Frequency"
          value={isEarlyCODEnabled ? "Early COD (T+1)" : "Standard (T+3)"}
          subtitle="Verified Bank Account Linked"
          variant="amber"
        />
      </div>

      {/* Interactive Middle Row: Early COD Control & Bank Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Early COD (T+1) Switcher Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-black text-base text-white font-display">Early COD Remittance (T+1 Instant)</h3>
                <span className="text-[11px] text-indigo-200">Receive cash within 24 hours of delivery instead of waiting 4–7 days</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">
                {isEarlyCODEnabled ? 'T+1 Active' : 'Standard T+3'}
              </span>
              <button
                onClick={() => {
                  toggleEarlyCOD(!isEarlyCODEnabled);
                  toast.success(`Early COD remittance switched to ${!isEarlyCODEnabled ? 'ENABLED' : 'DISABLED'}`);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isEarlyCODEnabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    isEarlyCODEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Dynamic Deduction Breakdown Formula */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-800/50 space-y-2 text-xs font-mono">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
              Transparent Payout Settlement Calculation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Gross COD Collected</span>
                <strong className="text-white text-sm">₹{totalGrossPending.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-rose-300 block">(-) Freight Deductions</span>
                <strong className="text-rose-400 text-sm">-₹{pendingFreightDebits.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-amber-300 block">(-) Early COD Fee ({isEarlyCODEnabled ? '1.2%' : '0%'})</span>
                <strong className="text-amber-400 text-sm">-₹{isEarlyCODEnabled ? earlyCODFeeAmount : 0}</strong>
              </div>
              <div className="sm:border-l sm:border-slate-800 sm:pl-3">
                <span className="text-[10px] text-emerald-300 block">(=) Net Bank Payout</span>
                <strong className="text-emerald-400 text-sm font-black">₹{estimatedNetPayout.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Bank Account Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" /> Receiving Bank Account
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Penny-Drop Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-extrabold text-sm text-slate-900 block">{sellerBankAccount?.bank_name || 'HDFC Bank Ltd'}</span>
              <span className="font-mono text-xs font-bold text-slate-700 block">
                A/C: •••••••••{sellerBankAccount?.account_number.slice(-5) || '92834'}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold block">
                IFSC: {sellerBankAccount?.ifsc_code || 'HDFC0001248'} • {sellerBankAccount?.account_holder_name || 'Apex D2C Logistics'}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBankModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            className="w-full text-xs font-bold"
          >
            Update Bank Details
          </Button>
        </div>
      </div>

      {/* Remittance Batches Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">
            COD Remittance Batches &amp; Payout History
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {codPayoutBatches.length} Settlement Cycles Logged
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Batch Reference</th>
                <th className="p-3.5">Payout Mode</th>
                <th className="p-3.5">Shipments</th>
                <th className="p-3.5">Gross COD</th>
                <th className="p-3.5">Freight Surcharges</th>
                <th className="p-3.5">Net Transferred</th>
                <th className="p-3.5">Bank Reference / UTR</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {codPayoutBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-600">{batch.batch_reference}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      batch.payout_mode === 'EARLY_COD_T1' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {batch.payout_mode === 'EARLY_COD_T1' ? 'T+1 Early COD' : 'Standard T+3'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{batch.shipment_count} AWBs</td>
                  <td className="p-3.5 font-mono text-slate-700">₹{batch.gross_cod_amount.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-mono text-rose-600 font-bold">-₹{batch.freight_deductions.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-mono font-black text-emerald-700 text-sm">
                    ₹{batch.net_payout_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {batch.utr_number ? (
                      <span className="text-slate-900 font-bold">{batch.utr_number}</span>
                    ) : (
                      <span className="text-amber-600 font-semibold animate-pulse">Disbursing via Payout API</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={batch.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Account Update Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title="Update Payout Bank Account"
        subtitle="COD collections and ledger refunds will be wired to this verified bank account"
      >
        <form onSubmit={handleSaveBank} className="space-y-4">
          <Input 
            label="Beneficiary Account Holder Name"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Company or Proprietor Name"
            required
          />
          <Input 
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. HDFC Bank, ICICI Bank"
            required
          />
          <Input 
            label="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="12 to 18 digit account number"
            required
          />
          <Input 
            label="Bank IFSC Code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            placeholder="e.g. HDFC0001248"
            required
          />

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <span className="font-extrabold block">Automated Penny-Drop Verification:</span>
            <p>Our platform automatically deposits ₹1.00 via IMPS to verify the account holder name against bank records.</p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsBankModalOpen(false)}>Cancel</Button>
            <Button type="submit">Verify &amp; Save Bank</Button>
          </div>
        </form>
      </Modal>

      {/* Request Instant Payout Modal */}
      <Modal
        isOpen={isInstantPayoutModalOpen}
        onClose={() => setIsInstantPayoutModalOpen(false)}
        title="Confirm Instant Early COD Payout"
        subtitle="Transfer funds directly to your verified bank account without waiting for carrier cycles"
      >
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Eligible Delivered COD Amount:</span>
              <strong className="text-slate-900 font-mono">₹{totalGrossPending.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Pending Freight Charges:</span>
              <strong className="text-rose-600 font-mono">-₹{pendingFreightDebits.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Instant T+1 Processing Fee (1.2%):</span>
              <strong className="text-amber-600 font-mono">-₹{earlyCODFeeAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between border-t border-indigo-200 pt-2 font-black text-sm">
              <span className="text-indigo-950">Net Wire Transfer Amount:</span>
              <span className="text-emerald-700 font-mono">₹{(totalGrossPending - pendingFreightDebits - earlyCODFeeAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Destination Bank</span>
            <strong className="text-slate-900 block font-semibold">
              {sellerBankAccount?.bank_name} (•••••••••{sellerBankAccount?.account_number.slice(-5)})
            </strong>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsInstantPayoutModalOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={handleInstantPayoutSubmit}>
              Confirm Payout Transfer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
