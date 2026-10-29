import React, { useState, useEffect } from 'react';
import { 
  MapPin, Truck, Clock, ArrowRight, 
  Sparkles, Calculator, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { rateEngine } from '../../../services/couriers/rateEngine';
import { RateQuote } from '../../../types';
import { getOfflinePincodeDetails } from '../../../services/pincodeService';

interface PincodeRateWidgetProps {
  includeGst: boolean;
  onToggleGst?: (val: boolean) => void;
}

const resolveCity = (pin: string, isPickup = false): string => {
  const clean = pin.replace(/\D/g, '').trim();
  if (clean.length === 6) {
    const details = getOfflinePincodeDetails(clean);
    if (details.isValid && details.city && details.state) {
      return `${details.city}, ${details.state}`;
    }
    return isPickup ? `Zone-${clean.slice(0, 3)} Origin Hub` : `Zone-${clean.slice(0, 3)} Destination`;
  }
  return 'Enter 6-digit PIN';
};

export const PincodeRateWidget: React.FC<PincodeRateWidgetProps> = ({ 
  includeGst,
  onToggleGst 
}) => {
  const [pickupPincode, setPickupPincode] = useState('110020');
  const [deliveryPincode, setDeliveryPincode] = useState('400001');
  const [weightKg, setWeightKg] = useState(0.5);
  const [paymentMode, setPaymentMode] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [orderValue, setOrderValue] = useState(1500);

  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [engineError, setEngineError] = useState('');

  const isPinValid = /^\d{6}$/.test(pickupPincode.trim()) && /^\d{6}$/.test(deliveryPincode.trim());
  const formError = !isPinValid ? 'Please enter valid 6-digit pickup and delivery pincodes.' : engineError;

  useEffect(() => {
    if (!/^\d{6}$/.test(pickupPincode.trim()) || !/^\d{6}$/.test(deliveryPincode.trim())) {
      return;
    }

    let isCurrent = true;
    Promise.resolve().then(() => {
      if (isCurrent) {
        setIsLoading(true);
        setEngineError('');
      }
    });

    rateEngine.fetchComparisonQuotes({
      sellerId: 'demo-seller',
      pickupPincode: pickupPincode.trim(),
      deliveryPincode: deliveryPincode.trim(),
      weightKg,
      paymentType: paymentMode,
      orderValue
    }).then((rawQuotes) => {
      if (!isCurrent) return;
      const augmented: RateQuote[] = rawQuotes.map((q, idx) => {
        const isAir = idx % 2 === 1;
        const multiplier = isAir ? 1.3 : 1.0;
        const weightMultiplier = 1 + Math.max(0, (weightKg - 0.5) / 0.5) * 0.72;
        const base = Math.round(q.base_rate * multiplier * weightMultiplier);
        const codFee = paymentMode === 'COD' ? Math.max(20, Math.round(orderValue * 0.015)) : 0;
        const gstAmount = Math.round((base + codFee) * 0.18);
        const total = base + codFee + (includeGst ? gstAmount : 0);

        return {
          ...q,
          service_name: isAir ? 'Express Air' : 'Surface Priority',
          base_rate: base,
          cod_charge: codFee,
          tax_amount: gstAmount,
          total_rate: total,
        };
      });

      augmented.sort((a, b) => a.total_rate - b.total_rate);
      if (augmented[0]) augmented[0].recommendation_badge = 'Cheapest';
      if (augmented[1]) augmented[1].recommendation_badge = 'Recommended';
      const fastest = augmented.find(q => q.estimated_days <= 2);
      if (fastest && fastest.id !== augmented[0]?.id) {
        fastest.recommendation_badge = 'Fastest';
      }

      setQuotes(augmented);
    }).catch(() => {
      if (!isCurrent) return;
      setEngineError('Unable to calculate rates at this moment. Please check pincodes.');
    }).finally(() => {
      if (!isCurrent) return;
      setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [pickupPincode, deliveryPincode, weightKg, paymentMode, orderValue, includeGst]);

  return (
    <div id="pincode-calc" className="space-y-6 pt-8 border-t border-slate-200/80 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-3.5 max-w-3xl text-left">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 xs:px-3.5 rounded-full bg-blue-50 text-blue-700 text-[11px] xs:text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <Calculator className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="uppercase tracking-wider">Live Pan-India Pincode Estimator</span>
            </div>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.2] sm:leading-[1.24]">
            Instant Pincode Rate Check{' '}
            <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Across All Couriers
            </span>
          </h2>

          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
            Enter your origin and destination pincodes to pull real-time API contract rates across Delhivery, Xpressbees, Shadowfax, and Ecom Express.
          </p>
        </div>

        {/* GST Toggle Switch */}
        <div className="inline-flex items-center gap-1.5 xs:gap-2 p-1 xs:p-1.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs self-start md:self-end">
          <span className="text-[11px] xs:text-xs font-bold text-slate-600 pl-1.5 xs:pl-2">Display Mode:</span>
          <button
            type="button"
            onClick={() => onToggleGst && onToggleGst(false)}
            className={`px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-lg sm:rounded-xl text-[11px] xs:text-xs font-extrabold transition-all cursor-pointer ${
              !includeGst 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excl. 18% GST
          </button>
          <button
            type="button"
            onClick={() => onToggleGst && onToggleGst(true)}
            className={`px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-lg sm:rounded-xl text-[11px] xs:text-xs font-extrabold transition-all cursor-pointer ${
              includeGst 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incl. 18% GST
          </button>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Origin Pincode */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Pickup Pincode</span>
              <span className="text-[11px] font-mono text-blue-600 font-semibold truncate max-w-[130px]">
                {resolveCity(pickupPincode, true)}
              </span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                value={pickupPincode}
                onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 110020"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
              />
            </div>
            {/* Quick Origin Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                { label: 'Delhi', pin: '110020' },
                { label: 'Mumbai', pin: '400001' },
                { label: 'BLR', pin: '560001' },
                { label: 'Kolkata', pin: '700001' }
              ].map((preset) => (
                <button
                  key={preset.pin}
                  type="button"
                  onClick={() => setPickupPincode(preset.pin)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    pickupPincode === preset.pin
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Pincode */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Delivery Pincode</span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold truncate max-w-[130px]">
                {resolveCity(deliveryPincode, false)}
              </span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                value={deliveryPincode}
                onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 400001"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
              />
            </div>
            {/* Quick Destination Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                { label: 'Mumbai', pin: '400001' },
                { label: 'BLR', pin: '560001' },
                { label: 'Patna', pin: '800001' },
                { label: 'Guwahati', pin: '781001' }
              ].map((preset) => (
                <button
                  key={preset.pin}
                  type="button"
                  onClick={() => setDeliveryPincode(preset.pin)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    deliveryPincode === preset.pin
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Selection */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Dead / Chargeable Weight</span>
              <span className="text-[11px] font-mono text-blue-600 font-extrabold">{weightKg} kg</span>
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
              {[0.5, 1.0, 2.0, 5.0].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeightKg(w)}
                  className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    weightKg === w
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Billing slab: {Math.max(1, Math.ceil(weightKg / 0.5))} × 500g increments
            </div>
          </div>

          {/* Payment Mode & Value */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('PREPAID')}
                className={`py-2 px-2.5 xs:px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  paymentMode === 'PREPAID'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Prepaid (₹0 COD)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('COD')}
                className={`py-2 px-2.5 xs:px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  paymentMode === 'COD'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                COD (+₹20)
              </button>
            </div>
            {paymentMode === 'COD' && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 font-mono">
                <span>Order Value:</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={orderValue}
                  onChange={(e) => setOrderValue(Number(e.target.value) || 100)}
                  className="w-20 px-1.5 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-800 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {formError}
          </div>
        )}

        {/* Live Comparison Rate Cards Grid */}
        <div className="pt-4 border-t border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700">
            <span className="flex flex-wrap items-center gap-1.5 xs:gap-2">
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span>Real-Time Quotes:</span>
              <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px] xs:text-xs">
                {pickupPincode} ➔ {deliveryPincode} ({weightKg} kg)
              </span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {includeGst ? 'All prices include 18% GST' : 'Base commercial freight ex-GST'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {quotes.map((q) => {
              const isRecommended = q.recommendation_badge === 'Recommended';
              const isCheapest = q.recommendation_badge === 'Cheapest';
              const isFastest = q.recommendation_badge === 'Fastest';

              return (
                <div
                  key={q.id}
                  className={`p-3.5 xs:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
                    isRecommended
                      ? 'bg-slate-950 text-white border-blue-500 shadow-lg'
                      : isCheapest
                      ? 'bg-white border-emerald-300 shadow-xs hover:shadow-md ring-1 ring-emerald-500/20'
                      : isFastest
                      ? 'bg-white border-amber-300 shadow-xs hover:shadow-md ring-1 ring-amber-500/20'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  {/* Badge */}
                  {q.recommendation_badge && (
                    <div className="absolute -top-2.5 left-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono shadow-xs ${
                          isRecommended
                            ? 'bg-blue-600 text-white'
                            : isCheapest
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        ★ {q.recommendation_badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Truck className={`w-4 h-4 ${isRecommended ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`font-black text-sm ${isRecommended ? 'text-white' : 'text-slate-900'}`}>
                          {q.courier_name.split(' ')[0]}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        isRecommended ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {q.service_name}
                      </span>
                    </div>

                    {/* Transit SLA */}
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <Clock className={`w-3.5 h-3.5 ${isRecommended ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className={isRecommended ? 'text-slate-300' : 'text-slate-600'}>
                        Transit: <strong className={isRecommended ? 'text-white' : 'text-slate-900'}>{q.estimated_days} - {q.estimated_days + 1} Days</strong>
                      </span>
                    </div>

                    {/* Rate Display */}
                    <div className="pt-2 border-t border-slate-100/20">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-xl xs:text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                          isRecommended ? 'text-blue-400' : isCheapest ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          ₹{q.total_rate}
                        </span>
                        <span className={`text-[10px] xs:text-[11px] font-semibold ${isRecommended ? 'text-slate-400' : 'text-slate-500'}`}>
                          {includeGst ? 'incl. GST' : 'excl. GST'}
                        </span>
                      </div>
                      <div className={`text-[9px] xs:text-[10px] font-mono ${isRecommended ? 'text-slate-400' : 'text-slate-400'} pt-0.5`}>
                        Base: ₹{q.base_rate} {q.cod_charge > 0 && `+ COD ₹${q.cod_charge}`} {includeGst && `+ GST ₹${q.tax_amount}`}
                      </div>
                    </div>
                  </div>

                  {/* Direct Book CTA */}
                  <Link to="/register" className="block pt-1">
                    <button
                      className={`w-full py-2 px-2.5 xs:px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isRecommended
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : isCheapest
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800'
                      }`}
                    >
                      <span>Ship with {q.courier_name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
