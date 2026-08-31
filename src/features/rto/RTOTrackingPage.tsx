import React from 'react';
import { RotateCcw, AlertCircle, Warehouse, DollarSign, Package } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';
import { Shipment } from '../../types';

export const RTOTrackingPage: React.FC = () => {
  const { shipments } = usePlatformStore();
  const rtoShipments = shipments.filter((s: Shipment) => s.status === 'RTO_INITIATED' || s.status === 'NDR' || s.status === 'RTO_DELIVERED');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">RTO Returns Tracker</h2>
        <p className="text-xs text-slate-500 font-medium">Track undelivered shipments returning back to your pickup fulfillment hubs</p>
      </div>

      <div className="space-y-4">
        {rtoShipments.map((shp: Shipment) => (
          <div key={shp.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-slate-900">{shp.awb_number}</span>
                  <StatusBadge status={shp.status} />
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">Returning to: <strong className="text-slate-900 font-bold">Primary Mumbai Fulfillment Hub</strong></p>
              </div>

              <div className="text-right">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">RTO Freight Charge</span>
                <span className="block text-xl font-black text-rose-600 font-mono">
                  ₹{Math.round(((shp.total_freight_charge || shp.shipping_cost || 88)) * 1.2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block font-bold uppercase text-[10px]">Forward Shipping Cost</span>
                <span className="text-slate-900 font-black text-sm font-mono">
                  ₹{shp.total_freight_charge || shp.shipping_cost || 88}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-rose-800 block font-bold uppercase text-[10px]">Reverse RTO Surcharge</span>
                <span className="text-rose-700 font-black text-sm font-mono">
                  ₹{Math.round(((shp.total_freight_charge || shp.shipping_cost || 88)) * 1.2)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-amber-800 block font-bold uppercase text-[10px]">Warehouse Receipt Status</span>
                <span className="text-amber-900 font-bold text-xs">In Transit Back</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

