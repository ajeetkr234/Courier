import React from 'react';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';
import { Shipment } from '../../types';

export const RTOTrackingPage: React.FC = () => {
  const { shipments, warehouses, loadSupabaseData } = usePlatformStore();

  React.useEffect(() => {
    loadSupabaseData();
  }, [loadSupabaseData]);

  const rtoShipments = shipments.filter((shipment: Shipment) =>
    ['RTO_INITIATED', 'RTO_IN_TRANSIT', 'RTO_DELIVERED', 'NDR'].includes(shipment.status)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">RTO Returns Tracker</h2>
        <p className="text-xs text-slate-500 font-medium">Track undelivered shipments returning back to your pickup fulfillment hubs</p>
      </div>

      <div className="space-y-4">
        {rtoShipments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-sm font-semibold text-slate-500">
            No live RTO shipments found.
          </div>
        ) : (
          rtoShipments.map((shipment) => {
            const warehouse = warehouses.find((item) => item.id === shipment.order?.warehouse_id);
            const forwardCharge = Number(shipment.total_freight_charge || shipment.shipping_cost || 0);
            const reverseCharge = Number((forwardCharge * 1.2).toFixed(2));

            return (
              <div key={shipment.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-slate-900">{shipment.awb_number}</span>
                      <StatusBadge status={shipment.status} />
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Returning to: <strong className="text-slate-900 font-bold">{warehouse?.name || 'Warehouse not linked'}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Estimated RTO Charge</span>
                    <span className="block text-xl font-black text-rose-600 font-mono">Rs {reverseCharge.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 block font-bold uppercase text-[10px]">Forward Shipping Cost</span>
                    <span className="text-slate-900 font-black text-sm font-mono">Rs {forwardCharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="text-rose-800 block font-bold uppercase text-[10px]">Reverse RTO Surcharge</span>
                    <span className="text-rose-700 font-black text-sm font-mono">Rs {reverseCharge.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-amber-800 block font-bold uppercase text-[10px]">Warehouse Receipt Status</span>
                    <span className="text-amber-900 font-bold text-xs">{shipment.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
