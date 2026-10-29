import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Truck, DollarSign, Activity, AlertTriangle, ShieldCheck, TrendingUp, 
  Wallet, CheckCircle2, ShieldAlert, ShoppingBag, Search, Filter, Eye, Clock, 
  Sparkles, Building2, Package, X, ArrowUpRight, Phone, MapPin, Check, RefreshCw
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { usePlatformStore } from '../../services/store';
import { Order, OrderStatus, Seller } from '../../types';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const { 
    sellers, 
    orders, 
    shipments, 
    couriers, 
    codRemittances, 
    reconciliations,
    loadSupabaseData,
    lastOrderNotification,
    clearLastOrderNotification,
    updateOrderStatus,
    isLoadingData
  } = usePlatformStore();

  const [selectedSellerFilter, setSelectedSellerFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    // Force loading platform-wide orders for all sellers
    loadSupabaseData(true);
  }, []);

  // Compute platform metrics
  const pendingKYC = sellers.filter((s) => s.status === 'KYC_PENDING').length;
  const activeSellers = sellers.filter((s) => s.status === 'ACTIVE').length;
  const totalFreightValue = shipments.reduce((acc, s) => acc + (s.shipping_cost || 68), 0);
  const totalCODCollected = codRemittances.reduce((acc, c) => acc + c.amount, 0);

  // Orders metrics
  const totalOrdersCount = orders.length;
  const newOrdersToday = orders.filter((o) => {
    const today = new Date().toDateString();
    return new Date(o.created_at).toDateString() === today;
  }).length;
  const totalOrderGMV = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const codOrdersCount = orders.filter((o) => o.payment_type === 'COD').length;
  const prepaidOrdersCount = orders.filter((o) => o.payment_type === 'PREPAID').length;

  // Filter orders
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      // Seller match
      if (selectedSellerFilter !== 'ALL' && order.seller_id !== selectedSellerFilter) {
        return false;
      }
      // Status match
      if (selectedStatusFilter !== 'ALL' && order.current_status !== selectedStatusFilter) {
        return false;
      }
      // Search match
      if (!term) return true;
      const seller = sellers.find((s) => s.id === order.seller_id);
      const sellerName = (seller?.brand_name || seller?.company_name || '').toLowerCase();
      const orderId = order.id.toLowerCase();
      const extId = (order.external_order_id || '').toLowerCase();
      const customerName = (order.shipping_address?.name || order.customer?.name || '').toLowerCase();
      const phone = (order.shipping_address?.phone || '').toLowerCase();
      const city = (order.shipping_address?.city || '').toLowerCase();
      const pincode = (order.shipping_address?.pincode || '').toLowerCase();

      return (
        orderId.includes(term) ||
        extId.includes(term) ||
        sellerName.includes(term) ||
        customerName.includes(term) ||
        phone.includes(term) ||
        city.includes(term) ||
        pincode.includes(term)
      );
    });
  }, [orders, selectedSellerFilter, selectedStatusFilter, searchTerm, sellers]);

  // Helper to format relative time
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const isOrderRecent = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      return diffMs < 1000 * 60 * 30; // 30 minutes
    } catch {
      return false;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      if (inspectedOrder && inspectedOrder.id === orderId) {
        setInspectedOrder({ ...inspectedOrder, current_status: newStatus });
      }
    } catch (err: any) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Real-time Toast/Alert for New Seller Order */}
      {lastOrderNotification && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-indigo-900/60 to-purple-950/80 border border-indigo-500/50 shadow-xl shadow-indigo-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-short">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black border border-emerald-500/30">
                  REALTIME ORDER EVENT
                </span>
                <span className="text-xs text-slate-400 font-medium">{getRelativeTime(new Date(lastOrderNotification.timestamp).toISOString())}</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                New Order <span className="font-mono text-indigo-300">#{lastOrderNotification.order.external_order_id || lastOrderNotification.order.id}</span> created by seller{' '}
                <strong className="text-amber-300 font-extrabold">{lastOrderNotification.sellerName}</strong> for ₹{Number(lastOrderNotification.order.total_amount || 0).toLocaleString('en-IN')} ({lastOrderNotification.order.payment_type})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInspectedOrder(lastOrderNotification.order)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Inspect Order
            </button>
            <button
              onClick={() => clearLastOrderNotification()}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Alert for KYC */}
      {pendingKYC > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-amber-200">KYC Verification Queue Pending</h4>
              <p className="text-xs text-amber-300/80">{pendingKYC} seller accounts awaiting document approval.</p>
            </div>
          </div>
          <a href="/admin/sellers" className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition">
            Review Sellers
          </a>
        </div>
      )}

      {/* Platform Level Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Active Sellers" 
          value={`${activeSellers} / ${sellers.length}`} 
          subtitle={`${pendingKYC} pending KYC review`} 
          icon={<Users className="w-5 h-5 text-indigo-400" />} 
        />
        <StatCard 
          title="Total Platform Orders" 
          value={totalOrdersCount.toLocaleString('en-IN')} 
          subtitle={`${newOrdersToday} new today across all sellers`} 
          icon={<ShoppingBag className="w-5 h-5 text-emerald-400" />} 
          variant="emerald" 
        />
        <StatCard 
          title="Gross Order GMV" 
          value={`₹${totalOrderGMV.toLocaleString('en-IN')}`} 
          subtitle={`${codOrdersCount} COD · ${prepaidOrdersCount} Prepaid`} 
          icon={<DollarSign className="w-5 h-5 text-cyan-400" />} 
        />
        <StatCard 
          title="Platform Net Margin" 
          value="18.5%" 
          subtitle="Average freight markup" 
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />} 
          variant="indigo" 
        />
      </div>

      {/* LIVE PLATFORM ORDERS & REAL-TIME SELLER ACTIVITY MONITOR */}
      <section className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl">
        {/* Section Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-base font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-400" /> Platform Orders &amp; Live Seller Activity
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                LIVE DB FEED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitor tracking every order created across all registered sellers on the platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadSupabaseData(true)}
              disabled={isLoadingData}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-indigo-400' : ''}`} />}
            >
              Refresh Feed
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 px-6 bg-slate-950/60 border-b border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Seller Name, Buyer, City, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Seller */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedSellerFilter}
                onChange={(e) => setSelectedSellerFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Sellers (Platform-wide)</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.brand_name || s.company_name} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
                <option value="NEW" className="bg-slate-900 text-white">New Orders</option>
                <option value="CONFIRMED" className="bg-slate-900 text-white">Confirmed</option>
                <option value="READY_TO_SHIP" className="bg-slate-900 text-white">Ready to Ship</option>
                <option value="IN_TRANSIT" className="bg-slate-900 text-white">In Transit</option>
                <option value="DELIVERED" className="bg-slate-900 text-white">Delivered</option>
                <option value="NDR" className="bg-slate-900 text-white">NDR Exception</option>
                <option value="RTO" className="bg-slate-900 text-white">RTO</option>
                <option value="CANCELLED" className="bg-slate-900 text-white">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800 text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Seller Account</th>
                <th className="p-3.5">Buyer &amp; City</th>
                <th className="p-3.5">Weight &amp; Items</th>
                <th className="p-3.5">Order Value</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Created</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-400">No orders match the current filter</p>
                    <p className="text-[11px] text-slate-600">When any seller creates an order, it appears here immediately.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 15).map((ord) => {
                  const seller = sellers.find((s) => s.id === ord.seller_id);
                  const isRecent = isOrderRecent(ord.created_at);

                  return (
                    <tr key={ord.id} className={`hover:bg-slate-800/50 transition-colors ${isRecent ? 'bg-indigo-950/20' : ''}`}>
                      {/* Order Ref */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white text-xs">
                            {ord.external_order_id || ord.id}
                          </span>
                          {isRecent && (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">{ord.id}</span>
                      </td>

                      {/* Seller Account Badge */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-xs shrink-0">
                            {(seller?.brand_name || seller?.company_name || 'SE').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block truncate max-w-[140px]">
                              {seller?.brand_name || seller?.company_name || 'Seller Account'}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-semibold block">
                              {seller?.status || 'ACTIVE'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Buyer & City */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-200 block truncate max-w-[130px]">
                          {ord.shipping_address?.name || ord.customer?.name || 'Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-slate-500" />
                          {ord.shipping_address?.city || 'NA'} ({ord.shipping_address?.pincode || 'NA'})
                        </span>
                      </td>

                      {/* Weight & Items */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-300 block">{ord.weight_kg} kg</span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {(ord.items || []).length || 1} item{((ord.items || []).length || 1) > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Order Value & Mode */}
                      <td className="p-3.5">
                        <span className="font-mono font-black text-emerald-400 text-sm block">
                          ₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          ord.payment_type === 'COD' ? 'text-amber-400' : 'text-indigo-400'
                        }`}>
                          {ord.payment_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge status={ord.current_status} />
                      </td>

                      {/* Created Relative */}
                      <td className="p-3.5 font-sans">
                        <span className="text-slate-300 font-semibold block">{getRelativeTime(ord.created_at)}</span>
                        <span className="text-[10px] text-slate-500">{new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInspectedOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 15 && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
            Showing top 15 of {filteredOrders.length} matching orders.
          </div>
        )}
      </section>

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

      {/* SUPER ADMIN ORDER DETAILS INSPECTOR MODAL */}
      {inspectedOrder && (
        <Modal
          isOpen={!!inspectedOrder}
          onClose={() => setInspectedOrder(null)}
          title={`Order Inspection • #${inspectedOrder.external_order_id || inspectedOrder.id}`}
          subtitle={`Created on ${new Date(inspectedOrder.created_at).toLocaleString('en-IN')}`}
        >
          <div className="space-y-5 text-slate-200 text-xs">
            {/* Seller Info Card */}
            {(() => {
              const seller = sellers.find((s) => s.id === inspectedOrder.seller_id);
              return (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Seller Account</span>
                      <strong className="text-sm text-white font-bold">{seller?.company_name || 'Seller Account'}</strong>
                      {seller?.brand_name && (
                        <span className="text-indigo-400 font-semibold block text-xs">Brand: {seller.brand_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Seller Status</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                      {seller?.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Customer & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buyer Details</span>
                <p className="font-bold text-white text-sm">{inspectedOrder.shipping_address?.name || inspectedOrder.customer?.name || 'Customer'}</p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {inspectedOrder.shipping_address?.phone || inspectedOrder.customer?.phone || 'No phone'}
                </p>
                {inspectedOrder.customer?.email && (
                  <p className="text-slate-400">{inspectedOrder.customer.email}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Destination</span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {inspectedOrder.shipping_address?.address_line1}
                </p>
                <p className="font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {inspectedOrder.shipping_address?.city}, {inspectedOrder.shipping_address?.state} - {inspectedOrder.shipping_address?.pincode}
                </p>
              </div>
            </div>

            {/* Parcel Specs & Value */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Chargeable Weight</span>
                <span className="text-sm font-bold text-white">{inspectedOrder.weight_kg} Kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Mode</span>
                <span className="text-sm font-bold text-amber-400">{inspectedOrder.payment_type}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Value</span>
                <span className="text-base font-black text-emerald-400 font-mono">₹{Number(inspectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Products Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Items List</span>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase font-bold text-slate-500 text-[10px]">
                    <tr>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {(inspectedOrder.items && inspectedOrder.items.length > 0) ? (
                      inspectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono text-indigo-300">{it.sku}</td>
                          <td className="p-2.5 text-white">{it.name}</td>
                          <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-200">₹{Number(it.unit_price).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-500">Standard Package Item</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Override / Admin Action */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Current Status:</span>
                <StatusBadge status={inspectedOrder.current_status} />
              </div>

              <div className="flex items-center gap-2">
                {inspectedOrder.current_status === 'NEW' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(inspectedOrder.id, 'CONFIRMED')}
                    disabled={isUpdatingStatus}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Confirm Order
                  </Button>
                )}
                {inspectedOrder.current_status !== 'CANCELLED' && inspectedOrder.current_status !== 'DELIVERED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(inspectedOrder.id, 'CANCELLED')}
                    disabled={isUpdatingStatus}
                    className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold"
                  >
                    Cancel Order
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInspectedOrder(null)}
                  className="bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
