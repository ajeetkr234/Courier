import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Search, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { usePincodeLookup } from '../../hooks/usePincodeLookup';
import { usePlatformStore } from '../../services/store';

const steps = [
  { label: 'Buyer', caption: 'Pickup contact' },
  { label: 'Warehouse', caption: 'Return destination' },
  { label: 'Reason', caption: 'Items & cause' },
  { label: 'Package', caption: 'Weight & review' },
];

export const NewReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, warehouses, shipments, loadSupabaseData, createReturnRequest } = usePlatformStore();
  const [lookup, setLookup] = useState('');
  const [orderId, setOrderId] = useState('');
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('Size mismatch');
  const [returnCause, setReturnCause] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [buyerPhone,setBuyerPhone]=useState(''),[firstName,setFirstName]=useState(''),[lastName,setLastName]=useState(''),[buyerEmail,setBuyerEmail]=useState('');
  const [pickupAddress,setPickupAddress]=useState(''),[landmark,setLandmark]=useState(''),[pickupCity,setPickupCity]=useState(''),[pickupState,setPickupState]=useState(''),[country,setCountry]=useState('India');
  const {
    pincode: pickupPincode,
    setPincode: setPickupPincode,
    verify: verifyPickupPincode,
    status: pincodeStatus,
    result: pincodeResult,
    errorMsg: pincodeError,
  } = usePincodeLookup({
    onVerified: (data) => {
      setPickupCity(data.city || '');
      setPickupState(data.state || '');
    },
  });

  useEffect(() => { void loadSupabaseData(); }, [loadSupabaseData]);
  const order = orders.find((item) => item.id === orderId)!;
  const warehouse = warehouses.find((item) => item.id === order?.warehouse_id);
  const canContinue = useMemo(() => Boolean(order), [order]);

  const findOrder = () => {
    const query = lookup.trim().toLowerCase();
    const shipment = shipments.find((item) => item.awb_number?.toLowerCase() === query);
    const found = orders.find((item) => item.id.toLowerCase() === query || item.external_order_id?.toLowerCase() === query || item.id === shipment?.order_id);
    if (!found) { toast.error('Delivered order ID or AWB not found'); return; }
    setOrderId(found.id); setStep(1);
    const fullName=String(found.shipping_address.name||'').trim().split(/\s+/); setFirstName(fullName.shift()||''); setLastName(fullName.join(' '));
    setBuyerPhone(String(found.shipping_address.phone||'').replace(/\D/g,'').slice(-10)); setBuyerEmail(String((found.shipping_address as any).email||''));
    setPickupAddress(found.shipping_address.address_line1||''); setLandmark(String((found.shipping_address as any).landmark||'')); setPickupPincode(found.shipping_address.pincode||''); setPickupCity(found.shipping_address.city||''); setPickupState(found.shipping_address.state||'');
    setWeight(String(found.weight_kg || '')); setLength(String(found.length_cm || ''));
    setWidth(String(found.width_cm || '')); setHeight(String(found.height_cm || ''));
    toast.success('Order details loaded');
  };

  const next = async () => {
    if (step === 1) {
      const verifiedPincode = pincodeResult?.pincode === pickupPincode
        ? pincodeResult
        : await verifyPickupPincode(pickupPincode);
      if (!/^[6-9]\d{9}$/.test(buyerPhone) || !firstName.trim() || !pickupAddress.trim() || !verifiedPincode?.city || !verifiedPincode.state) {
        toast.error(!verifiedPincode ? 'Enter a valid buyer pincode to auto-fill city and state' : 'Complete all required buyer pickup details');
        return;
      }
    }
    if (!order) { toast.error('Find the original order to continue after entering buyer details'); return; }
    if (step === 3 && returnCause.trim().length < 10) { toast.error('Describe the return cause in at least 10 characters'); return; }
    setStep((current) => Math.min(4, current + 1));
  };

  const submit = () => {
    if (!order || returnCause.trim().length < 10) return;
    createReturnRequest(order.id, `${reason}: ${returnCause.trim()}`, { phone:buyerPhone, first_name:firstName.trim(), last_name:lastName.trim(), email:buyerEmail.trim(), address:pickupAddress.trim(), landmark:landmark.trim(), pincode:pickupPincode, city:pickupCity.trim(), state:pickupState.trim(), country });
    toast.success('Return request created successfully');
    navigate('/app/returns');
  };

  return <div className="mx-auto grid max-w-7xl gap-5 pb-16 lg:grid-cols-[150px_minmax(0,1fr)]">
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
      <div className="flex items-center gap-3">
        <button aria-label="Back to returns" onClick={() => navigate('/app/returns')} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><ArrowLeft className="h-5 w-5" /></button>
        <div><h1 className="text-xl font-black text-slate-950">Create return</h1><p className="mt-0.5 text-xs font-medium text-slate-500">Start a reverse pickup for a delivered order</p></div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Secure reverse logistics</div>
    </header>

    <div className="flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-bold lg:col-span-2"><button className="bg-indigo-50 px-4 py-2 text-indigo-700">Single Order</button><button className="border-l border-slate-200 px-4 py-2 text-slate-600" onClick={()=>toast.info('Bulk returns can be uploaded from the returns list')}>Bulk Order</button></div>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:row-span-2 lg:min-h-[360px]">
      <div className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-5">
        {steps.map((item, index) => { const number=index+1, active=step===number, complete=step>number; return <button key={item.label} type="button" disabled={!canContinue} onClick={()=>setStep(number)} className="group relative flex flex-col items-center text-center disabled:cursor-default lg:flex-row lg:text-left">
          {index<3&&<span className={`absolute left-1/2 top-4 h-0.5 w-full lg:hidden ${complete?'bg-emerald-400':'bg-slate-200'}`} />}
          <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-black transition ${complete?'border-emerald-500 bg-emerald-500 text-white':active?'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200':'border-slate-200 bg-white text-slate-400'}`}>{complete?<Check className="h-4 w-4"/>:number}</span>
          <span className={`mt-2 text-[11px] font-extrabold sm:text-xs ${active?'text-indigo-700':complete?'text-emerald-700':'text-slate-500'}`}>{item.label}</span>
          <span className="mt-0.5 hidden text-[10px] text-slate-400 sm:block lg:hidden">{item.caption}</span>
        </button>})}
      </div>
    </section>

    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-4 shadow-sm sm:p-5 lg:col-start-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><Search className="h-4 w-4"/></span><div><h2 className="text-sm font-black text-slate-900">Find original order</h2><p className="text-xs text-slate-500">Buyer, product and package details will be auto-filled.</p></div></div></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl"><input value={lookup} onChange={e=>setLookup(e.target.value)} onKeyDown={e=>e.key==='Enter'&&findOrder()} placeholder="Enter delivered Order ID or AWB" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/><Button onClick={findOrder} className="sm:min-w-28">Find order</Button></div>
      </div>
    </section>

    <div className="grid items-start gap-5 lg:col-start-2 xl:grid-cols-[minmax(0,1fr)_320px]">
      <main className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <>
          {step===1&&<div className="space-y-7"><SectionTitle number="01" title="Buyer Details" subtitle="Confirm or correct the reverse-pickup contact and address."/><section className="space-y-5"><h3 className="text-sm font-black text-slate-900">From whom is the return being picked up? <span className="font-medium text-slate-500">(Buyer's Info)</span></h3><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div><label className="mb-1 block text-xs font-bold text-slate-700">Mobile Number</label><div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"><span className="grid w-12 place-items-center bg-slate-50 text-xs font-bold text-slate-500">+91</span><input value={buyerPhone} onChange={e=>setBuyerPhone(e.target.value.replace(/\D/g,'').slice(0,10))} inputMode="numeric" placeholder="Enter buyer's phone number" className="min-w-0 flex-1 px-3 text-sm outline-none"/></div></div><Input label="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Enter first name" required/><Input label="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Enter last name"/><Input label="Email ID (Optional)" type="email" value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} placeholder="i.e. abc@gmail.com"/></div></section><hr className="border-slate-200"/><section className="space-y-5"><h3 className="text-sm font-black text-slate-900">Where is the return being picked from? <span className="font-medium text-slate-500">(Buyer's Address)</span></h3><div className="grid gap-4 md:grid-cols-2"><Input label="Complete Address" value={pickupAddress} onChange={e=>setPickupAddress(e.target.value)} placeholder="House/Floor No. Building Name or Street, Locality" required/><Input label="Landmark (Optional)" value={landmark} onChange={e=>setLandmark(e.target.value)} placeholder="Any nearby post office, market, Hospital as the landmark"/></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Input label="Pincode" value={pickupPincode} onChange={e=>{setPickupCity('');setPickupState('');setPickupPincode(e.target.value);}} placeholder="Enter Buyer's Pincode" inputMode="numeric" maxLength={6} required error={pincodeError||undefined} helperText={pincodeStatus==='loading'?'Finding city and state...':pincodeStatus==='success'?`Verified: ${pickupCity}, ${pickupState}`:'City and state fill automatically after 6 digits'}/><Input label="City" value={pickupCity} readOnly placeholder="Auto-filled from pincode" required className="bg-slate-50"/><Input label="State" value={pickupState} readOnly placeholder="Auto-filled from pincode" required className="bg-slate-50"/><Select label="Country" value={country} onChange={e=>setCountry(e.target.value)} options={[{value:'India',label:'India'}]}/></div></section></div>}
          {step===2&&<div className="space-y-6"><SectionTitle number="02" title="Return warehouse" subtitle="The returned parcel will be delivered to this location."/><div className="grid gap-4 md:grid-cols-2"><Input label="Warehouse" value={warehouse?.name||''} disabled/><Input label="Contact Mobile" value={warehouse?.phone||''} disabled/><div className="md:col-span-2"><Input label="Warehouse Address" value={warehouse?`${warehouse.address_line1}, ${warehouse.city}, ${warehouse.state} - ${warehouse.pincode}`:''} disabled/></div></div></div>}
          {step===3&&<div className="space-y-6"><SectionTitle number="03" title="Return reason & items" subtitle="Provide enough detail for review and reverse pickup processing."/><Select label="Return Reason" value={reason} onChange={e=>setReason(e.target.value)} options={['Size mismatch','Defective / Damaged product','Incorrect item delivered','Buyer changed mind','Other'].map(value=>({value,label:value}))}/><div><label className="mb-1.5 block text-xs font-bold text-slate-700">Describe the cause of return</label><textarea value={returnCause} onChange={e=>setReturnCause(e.target.value.slice(0,500))} rows={4} placeholder="Explain what was wrong with the product or why the buyer is returning it..." className="w-full resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/><div className="mt-1 flex justify-between text-[11px]"><span className={returnCause.length>0&&returnCause.trim().length<10?'text-rose-600':'text-slate-400'}>Minimum 10 characters</span><span className="text-slate-400">{returnCause.length}/500</span></div></div><div className="space-y-2">{order.items?.map(item=><div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><div><b className="text-slate-900">{item.name}</b><p className="mt-0.5 text-[11px] text-slate-500">SKU {item.sku}</p></div><div className="text-right"><b>₹{item.unit_price}</b><p className="text-[11px] text-slate-500">Qty {item.quantity}</p></div></div>)}</div></div>}
          {step===4&&<div className="space-y-6"><SectionTitle number="04" title="Package & final review" subtitle="Confirm parcel measurements before creating the return."/><div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Input label="Weight (kg)" type="number" value={weight} onChange={e=>setWeight(e.target.value)}/><Input label="Length (cm)" type="number" value={length} onChange={e=>setLength(e.target.value)}/><Input label="Width (cm)" type="number" value={width} onChange={e=>setWidth(e.target.value)}/><Input label="Height (cm)" type="number" value={height} onChange={e=>setHeight(e.target.value)}/></div><div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Truck className="mt-0.5 h-5 w-5 shrink-0"/><div><b>Reverse pickup ready</b><p className="mt-1 text-xs leading-5">Parcel will be collected from {order.shipping_address.city} and returned to {warehouse?.name||'the selected warehouse'}.</p></div></div></div>}
        </>
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><Button variant="outline" disabled={step===1} onClick={()=>setStep(current=>current-1)}>Previous</Button>{step<4?<Button onClick={next} disabled={step===3&&returnCause.trim().length<10}>{step===1?'Next':'Continue'}</Button>:<Button onClick={submit}>Create return</Button>}</div>
      </main>

      <aside className="space-y-4 lg:sticky lg:top-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-black text-slate-900">Order summary</h3>{order?<div className="mt-4 space-y-3 text-xs"><Summary label="Order ID" value={order.external_order_id||order.id.slice(0,12)}/><Summary label="Buyer" value={order.shipping_address.name||'—'}/><Summary label="Order value" value={`₹${Number(order.total_amount).toLocaleString('en-IN')}`}/><Summary label="Payment" value={order.payment_type}/><Summary label="Items" value={String(order.items?.reduce((sum,item)=>sum+item.quantity,0)||0)}/><div className="mt-4 rounded-xl bg-indigo-50 p-3 font-semibold text-indigo-800"><RotateCcw className="mr-2 inline h-4 w-4"/>Reverse pickup request</div></div>:<p className="mt-3 text-xs leading-5 text-slate-500">Order information will appear here after a successful search.</p>}</div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><b>Before creating a return</b><p className="mt-1">Confirm the buyer phone, pickup address, returned items and package measurements.</p></div>
      </aside>
    </div>
  </div>;
};

const SectionTitle=({number,title,subtitle}:{number:string;title:string;subtitle:string})=><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-700">{number}</span><div><h2 className="text-lg font-black text-slate-950">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{subtitle}</p></div></div>;
const Summary=({label,value}:{label:string;value:string})=><div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">{label}</span><b className="max-w-[170px] break-all text-right text-slate-800">{value}</b></div>;
