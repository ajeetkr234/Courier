import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, Upload, Truck, FileText, CheckSquare, X, ChevronRight, Eye 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { Order } from '../../types';
import { usePlatformStore } from '../../services/store';
import { RateComparisonModal } from '../shipments/RateComparisonModal';
import { toast } from 'sonner';

export const OrdersListPage: React.FC = () => {
  const { orders } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [rateModalOrder, setRateModalOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.external_order_id && ord.external_order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ord.customer?.name && ord.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ord.customer?.phone && ord.customer.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || ord.current_status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || ord.payment_type === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
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

  const openShipModal = (order: Order) => {
    setRateModalOrder(order);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Action Subheader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 font-display">Manage & Ship Orders</h2>
          <p className="text-xs text-slate-500 font-medium">Compare courier rates, generate AWB labels, and track dispatches.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/orders/import">
            <Button variant="outline" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
              Import CSV / XLSX
            </Button>
          </Link>
          <Link to="/app/orders/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search Order ID, External ID, Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'NEW', label: 'New' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'READY_TO_SHIP', label: 'Ready To Ship' },
              { value: 'SHIPPED', label: 'Shipped' },
              { value: 'IN_TRANSIT', label: 'In Transit' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'NDR', label: 'NDR Action' },
              { value: 'RTO', label: 'RTO' },
            ]}
          />
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Payments' },
              { value: 'PREPAID', label: 'Prepaid' },
              { value: 'COD', label: 'COD' },
            ]}
          />
        </div>
      </div>

      {/* Bulk Operations Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between shadow-xs">
          <span className="text-xs font-extrabold text-blue-900">
            {selectedOrderIds.length} orders selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" leftIcon={<Truck className="w-3.5 h-3.5" />} onClick={() => toast.info('Bulk shipment creation queued in background worker!')}>
              Bulk Ship Selected
            </Button>
            <Button size="sm" variant="outline" className="text-xs font-bold text-slate-700" onClick={() => setSelectedOrderIds([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Orders High-Density Logistics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Orders Registry</h3>
          <span className="text-xs text-slate-500 font-semibold">{filteredOrders.length} Total Orders</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Customer &amp; Phone</th>
                <th className="p-3.5">Pincode</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Weight</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500 font-semibold">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(ord.id)}
                        onChange={() => handleToggleSelect(ord.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-black text-slate-900 block">{ord.external_order_id || ord.id}</span>
                      <span className="text-[10px] text-slate-500 font-sans font-semibold">{new Date(ord.created_at).toLocaleDateString('en-IN')}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-extrabold uppercase text-slate-800">
                        {ord.source}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{ord.customer?.name || ord.shipping_address.name}</span>
                      <span className="text-[11px] font-mono text-slate-600 font-semibold">{ord.customer?.phone || ord.shipping_address.phone}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{ord.shipping_address.pincode}</td>
                    <td className="p-3.5">
                      <span className="font-black text-emerald-700 font-mono text-sm block">₹{ord.total_amount}</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-extrabold">{ord.payment_type}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{ord.weight_kg} kg</td>
                    <td className="p-3.5"><StatusBadge status={ord.current_status} /></td>
                    <td className="p-3.5 text-right space-x-1">
                      {ord.current_status === 'NEW' || ord.current_status === 'CONFIRMED' || ord.current_status === 'READY_TO_SHIP' ? (
                        <Button size="sm" variant="primary" className="text-xs font-bold" onClick={() => openShipModal(ord)}>
                          Ship Now
                        </Button>
                      ) : (
                        <Link to={`/app/orders/${ord.id}`}>
                          <Button size="sm" variant="outline" className="text-xs font-bold" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            View
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Rate Comparison Modal */}
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

