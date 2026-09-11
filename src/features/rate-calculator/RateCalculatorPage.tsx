import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, MapPin, Truck, ShieldCheck, CheckCircle2, Zap, 
  RotateCcw, Info, ArrowRight, Sparkles, Package, Clock, Star, 
  RefreshCw, AlertCircle, Plane, FileText, ChevronRight, AlertTriangle,
  ArrowUpDown, Filter, Sparkle, ArrowUpRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { rateEngine } from '../../services/couriers/rateEngine';
import { RateQuote } from '../../types';
import { toast } from 'sonner';
import { usePlatformStore } from '../../services/store';
import { getOfflinePincodeDetails } from '../../services/pincodeService';

interface RecentSearch {
  id: string;
  type: 'FORWARD' | 'RETURN';
  pickupPincode: string;
  deliveryPincode: string;
  deliveryCity: string;
  weightKg: number;
  shipmentValue: number;
  paymentMode: 'PREPAID' | 'COD';
  isDangerous: boolean;
  isSecured: boolean;
  timestamp: string;
}

export const RateCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeller, warehouses } = usePlatformStore();

  // Tab State: Domestic vs International
  const [activeTab, setActiveTab] = useState<'DOMESTIC' | 'INTERNATIONAL'>('DOMESTIC');

  // Form Fields State
  const [shipmentType, setShipmentType] = useState<'FORWARD' | 'RETURN'>('FORWARD');
  const [pickupPincode, setPickupPincode] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [actualWeight, setActualWeight] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [shipmentValue, setShipmentValue] = useState('');
  const [isDangerousGoods, setIsDangerousGoods] = useState<'YES' | 'NO'>('NO');
  const [isSmartOrder, setIsSmartOrder] = useState<'YES' | 'NO'>('YES');

  // Location Details lookup simulation
  const [pickupCityState, setPickupCityState] = useState('');
  const [deliveryCityState, setDeliveryCityState] = useState('');

  // Calculated weights
  const [volumetricWeight, setVolumetricWeight] = useState(0);
  const [applicableWeight, setApplicableWeight] = useState(5);

  // Execution & Results State
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [courierFilter, setCourierFilter] = useState<'ALL' | 'AIR' | 'SURFACE'>('ALL');
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [formError, setFormError] = useState('');

  // Recent searches list
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const defaultWarehouse = warehouses.find((warehouse) => warehouse.is_default) || warehouses[0];
    if (!pickupPincode && defaultWarehouse?.pincode) {
      setPickupPincode(defaultWarehouse.pincode);
      setPickupCityState(`${defaultWarehouse.city}, ${defaultWarehouse.state}`);
    }
  }, [pickupPincode, warehouses]);

  // Recalculate Volumetric & Applicable Weights on inputs change
  useEffect(() => {
    const actW = parseFloat(actualWeight) || 0;
    const l = parseFloat(lengthCm) || 0;
    const w = parseFloat(widthCm) || 0;
    const h = parseFloat(heightCm) || 0;

    let volW = 0;
    if (l > 0 && w > 0 && h > 0) {
      volW = parseFloat(((l * w * h) / 5000).toFixed(2));
    }

    setVolumetricWeight(volW);
    const finalW = Math.max(actW, volW);
    setApplicableWeight(finalW > 0 ? finalW : 0.5);
  }, [actualWeight, lengthCm, widthCm, heightCm]);

  // Dynamic Pincode to City/State mapper
  useEffect(() => {
    const cleanPickup = pickupPincode.replace(/\D/g, '').trim();
    if (cleanPickup.length === 6) {
      const details = getOfflinePincodeDetails(cleanPickup);
      if (details.isValid && details.city && details.state) {
        setPickupCityState(`${details.city}, ${details.state}`);
      } else {
        setPickupCityState(`Zone-${cleanPickup.slice(0, 3)} Hub`);
      }
    } else {
      setPickupCityState('');
    }

    const cleanDelivery = deliveryPincode.replace(/\D/g, '').trim();
    if (cleanDelivery.length === 6) {
      const details = getOfflinePincodeDetails(cleanDelivery);
      if (details.isValid && details.city && details.state) {
        setDeliveryCityState(`${details.city}, ${details.state}`);
      } else {
        setDeliveryCityState(`Zone-${cleanDelivery.slice(0, 3)} Destination`);
      }
    } else {
      setDeliveryCityState('');
    }
  }, [pickupPincode, deliveryPincode]);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pickupPincode.trim())) {
      setFormError('Please enter a valid 6-digit Pickup Pincode.');
      return;
    }
    if (!pinRegex.test(deliveryPincode.trim())) {
      setFormError('Please enter a valid 6-digit Delivery Pincode.');
      return;
    }

    const weightVal = parseFloat(actualWeight);
    if (!weightVal || weightVal <= 0) {
      setFormError('Please enter a valid weight in KG.');
      return;
    }

    const valueVal = parseFloat(shipmentValue);
    if (isNaN(valueVal) || valueVal < 0) {
      setFormError('Please enter a valid shipment value in ₹.');
      return;
    }

    setIsCalculating(true);
    try {
      // Fetch engine quotes
      const rawQuotes = await rateEngine.fetchComparisonQuotes({
        sellerId: currentSeller?.id || '',
        pickupPincode,
        deliveryPincode,
        weightKg: applicableWeight,
        paymentType,
        orderValue: valueVal
      });

      // Augment quotes with specific rates & mode labels
      const augmented: RateQuote[] = rawQuotes.map((q, idx) => {
        const isAir = idx % 2 === 1 || q.courier_name.toLowerCase().includes('express');
        const modeName = isAir ? 'Air' : 'Surface';
        const finalBase = isAir ? Number((q.base_rate * 1.35).toFixed(2)) : q.base_rate;
        const codFee = paymentType === 'COD' ? Math.max(30, Number((valueVal * 0.018).toFixed(2))) : 0;
        const gst = Number(((finalBase + codFee) * 0.18).toFixed(2));
        const total = Number((finalBase + codFee + gst).toFixed(2));

        return {
          ...q,
          courier_name: `${q.courier_name.replace(' Direct', '').replace(' Express', '')} ${modeName} ${applicableWeight}kg`,
          service_name: modeName,
          base_rate: finalBase,
          cod_charge: codFee,
          tax_amount: gst,
          total_rate: total,
          estimated_days: isAir ? Math.max(2, q.estimated_days - 1) : q.estimated_days,
          recommendation_badge: idx === 0 ? 'Recommended' : q.recommendation_badge
        };
      });

      setQuotes(augmented);
      setHasCalculated(true);

      // Add to recent searches
      const newSearchItem: RecentSearch = {
        id: `rs-${Date.now()}`,
        type: shipmentType,
        pickupPincode,
        deliveryPincode,
        deliveryCity: deliveryCityState.split(',')[0],
        weightKg: applicableWeight,
        shipmentValue: valueVal,
        paymentMode: paymentType,
        isDangerous: isDangerousGoods === 'YES',
        isSecured: true,
        timestamp: 'Just now'
      };
      setRecentSearches(prev => [newSearchItem, ...prev.slice(0, 3)]);

      toast.success(`Calculated rates for ${applicableWeight}kg parcel from ${pickupPincode} to ${deliveryPincode}`);
    } catch (err) {
      toast.error('Failed to calculate rates. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setShipmentType('FORWARD');
    const defaultWarehouse = warehouses.find((warehouse) => warehouse.is_default) || warehouses[0];
    setPickupPincode(defaultWarehouse?.pincode || '');
    setDeliveryPincode('');
    setActualWeight('');
    setLengthCm('');
    setWidthCm('');
    setHeightCm('');
    setPaymentType('PREPAID');
    setShipmentValue('');
    setIsDangerousGoods('NO');
    setIsSmartOrder('YES');
    setHasCalculated(false);
    setFormError('');
  };

  const loadRecentSearch = (search: RecentSearch) => {
    setShipmentType(search.type);
    setPickupPincode(search.pickupPincode);
    setDeliveryPincode(search.deliveryPincode);
    setActualWeight(search.weightKg.toString());
    setPaymentType(search.paymentMode);
    setShipmentValue(search.shipmentValue.toString());
    setIsDangerousGoods(search.isDangerous ? 'YES' : 'NO');
    toast.info(`Loaded search for ${search.pickupPincode} → ${search.deliveryPincode}`);
  };

  const handleCreateShipment = (quote: RateQuote) => {
    navigate('/app/orders/new', {
      state: {
        pickupPincode,
        deliveryPincode,
        weightKg: applicableWeight,
        paymentType,
        orderValue: parseFloat(shipmentValue) || 1000,
        selectedCourierId: quote.courier_id,
        selectedCourierName: quote.courier_name,
        estimatedRate: quote.total_rate
      }
    });
  };

  const filteredQuotes = quotes.filter(q => {
    if (courierFilter === 'AIR') return q.service_name?.toUpperCase().includes('AIR');
    if (courierFilter === 'SURFACE') return q.service_name?.toUpperCase().includes('SURFACE');
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
              Shipping Rate Calculator
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Calculate accurate freight charges, Compare 25+ courier partners, and analyze volumetric weights in real-time.
          </p>
        </div>

        {/* Domestic / International Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('DOMESTIC')}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'DOMESTIC'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Domestic
          </button>
          <button
            onClick={() => {
              setActiveTab('INTERNATIONAL');
              toast.info('International Shipping Rate Calculator coming soon!');
            }}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'INTERNATIONAL'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            International
          </button>
        </div>
      </div>

      {/* Recent Searches Header Bar */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Recent Searches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentSearches.map(search => (
            <div
              key={search.id}
              onClick={() => loadRecentSearch(search)}
              className="group p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-pointer transition-all shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                  Forward Shipment
                </span>
                <div className="flex items-center gap-1">
                  {search.isDangerous && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Dangerous Goods
                    </span>
                  )}
                  {search.isSecured && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Secured
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-black text-slate-800 my-1">
                <span>{search.pickupPincode}</span>
                <span className="text-slate-400 font-bold">······››······</span>
                <span className="truncate">{search.deliveryPincode} <span className="text-[10px] text-slate-500 font-medium">({search.deliveryCity})</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-semibold mt-2">
                <span>{search.weightKg} kg</span>
                <span>₹{search.shipmentValue.toLocaleString('en-IN')}</span>
                <span className="font-bold text-slate-700">{search.paymentMode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleCalculate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Shipment Type Radio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Shipment Type
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="shipmentType"
                    checked={shipmentType === 'FORWARD'}
                    onChange={() => setShipmentType('FORWARD')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Forward</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="shipmentType"
                    checked={shipmentType === 'RETURN'}
                    onChange={() => setShipmentType('RETURN')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Return</span>
                </label>
              </div>
            </div>

            {/* Pincodes Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Pincode
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 462028"
                  className="font-mono text-sm"
                />
                {pickupCityState && (
                  <span className="block text-[11px] font-semibold text-indigo-600 mt-1">
                    📍 {pickupCityState}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Pincode
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 841235"
                  className="font-mono text-sm"
                />
                {deliveryCityState && (
                  <span className="block text-[11px] font-semibold text-indigo-600 mt-1">
                    🎯 {deliveryCityState}
                  </span>
                )}
              </div>
            </div>

            {/* Weight & Dimensions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Actual Weight
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    placeholder="5"
                    className="font-semibold text-sm pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    KG
                  </span>
                </div>
                <span className="block text-[11px] font-medium text-slate-600 mt-1">
                  Note: Minimum chargeable weight is 0.5kg
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dimensions <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <Input
                      type="number"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(e.target.value)}
                      placeholder="L"
                      className="text-xs text-center pr-6"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">CM</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={widthCm}
                      onChange={(e) => setWidthCm(e.target.value)}
                      placeholder="B"
                      className="text-xs text-center pr-6"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">CM</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="H"
                      className="text-xs text-center pr-6"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">CM</span>
                  </div>
                </div>
                <span className="block text-[11px] font-medium text-slate-600 mt-1">
                  Note: Dimensional value should be greater than 0.5cm
                </span>
              </div>
            </div>

            {/* Calculated Weight Badges Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                <span>Volumetric Weight :</span>
                <span className="font-mono text-indigo-700">{volumetricWeight.toFixed(2)} KG</span>
                <span title="Calculated as (Length x Width x Height) / 5000">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
                <span>Applicable Weight :</span>
                <span className="font-mono text-indigo-700 font-black">{applicableWeight.toFixed(2)} KG</span>
                <span title="Higher of Actual Weight or Volumetric Weight">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                </span>
              </div>
            </div>

            {/* Payment Type & Shipment Value Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Payment Type
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'COD'}
                      onChange={() => setPaymentType('COD')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Cash on Delivery</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'PREPAID'}
                      onChange={() => setPaymentType('PREPAID')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Prepaid</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shipment Value (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={shipmentValue}
                    onChange={(e) => setShipmentValue(e.target.value)}
                    placeholder="60000"
                    className="font-semibold text-sm pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Dangerous Goods & Smart Order Radio Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <span>Shipping Dangerous Goods?</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="dangerousGoods"
                      checked={isDangerousGoods === 'YES'}
                      onChange={() => setIsDangerousGoods('YES')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="dangerousGoods"
                      checked={isDangerousGoods === 'NO'}
                      onChange={() => setIsDangerousGoods('NO')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1 text-indigo-700 font-extrabold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Smart Order
                  </span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="smartOrder"
                      checked={isSmartOrder === 'YES'}
                      onChange={() => setIsSmartOrder('YES')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="smartOrder"
                      checked={isSmartOrder === 'NO'}
                      onChange={() => setIsSmartOrder('NO')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <Button
                type="submit"
                isLoading={isCalculating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md shadow-indigo-600/20"
              >
                Calculate
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="font-bold px-8 py-2.5 rounded-xl border-slate-300 text-slate-700"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Right Route Visualizer Box Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[460px] relative overflow-hidden">
            {/* Visual Route */}
            <div className="space-y-6 relative z-10">
              {/* Pickup location pin */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-extrabold text-xs">
                  <MapPin className="w-4 h-4 fill-indigo-600 text-white" />
                  <span>Pickup Location</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {pickupCityState || pickupPincode}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">PIN: {pickupPincode}</span>
              </div>

              {/* Connecting animated line */}
              <div className="flex justify-center relative my-2">
                <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-500 via-indigo-300 to-indigo-600 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute left-1/2 -translate-x-1/2 top-0 animate-ping" />
                </div>
              </div>

              {/* Delivery location pin */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-extrabold text-xs">
                  <MapPin className="w-4 h-4 fill-indigo-600 text-white" />
                  <span>Delivery Location</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {deliveryCityState || deliveryPincode}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">PIN: {deliveryPincode}</span>
              </div>
            </div>

            {/* Illustration SVG Graphic */}
            <div className="pt-6 mt-4 border-t border-slate-100 text-center flex flex-col items-center justify-center">
              <svg viewBox="0 0 200 120" className="w-48 h-auto mx-auto opacity-90">
                <rect x="20" y="70" width="160" height="40" rx="8" fill="#F1F5F9" />
                <path d="M40 70 L60 40 L140 40 L160 70 Z" fill="#E2E8F0" />
                <circle cx="60" cy="95" r="14" fill="#334155" />
                <circle cx="60" cy="95" r="6" fill="#FFFFFF" />
                <circle cx="140" cy="95" r="14" fill="#334155" />
                <circle cx="140" cy="95" r="6" fill="#FFFFFF" />
                <rect x="70" y="30" width="40" height="30" rx="4" fill="#4F46E5" />
                <path d="M90 30 L90 60" stroke="#818CF8" strokeWidth="2" />
                <circle cx="150" cy="25" r="12" fill="#E0E7FF" />
                <path d="M150 18 L150 32 M143 25 L157 25" stroke="#4F46E5" strokeWidth="2" />
              </svg>
              <span className="text-[11px] font-semibold text-slate-500 mt-2">
                Fastest Pan-India Delivery Route
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Results Section */}
      <AnimatePresence>
        {hasCalculated && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Order Details Summary Card (Left Column) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900 font-display pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span>Order Details</span>
                    <button onClick={() => setHasCalculated(false)} className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer">
                      Edit
                    </button>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Pickup From</span>
                      <span className="font-extrabold text-slate-900 font-mono">{pickupPincode}</span>
                    </div>

                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Delivery To</span>
                      <span className="font-extrabold text-slate-900">{deliveryPincode} <span className="text-slate-600 font-semibold">({deliveryCityState})</span></span>
                    </div>

                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Shipment Value</span>
                      <span className="font-extrabold text-slate-900">₹{parseFloat(shipmentValue).toLocaleString('en-IN')}</span>
                    </div>

                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Payment Mode</span>
                      <span className="font-extrabold text-slate-900">{paymentType === 'COD' ? 'Cash on Delivery' : 'Prepaid'}</span>
                    </div>

                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Applicable Weight (in Kg)</span>
                      <span className="font-extrabold text-slate-900">{applicableWeight} Kg</span>
                    </div>

                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Dangerous Goods</span>
                      <span className="font-extrabold text-slate-900">{isDangerousGoods}</span>
                    </div>

                    <div>
                      <span className="block text-slate-600 font-bold uppercase text-[10px] tracking-wider">Secure Shipment</span>
                      <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Yes (Coverage up to ₹4,75,000)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Serviceable Courier Partners (Right Main Column) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  {/* Top Auto-Secured Banner */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-emerald-950 block">Your shipment is Auto Secured</span>
                      <span className="text-emerald-800">You are eligible for full refund on your shipment up to ₹ 4,75,000 in case of damage or transit loss.</span>
                    </div>
                  </div>

                  {/* Filter Tabs & Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <h3 className="text-lg font-black text-slate-900 font-display">
                      Serviceable Courier Partners
                    </h3>

                    <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                      <button
                        onClick={() => setCourierFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          courierFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        All ({quotes.length})
                      </button>
                      <button
                        onClick={() => setCourierFilter('AIR')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          courierFilter === 'AIR' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Air
                      </button>
                      <button
                        onClick={() => setCourierFilter('SURFACE')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          courierFilter === 'SURFACE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Surface
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Showing {filteredQuotes.length} serviceable courier options for route {pickupPincode} → {deliveryPincode}
                  </p>

                  {/* Smarter Courier Selection Radar AI Banner */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-900 font-display">
                        Smarter Courier Selection with Radar
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black tracking-wider uppercase">
                        AI-POWERED
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Uses real-time data of millions of shipments to measure: Current stress at delivery pincode level for each courier, and pincode level rating for each courier.
                    </p>
                  </div>

                  {/* Courier Table Headers */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 text-[10px] font-extrabold uppercase text-slate-600 tracking-wider px-4 pt-2">
                    <div className="col-span-4">Courier Partner</div>
                    <div className="col-span-2 text-center">Rating (Radar AI)</div>
                    <div className="col-span-2 text-center">Estimated Delivery</div>
                    <div className="col-span-2 text-right">Shipment Rate</div>
                    <div className="col-span-2 text-center">Action</div>
                  </div>

                  {/* Courier Cards List */}
                  <div className="space-y-3">
                    {filteredQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        className={`p-4 rounded-2xl border transition-all relative ${
                          quote.recommendation_badge === 'Recommended'
                            ? 'bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                            : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
                        }`}
                      >
                        {quote.recommendation_badge === 'Recommended' && (
                          <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-white" />
                            <span>Recommended</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          {/* Courier Partner Info */}
                          <div className="sm:col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                              {quote.courier_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">
                                {quote.courier_name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {quote.service_name} • {applicableWeight} Kg
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Radar Rating */}
                          <div className="sm:col-span-2 flex sm:justify-center items-center gap-1.5">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-300">
                              4.5
                            </span>
                          </div>

                          {/* Estimated Delivery */}
                          <div className="sm:col-span-2 text-left sm:text-center">
                            <span className="block text-xs font-bold text-slate-800">
                              Sep 11, 2026
                            </span>
                            <span className="block text-[11px] font-bold text-emerald-600">
                              In {quote.estimated_days} Days
                            </span>
                          </div>

                          {/* Shipment Rate */}
                          <div className="sm:col-span-2 text-left sm:text-right">
                            <span className="block text-sm font-black text-slate-900 font-display">
                              ₹{quote.total_rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold" title="Includes GST & COD fee if applicable">
                              GST Included
                            </span>
                          </div>

                          {/* Action Button */}
                          <div className="sm:col-span-2 flex justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleCreateShipment(quote)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl"
                            >
                              Create Shipment
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 font-display">
          Terms &amp; Conditions
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed list-disc pl-4">
          <li>
            Freight charges (GST inclusive) are based on the higher dead/dry or volumetric weight. RTO (return to origin) shipment will be charged differently from the forward delivery rate.
          </li>
          <li>
            Note: The standard courier RTO charge will also apply to their additional weight courier type.
          </li>
          <li>
            Fixed COD charge or COD % of the order value whichever is higher will be taken while calculating the COD fee.
          </li>
          <li>
            Volumetric weight is calculated as LxBxH/5000 for most couriers except Aramex. Measurements (length, breadth, height) should be in centimeters.
          </li>
          <li>
            The maximum liability, if any, is limited to whatever compensation the logistics partner offers to Company in event of a claim raised by the Merchant within one (1) month from the date of such damage or loss or theft.
          </li>
          <li>
            Detailed terms and conditions can be reviewed on our merchant agreement.
          </li>
          <li>
            For queries, write to us on <a href="mailto:support@shipswift.com" className="text-indigo-600 underline font-bold">support@shipswift.com</a>.
          </li>
        </ul>
      </div>
    </div>
  );
};
