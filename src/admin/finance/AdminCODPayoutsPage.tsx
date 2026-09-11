import React, { useState } from 'react';
import { 
  Landmark, DollarSign, CheckCircle2, Clock, Download, 
  Send, RefreshCw, FileText, AlertTriangle, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { usePlatformStore } from '../../services/store';
import { CODPayoutBatch } from '../../types';
import { toast } from 'sonner';

export const AdminCODPayoutsPage: React.FC = () => {
  const { codPayoutBatches, createAdminCODPayoutBatch, sellers } = usePlatformStore();
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // New Batch Form State
  const [selectedSellerId, setSelectedSellerId] = useState(sellers[0]?.id || '32d724db-23c4-4cba-a76f-f78e4022194e');
  const [grossCod, setGrossCod] = useState('75000');
  const [freightCut, setFreightCut] = useState('9400');
  const [earlyFee, setEarlyFee] = useState('900');
  const [payoutMode, setPayoutMode] = useState<'STANDARD_T3' | 'EARLY_COD_T1'>('EARLY_COD_T1');

  const grossNum = parseFloat(grossCod) || 0;
  const freightNum = parseFloat(freightCut) || 0;
  const earlyNum = payoutMode === 'EARLY_COD_T1' ? (parseFloat(earlyFee) || 0) : 0;
  const netTransfer = grossNum - freightNum - earlyNum;

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const seller = sellers.find(s => s.id === selectedSellerId) || sellers[0];
    const newBatch = createAdminCODPayoutBatch({
      batch_reference: `COD-REM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0${codPayoutBatches.length + 1}`,
      seller_id: selectedSellerId,
      seller_name: seller?.company_name || 'Apex Retail',
      gross_cod_amount: grossNum,
      freight_deductions: freightNum,
      early_cod_fee: earlyNum,
      net_payout_amount: netTransfer,
      shipment_count: Math.max(5, Math.round(grossNum / 1400)),
      bank_name: 'HDFC Bank Ltd',
      account_number_masked: '•••••••••92834',
      utr_number: `HDFCR9${Date.now().toString().slice(-8)}`,
      payout_mode: payoutMode,
      status: 'SETTLED',
      settled_at: new Date().toISOString(),
    });

    toast.success(`Dispatched COD Settlement Batch ${newBatch.batch_reference} with UTR ${newBatch.utr_number}!`);
    setIsBatchModalOpen(false);
  };

  const handleExportBankCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Batch Ref,Seller,Bank,Account,IFSC,Net Transfer,UTR,Payout Mode,Status\n" +
      codPayoutBatches.map(b => 
        `"${b.batch_reference}","${b.seller_name}","${b.bank_name}","${b.account_number_masked}","HDFC0001248","${b.net_payout_amount}","${b.utr_number || 'PENDING'}","${b.payout_mode}","${b.status}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_Bank_Payout_Batch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Corporate Banking Bulk Payout CSV exported!');
  };

  const totalGrossDisbursed = codPayoutBatches.reduce((acc, b) => acc + b.gross_cod_amount, 0);
  const totalFreightRetained = codPayoutBatches.reduce((acc, b) => acc + b.freight_deductions, 0);
  const totalEarlyFeesEarned = codPayoutBatches.reduce((acc, b) => acc + b.early_cod_fee, 0);
  const totalNetWired = codPayoutBatches.reduce((acc, b) => acc + b.net_payout_amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Landmark className="h-6 w-6 text-emerald-400" /> Carrier COD Settlements &amp; Bank Payout Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin nodal account settlements, automated freight debt recovery from COD, and corporate bank API transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportBankCSV}
            leftIcon={<Download className="w-4 h-4 text-slate-300" />}
            className="text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Bank Bulk Payout CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsBatchModalOpen(true)}
            leftIcon={<Send className="w-4 h-4 text-white" />}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
          >
            Dispatch Payout Batch
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Carrier COD Remitted</span>
          <strong className="text-xl font-mono text-white block">₹{totalGrossDisbursed.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-indigo-400">Received in platform nodal account</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Net Wired to Sellers</span>
          <strong className="text-xl font-mono text-emerald-400 block">₹{totalNetWired.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-slate-400">Transferred via bank APIs</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-400">Freight Debts Recovered</span>
          <strong className="text-xl font-mono text-rose-400 block">₹{totalFreightRetained.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-slate-400">Auto-deducted shipping dues</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400">Early COD Fees Earned</span>
          <strong className="text-xl font-mono text-amber-400 block">₹{totalEarlyFeesEarned.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-amber-300">1.2% instant payout markup</span>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Settlement Batches &amp; Wire Logs</h3>
          <span className="text-xs text-slate-400 font-mono">{codPayoutBatches.length} Batches Dispatched</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Batch Ref</th>
                <th className="p-3.5">Seller Name</th>
                <th className="p-3.5">Payout Mode</th>
                <th className="p-3.5">Shipments</th>
                <th className="p-3.5">Gross COD</th>
                <th className="p-3.5">Freight Surcharge Cut</th>
                <th className="p-3.5">Net Payout</th>
                <th className="p-3.5">Bank UTR</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {codPayoutBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">{b.batch_reference}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{b.seller_name}</span>
                    <span className="text-[10px] text-slate-400">{b.bank_name}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      b.payout_mode === 'EARLY_COD_T1'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {b.payout_mode === 'EARLY_COD_T1' ? 'T+1 Fast' : 'Standard T+3'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-300">{b.shipment_count} AWBs</td>
                  <td className="p-3.5 font-mono text-slate-300">₹{b.gross_cod_amount.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-mono text-rose-400">-₹{b.freight_deductions.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                    ₹{b.net_payout_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    <span className="font-bold text-white">{b.utr_number || 'PENDING'}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      b.status === 'SETTLED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Batch Modal */}
      {isBatchModalOpen && (
        <Modal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          title="Dispatch COD Settlement Batch"
          subtitle="Execute automated freight deductions and generate IMPS/NEFT UTR reference"
        >
          <form onSubmit={handleCreateBatch} className="space-y-4 text-slate-900 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Seller Account</label>
              <select
                value={selectedSellerId}
                onChange={(e) => setSelectedSellerId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name} ({s.brand_name || 'Seller'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Gross COD Remittance Received (₹)"
                value={grossCod}
                onChange={(e) => setGrossCod(e.target.value)}
                required
              />
              <Input
                label="Unpaid Freight Surcharges (₹)"
                value={freightCut}
                onChange={(e) => setFreightCut(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Cycle Mode</label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="EARLY_COD_T1">Early COD (T+1) — 1.2% Platform Fee</option>
                  <option value="STANDARD_T3">Standard COD (T+3) — Zero Platform Fee</option>
                </select>
              </div>
              <Input
                label="Early COD Processing Fee (₹)"
                value={earlyFee}
                onChange={(e) => setEarlyFee(e.target.value)}
                disabled={payoutMode === 'STANDARD_T3'}
              />
            </div>

            {/* Calculated Preview */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold space-y-1">
              <div className="flex justify-between text-xs">
                <span>Net Bank Transfer to Seller:</span>
                <span className="font-mono text-sm text-emerald-800">₹{netTransfer.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-normal">
                UTR will be generated and logged to the seller's live remittance dashboard instantly.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsBatchModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Generate Batch &amp; Wire UTR
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
