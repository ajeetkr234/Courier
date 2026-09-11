import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  ShieldCheck, Users, Truck, DollarSign, FileCheck, 
  Activity, ArrowLeft, Scale, BarChart3, Search, Menu, X,
  AlertTriangle, Landmark, ShieldAlert, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { usePlatformStore } from '../../services/store';
import { CommandPalette } from '../ui/CommandPalette';
import { PageLoadingFallback } from '../ui/PageLoadingFallback';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, switchDemoRole } = useAuth();
  const { ndrEscalations, weightDiscrepancies, orders, loadSupabaseData } = usePlatformStore();

  const mainRef = useRef<HTMLElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  const openEscalationsCount = ndrEscalations.filter(e => e.carrier_escalation_status === 'OPEN').length;
  const disputedWeightCount = weightDiscrepancies.filter(w => w.status === 'DISPUTED').length;

  useEffect(() => {
    loadSupabaseData(true);
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-300">
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-extrabold text-base text-white font-display">Control Tower</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            Admin Mode
          </span>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-30 md:hidden" 
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 h-screen shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg text-white font-display">Control Tower</span>
              <span className="block text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Platform Super Admin</span>
            </div>
          </div>
        </div>

        <nav onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) {
            setIsSidebarOpen(false);
          }
        }} className="flex-1 p-4 space-y-1 text-xs font-semibold overflow-y-auto">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Platform Overview</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/orders') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Live Seller Orders</span>
            </div>
            {orders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                {orders.length}
              </span>
            )}
          </Link>

          <Link
            to="/admin/sellers"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/sellers') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sellers &amp; KYC Approval</span>
          </Link>

          {/* NDR Escalations Queue */}
          <Link
            to="/admin/ndr-escalations"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/ndr-escalations') ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Fake NDR Escalations</span>
            </div>
            {openEscalationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] animate-pulse">
                {openEscalationsCount}
              </span>
            )}
          </Link>

          {/* Weight Dispute Arbitration Desk */}
          <Link
            to="/admin/weight-disputes"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/weight-disputes') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Weight Arbitration Desk</span>
            </div>
            {disputedWeightCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-black text-[9px]">
                {disputedWeightCount}
              </span>
            )}
          </Link>

          {/* COD Payouts & Settlements */}
          <Link
            to="/admin/cod-payouts"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/cod-payouts') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>COD Payouts &amp; Wires</span>
          </Link>

          <Link
            to="/admin/couriers"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/couriers') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Courier Health &amp; Adapters</span>
          </Link>

          <Link
            to="/admin/rates"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/rates') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Rate Cards &amp; Margins</span>
          </Link>

          <Link
            to="/admin/reconciliation"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/reconciliation') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Carrier Reconciliation</span>
          </Link>

          <Link
            to="/admin/reports"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/reports') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Reports</span>
          </Link>

          <Link
            to="/admin/audit"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive('/admin/audit') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Audit Trail Logs</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={() => {
              switchDemoRole('SELLER');
              navigate('/app/dashboard');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Seller App
          </button>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-950">
        {/* Desktop Fixed Top Header Navbar */}
        <header className="hidden md:flex px-6 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 items-center justify-between shadow-xs shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-base font-black text-white font-display tracking-tight">
              {isActive('/admin') && 'Platform Overview & Live Traffic'}
              {isActive('/admin/orders') && 'Live Seller Orders & Platform Traffic'}
              {isActive('/admin/sellers') && 'Seller Management & KYC Approvals'}
              {isActive('/admin/couriers') && 'Courier Adapters & Health Monitoring'}
              {isActive('/admin/rates') && 'Master Rate Cards Engine'}
              {isActive('/admin/reconciliation') && 'Financial Remittance & COD Reconciliation'}
              {isActive('/admin/reports') && 'Platform Performance Analytics'}
              {isActive('/admin/audit') && 'System Audit Trail'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCmdKOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 shadow-xs">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-extrabold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Courier APIs Operational</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-none">
          <Suspense fallback={<PageLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

