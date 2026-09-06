import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Upload, Truck, FileText, CheckSquare, X, ChevronRight, Eye,
  ChevronDown, RefreshCw, Download, AlertTriangle, CheckCircle2, ShieldAlert,
  ShoppingBag, ArrowRight, Smartphone, QrCode, Sparkles, Layers, Box
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { Order } from '../../types';
import { usePlatformStore } from '../../services/store';
import { RateComparisonModal } from '../shipments/RateComparisonModal';
import { toast } from 'sonner';

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = usePlatformStore();

  // Tab States
  const [activeTab, setActiveTab] = useState<'NEW' | 'READY_TO_SHIP' | 'PICKUPS' | 'IN_TRANSIT' | 'DELIVERED' | 'RTO' | 'ALL'>('NEW');
  const [activeSubTab, setActiveSubTab] = useState<'NEW' | 'ON_HOLD'>('NEW');
  const [domesticScope, setDomesticScope] = useState<'DOMESTIC' | 'INTERNATIONAL'>('DOMESTIC');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [rateModalOrder, setRateModalOrder] = useState<Order | null>(null);

  // App download popup dismiss state
  const [showAppBanner, setShowAppBanner] = useState(true);
  const [showKycBanner, setShowKycBanner] = useState(true);

  // Filter orders based on tabs & search
  const filteredOrders = orders.filter((ord) => {
    // Search match
    const matchesSearch = 
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.external_order_id && ord.external_order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ord.customer?.name && ord.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ord.customer?.phone && ord.customer.phone.includes(searchTerm)) ||
      (ord.shipping_address?.name && ord.shipping_address.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status Tab Match
    let matchesStatus = true;
    const statusStr = ord.current_status as string;
    if (activeTab === 'NEW') {
      if (activeSubTab === 'ON_HOLD') {
        matchesStatus = statusStr === 'ON_HOLD';
      } else {
        matchesStatus = statusStr === 'NEW' || statusStr === 'CONFIRMED';
      }
    } else if (activeTab === 'READY_TO_SHIP') {
      matchesStatus = statusStr === 'READY_TO_SHIP';
    } else if (activeTab === 'PICKUPS') {
      matchesStatus = statusStr === 'PICKUP_SCHEDULED' || statusStr === 'PICKED_UP';
    } else if (activeTab === 'IN_TRANSIT') {
      matchesStatus = statusStr === 'IN_TRANSIT' || statusStr === 'OUT_FOR_DELIVERY';
    } else if (activeTab === 'DELIVERED') {
      matchesStatus = ord.current_status === 'DELIVERED';
    } else if (activeTab === 'RTO') {
      matchesStatus = ord.current_status === 'RTO' || ord.current_status === 'NDR';
    } else if (activeTab === 'ALL') {
      matchesStatus = true;
    }

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full space-y-4 pb-16 text-slate-900 font-sans">
      {/* Top Banner: Mandatory KYC Verification */}
      {showKycBanner && (
        <div className="p-3.5 px-5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-between text-xs text-rose-950 font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong className="font-extrabold text-rose-700">Please note:</strong> KYC verification is mandatory for shipping your orders. Complete your KYC to start shipping orders seamlessly.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toast.info('Redirecting to KYC verification...');
                navigate('/app/settings');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Proceed To Verify KYC</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowKycBanner(false)} className="text-slate-400 hover:text-slate-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Title & Domestic Dropdown */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
            Orders
          </h1>
          <div className="relative">
            <select
              value={domesticScope}
              onChange={(e) => setDomesticScope(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 pr-8 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="DOMESTIC">Domestic</option>
              <option value="INTERNATIONAL">International</option>
            </select>
          </div>
        </div>

        {/* Global Order Search Bar */}
        <div className="flex-1 w-full mx-0 lg:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for AWB, Order ID, Buyer Mobile Number, Email, SKU, Pickup ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/app/orders/new">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Order
            </Button>
          </Link>

          <Link to="/app/integrations">
            <Button
              size="sm"
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2 rounded-xl"
            >
              Connect Channel
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Status Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto text-xs font-extrabold scrollbar-none px-4 pt-2">
          {[
            { id: 'NEW', label: 'New' },
            { id: 'READY_TO_SHIP', label: 'Ready To Ship' },
            { id: 'PICKUPS', label: 'Pickups & Manifests' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'RTO', label: 'RTO' },
            { id: 'ALL', label: 'All' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-pills (When 'New' tab is active) */}
        {activeTab === 'NEW' && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setActiveSubTab('NEW')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'NEW'
                  ? 'bg-indigo-100 text-indigo-800 font-extrabold border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveSubTab('ON_HOLD')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'ON_HOLD'
                  ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              On Hold
            </button>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="7">📅 Last 7 days</option>
              <option value="30">📅 Last 30 days</option>
              <option value="90">📅 Last 90 days</option>
              <option value="ALL">📅 Lifetime</option>
            </select>

            {/* More Filters Button */}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>More Filters</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {filteredOrders.length} Orders for Last {dateRange} days
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                onClick={() => toast.info('Exporting orders CSV data...')}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Export Orders"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => toast.success('Orders refreshed!')}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Select Bulk Action Dropdown */}
              <select
                disabled={selectedOrderIds.length === 0}
                onChange={(e) => {
                  if (e.target.value) {
                    toast.info(`Executing bulk action "${e.target.value}" on ${selectedOrderIds.length} orders...`);
                    e.target.value = '';
                  }
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <option value="">Select Bulk Action</option>
                <option value="SHIP">Bulk Create Shipments</option>
                <option value="CANCEL">Cancel Orders</option>
                <option value="MANIFEST">Generate Manifest</option>
                <option value="PRINT_LABEL">Print Shipping Labels</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Orders Banner */}
        {selectedOrderIds.length > 0 && (
          <div className="p-3 px-6 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900">
            <span>{selectedOrderIds.length} orders selected</span>
            <button onClick={() => setSelectedOrderIds([])} className="text-xs text-indigo-700 underline font-extrabold">
              Clear Selection
            </button>
          </div>
        )}

        {/* Orders Table or Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
            {/* Empty State Vector Graphic Illustration */}
            <div className="relative w-40 h-36 flex items-center justify-center">
              <div className="w-32 h-24 bg-indigo-100 rounded-2xl border-2 border-indigo-200 shadow-sm flex items-center justify-center relative overflow-hidden">
                <FileText className="w-12 h-12 text-indigo-500 opacity-80" />
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                  ✓
                </div>
              </div>
              <div className="absolute -bottom-2 right-2">
                <svg viewBox="0 0 60 80" className="w-16 h-20 text-slate-800">
                  <circle cx="30" cy="18" r="12" fill="#334155" />
                  <path d="M10 70 C10 40 50 40 50 70 Z" fill="#475569" />
                  <rect x="24" y="32" width="12" height="20" fill="#F8FAFC" rx="2" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-display">
                Add your first order to get started
              </h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                Create a manual single order or sync orders automatically from Shopify, WooCommerce, or Amazon.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link to="/app/orders/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/20">
                  Add order
                </Button>
              </Link>
              <Link to="/app/integrations">
                <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-2.5 rounded-xl">
                  Sync Website Orders
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wider text-slate-600 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Package Details</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Pickup Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(ord.id)}
                        onChange={() => handleToggleSelect(ord.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Order Details */}
                    <td className="p-4">
                      <span className="font-mono font-black text-indigo-700 block text-xs">
                        #{ord.external_order_id || ord.id}
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold block">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {ord.source}
                      </span>
                    </td>

                    {/* Customer Details */}
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">
                        {ord.customer?.name || ord.shipping_address.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 block">
                        {ord.customer?.phone || ord.shipping_address.phone}
                      </span>
                      <span className="text-[10px] text-slate-600 truncate block max-w-[140px]">
                        {ord.shipping_address.city}, {ord.shipping_address.state} - {ord.shipping_address.pincode}
                      </span>
                    </td>

                    {/* Product Details */}
                    <td className="p-4">
                      {ord.items && ord.items.length > 0 ? (
                        <div>
                          <span className="font-extrabold text-slate-800 block text-xs truncate max-w-[160px]">
                            {ord.items[0].name}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono block">
                            SKU: {ord.items[0].sku} (Qty: {ord.items[0].quantity})
                          </span>
                          {ord.items.length > 1 && (
                            <span className="text-[10px] text-indigo-600 font-bold">
                              +{ord.items.length - 1} more items
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">1 Standard Parcel</span>
                      )}
                    </td>

                    {/* Package Details */}
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">
                        {ord.weight_kg} kg
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono block">
                        {ord.length_cm || 15}x{ord.width_cm || 10}x{ord.height_cm || 10} cm
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="p-4">
                      <span className="font-black text-slate-900 font-mono block">
                        ₹{ord.total_amount.toLocaleString('en-IN')}
                      </span>
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        ord.payment_type === 'COD' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {ord.payment_type}
                      </span>
                    </td>

                    {/* Pickup Address */}
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        Home Warehouse
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 block">
                        PIN: 462028
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={ord.current_status} />
                    </td>

                    {/* Action */}
                    <td className="p-4 text-center">
                      {ord.current_status === 'NEW' || ord.current_status === 'CONFIRMED' ? (
                        <Button
                          size="sm"
                          onClick={() => setRateModalOrder(ord)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
                        >
                          Ship Now
                        </Button>
                      ) : (
                        <Link to={`/app/orders/${ord.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs px-3 py-1.5 rounded-xl"
                          >
                            View
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination Row */}
        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 shadow-xs cursor-pointer">
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center gap-4 font-bold">
            <button className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition disabled:opacity-40 cursor-pointer" disabled>
              ‹ PREV
            </button>
            <span className="text-slate-800 font-mono">1</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition disabled:opacity-40 cursor-pointer" disabled>
              NEXT ›
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom-Right Get App Banner Widget */}
      {showAppBanner && (
        <div className="fixed bottom-4 right-4 z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-72 space-y-3 animate-slideUp">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-900 font-display">
              Get the ShipSwift App
            </span>
            <button onClick={() => setShowAppBanner(false)} className="text-slate-400 hover:text-slate-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Scan to track shipments and get live courier updates on the go.
            </div>
          </div>

          <button
            onClick={() => toast.info('Download link sent to your phone!')}
            className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition"
          >
            Install now
          </button>
        </div>
      )}

      {/* Courier Rate Modal */}
      {rateModalOrder && (
        <RateComparisonModal
          order={rateModalOrder}
          isOpen={!!rateModalOrder}
          onClose={() => setRateModalOrder(null)}
          onShipmentCreated={() => setRateModalOrder(null)}
        />
      )}
    </div>
  );
};
