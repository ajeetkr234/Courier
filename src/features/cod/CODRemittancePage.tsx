import React from 'react';
import { DollarSign, Landmark, CheckCircle2, Clock, FileText } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';

export const CODRemittancePage: React.FC = () => {
  const remittances = [
    { id: 'rem-8819', ref: 'UTIB00012399281', date: '2026-02-20', amount: 34500.00, status: 'SETTLED', count: 18 },
    { id: 'rem-8820', ref: 'UTIB00012399282', date: '2026-02-24', amount: 28900.00, status: 'PENDING', count: 14 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">COD Remittances &amp; Settlements</h2>
        <p className="text-xs text-slate-500 font-medium">Track Cash On Delivery collections from courier partners and bank transfers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="COD Pending" value="₹42,850.00" subtitle="Delivered orders pending payout" variant="amber" />
        <StatCard title="COD Settled This Month" value="₹1,84,500.00" subtitle="Transferred to HDFC bank" variant="emerald" />
        <StatCard title="Remittance Cycle" value="T + 2 Days" subtitle="Early COD settlement active" variant="indigo" />
        <StatCard title="Active Bank Account" value="HDFC Bank (9182)" subtitle="Primary verified account" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Remittance Batches</h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Remittance Ref</th>
                <th className="p-3.5">Bank UTR Reference</th>
                <th className="p-3.5">Shipments Count</th>
                <th className="p-3.5">Settlement Date</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {remittances.map((rem) => (
                <tr key={rem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{rem.id}</td>
                  <td className="p-3.5 font-mono text-slate-600">{rem.ref}</td>
                  <td className="p-3.5 font-bold text-slate-800">{rem.count} AWBs</td>
                  <td className="p-3.5 text-slate-600">{rem.date}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-700 font-mono">₹{rem.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3.5"><StatusBadge status={rem.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
