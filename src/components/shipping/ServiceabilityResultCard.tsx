import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Truck, MapPin, Calendar, Tag } from 'lucide-react';
import { ServiceabilityResponse } from '../../types/serviceability';
import { Button } from '../ui/Button';

interface ServiceabilityResultCardProps {
  result: ServiceabilityResponse;
  onModify: () => void;
  onContinue?: () => void;
}

export const ServiceabilityResultCard: React.FC<ServiceabilityResultCardProps> = ({
  result,
  onModify,
  onContinue,
}) => {
  if (result.available) {
    return (
      <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
        {/* Availability Banner */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-950 font-display">✓ Delivery Available</h3>
            <p className="text-xs text-emerald-700 font-semibold">Serviceable across courier network</p>
          </div>
        </div>

        {/* Route Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-200 shadow-xs text-slate-800">
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" /> Pickup
            </span>
            <strong className="text-base font-black text-slate-900 font-display block">
              {result.pickupCity || result.pickupLocation?.city}
            </strong>
            <span className="text-xs text-slate-500 font-mono">PIN: {result.pickupPincode}</span>
          </div>

          <div className="space-y-1 sm:pl-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Delivery
            </span>
            <strong className="text-base font-black text-slate-900 font-display block">
              {result.deliveryCity || result.deliveryLocation?.city}
            </strong>
            <span className="text-xs text-slate-500 font-mono">PIN: {result.deliveryPincode}</span>
          </div>
        </div>

        {/* SLA & Price */}
        <div className="grid grid-cols-2 gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-600" /> Estimated Delivery
            </span>
            <strong className="text-lg font-black text-slate-900 font-display">
              {result.estimatedDays || '1–2 Days'}
            </strong>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1 justify-end">
              <Tag className="w-3 h-3 text-emerald-600" /> Estimated Price
            </span>
            <strong className="text-2xl font-black text-emerald-700 font-mono">
              ₹{result.estimatedPrice || 149}
            </strong>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onModify}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-bold border-emerald-300 text-emerald-900 hover:bg-emerald-100/60"
          >
            Modify Search
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onContinue}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:flex-1 text-sm font-extrabold py-3 shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Continue Shipment Booking
          </Button>
        </div>
      </div>
    );
  }

  // Unavailable Card
  return (
    <div className="bg-rose-50/90 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md">
          <XCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-rose-950 font-display">✕ Delivery currently unavailable</h3>
          <p className="text-xs text-rose-700 font-medium mt-0.5">
            {result.message || "We currently don't provide delivery between these locations."}
          </p>
        </div>
      </div>

      <div className="p-4 bg-white/90 rounded-2xl border border-rose-200 text-xs text-slate-700 space-y-1">
        <span className="block font-extrabold text-slate-900 uppercase text-[10px]">Attempted Route:</span>
        <span className="block font-medium">
          Pickup: <strong>{result.pickupCity || 'Selected Location'} ({result.pickupPincode})</strong> → Delivery: <strong>{result.deliveryCity || 'Selected Destination'} ({result.deliveryPincode})</strong>
        </span>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onModify}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-auto text-xs font-bold border-rose-300 text-rose-900 hover:bg-rose-100"
        >
          Modify Pickup / Delivery Location
        </Button>
      </div>
    </div>
  );
};
