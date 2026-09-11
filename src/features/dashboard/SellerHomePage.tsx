import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wallet,
  PlusCircle,
  Upload,
  Calculator,
  MapPin,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Scale
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';
import { rateEngine } from '../../services/couriers/rateEngine';
import { getOfflinePincodeDetails } from '../../services/pincodeService';
import { RateQuote } from '../../types';
import { toast } from 'sonner';

export const SellerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    walletBalance,
    currentSeller,
    warehouses,
    orders,
    shipments,
    couriers,
    ndrCases,
    isLoadingData,
    loadSupabaseData,
  } = usePlatformStore();

  const [pickupPincode, setPickupPincode] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [weightKg, setWeightKg] = useState<number | string>(0.5);
  const [itemPrice, setItemPrice] = useState<number | string>(1000);
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [isCalculating, setIsCalculating] = useState(false);
  const [quotes, setQuotes] = useState<RateQuote[]>([]);

  const isPickupValid = /^\d{6}$/.test(pickupPincode.trim());
  const isDeliveryValid = /^\d{6}$/.test(deliveryPincode.trim());
  const areBothPincodesValid = isPickupValid && isDeliveryValid;

  const pickupLocation = useMemo(() => {
    if (isPickupValid) {
      const details = getOfflinePincodeDetails(pickupPincode.trim());
      if (details.isValid && details.city && details.state) {
        return `${details.city}, ${details.state}`;
      }
    }
    return '';
  }, [pickupPincode, isPickupValid]);

  const deliveryLocation = useMemo(() => {
    if (isDeliveryValid) {
      const details = getOfflinePincodeDetails(deliveryPincode.trim());
      if (details.isValid && details.city && details.state) {
        return `${details.city}, ${details.state}`;
      }
    }
    return '';
  }, [deliveryPincode, isDeliveryValid]);

  const tasks = [
    {
      title: 'Add a warehouse',
      complete: warehouses.length > 0,
      detail: warehouses.length > 0 ? `${warehouses.length} warehouse${warehouses.length === 1 ? '' : 's'} available` : 'A pickup warehouse is required before shipping.',
      action: 'Manage warehouses',
      path: '/app/settings',
    },
    {
      title: 'Complete business verification',
      complete: currentSeller?.status === 'ACTIVE',
      detail: currentSeller ? `Current account status: ${currentSeller.status.replace(/_/g, ' ')}` : 'Seller record is not available.',
      action: 'Open settings',
      path: '/app/settings',
    },
    {
      title: 'Create an order',
      complete: orders.length > 0,
      detail: orders.length > 0 ? `${orders.length} order${orders.length === 1 ? '' : 's'} in the database` : 'No orders found for this seller.',
      action: 'Create order',
      path: '/app/orders/new',
    },
  ];
  const completedTasks = tasks.filter((task) => task.complete).length;

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5),
    [orders],
  );

  const handleCalculate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!areBothPincodesValid) {
      toast.error('Enter valid 6-digit pickup and delivery pincodes.');
      return;
    }
    const numWeight = parseFloat(String(weightKg)) || 0.5;
    if (numWeight <= 0) {
      toast.error('Please enter a valid package weight greater than 0 kg.');
      return;
    }
    const numPrice = Math.max(0, parseFloat(String(itemPrice)) || 0);

    if (!currentSeller?.id) {
      toast.error('No seller is selected.');
      return;
    }

    setIsCalculating(true);
    setQuotes([]);
    try {
      const liveQuotes = await rateEngine.fetchComparisonQuotes({
        sellerId: currentSeller.id,
        pickupPincode: pickupPincode.trim(),
        deliveryPincode: deliveryPincode.trim(),
        weightKg: numWeight,
        paymentType,
        orderValue: numPrice,
      });
      setQuotes(liveQuotes.sort((a, b) => a.total_rate - b.total_rate));
      if (liveQuotes.length === 0) toast.info('No live rate slabs are configured for this route.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load live rates.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBookQuote = (quote: RateQuote) => {
    navigate('/app/orders/new', {
      state: {
        pickupPincode: pickupPincode.trim(),
        deliveryPincode: deliveryPincode.trim(),
        weightKg: parseFloat(String(weightKg)) || 0.5,
        paymentType,
        orderValue: Math.max(0, parseFloat(String(itemPrice)) || 0),
        estimatedRate: quote.total_rate,
        selectedCourierName: quote.courier_name,
      }
    });
  };

  return (
    <div className="w-full space-y-6 pb-12 text-slate-900">
      {/* Welcome Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display">
            {currentSeller?.brand_name || currentSeller?.company_name || 'Seller workspace'}
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Operational dashboard and cross-service management center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/orders/new">
            <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />} className="font-bold text-xs">
              New Order
            </Button>
          </Link>
          <Button variant="outline" onClick={() => loadSupabaseData()} disabled={isLoadingData} className="text-xs font-bold">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin text-indigo-600' : ''}`} />
            {isLoadingData ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* QUICK ACTIONS HUB - Seamless Inter-page connectivity */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-indigo-100/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 font-display">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Quick Operational Actions
          </span>
          <span className="text-[11px] text-indigo-600 font-bold">1-Click Page Jump</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 xs:gap-2.5">
          <Link
            to="/app/orders/new"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">New Order</span>
          </Link>

          <Link
            to="/app/orders/import"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">Import CSV</span>
          </Link>

          <Link
            to="/app/rate-calculator"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">Rate Calc</span>
          </Link>

          <Link
            to="/app/shipments"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">Shipments</span>
          </Link>

          <Link
            to="/app/tracking"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">Track AWB</span>
          </Link>

          <Link
            to="/app/ndr"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer relative"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">NDR Hub</span>
            {ndrCases.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </Link>

          <Link
            to="/app/wallet"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">Recharge</span>
          </Link>

          <Link
            to="/app/settings"
            className="flex flex-col items-center justify-center p-2.5 xs:p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group text-center cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] xs:text-xs font-bold text-slate-800">Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: 'Wallet balance', value: `₹${walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: Wallet, link: '/app/wallet' },
          { label: 'Orders', value: orders.length.toLocaleString('en-IN'), icon: Package, link: '/app/orders' },
          { label: 'Shipments', value: shipments.length.toLocaleString('en-IN'), icon: Truck, link: '/app/shipments' },
          { label: 'Active couriers', value: couriers.filter((courier) => courier.is_active).length.toLocaleString('en-IN'), icon: ShieldCheck, link: '/app/rate-calculator' },
        ].map(({ label, value, icon: Icon, link }) => (
          <Link
            key={label}
            to={link}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer block overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 shrink-0" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-base sm:text-xl font-black truncate">{isLoadingData ? '—' : value}</div>
            <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Account Setup Progress */}
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs xl:col-span-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black font-display">Account setup</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Status is calculated from live seller, warehouse and order records.</p>
            </div>
            <span className="text-xs font-bold text-slate-600">{completedTasks} of {tasks.length} complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${(completedTasks / tasks.length) * 100}%` }} />
          </div>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={task.title} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black ${task.complete ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-slate-300 bg-white text-slate-600'}`}>
                    {task.complete ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black">{task.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{task.detail}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate(task.path)} className="w-full sm:w-auto shrink-0 text-xs font-bold justify-center">{task.action}</Button>
              </div>
            ))}
          </div>
        </section>

        {/* Live Shipping Rates Card */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-display">Live shipping rates</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Instant multi-courier rate check.</p>
            </div>
            <Link to="/app/rate-calculator" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>Full Calc</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <form onSubmit={handleCalculate} className="space-y-3.5">
            {/* ROW 1: Pickup & Delivery Pincodes (2 details in 1 row) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Pickup Pincode */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
                    Pickup PIN
                  </label>
                  {pickupLocation ? (
                    <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[90px]" title={pickupLocation}>
                      ✓ {pickupLocation}
                    </span>
                  ) : warehouses.length > 0 && warehouses[0].pincode && !pickupPincode ? (
                    <button
                      type="button"
                      onClick={() => setPickupPincode(warehouses[0].pincode)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer truncate max-w-[80px]"
                      title={`Use ${warehouses[0].name} (${warehouses[0].pincode})`}
                    >
                      Use WH
                    </button>
                  ) : null}
                </div>
                <Input
                  value={pickupPincode}
                  maxLength={6}
                  onChange={(event) => {
                    const val = event.target.value.replace(/\D/g, '');
                    setPickupPincode(val);
                    if (quotes.length > 0) setQuotes([]);
                  }}
                  placeholder="6-digit PIN"
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>

              {/* Delivery Pincode */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
                    Delivery PIN
                  </label>
                  {deliveryLocation && (
                    <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[90px]" title={deliveryLocation}>
                      ✓ {deliveryLocation}
                    </span>
                  )}
                </div>
                <Input
                  value={deliveryPincode}
                  maxLength={6}
                  onChange={(event) => {
                    const val = event.target.value.replace(/\D/g, '');
                    setDeliveryPincode(val);
                    if (quotes.length > 0) setQuotes([]);
                  }}
                  placeholder="6-digit PIN"
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>
            </div>

            {/* Prompt when pincodes not yet filled */}
            {!areBothPincodesValid && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Fill both 6-digit pincodes above to enter item weight &amp; price.</span>
              </div>
            )}

            {/* Revealed when both pincodes filled correctly */}
            {areBothPincodesValid && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 transition-all">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-100/80">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Scale className="w-3.5 h-3.5 text-indigo-600" /> Package Specifications
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pincodes Set
                  </span>
                </div>

                {/* ROW 2: Weight of Item & Price of Item (2 details in 1 row) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Weight of Item */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 truncate">Weight (kg)</label>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">
                        {weightKg || 0} kg
                      </span>
                    </div>
                    <Input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => {
                        setWeightKg(e.target.value);
                        if (quotes.length > 0) setQuotes([]);
                      }}
                      placeholder="0.5"
                      leftIcon={<Scale className="w-3.5 h-3.5 text-slate-400" />}
                    />
                    {/* Quick Weight Chips */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {[0.5, 1.0, 2.0, 5.0].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            setWeightKg(w);
                            if (quotes.length > 0) setQuotes([]);
                          }}
                          className={`flex-1 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            Number(weightKg) === w
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {w}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price of Item */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 truncate">Price / Value (₹)</label>
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        ₹{Number(itemPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="50"
                      value={itemPrice}
                      onChange={(e) => {
                        setItemPrice(e.target.value);
                        if (quotes.length > 0) setQuotes([]);
                      }}
                      placeholder="1000"
                      leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
                    />
                    {/* Quick Price Chips */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {[500, 1000, 2000, 5000].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setItemPrice(p);
                            if (quotes.length > 0) setQuotes([]);
                          }}
                          className={`flex-1 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            Number(itemPrice) === p
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          ₹{p >= 1000 ? `${p / 1000}k` : p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('PREPAID');
                        if (quotes.length > 0) setQuotes([]);
                      }}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'PREPAID'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Prepaid
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('COD');
                        if (quotes.length > 0) setQuotes([]);
                      }}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'COD'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      COD
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isCalculating} className="w-full justify-center text-xs font-bold shadow-xs">
                  {isCalculating ? 'Loading live rates…' : 'Calculate rates'}
                </Button>
              </div>
            )}
          </form>
          {quotes.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              {quotes.slice(0, 3).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="font-black text-slate-900">{quote.courier_name}</div>
                    <div className="mt-0.5 text-slate-500">{quote.estimated_days} day estimate</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center font-black text-emerald-700 font-mono">
                      <IndianRupee className="h-3 w-3" />{quote.total_rate.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleBookQuote(quote)}
                      title="Book this rate"
                      className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Orders List */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black font-display">Recent orders</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Latest records loaded from the orders table.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/app/orders')} className="text-xs font-bold">View all</Button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
            <Building2 className="mx-auto mb-3 h-7 w-7 text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No orders found</p>
            <p className="mt-1 text-xs text-slate-500">Create an order to see live activity here.</p>
            <div className="mt-4">
              <Link to="/app/orders/new">
                <Button size="sm" className="font-bold text-xs" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Create First Order
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex flex-col gap-3 p-3.5 sm:p-4 sm:grid sm:grid-cols-[1.2fr_1fr_auto_auto] sm:items-center hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center justify-between sm:block">
                  <div>
                    <div className="text-xs font-black text-slate-900 truncate max-w-[200px] xs:max-w-none">{order.external_order_id || order.id}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{order.payment_type} · ₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="sm:hidden shrink-0">
                    <StatusBadge status={order.current_status} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-500">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(order.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div className="hidden sm:block">
                  <StatusBadge status={order.current_status} />
                </div>
                <div className="flex items-center gap-2">
                  {(order.current_status === 'NEW' || order.current_status === 'CONFIRMED') ? (
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/app/orders?shipOrderId=${order.id}`)}
                      className="w-full sm:w-auto text-xs font-bold py-1 px-2.5 h-7 justify-center"
                    >
                      Ship Now
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate('/app/shipments')}
                      className="w-full sm:w-auto text-xs font-bold py-1 px-2.5 h-7 justify-center"
                    >
                      Shipment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
