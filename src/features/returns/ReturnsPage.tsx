import React, { useState } from 'react';
import { RotateCcw, Plus, Truck, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';
import { Order, ReturnOrder } from '../../types';
import { toast } from 'sonner';

export const ReturnsPage: React.FC = () => {
  const { orders, returnRequests, createReturnRequest } = usePlatformStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || 'ord-101');
  const [returnReason, setReturnReason] = useState('Size mismatch / Defective product');

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    createReturnRequest(selectedOrderId, returnReason);
    toast.success('Reverse Pickup Order Created & AWB generated!');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 font-display">Reverse Logistics &amp; Returns</h2>
          <p className="text-xs text-slate-500 font-medium">Initiate reverse pickups, inspect returned items &amp; issue replacement exchanges</p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Create Return / Exchange
        </Button>
      </div>

      {/* Active Returns List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Return Orders ({returnRequests.length})</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Return AWB</th>
                <th className="p-3.5">Original Order ID</th>
                <th className="p-3.5">Return Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {returnRequests.map((ret: ReturnOrder) => (
                <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-600">{ret.reverse_awb_number || ret.return_awb || 'REV-991823'}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{ret.original_order_id}</td>
                  <td className="p-3.5 text-slate-700">{ret.reason || ret.return_reason}</td>
                  <td className="p-3.5"><StatusBadge status={ret.status} /></td>
                  <td className="p-3.5 text-right">
                    <Button size="sm" variant="outline" className="text-xs">Track Return</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Return Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Reverse Return Request"
        subtitle="Select original delivered order to initiate reverse pickup"
      >
        <form onSubmit={handleCreateReturn} className="space-y-4">
          <Select
            label="Select Original Order"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            options={orders.slice(0, 10).map((o: Order) => ({ value: o.id, label: `${o.external_order_id || o.id} - ${o.customer?.name || o.shipping_address.name} (₹${o.total_amount})` }))}
          />

          <Select
            label="Return Reason"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            options={[
              { value: 'Size mismatch', label: 'Size mismatch' },
              { value: 'Defective / Damaged product', label: 'Defective / Damaged product' },
              { value: 'Buyer changed mind', label: 'Buyer changed mind' },
              { value: 'Incorrect item delivered', label: 'Incorrect item delivered' },
            ]}
          />

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Generate Reverse AWB</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

