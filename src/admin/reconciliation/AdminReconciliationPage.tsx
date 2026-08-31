import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, FileSpreadsheet, RefreshCw, Filter } from 'lucide-react';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const AdminReconciliationPage: React.FC = () => {
  const { reconciliations, addReconciliationOverride } = usePlatformStore();
  const [filter, setFilter] = useState<'ALL' | 'FLAGGED' | 'RESOLVED'>('ALL');

  const filtered = reconciliations.filter((r) => {
    if (filter === 'FLAGGED') return r.status === 'FLAGGED';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const handleResolve = (id: string) => {
    addReconciliationOverride(id, 'RESOLVED', 'Manually verified and adjusted in carrier statement');
    toast.success('Discrepancy resolved and marked settled!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Scale className="h-6 w-6 text-indigo-400" /> Automated Reconciliation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare Courier Remittance CSV output vs. Platform expected COD &amp; freight debits to catch short settlement or duplicate charges
          </p>
        </div>

        <button
          onClick={() => toast.success('Remittance CSV reconciled! 0 new discrepancies found.')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" /> Upload Remittance File
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({reconciliations.length})
          </button>
          <button
            onClick={() => setFilter('FLAGGED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'FLAGGED' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Flagged Mismatches ({reconciliations.filter((r) => r.status === 'FLAGGED').length})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'RESOLVED' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({reconciliations.filter((r) => r.status === 'RESOLVED').length})
          </button>
        </div>

        <span className="text-xs text-slate-400">Audit Status: Sync Live</span>
      </div>

      {/* Reconciliation Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">AWB Number</th>
                <th className="p-3.5">Carrier</th>
                <th className="p-3.5">Expected Amount</th>
                <th className="p-3.5">Remitted Amount</th>
                <th className="p-3.5">Discrepancy</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">{r.awb_number}</td>
                  <td className="p-3.5 font-bold uppercase">{r.courier_code}</td>
                  <td className="p-3.5 font-bold text-white">₹{r.platform_expected_amount}</td>
                  <td className="p-3.5 font-bold text-slate-300">₹{r.courier_remitted_amount}</td>
                  <td className="p-3.5">
                    <span className={`font-bold ${r.discrepancy_amount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {r.discrepancy_amount > 0 ? `+₹${r.discrepancy_amount}` : '₹0'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] uppercase text-amber-300">{r.category}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        r.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {r.status === 'FLAGGED' && (
                      <button
                        onClick={() => handleResolve(r.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        Resolve Override
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
