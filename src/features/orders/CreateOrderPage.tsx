import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Box, CheckCircle2, ChevronDown, CreditCard, MapPin, Package, Plus, Trash2, User, Wand2, Upload, Calculator, Sparkles, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { usePlatformStore } from '../../services/store';
import { usePincodeLookup } from '../../hooks/usePincodeLookup';

type DraftItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

interface RatePrefillState {
  pickupPincode?: string;
  deliveryPincode?: string;
  weightKg?: number;
  paymentType?: 'PREPAID' | 'COD';
  estimatedRate?: number;
  selectedCourierName?: string;
}

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const statePrefill = location.state as RatePrefillState | undefined;
  const { warehouses, addOrder, currentSeller } = usePlatformStore();

  const [externalOrderId, setExternalOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rawAddressInput, setRawAddressInput] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const {
    pincode,
    setPincode,
    status: pincodeStatus,
    result: pincodeResult,
    errorMsg: pincodeErrorMsg,
    isLoading: isVerifyingPincode,
    isSuccess: isPincodeVerified,
  } = usePincodeLookup({
    initialPincode: statePrefill?.deliveryPincode || '',
    onVerified: (data) => {
      if (data.city) setCity(data.city);
      if (data.state) setState(data.state);
    },
  });

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>(statePrefill?.paymentType || 'PREPAID');
  const [weightKg, setWeightKg] = useState(statePrefill?.weightKg ? statePrefill.weightKg.toString() : '');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [showPackagingGuide, setShowPackagingGuide] = useState(true);
  const [items, setItems] = useState<DraftItem[]>([{ sku: '', name: '', quantity: 1, unitPrice: 0 }]);

  React.useEffect(() => {
    if (warehouses.length > 0 && !warehouses.some((warehouse) => warehouse.id === warehouseId)) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouseId, warehouses]);

  const length = Number(lengthCm) || 0;
  const width = Number(widthCm) || 0;
  const height = Number(heightCm) || 0;
  const deadWeight = Number(weightKg) || 0;
  const volumetricWeight = Number(((length * width * height) / 5000).toFixed(2));
  const chargeableWeight = Math.max(deadWeight, volumetricWeight);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const packagingGuides = [
    { title: 'Fit', image: '/pack-guide-fit-v2.png', description: 'Choose a package that fits the product closely without crushing it.' },
    { title: 'Fill', image: '/pack-guide-fill-v2.png', description: 'Fill empty space so the item cannot shift while in transit.' },
    { title: 'Secure', image: '/pack-guide-secure-v2.png', description: 'Seal the center seam and exposed edges with strong packing tape.' },
    { title: 'Measure', image: '/pack-guide-measure-v2.png', description: 'Measure the outside of the final sealed package, not the product.' },
  ];

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const handleParseAddress = () => {
    const rawAddress = rawAddressInput.trim();
    if (!rawAddress) {
      toast.error('Please paste an address first');
      return;
    }

    const pincodeMatch = rawAddress.match(/\b[1-9]\d{5}\b/) || rawAddress.match(/\b\d{6}\b/);
    if (pincodeMatch) {
      setPincode(pincodeMatch[0]);
    } else {
      const lowerAddress = rawAddress.toLowerCase();
      if (lowerAddress.includes('gurgaon') || lowerAddress.includes('gurugram')) {
        setCity('Gurgaon');
        setState('Haryana');
      } else if (lowerAddress.includes('mumbai')) {
        setCity('Mumbai');
        setState('Maharashtra');
      } else if (lowerAddress.includes('delhi')) {
        setCity('Delhi');
        setState('Delhi');
      } else if (lowerAddress.includes('pune')) {
        setCity('Pune');
        setState('Maharashtra');
      }
    }

    setAddress1(rawAddress.replace(/\b\d{6}\b/, '').trim());
    toast.success('Address extracted from text');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const activeSellerId = currentSeller?.id || '32d724db-23c4-4cba-a76f-f78e4022194e';

    if (!warehouseId) {
      toast.error('Please add/select a pickup warehouse before creating an order');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Please enter a valid 6 digit delivery pincode');
      return;
    }
    if (chargeableWeight <= 0) {
      toast.error('Please enter package weight or dimensions');
      return;
    }
    if (!items.every((item) => item.sku.trim() && item.name.trim() && item.quantity > 0 && item.unitPrice >= 0)) {
      toast.error('Please complete product SKU, name, quantity and price');
      return;
    }

    try {
      const created = addOrder({
        seller_id: activeSellerId,
        warehouse_id: warehouseId,
        customer_id: '',
        external_order_id: externalOrderId.trim() || undefined,
        source: 'MANUAL',
        payment_type: paymentType,
        cod_amount: paymentType === 'COD' ? totalValue : 0,
        total_amount: totalValue,
        weight_kg: chargeableWeight,
        length_cm: length || undefined,
        width_cm: width || undefined,
        height_cm: height || undefined,
        shipping_address: {
          name: customerName,
          phone: customerPhone,
          address_line1: address1,
          city,
          state,
          pincode,
        },
        items: items.map((item) => ({
          id: '',
          order_id: '',
          sku: item.sku.trim(),
          name: item.name.trim(),
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
        current_status: 'NEW',
      });

      toast.success(`Order #${created.external_order_id || created.id} created. Total: Rs ${totalValue.toLocaleString('en-IN')}`);
      navigate('/app/orders');
    } catch {
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader with Page Cross-Links */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app/orders')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>
          <h2 className="text-base font-extrabold text-slate-900 font-display">Create Manual Order</h2>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/app/orders/import">
            <Button size="sm" variant="outline" className="text-xs font-bold" leftIcon={<Upload className="w-3.5 h-3.5" />}>
              Import CSV Instead
            </Button>
          </Link>
          <Link to="/app/rate-calculator">
            <Button size="sm" variant="outline" className="text-xs font-bold" leftIcon={<Calculator className="w-3.5 h-3.5" />}>
              Rate Calculator
            </Button>
          </Link>
        </div>
      </div>

      {/* Rate Calculator Prefill Notification Banner */}
      {statePrefill && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-950 font-semibold shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-extrabold text-indigo-900 block">
                Pre-filled from Shipping Rate Calculator
              </span>
              <span className="text-indigo-700">
                Pincode {statePrefill.deliveryPincode} · Weight {statePrefill.weightKg} kg · {statePrefill.selectedCourierName ? `Estimated courier: ${statePrefill.selectedCourierName}` : ''} {statePrefill.estimatedRate ? `(₹${statePrefill.estimatedRate.toFixed(2)})` : ''}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/rate-calculator')}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
          >
            Re-calculate
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
            <User className="w-5 h-5 text-indigo-600" /> Customer Details
          </h3>
          <Input label="External Order ID" value={externalOrderId} onChange={(event) => setExternalOrderId(event.target.value)} placeholder="Optional marketplace/store order ID" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Full Name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
            <Input label="Phone Number" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required />
            <Input label="Email Address" type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <MapPin className="w-5 h-5 text-indigo-600" /> Destination Address
            </h3>
            <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Rates checked during shipment creation
            </span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <label className="block text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> Address helper
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste complete delivery address to extract pincode/city when present"
                value={rawAddressInput}
                onChange={(event) => setRawAddressInput(event.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <Button type="button" size="sm" onClick={handleParseAddress} className="font-bold text-xs">
                Extract
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Pincode"
              value={pincode}
              onChange={(event) => setPincode(event.target.value)}
              placeholder="e.g. 110001"
              maxLength={6}
              required
              rightIcon={
                isVerifyingPincode ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : isPincodeVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : pincodeStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : undefined
              }
              error={pincodeErrorMsg || undefined}
              helperText={
                isVerifyingPincode
                  ? 'Verifying with India Post...'
                  : isPincodeVerified && pincodeResult
                  ? `✓ Verified: ${pincodeResult.city}, ${pincodeResult.state}`
                  : 'Enter 6 digits to verify'
              }
            />
            <Input
              label="City"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Auto-filled from pincode"
              required
            />
            <Input
              label="State"
              value={state}
              onChange={(event) => setState(event.target.value)}
              placeholder="Auto-filled from pincode"
              required
            />
          </div>

          {isPincodeVerified && pincodeResult?.localities && pincodeResult.localities.length > 0 && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1.5 animate-fadeIn">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                Suggested post offices / localities for PIN {pincode}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pincodeResult.localities.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      if (!address1.includes(loc)) {
                        setAddress1((prev) => (prev ? `${prev}, ${loc}` : loc));
                        toast.info(`Added "${loc}" to Address`);
                      }
                    }}
                    className="text-xs bg-white hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                  >
                    + {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Address Line 1"
            value={address1}
            onChange={(event) => setAddress1(event.target.value)}
            placeholder="Flat/House no., building, street name"
            required
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <Package className="w-5 h-5 text-indigo-600" /> Products in Order
            </h3>
            <Button type="button" size="sm" variant="outline" className="text-xs font-bold" onClick={() => setItems([...items, { sku: '', name: '', quantity: 1, unitPrice: 0 }])} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="col-span-2 sm:col-span-3">
                  <Input label="SKU" value={item.sku} onChange={(event) => updateItem(index, { sku: event.target.value })} required />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <Input label="Item Name" value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} required />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Input label="Qty" type="number" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) || 1 })} required />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Input label="Price (Rs)" type="number" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) || 0 })} required />
                </div>
                <div className="col-span-2 sm:col-span-1 text-right sm:text-center">
                  <button type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer" disabled={items.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
            <Box className="w-5 h-5 text-indigo-600" /> Package Weight
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input label="Dead Weight (Kg)" type="number" step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} required />
            <Input label="Length (cm)" type="number" value={lengthCm} onChange={(event) => setLengthCm(event.target.value)} />
            <Input label="Width (cm)" type="number" value={widthCm} onChange={(event) => setWidthCm(event.target.value)} />
            <Input label="Height (cm)" type="number" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-black text-emerald-900">Applicable weight: {chargeableWeight.toFixed(2)} kg</p>
              <p className="mt-0.5 text-xs font-medium text-emerald-700">
                Couriers charge the higher of dead weight and volumetric weight. Current basis: {volumetricWeight > deadWeight ? 'volumetric weight' : 'dead weight'}.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              aria-expanded={showPackagingGuide}
              onClick={() => setShowPackagingGuide((current) => !current)}
              className="flex w-full items-center justify-between py-1 text-left"
            >
              <span>
                <span className="text-sm font-black text-slate-900">Pack like a pro</span>
                <span className="ml-1 text-xs font-medium text-slate-500">Guidelines for packaging and measuring</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                {showPackagingGuide ? 'Hide guide' : 'Show guide'}
                <ChevronDown className={`h-4 w-4 transition-transform ${showPackagingGuide ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {showPackagingGuide && (
              <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:grid-cols-2 xl:grid-cols-4">
                {packagingGuides.map((guide, index) => (
                  <article key={guide.title} className={`p-4 text-center ${index > 0 ? 'border-t border-slate-200 sm:border-t-0 sm:[&:nth-child(odd)]:border-l xl:border-l' : ''} ${index === 2 ? 'sm:border-t xl:border-t-0' : ''}`}>
                    <img
                      src={guide.image}
                      alt={`${guide.title} packaging: correct and incorrect examples`}
                      className="aspect-[4/3] w-full rounded-lg bg-white object-cover"
                    />
                    <h4 className="mt-3 text-sm font-black text-slate-900"><span className="mr-1 text-slate-400">{index + 1}.</span>{guide.title}</h4>
                    <p className="mx-auto mt-1 max-w-xs text-xs font-medium leading-5 text-slate-600">{guide.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Payment & Pickup Options
            </h3>
            <Link to="/app/settings" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Manage Warehouses</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Pickup Warehouse"
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              options={warehouses.map((warehouse) => ({ value: warehouse.id, label: `${warehouse.name} (${warehouse.pincode})` }))}
            />
            <Select
              label="Payment Mode"
              value={paymentType}
              onChange={(event) => setPaymentType(event.target.value as 'PREPAID' | 'COD')}
              options={[
                { value: 'PREPAID', label: 'Prepaid' },
                { value: 'COD', label: 'Cash On Delivery' },
              ]}
            />
            <Input label="COD Collectible (Rs)" type="number" value={paymentType === 'COD' ? totalValue : 0} disabled />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="block text-xs text-slate-500 font-bold uppercase">Total Order Value</span>
            <span className="block text-3xl font-black text-emerald-600 font-display">Rs {totalValue.toLocaleString('en-IN')}</span>
          </div>

          <Button type="submit" size="lg" className="font-bold">
            Save & Create Order
          </Button>
        </div>
      </form>
    </div>
  );
};
