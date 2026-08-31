import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, MapPin, Package, CreditCard, ArrowLeft, Plus, Trash2, Wand2, Box, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { warehouses, addOrder, currentSeller } = usePlatformStore();

  const [customerName, setCustomerName] = useState('Aniket Roy');
  const [customerPhone, setCustomerPhone] = useState('+91 9876549988');
  const [customerEmail, setCustomerEmail] = useState('aniket@gmail.com');

  const [rawAddressInput, setRawAddressInput] = useState('');
  const [address1, setAddress1] = useState('Flat 204, Green Valley Heights');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('411001');

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'wh-mumbai');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [weightKg, setWeightKg] = useState('0.8');

  // Volumetric Dimension States
  const [lengthCm, setLengthCm] = useState('20');
  const [widthCm, setWidthCm] = useState('15');
  const [heightCm, setHeightCm] = useState('10');

  const [items, setItems] = useState([
    { sku: 'APX-TSHIRT-L', name: 'Cotton Premium T-Shirt', quantity: 1, unitPrice: 799 }
  ]);

  // Calculations
  const l = parseFloat(lengthCm) || 0;
  const w = parseFloat(widthCm) || 0;
  const h = parseFloat(heightCm) || 0;
  const volumetricWeight = Number(((l * w * h) / 5000).toFixed(2));
  const deadWeight = parseFloat(weightKg) || 0;
  const chargeableWeight = Math.max(deadWeight, volumetricWeight);
  const isVolumetricActive = volumetricWeight > deadWeight;

  // Address AI Parser
  const handleParseAddress = () => {
    if (!rawAddressInput.trim()) {
      toast.error('Please paste a raw address to parse');
      return;
    }
    // Simple intelligent extraction demo
    const pincodeMatch = rawAddressInput.match(/\b\d{6}\b/);
    if (pincodeMatch) setPincode(pincodeMatch[0]);

    if (rawAddressInput.toLowerCase().includes('gurgaon')) {
      setCity('Gurgaon');
      setState('Haryana');
    } else if (rawAddressInput.toLowerCase().includes('mumbai')) {
      setCity('Mumbai');
      setState('Maharashtra');
    } else if (rawAddressInput.toLowerCase().includes('delhi')) {
      setCity('Delhi');
      setState('Delhi');
    }

    setAddress1(rawAddressInput.replace(/\b\d{6}\b/, '').trim());
    toast.success('Address parsed & structured into destination fields!');
  };

  const addItem = () => {
    setItems([...items, { sku: `APX-ITEM-0${items.length + 1}`, name: 'Extra Item', quantity: 1, unitPrice: 499 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalValue = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = addOrder({
        seller_id: currentSeller?.id || 's-101',
        warehouse_id: warehouseId,
        customer_id: `cust-${Date.now()}`,
        source: 'MANUAL',
        payment_type: paymentType,
        cod_amount: paymentType === 'COD' ? totalValue : 0,
        total_amount: totalValue,
        weight_kg: chargeableWeight,
        length_cm: l,
        width_cm: w,
        height_cm: h,
        shipping_address: {
          name: customerName,
          phone: customerPhone,
          address_line1: address1,
          city,
          state,
          pincode,
        },
        items: items.map((it, i) => ({
          id: `item-${Date.now()}-${i}`,
          order_id: '',
          sku: it.sku,
          name: it.name,
          quantity: it.quantity,
          unit_price: it.unitPrice,
        })),
        current_status: 'NEW',
      });

      toast.success(`Order #${created.id} created successfully! Total: ₹${totalValue}`);
      navigate('/app/orders');
    } catch (err: any) {
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <button onClick={() => navigate('/app/orders')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <h2 className="text-base font-extrabold text-slate-900 font-display">Create Manual Order</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
            <User className="w-5 h-5 text-indigo-600" /> Customer Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            <Input label="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
            <Input label="Email Address" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </div>
        </div>

        {/* Destination Address + AI Parser */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <MapPin className="w-5 h-5 text-indigo-600" /> Destination Address
            </h3>
            <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Serviceable by All 4 Carriers
            </span>
          </div>

          {/* AI Parser Input */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <label className="block text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> Smart 1-Click Address Parser
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste raw address (e.g. Flat 402, Sunshine Apts, MG Road, Gurgaon 122002)..."
                value={rawAddressInput}
                onChange={(e) => setRawAddressInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <Button type="button" size="sm" onClick={handleParseAddress} className="font-bold text-xs">
                Auto-Extract
              </Button>
            </div>
          </div>

          <Input label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>
        </div>

        {/* Product Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <Package className="w-5 h-5 text-indigo-600" /> Products in Order
            </h3>
            <Button type="button" size="sm" variant="outline" className="text-xs font-bold" onClick={addItem} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="col-span-2 sm:col-span-3">
                  <Input label="SKU" value={item.sku} onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].sku = e.target.value;
                    setItems(newItems);
                  }} />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <Input label="Item Name" value={item.name} onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].name = e.target.value;
                    setItems(newItems);
                  }} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Input label="Qty" type="number" value={item.quantity} onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = parseInt(e.target.value) || 1;
                    setItems(newItems);
                  }} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Input label="Price (₹)" type="number" value={item.unitPrice} onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                  }} />
                </div>
                <div className="col-span-2 sm:col-span-1 text-right sm:text-center">
                  <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volumetric Calculator & Box Scaler */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
            <Box className="w-5 h-5 text-indigo-600" /> Interactive Volumetric Weight Calculator
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Dimensions Form Inputs */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="Dead Weight (Kg)" type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              <Input label="Length (cm)" type="number" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} />
              <Input label="Width (cm)" type="number" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} />
              <Input label="Height (cm)" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>

            {/* Live 3D Box Scaler Graphic */}
            <div className="md:col-span-4 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Visual Box Preview</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isVolumetricActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {isVolumetricActive ? 'Volumetric Billed' : 'Dead Weight Billed'}
                </span>
              </div>

              {/* Scaled Box Box Graphic */}
              <div className="h-20 flex items-center justify-center">
                <div
                  className="bg-indigo-600/30 border-2 border-indigo-400 rounded-xl transition-all duration-300 flex items-center justify-center font-mono font-bold text-xs text-indigo-200"
                  style={{
                    width: `${Math.min(100, Math.max(40, l * 2.5))}px`,
                    height: `${Math.min(70, Math.max(30, h * 2.5))}px`,
                  }}
                >
                  {l}x{w}x{h} cm
                </div>
              </div>

              <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Volumetric Weight:</span>
                <strong className="text-indigo-400 font-mono">{volumetricWeight} kg</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Final Billed Weight:</span>
                <strong className="text-emerald-400 font-mono text-sm">{chargeableWeight} kg</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Payment &amp; Pickup Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Pickup Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
            />
            <Select
              label="Payment Mode"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as any)}
              options={[
                { value: 'PREPAID', label: 'Prepaid' },
                { value: 'COD', label: 'Cash On Delivery' },
              ]}
            />
            <Input
              label="COD Collectible (₹)"
              type="number"
              value={paymentType === 'COD' ? totalValue : 0}
              disabled={paymentType === 'PREPAID'}
            />
          </div>
        </div>

        {/* Footer Summary & Submit */}
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="block text-xs text-slate-500 font-bold uppercase">Total Order Value</span>
            <span className="block text-3xl font-black text-emerald-600 font-display">₹{totalValue}</span>
          </div>

          <Button type="submit" size="lg" className="font-bold">
            Save &amp; Create Order
          </Button>
        </div>
      </form>
    </div>
  );
};


