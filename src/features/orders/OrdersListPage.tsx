import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Download, FileText, Filter, Plus, RefreshCw, Search, ShieldAlert, X, Truck, Zap, AlertCircle, Upload, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Order, OrderStatus } from '../../types';
import { usePlatformStore } from '../../services/store';
import { RateComparisonModal } from '../shipments/RateComparisonModal';

const statusTabs: Array<{ id: OrderStatus | 'PICKUPS' | 'ALL'; label: string }> = [
  { id: 'NEW', label: 'New' },
  { id: 'READY_TO_SHIP', label: 'Ready To Ship' },
  { id: 'PICKUPS', label: 'Pickups & Manifests' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'RTO', label: 'RTO' },
  { id: 'ALL', label: 'All' },
];

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as OrderStatus | 'PICKUPS' | 'ALL' | null;
  const shipOrderIdParam = searchParams.get('shipOrderId');

  const {
    orders,
    warehouses,
    couriers,
    currentSeller,
    walletBalance,
    isLoadingData,
    loadSupabaseData,
    subscribeOrders,
    updateOrderStatus,
    bulkAssignShipments,
  } = usePlatformStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'PICKUPS' | 'ALL'>(tabParam || 'NEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNow, setFilterNow] = useState(() => Date.now());
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [rateModalOrder, setRateModalOrder] = useState<Order | null>(null);
  const [showKycBanner, setShowKycBanner] = useState(true);

  // Bulk Carrier Assignment Modal State
  const [isBulkShipModalOpen, setIsBulkShipModalOpen] = useState(false);
  const [bulkStrategy, setBulkStrategy] = useState<'CHEAPEST' | 'FASTEST' | 'SPECIFIC'>('CHEAPEST');
  const [selectedBulkCourierId, setSelectedBulkCourierId] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (shipOrderIdParam && orders.length > 0) {
      const target = orders.find((o) => o.id === shipOrderIdParam || o.external_order_id === shipOrderIdParam);
      if (target) {
        setRateModalOrder(target);
      }
    }
  }, [shipOrderIdParam, orders]);

  React.useEffect(() => {
    loadSupabaseData();
    const unsubscribe = subscribeOrders();
    return () => unsubscribe();
  }, [loadSupabaseData, subscribeOrders]);

  const warehouseById = useMemo(() => new Map(warehouses.map((warehouse) => [warehouse.id, warehouse])), [warehouses]);
  const needsKyc = currentSeller?.status && currentSeller.status !== 'ACTIVE';
  const dateCutoff = useMemo(
    () => dateRange === 'ALL' ? null : filterNow - Number(dateRange) * 24 * 60 * 60 * 1000,
    [dateRange, filterNow]
  );

  const filteredOrders = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    const normalizedSearch = trimmedSearch.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = normalizedSearch.length === 0 ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        (order.external_order_id || '').toLowerCase().includes(normalizedSearch) ||
        (order.customer?.name || '').toLowerCase().includes(normalizedSearch) ||
        (order.customer?.email || '').toLowerCase().includes(normalizedSearch) ||
        (order.customer?.phone || '').includes(trimmedSearch) ||
        (order.shipping_address?.name || '').toLowerCase().includes(normalizedSearch) ||
        (order.shipping_address?.phone || '').includes(trimmedSearch) ||
        (order.shipping_address?.pincode || '').includes(trimmedSearch) ||
        (order.items || []).some((item) =>
          item.sku.toLowerCase().includes(normalizedSearch) ||
          item.name.toLowerCase().includes(normalizedSearch)
        );

      let matchesStatus = true;
      if (activeTab === 'NEW') {
        matchesStatus = order.current_status === 'NEW' || order.current_status === 'CONFIRMED';
      } else if (activeTab === 'PICKUPS') {
        matchesStatus = order.current_status === 'READY_TO_SHIP' || order.current_status === 'SHIPPED';
      } else if (activeTab === 'IN_TRANSIT') {
        matchesStatus = order.current_status === 'IN_TRANSIT' || order.current_status === 'OUT_FOR_DELIVERY';
      } else if (activeTab === 'RTO') {
        matchesStatus = order.current_status === 'RTO' || order.current_status === 'NDR' || order.current_status === 'RETURNED';
      } else if (activeTab !== 'ALL') {
        matchesStatus = order.current_status === activeTab;
      }

      const matchesDate = dateCutoff === null ? true : Date.parse(order.created_at) >= dateCutoff;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [activeTab, dateCutoff, orders, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const visibleOrders = filteredOrders.slice(pageStart, pageStart + pageSize);

  const resetTableView = () => {
    setCurrentPage(1);
    setSelectedOrderIds([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSupabaseData();
    setFilterNow(Date.now());
    setIsRefreshing(false);
    toast.success('Orders synced from database');
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOrderIds(event.target.checked ? visibleOrders.map((order) => order.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast.info('No orders available to export');
      return;
    }

    const rows = filteredOrders.map((order) => {
      const warehouse = warehouseById.get(order.warehouse_id);
      return [
        order.external_order_id || order.id,
        order.current_status,
        order.source,
        order.payment_type,
        order.total_amount,
        order.cod_amount,
        order.weight_kg,
        order.shipping_address?.name,
        order.shipping_address?.phone,
        order.shipping_address?.city,
        order.shipping_address?.state,
        order.shipping_address?.pincode,
        warehouse?.name || '',
        warehouse?.pincode || '',
        order.created_at,
      ].map(csvEscape).join(',');
    });

    const csv = [
      'Order ID,Status,Source,Payment,Total Amount,COD Amount,Weight KG,Customer,Phone,City,State,Pincode,Warehouse,Pickup Pincode,Created At',
      ...rows,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredOrders.length} live orders exported`);
  };

  const handleBulkAction = async (action: string) => {
    const selectedOrders = orders.filter((order) => selectedOrderIds.includes(order.id));
    if (selectedOrders.length === 0) return;

    if (action === 'CONFIRM') {
      const targets = selectedOrders
        .filter((order) => order.current_status === 'NEW')
      try {
        await Promise.all(targets.map((order) => updateOrderStatus(order.id, 'CONFIRMED')));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to confirm selected orders');
        return;
      }
      setSelectedOrderIds([]);
      toast.success('Selected new orders confirmed in database');
      return;
    }

    if (action === 'SHIP') {
      const shippableOrders = selectedOrders.filter((order) => order.current_status === 'NEW' || order.current_status === 'CONFIRMED');
      if (shippableOrders.length === 0) {
        toast.error('None of the selected orders are eligible for shipping');
        return;
      }
      if (shippableOrders.length === 1) {
        const firstShippable = shippableOrders[0];
        setRateModalOrder({ ...firstShippable, warehouse: warehouseById.get(firstShippable.warehouse_id) || firstShippable.warehouse });
      } else {
        setIsBulkShipModalOpen(true);
      }
      return;
    }

    if (action === 'CANCEL') {
      const targets = selectedOrders
        .filter((order) => !['DELIVERED', 'RTO', 'RETURNED'].includes(order.current_status))
      try {
        await Promise.all(targets.map((order) => updateOrderStatus(order.id, 'CANCELLED')));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to cancel selected orders');
        return;
      }
      setSelectedOrderIds([]);
      toast.success('Selected cancellable orders updated in database');
      return;
    }

    toast.info('Manifest generation is managed from shipments after labels are created');
  };

  const handleConfirmBulkShip = async () => {
    setIsProcessingBulk(true);
    try {
      const shippableIds = selectedOrderIds.filter(id => {
        const o = orders.find(ord => ord.id === id);
        return o && (o.current_status === 'NEW' || o.current_status === 'CONFIRMED');
      });
      const courier = bulkStrategy === 'SPECIFIC' && selectedBulkCourierId
        ? selectedBulkCourierId
        : couriers[0]?.id;
      
      const shippedCount = await bulkAssignShipments(shippableIds, courier);
      toast.success(`Successfully dispatched ${shippedCount} orders! AWBs generated.`);
      setIsBulkShipModalOpen(false);
      setSelectedOrderIds([]);
      setActiveTab('PICKUPS');
    } catch (err: any) {
      toast.error(err.message || 'Bulk shipment failed');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-16 text-slate-900 font-sans">
      {needsKyc && showKycBanner && (
        <div className="p-3.5 px-5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-between text-xs text-rose-950 font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong className="font-extrabold text-rose-700">KYC required:</strong> Seller status is {currentSeller?.status}. Complete KYC before shipping orders.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/settings')}
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">Orders</h1>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
            Live DB
          </span>
        </div>

        <div className="flex-1 w-full mx-0 lg:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID, buyer, mobile, email, SKU, pincode..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                resetTableView();
              }}
              className="w-full bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-3 py-2 rounded-xl"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />}
          >
            Sync
          </Button>

          <Link to="/app/orders/new">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Order
            </Button>
          </Link>

          <Link to="/app/orders/import">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-3.5 py-2 rounded-xl shadow-xs"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Import CSV
            </Button>
          </Link>

          <Link to="/app/integrations">
            <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2 rounded-xl">
              Connect Channel
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto text-xs font-extrabold scrollbar-none px-4 pt-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetTableView();
              }}
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

        <div className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={(event) => {
                setDateRange(event.target.value);
                setFilterNow(Date.now());
                resetTableView();
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="ALL">Lifetime</option>
            </select>

            <button
              onClick={() => toast.info('Search, status and date filters are applied to live orders')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Live Filters</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {filteredOrders.length} orders {dateRange === 'ALL' ? 'for lifetime' : `for last ${dateRange} days`}
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                onClick={handleExport}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Export Orders"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleRefresh}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>

              <select
                disabled={selectedOrderIds.length === 0}
                onChange={(event) => {
                  if (event.target.value) {
                    handleBulkAction(event.target.value);
                    event.target.value = '';
                  }
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <option value="">Select Bulk Action</option>
                <option value="CONFIRM">Confirm Orders</option>
                <option value="SHIP">Create Shipment</option>
                <option value="CANCEL">Cancel Orders</option>
                <option value="MANIFEST">Generate Manifest</option>
              </select>
            </div>
          </div>
        </div>

        {selectedOrderIds.length > 0 && (
          <div className="p-3 px-6 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900">
            <span>{selectedOrderIds.length} orders selected</span>
            <button onClick={() => setSelectedOrderIds([])} className="text-xs text-indigo-700 underline font-extrabold">
              Clear Selection
            </button>
          </div>
        )}

        {isLoadingData ? (
          <div className="p-16 text-center">
            <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs font-bold text-slate-500">Loading live orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="relative w-40 h-36 flex items-center justify-center">
              <div className="w-32 h-24 bg-indigo-100 rounded-2xl border-2 border-indigo-200 shadow-sm flex items-center justify-center relative overflow-hidden">
                <FileText className="w-12 h-12 text-indigo-500 opacity-80" />
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                  OK
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-display">No live orders found</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                Create a manual order or connect a sales channel. This list only shows records available in the database.
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
                      checked={selectedOrderIds.length === visibleOrders.length && visibleOrders.length > 0}
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
                {visibleOrders.map((order) => {
                  const warehouse = warehouseById.get(order.warehouse_id);
                  return (
                    <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleToggleSelect(order.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-black text-indigo-700 block text-xs">
                          #{order.external_order_id || order.id}
                        </span>
                        <span className="text-[10px] text-slate-600 font-semibold block">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                          {order.source}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          {order.customer?.name || order.shipping_address.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 block">
                          {order.customer?.phone || order.shipping_address.phone}
                        </span>
                        <span className="text-[10px] text-slate-600 truncate block max-w-[140px]">
                          {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                        </span>
                      </td>

                      <td className="p-4">
                        {order.items && order.items.length > 0 ? (
                          <div>
                            <span className="font-extrabold text-slate-800 block text-xs truncate max-w-[160px]">
                              {order.items[0].name}
                            </span>
                            <span className="text-[10px] text-slate-600 font-mono block">
                              SKU: {order.items[0].sku} (Qty: {order.items[0].quantity})
                            </span>
                            {order.items.length > 1 && (
                              <span className="text-[10px] text-indigo-600 font-bold">
                                +{order.items.length - 1} more items
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">No items linked</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{order.weight_kg} kg</span>
                        <span className="text-[10px] text-slate-600 font-mono block">
                          {[order.length_cm, order.width_cm, order.height_cm].every(Boolean)
                            ? `${order.length_cm}x${order.width_cm}x${order.height_cm} cm`
                            : 'Dimensions not set'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-slate-900 font-mono block">
                          Rs {order.total_amount.toLocaleString('en-IN')}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            order.payment_type === 'COD'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {order.payment_type}
                          </span>
                          {order.rto_risk_level && (
                            <span 
                              title={order.rto_risk_reason || 'AI RTO Risk Assessment'}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border cursor-help ${
                                order.rto_risk_level === 'HIGH'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : order.rto_risk_level === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                order.rto_risk_level === 'HIGH' ? 'bg-rose-600 animate-pulse' : order.rto_risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              {order.rto_risk_level} Risk
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800 block text-xs">
                          {warehouse?.name || 'Warehouse not linked'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 block">
                          PIN: {warehouse?.pincode || 'NA'}
                        </span>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={order.current_status} />
                      </td>

                      <td className="p-4 text-center">
                        {order.current_status === 'NEW' || order.current_status === 'CONFIRMED' ? (
                          <Button
                            size="sm"
                            onClick={() => setRateModalOrder({ ...order, warehouse: warehouse || order.warehouse })}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
                          >
                            Ship Now
                          </Button>
                        ) : order.current_status === 'NDR' ? (
                          <Link to="/app/ndr">
                            <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs px-3 py-1.5 rounded-xl">
                              Resolve NDR
                            </Button>
                          </Link>
                        ) : order.current_status === 'RTO' ? (
                          <Link to="/app/rto">
                            <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-xs px-3 py-1.5 rounded-xl">
                              Track RTO
                            </Button>
                          </Link>
                        ) : order.current_status === 'RETURNED' ? (
                          <Link to="/app/returns">
                            <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold text-xs px-3 py-1.5 rounded-xl">
                              Returns
                            </Button>
                          </Link>
                        ) : (
                          <Link to="/app/shipments">
                            <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs px-3 py-1.5 rounded-xl">
                              Shipment
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                resetTableView();
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center gap-4 font-bold">
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition disabled:opacity-40 cursor-pointer"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              PREV
            </button>
            <span className="text-slate-800 font-mono">{currentPage} / {totalPages}</span>
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition disabled:opacity-40 cursor-pointer"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {rateModalOrder && (
        <RateComparisonModal
          order={rateModalOrder}
          isOpen={!!rateModalOrder}
          onClose={() => setRateModalOrder(null)}
          onShipmentCreated={() => {
            setRateModalOrder(null);
            setSelectedOrderIds([]);
          }}
        />
      )}

      {/* Bulk Shipping Carrier Selection Modal */}
      <Modal
        isOpen={isBulkShipModalOpen}
        onClose={() => setIsBulkShipModalOpen(false)}
        title={`Bulk Ship ${selectedOrderIds.length} Orders`}
        subtitle="Select carrier routing strategy and allocate tracking AWBs in one click"
      >
        <div className="space-y-4 text-slate-900 text-xs">
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1 text-indigo-950">
            <span className="font-extrabold block text-xs">Smart Shipping Engine:</span>
            <p className="text-slate-700">
              Orders will be routed to courier partners based on your chosen algorithm. Freight charges will be deducted from your live wallet balance (₹{walletBalance.toLocaleString('en-IN')}).
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase text-[10px]">Courier Allocation Algorithm</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBulkStrategy('CHEAPEST')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                  bulkStrategy === 'CHEAPEST' ? 'bg-indigo-600 text-white font-black border-indigo-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block font-bold">Lowest Cost</span>
                <span className="text-[10px] block opacity-80">Prioritize margin</span>
              </button>
              <button
                type="button"
                onClick={() => setBulkStrategy('FASTEST')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                  bulkStrategy === 'FASTEST' ? 'bg-indigo-600 text-white font-black border-indigo-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block font-bold">Fastest SLA</span>
                <span className="text-[10px] block opacity-80">Air Express priority</span>
              </button>
              <button
                type="button"
                onClick={() => setBulkStrategy('SPECIFIC')}
                className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                  bulkStrategy === 'SPECIFIC' ? 'bg-indigo-600 text-white font-black border-indigo-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="block font-bold">Single Carrier</span>
                <span className="text-[10px] block opacity-80">Custom choice</span>
              </button>
            </div>
          </div>

          {bulkStrategy === 'SPECIFIC' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Select Carrier Partner</label>
              <select
                value={selectedBulkCourierId}
                onChange={(e) => setSelectedBulkCourierId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs"
              >
                <option value="">Auto-Assign Active Carrier</option>
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Total Packages to Fulfill:</span>
              <strong className="text-slate-900 font-mono">{selectedOrderIds.length} Packages</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Estimated Total Freight:</span>
              <strong className="text-indigo-700 font-mono">~₹{(selectedOrderIds.length * 68).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsBulkShipModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" 
              onClick={handleConfirmBulkShip}
              disabled={isProcessingBulk}
            >
              {isProcessingBulk ? 'Generating AWBs...' : 'Confirm Bulk Shipment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
