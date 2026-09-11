import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, Truck, CalendarCheck, MapPin, 
  AlertTriangle, RotateCcw, Scale, Wallet, FileText, Globe, 
  BarChart3, Code2, Users, Settings, ChevronDown,
  Menu, X, Building2, PlusCircle, Upload, ShieldCheck, Search, Activity, Calculator,
  Palette
} from 'lucide-react';
import { usePlatformStore } from '../../services/store';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../ui/Button';
import { CommandPalette } from '../ui/CommandPalette';
import { PageLoadingFallback } from '../ui/PageLoadingFallback';

import { ShipFasterLogo } from '../ui/ShipFasterLogo';

export const SellerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    walletBalance, 
    warehouses, 
    ndrCases, 
    weightDiscrepancies, 
    loadSupabaseData, 
    initRealtimeSubscription, 
    realtimeStatus,
    currentSeller 
  } = usePlatformStore();
  const { user, switchDemoRole } = useAuth();

  const mainRef = useRef<HTMLElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeWarehouseId, setActiveWarehouseId] = useState(warehouses[0]?.id || '');
  const [ordersOpen, setOrdersOpen] = useState(location.pathname.startsWith('/app/orders'));
  const [financeOpen, setFinanceOpen] = useState(location.pathname.startsWith('/app/finance') || location.pathname.startsWith('/app/wallet'));
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastMainScrollY = useRef(0);

  useEffect(() => {
    loadSupabaseData();
    const unsub = initRealtimeSubscription();
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (warehouses.length > 0 && !warehouses.some((warehouse) => warehouse.id === activeWarehouseId)) {
      setActiveWarehouseId(warehouses.find((warehouse) => warehouse.is_default)?.id || warehouses[0].id);
    }
  }, [activeWarehouseId, warehouses]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      setIsHeaderHidden(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleMainScroll = () => {
      const currentScrollY = mainEl.scrollTop;

      if (currentScrollY <= 50) {
        setIsHeaderHidden(false);
        lastMainScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastMainScrollY.current;

      // Upward scroll -> reveal header
      if (diff < -4) {
        setIsHeaderHidden(false);
        lastMainScrollY.current = currentScrollY;
      }
      // Downward scroll -> hide header
      else if (diff > 8) {
        setIsHeaderHidden(true);
        lastMainScrollY.current = currentScrollY;
      }
    };

    mainEl.addEventListener('scroll', handleMainScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleMainScroll);
  }, []);

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
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-extrabold text-lg text-slate-900 font-display">ShipSwift AI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden" 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 h-screen shrink-0 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 shadow-xs
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="hidden md:flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <Link to="/app/dashboard" className="flex items-center gap-2.5">
            <ShipFasterLogo size="md" variant="dark" />
          </Link>
        </div>

        {/* Warehouse Selector */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Active Warehouse
          </label>
          <div className="relative">
            <select
              value={activeWarehouseId}
              onChange={(e) => setActiveWarehouseId(e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              {warehouses.length === 0 && <option value="">No warehouse configured</option>}
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 text-sm font-semibold">
          {/* Home */}
          <Link
            to="/app/home"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/home') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </Link>

          {/* Analytics Dashboard */}
          <Link
            to="/app/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/dashboard') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {/* Orders Parent */}
          <div>
            <button
              onClick={() => setOrdersOpen(!ordersOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ordersOpen ? 'rotate-180' : ''}`} />
            </button>
            {ordersOpen && (
              <div className="ml-7 my-1 space-y-1 border-l border-slate-200 pl-3">
                <Link
                  to="/app/orders"
                  className={`block py-1.5 text-xs transition-colors ${isActive('/app/orders') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All Orders
                </Link>
                <Link
                  to="/app/orders/new"
                  className={`flex items-center gap-1.5 py-1.5 text-xs transition-colors ${isActive('/app/orders/new') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Create Order</span>
                </Link>
                <Link
                  to="/app/orders/import"
                  className={`flex items-center gap-1.5 py-1.5 text-xs transition-colors ${isActive('/app/orders/import') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Import Orders (CSV)</span>
                </Link>
              </div>
            )}
          </div>

          {/* Shipments */}
          <Link
            to="/app/shipments"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/shipments') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Shipments</span>
          </Link>

          {/* Pickups */}
          <Link
            to="/app/pickups"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/pickups') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Pickups</span>
          </Link>

          {/* Tracking */}
          <Link
            to="/app/tracking"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/tracking') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Tracking</span>
          </Link>

          {/* Branded Tracking Customizer */}
          <Link
            to="/app/tracking/customizer"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/tracking/customizer') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <div className="flex items-center justify-between flex-1">
              <span>Branded Tracking</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">New</span>
            </div>
          </Link>

          {/* NDR */}
          <Link
            to="/app/ndr"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/ndr') ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>NDR Action</span>
            </div>
            {ndrCases.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-100 text-rose-700 rounded-full">{ndrCases.length}</span>
            )}
          </Link>

          {/* Returns */}
          <Link
            to="/app/returns"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/returns') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Returns &amp; Exchanges</span>
          </Link>

          {/* Weight Disputes */}
          <Link
            to="/app/weight-disputes"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/weight-disputes') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4" />
              <span>Weight Disputes</span>
            </div>
            {weightDiscrepancies.filter(w => w.status === 'PENDING').length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-100 text-amber-800 rounded-full">
                {weightDiscrepancies.filter(w => w.status === 'PENDING').length}
              </span>
            )}
          </Link>

          {/* Rate Calculator */}
          <Link
            to="/app/rate-calculator"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/rate-calculator') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Rate Calculator</span>
          </Link>

          {/* Finance Parent */}
          <div>
            <button
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4" />
                <span>Finance</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${financeOpen ? 'rotate-180' : ''}`} />
            </button>
            {financeOpen && (
              <div className="ml-7 my-1 space-y-1 border-l border-slate-200 pl-3">
                <Link
                  to="/app/wallet"
                  className={`block py-1.5 text-xs transition-colors ${isActive('/app/wallet') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Wallet &amp; Ledger
                </Link>
                <Link
                  to="/app/cod"
                  className={`block py-1.5 text-xs transition-colors ${isActive('/app/cod') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  COD Remittances
                </Link>
                <Link
                  to="/app/billing"
                  className={`block py-1.5 text-xs transition-colors ${isActive('/app/billing') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Invoices &amp; Billing
                </Link>
              </div>
            )}
          </div>

          <div className="pt-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3">
            Integrations &amp; Admin
          </div>

          {/* Integrations */}
          <Link
            to="/app/integrations"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/integrations') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Shopify / Woo</span>
          </Link>

          {/* Reports */}
          <Link
            to="/app/reports"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/reports') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports Center</span>
          </Link>

          {/* Developers */}
          <Link
            to="/app/developers"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/developers') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Developer API</span>
          </Link>

          {/* Team Management */}
          <Link
            to="/app/team"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/team') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team &amp; RBAC</span>
          </Link>

          {/* Settings */}
          <Link
            to="/app/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive('/app/settings') ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Footer User & Role Switcher */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                {user?.name.slice(0, 2).toUpperCase() || 'SE'}
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-bold text-slate-900 truncate">{user?.name}</span>
                <span className="block text-[10px] text-slate-500 font-semibold truncate">{user?.role}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                switchDemoRole('ADMIN');
                navigate('/admin');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Switch to Platform Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Desktop Fixed Top Header Navbar — Smart Auto-Hide on Scroll */}
        <motion.header 
          variants={{
            visible: { y: '0%', opacity: 1 },
            hidden: { y: '-100%', opacity: 0 }
          }}
          animate={isHeaderHidden ? 'hidden' : 'visible'}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex items-center justify-between px-6 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs shrink-0 z-30 will-change-transform"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <h1 className="text-base font-black text-slate-900 font-display tracking-tight">
              {isActive('/app/home') && 'Seller Home'}
              {isActive('/app/dashboard') && 'Seller Analytics Dashboard'}
              {isActive('/app/orders') && 'Orders Management'}
              {isActive('/app/orders/new') && 'Create New Order'}
              {isActive('/app/orders/import') && 'Bulk Import Orders'}
              {isActive('/app/shipments') && 'Shipments & AWB Labels'}
              {isActive('/app/pickups') && 'Pickup Management'}
              {isActive('/app/tracking') && 'Realtime Shipment Tracking'}
              {isActive('/app/ndr') && 'NDR Resolution Hub'}
              {isActive('/app/returns') && 'Reverse Logistics & Returns'}
              {isActive('/app/weight-disputes') && 'Weight Disputes Inbox'}
              {isActive('/app/rate-calculator') && 'Shipping Rate Calculator'}
              {isActive('/app/wallet') && 'Wallet & Financial Ledger'}
              {isActive('/app/cod') && 'COD Remittances & Settlements'}
              {isActive('/app/billing') && 'Invoices & Rate Cards'}
              {isActive('/app/integrations') && 'E-Commerce Integrations'}
              {isActive('/app/reports') && 'Analytics & Operational Reports'}
              {isActive('/app/developers') && 'Developer Portal & Webhooks'}
              {isActive('/app/team') && 'Team Management & RBAC'}
              {isActive('/app/settings') && 'Account & Warehouse Settings'}
            </h1>
            {currentSeller && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentSeller.brand_name || currentSeller.company_name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCmdKOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search...</span>
              <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Live Supabase Realtime Indicator Pill */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
              realtimeStatus === 'CONNECTED'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${realtimeStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{realtimeStatus === 'CONNECTED' ? 'Realtime DB Live' : 'Connecting Realtime...'}</span>
            </div>

            <Link to="/app/wallet" className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all shadow-xs">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Wallet Balance</span>
                <span className="block text-xs font-black text-emerald-700 font-display">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Link>

            <Link to="/app/orders/new">
              <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />} className="font-bold">
                New Order
              </Button>
            </Link>
          </div>
        </motion.header>

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
