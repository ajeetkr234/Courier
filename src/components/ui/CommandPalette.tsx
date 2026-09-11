import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingBag, Truck, AlertTriangle, Users, MapPin, 
  Wallet, ArrowRight, X, Command, Calculator, FileSpreadsheet, 
  RotateCcw, Scale, ShieldCheck, Settings, Database, Activity, 
  Layers, Palette, Home, Sparkles 
} from 'lucide-react';
import { usePlatformStore } from '../../services/store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { orders, shipments } = usePlatformStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      (o.external_order_id && o.external_order_id.toLowerCase().includes(query.toLowerCase())) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(query.toLowerCase())) ||
      o.shipping_address.city.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredShipments = shipments.filter(
    (s) =>
      s.awb_number.toLowerCase().includes(query.toLowerCase()) ||
      s.courier_name?.toLowerCase().includes(query.toLowerCase()) ||
      s.order_id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const pages = [
    // Seller Hub
    { title: 'Seller Home & Quick Launch', path: '/app/home', category: 'Seller', icon: <Home className="w-4 h-4 text-indigo-400" /> },
    { title: 'Analytics Dashboard', path: '/app/dashboard', category: 'Seller', icon: <Activity className="w-4 h-4 text-sky-400" /> },
    { title: 'All Orders Log', path: '/app/orders', category: 'Seller', icon: <ShoppingBag className="w-4 h-4 text-emerald-400" /> },
    { title: 'Create Single Order', path: '/app/orders/new', category: 'Seller', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { title: 'Bulk Import CSV Orders', path: '/app/orders/import', category: 'Seller', icon: <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> },
    { title: 'Shipments, Labels & Manifests', path: '/app/shipments', category: 'Seller', icon: <Truck className="w-4 h-4 text-blue-400" /> },
    { title: 'Live AWB Tracking', path: '/app/tracking', category: 'Seller', icon: <MapPin className="w-4 h-4 text-emerald-400" /> },
    { title: 'Branded Tracking Page Customizer', path: '/app/tracking/customizer', category: 'Seller', icon: <Palette className="w-4 h-4 text-purple-400" /> },
    { title: 'Shipping Rate Calculator', path: '/app/rate-calculator', category: 'Seller', icon: <Calculator className="w-4 h-4 text-cyan-400" /> },
    { title: 'NDR Exception Resolution Hub', path: '/app/ndr', category: 'Seller', icon: <AlertTriangle className="w-4 h-4 text-rose-400" /> },
    { title: 'RTO Return Management', path: '/app/rto', category: 'Seller', icon: <RotateCcw className="w-4 h-4 text-orange-400" /> },
    { title: 'Customer Returns Hub', path: '/app/returns', category: 'Seller', icon: <Layers className="w-4 h-4 text-amber-400" /> },
    { title: 'Weight Discrepancy Disputes', path: '/app/weight-disputes', category: 'Seller', icon: <Scale className="w-4 h-4 text-yellow-400" /> },
    { title: 'Wallet & Passbook Ledger', path: '/app/wallet', category: 'Seller', icon: <Wallet className="w-4 h-4 text-emerald-400" /> },
    { title: 'COD Remittance & Payouts', path: '/app/cod', category: 'Seller', icon: <Wallet className="w-4 h-4 text-teal-400" /> },
    { title: 'Store Integrations (Shopify, Woo)', path: '/app/integrations', category: 'Seller', icon: <Database className="w-4 h-4 text-indigo-400" /> },
    { title: 'Developer APIs & Webhooks', path: '/app/developers', category: 'Seller', icon: <Command className="w-4 h-4 text-slate-400" /> },
    { title: 'Team & RBAC Roles', path: '/app/team', category: 'Seller', icon: <Users className="w-4 h-4 text-violet-400" /> },
    { title: 'Warehouse & Pickup Settings', path: '/app/settings', category: 'Seller', icon: <Settings className="w-4 h-4 text-slate-400" /> },
    // Super Admin Control Tower
    { title: 'Super Admin: Live Orders & Seller Activity Monitor', path: '/admin/orders', category: 'Super Admin', icon: <ShoppingBag className="w-4 h-4 text-emerald-400" /> },
    { title: 'Super Admin: Sellers Directory & KYC', path: '/admin/sellers', category: 'Super Admin', icon: <ShieldCheck className="w-4 h-4 text-indigo-400" /> },
    { title: 'Super Admin: Carrier Integrations Matrix', path: '/admin/couriers', category: 'Super Admin', icon: <Truck className="w-4 h-4 text-blue-400" /> },
    { title: 'Super Admin: Rate Cards & Margin Engine', path: '/admin/rates', category: 'Super Admin', icon: <Calculator className="w-4 h-4 text-cyan-400" /> },
    { title: 'Super Admin: Freight Reconciliation', path: '/admin/reconciliation', category: 'Super Admin', icon: <Activity className="w-4 h-4 text-amber-400" /> },
    { title: 'Super Admin: Platform Audit Trail', path: '/admin/audit', category: 'Super Admin', icon: <Database className="w-4 h-4 text-rose-400" /> },
  ].filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col divide-y divide-slate-800">
        {/* Search Header */}
        <div className="p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search orders, AWB numbers, customers, pages... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 text-sm focus:outline-none placeholder-slate-500 font-medium"
          />
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <span>ESC</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Nav Pages */}
          {pages.length > 0 && (
            <div>
              <span className="block px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Navigation Shortcut
              </span>
              <div className="space-y-1">
                {pages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => handleSelect(p.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent transition text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {p.icon}
                      <span className="font-semibold text-white">{p.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders Match */}
          {filteredOrders.length > 0 && (
            <div>
              <span className="block px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Matching Orders ({filteredOrders.length})
              </span>
              <div className="space-y-1">
                {filteredOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => handleSelect(`/app/orders?shipOrderId=${ord.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 border border-slate-800/60 transition text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400">{ord.external_order_id || ord.id}</span>
                      <span className="text-slate-400">• {ord.customer?.name || ord.shipping_address.name}</span>
                    </div>
                    <span className="font-bold text-emerald-400">₹{ord.total_amount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shipments Match */}
          {filteredShipments.length > 0 && (
            <div>
              <span className="block px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Matching AWBs ({filteredShipments.length})
              </span>
              <div className="space-y-1">
                {filteredShipments.map((shp) => (
                  <button
                    key={shp.id}
                    onClick={() => handleSelect(`/app/tracking?awb=${shp.awb_number}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 border border-slate-800/60 transition text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-mono font-bold text-white">{shp.awb_number}</span>
                      <span className="text-slate-400">({shp.courier_name})</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                      {shp.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pages.length === 0 && filteredOrders.length === 0 && filteredShipments.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching orders, AWBs, or pages found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <Command className="w-3 h-3 text-indigo-400" />
            <span>Navigation Command Palette</span>
          </div>
          <span>Use <strong>↑ ↓</strong> to navigate, <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
