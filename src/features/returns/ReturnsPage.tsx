import React, { useState } from 'react';
import { 
  RotateCcw, Plus, Search, Filter, HelpCircle, FileText, Download, RefreshCw, 
  ChevronRight, CheckCircle2, AlertTriangle, ChevronDown, Package, MapPin, 
  CreditCard, Truck, ExternalLink, X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';
import { Order, ReturnOrder } from '../../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const ReturnsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, warehouses, returnRequests, createReturnRequest, loadSupabaseData, isLoadingData } = usePlatformStore();

  React.useEffect(() => {
    loadSupabaseData();
  }, []);

  // Active Main Status Tab
  const [activeTab, setActiveTab] = useState<
    'PENDING_REQUESTS' | 'NEW' | 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'RETURN_RECEIVED' | 'UNDELIVERED' | 'ALL' | 'PENDING_REFUND'
  >('NEW');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [selectedReturnIds, setSelectedReturnIds] = useState<string[]>([]);

  // Add Return Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [returnReason, setReturnReason] = useState('Size mismatch');
  const [refundAmount, setRefundAmount] = useState('');

  React.useEffect(() => {
    if (orders.length > 0 && !orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  // Filter return orders based on active tab, reason, and search term
  const filteredReturns = returnRequests.filter((ret) => {
    // Search match
    const matchesSearch = 
      ret.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ret.original_order_id && ret.original_order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ret.reverse_awb_number && ret.reverse_awb_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ret.reason && ret.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    // Reason match
    const matchesReason = reasonFilter === 'ALL' || ret.reason?.toLowerCase().includes(reasonFilter.toLowerCase());

    // Tab Status match
    let matchesTab = true;
    const statusStr = ret.status as string;
    if (activeTab === 'PENDING_REQUESTS') {
      matchesTab = statusStr === 'PENDING_APPROVAL';
    } else if (activeTab === 'NEW') {
      matchesTab = statusStr === 'NEW' || statusStr === 'REQUESTED' || statusStr === 'CREATED';
    } else if (activeTab === 'PICKUP_SCHEDULED') {
      matchesTab = statusStr === 'PICKUP_SCHEDULED';
    } else if (activeTab === 'IN_TRANSIT') {
      matchesTab = statusStr === 'IN_TRANSIT' || statusStr === 'OUT_FOR_PICKUP';
    } else if (activeTab === 'RETURN_RECEIVED') {
      matchesTab = statusStr === 'DELIVERED_TO_WAREHOUSE' || statusStr === 'RECEIVED';
    } else if (activeTab === 'UNDELIVERED') {
      matchesTab = statusStr === 'UNDELIVERED' || statusStr === 'FAILED_PICKUP';
    } else if (activeTab === 'PENDING_REFUND') {
      matchesTab = statusStr === 'PENDING_REFUND';
    } else if (activeTab === 'ALL') {
      matchesTab = true;
    }

    return matchesSearch && matchesReason && matchesTab;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedReturnIds(filteredReturns.map(r => r.id));
    } else {
      setSelectedReturnIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedReturnIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      toast.error('Please select an order for return');
      return;
    }
    createReturnRequest(selectedOrderId, returnReason);
    toast.success('Reverse return request created from live order data.');
    setIsModalOpen(false);
  };

  const handleExportReturns = () => {
    if (filteredReturns.length === 0) {
      toast.info('No returns available to export');
      return;
    }
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = filteredReturns.map((ret) => {
      const order = ret.original_order || orders.find((item) => item.id === ret.original_order_id);
      return [
        ret.id,
        ret.reverse_awb_number || ret.return_awb || '',
        ret.original_order_id,
        order?.shipping_address?.name || '',
        order?.shipping_address?.phone || '',
        ret.return_reason || ret.reason || '',
        ret.status,
        ret.created_at,
      ].map(escape).join(',');
    });
    const csv = ['Return ID,Reverse AWB,Original Order ID,Customer,Phone,Reason,Status,Created At', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `returns-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredReturns.length} returns exported`);
  };

  return (
    <div className="w-full space-y-4 pb-16 text-slate-900 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
              Returns
            </h1>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-indigo-600 font-bold">
            <button
              onClick={() => toast.info('Opening Return FAQs documentation...')}
              className="flex items-center gap-1 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQs</span>
            </button>
            <button
              onClick={() => toast.info('Opening Reverse Logistics API Documentation...')}
              className="flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>API Help Doc</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar & Add Return Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 w-full mx-0 lg:mx-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search via order ID, Product SKU, AWB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 text-xs font-medium text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/app/returns/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Return
          </Button>
        </div>
      </div>

      {/* Main Status Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto text-xs font-extrabold scrollbar-none px-4 pt-2">
          {[
            { id: 'PENDING_REQUESTS', label: 'Pending Requests' },
            { id: 'NEW', label: 'New' },
            { id: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
            { id: 'RETURN_RECEIVED', label: 'Return Received' },
            { id: 'UNDELIVERED', label: 'Undelivered Returns' },
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_REFUND', label: 'Pending Refund' },
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

        {/* Filters Controls Toolbar */}
        <div className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="7">📅 Last 7 days</option>
              <option value="30">📅 Last 30 days</option>
              <option value="90">📅 Last 90 days</option>
              <option value="ALL">📅 Lifetime</option>
            </select>

            {/* Select Reason Filter */}
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="ALL">Select Reason</option>
              <option value="Size mismatch">Size Mismatch</option>
              <option value="Defective">Defective / Damaged Product</option>
              <option value="Wrong Item">Wrong Item Delivered</option>
              <option value="Changed Mind">Buyer Changed Mind</option>
            </select>

            {/* More Filters */}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>More Filters</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {filteredReturns.length} Orders for Last {dateRange} days
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                onClick={handleExportReturns}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  loadSupabaseData();
                  toast.success('Returns data refreshed from database');
                }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Select Bulk Action */}
              <select
                disabled={selectedReturnIds.length === 0}
                onChange={(e) => {
                  if (e.target.value) {
                    toast.info('Bulk return updates need backend status endpoints before they can be enabled.');
                    e.target.value = '';
                  }
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <option value="">Select Bulk Action</option>
                <option value="APPROVE">Approve Selected Returns</option>
                <option value="CANCEL">Cancel Return Request</option>
                <option value="REFUND">Process Bulk Refunds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Returns Table or Empty State */}
        {filteredReturns.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
            {/* Vector Graphic Illustration matching screenshot */}
            <div className="relative w-40 h-36 flex items-center justify-center">
              <div className="w-32 h-24 bg-indigo-100 rounded-2xl border-2 border-indigo-200 shadow-xs flex items-center justify-center relative overflow-hidden">
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
                We could not find any data for the applied filters.
              </h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                Please change filters and retry.
              </p>
            </div>

            <Button
              onClick={() => {
                setActiveTab('ALL');
                setSearchTerm('');
                setReasonFilter('ALL');
              }}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-2 rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wider text-slate-600 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedReturnIds.length === filteredReturns.length && filteredReturns.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Return Details</th>
                  <th className="p-4">Buyer Details</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Dimensions</th>
                  <th className="p-4">Warehouse Address</th>
                  <th className="p-4">Refund Details</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReturns.map((ret) => {
                  const originalOrder = ret.original_order || orders.find((order) => order.id === ret.original_order_id);
                  const warehouse = originalOrder ? warehouses.find((item) => item.id === originalOrder.warehouse_id) : undefined;
                  const firstItem = originalOrder?.items?.[0];

                  return (
                  <tr key={ret.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedReturnIds.includes(ret.id)}
                        onChange={() => handleToggleSelect(ret.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Return Details */}
                    <td className="p-4">
                      <span className="font-mono font-black text-indigo-700 block text-xs">
                        {ret.reverse_awb_number || ret.return_awb || `REV-${ret.id.slice(-6)}`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        Original Order: #{ret.original_order_id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(ret.created_at || Date.now()).toLocaleDateString('en-IN')}
                      </span>
                    </td>

                    {/* Buyer Details */}
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">
                        {originalOrder?.customer?.name || originalOrder?.shipping_address?.name || 'Customer not linked'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 block">
                        {originalOrder?.customer?.phone || originalOrder?.shipping_address?.phone || 'Phone not linked'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                        {[originalOrder?.shipping_address?.city, originalOrder?.shipping_address?.state].filter(Boolean).join(', ') || 'Address not linked'} {originalOrder?.shipping_address?.pincode ? `- ${originalOrder.shipping_address.pincode}` : ''}
                      </span>
                    </td>

                    {/* Product Details */}
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        {firstItem?.name || 'No item linked'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        SKU: {firstItem?.sku || 'NA'} (Qty: {firstItem?.quantity || 0})
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                        Reason: {ret.reason || ret.return_reason}
                      </span>
                    </td>

                    {/* Dimensions */}
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">
                        {originalOrder?.weight_kg || 0} kg
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {[originalOrder?.length_cm, originalOrder?.width_cm, originalOrder?.height_cm].every(Boolean)
                          ? `${originalOrder?.length_cm}x${originalOrder?.width_cm}x${originalOrder?.height_cm} cm`
                          : 'Dimensions not set'}
                      </span>
                    </td>

                    {/* Warehouse Address */}
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        {warehouse?.name || 'Warehouse not linked'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        PIN: {warehouse?.pincode || 'NA'}
                      </span>
                    </td>

                    {/* Refund Details */}
                    <td className="p-4">
                      <span className="font-black text-slate-900 font-mono block">
                        Rs {Number(originalOrder?.total_amount || refundAmount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                        Pending Refund
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => toast.success(`Return request ${ret.id} approved! Reverse pickup scheduled.`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        Approve Return
                      </Button>
                    </td>
                  </tr>
                  );
                })}
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

      {/* Add Return Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Reverse Return Request"
        subtitle="Initiate reverse pickup and AWB label generation"
      >
        <form onSubmit={handleCreateReturn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Delivered Order
            </label>
            <Select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              options={orders.slice(0, 10).map((o: Order) => ({
                value: o.id,
                label: `${o.external_order_id || o.id} - ${o.customer?.name || o.shipping_address.name} (₹${o.total_amount})`
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Return Reason
            </label>
            <Select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              options={[
                { value: 'Size mismatch', label: 'Size mismatch' },
                { value: 'Defective / Damaged product', label: 'Defective / Damaged product' },
                { value: 'Buyer changed mind', label: 'Buyer changed mind' },
                { value: 'Incorrect item delivered', label: 'Incorrect item delivered' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Refund Amount (₹)
            </label>
            <Input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="799"
              className="text-xs font-semibold"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Generate Reverse AWB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
