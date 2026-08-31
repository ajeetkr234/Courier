import React from 'react';
import { 
  Users, Truck, DollarSign, Activity, AlertTriangle, ShieldCheck, TrendingUp, Wallet, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { usePlatformStore } from '../../services/store';

export const AdminDashboardPage: React.FC = () => {
  const { sellers, orders, shipments, couriers, codRemittances, reconciliations } = usePlatformStore();

  const pendingKYC = sellers.filter((s) => s.status === 'KYC_PENDING').length;
  const activeSellers = sellers.filter((s) => s.status === 'ACTIVE').length;
  const totalFreightValue = shipments.reduce((acc, s) => acc + (s.shipping_cost || 68), 0);
  const totalCODCollected = codRemittances.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Alert */}
      {pendingKYC > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-amber-200">KYC Verification Queue Pending</h4>
              <p className="text-xs text-amber-300/80">{pendingKYC} seller accounts awaiting document approval.</p>
            </div>
          </div>
          <a href="/admin/sellers" className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition">
            Review Sellers
          </a>
        </div>
      )}

      {/* Platform Level Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Active Sellers" value={`${activeSellers} / ${sellers.length}`} subtitle={`${pendingKYC} pending KYC review`} icon={<Users className="w-5 h-5 text-indigo-400" />} />
        <StatCard title="Gross Shipping GMV" value={`₹${(totalFreightValue * 15).toLocaleString('en-IN')}`} subtitle="Platform Shipping Spend" icon={<DollarSign className="w-5 h-5 text-emerald-400" />} variant="emerald" />
        <StatCard title="Total Shipments" value={shipments.length.toString()} subtitle="Across active carrier adapters" icon={<Truck className="w-5 h-5 text-cyan-400" />} />
        <StatCard title="Platform Net Margin" value="18.5%" subtitle="Average freight markup" icon={<TrendingUp className="w-5 h-5 text-indigo-400" />} variant="indigo" />
      </div>

      {/* Operational Courier API Health */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" /> Courier Carrier Adapter Health &amp; Latency
          </h3>
          <span className="text-xs text-emerald-400 font-mono font-bold">100% Uptime</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {couriers.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{c.name}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${c.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              </div>
              <p className="text-xs text-slate-400">
                Latency: <strong className="text-slate-200">{c.avg_latency_ms || 180}ms</strong> • Status: <strong className="text-emerald-400">{c.is_active ? 'HEALTHY' : 'DISABLED'}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Wallet className="h-4 w-4 text-indigo-400" /> COD Remittance &amp; Receivables
          </h3>
          <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
            <span className="text-slate-400">Total COD Collected:</span>
            <strong className="text-emerald-400 font-mono text-base">₹{totalCODCollected.toLocaleString('en-IN')}</strong>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
            <span className="text-slate-400">Reconciliation Mismatches Flagged:</span>
            <strong className="text-amber-400 font-mono text-base">{reconciliations.filter(r => r.status === 'FLAGGED').length} Records</strong>
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" /> System Audit &amp; Compliance Logs
          </h3>
          <p className="text-xs text-slate-400">
            Immutable tracking enabled for KYC approvals, rate card overrides, wallet manual adjustments, and seller suspensions.
          </p>
          <div className="pt-2">
            <a href="/admin/audit" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline">
              View Audit Trail Logs →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

