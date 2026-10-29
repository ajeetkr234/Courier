import React, { useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Box, CheckCircle2, ChevronDown, CreditCard, MapPin, Package, Plus, Trash2, User, Wand2, Upload, Calculator, Sparkles, Building2, AlertCircle, Loader2, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { usePincodeLookup } from '../../hooks/usePincodeLookup';
import { rateEngine } from '../../services/couriers/rateEngine';
import { RateQuote } from '../../types';
import { getSellerOrderEligibility } from '../../services/sellerEligibility';
import { sendPickupOtp, verifyPickupOtp } from '../../services/pickupVerification';
import { updatePickupDetailsInSupabase } from '../../services/supabaseWarehouses';

type DraftItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number | '';
  discount: number | '';
  taxRate: number | '';
};

type SavedOrderDraft = {
  version: 1;
  updatedAt: string;
  externalOrderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  rawAddressInput: string;
  address1: string;
  city: string;
  state: string;
  pincode: string;
  warehouseId: string;
  paymentType: 'PREPAID' | 'COD';
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  items: DraftItem[];
  shippingCharges: number;
  codCharges: number;
  giftWrapCharges: number;
  transactionCharges: number;
  orderDiscount: number;
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
  const { warehouses, addOrder, addWarehouse, updateWarehouse, currentSeller, loadSupabaseData } = usePlatformStore();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isPickupVerificationOpen, setIsPickupVerificationOpen] = useState(false);
  const [pickupOtp, setPickupOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [pickupDraft, setPickupDraft] = useState({ name: '', contact_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '' });

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

  const defaultWh = warehouses.find((w) => w.is_default) || warehouses[0];
  const [warehouseId, setWarehouseId] = useState(defaultWh?.id || '');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>(statePrefill?.paymentType || 'PREPAID');
  const [weightKg, setWeightKg] = useState(statePrefill?.weightKg ? statePrefill.weightKg.toString() : '');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [showPackagingGuide, setShowPackagingGuide] = useState(true);
  const [items, setItems] = useState<DraftItem[]>([{ sku: '', name: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [codCharges, setCodCharges] = useState(0);
  const [giftWrapCharges, setGiftWrapCharges] = useState(0);
  const [transactionCharges, setTransactionCharges] = useState(0);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingRates, setIsCalculatingRates] = useState(false);
  const [rateQuotes, setRateQuotes] = useState<RateQuote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(null);
  const draftHydratedForSeller = useRef<string | null>(null);

  // Inline Add Warehouse Modal State
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhContact, setNewWhContact] = useState('');
  const [newWhPhone, setNewWhPhone] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');
  const [newWhPincode, setNewWhPincode] = useState('');
  const [newWhCity, setNewWhCity] = useState('');
  const [newWhState, setNewWhState] = useState('');
  const [newWhIsDefault, setNewWhIsDefault] = useState(false);

  const {
    setPincode: setModalLookupPin,
    isLoading: isWhPinLoading,
  } = usePincodeLookup({
    initialPincode: '',
    onVerified: (data) => {
      if (data.city) setNewWhCity(data.city);
      if (data.state) setNewWhState(data.state);
    },
  });

  const handleWhPinChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setNewWhPincode(cleaned);
    if (cleaned.length === 6) {
      setModalLookupPin(cleaned);
    }
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhAddress.trim() || newWhPincode.trim().length !== 6) {
      toast.error('Please provide warehouse name, full address, and a valid 6-digit pincode');
      return;
    }
    if (!/^\d{10}$/.test(newWhPhone)) {
      toast.error('Warehouse mobile number must be exactly 10 digits');
      return;
    }

    const created = addWarehouse({
      name: newWhName.trim(),
      contact_name: newWhContact.trim() || 'Warehouse Dispatch Incharge',
      phone: newWhPhone.trim() || '9876543210',
      email: 'dispatch@apexretail.store',
      address_line1: newWhAddress.trim(),
      city: newWhCity || 'City Hub',
      state: newWhState || 'State Hub',
      pincode: newWhPincode.trim(),
      is_default: newWhIsDefault || warehouses.length === 0,
      seller_id: currentSeller?.id || '32d724db-23c4-4cba-a76f-f78e4022194e',
    });

    setWarehouseId(created.id);
    toast.success(`Warehouse "${created.name}" registered & selected for pickup!`);
    setIsAddWhModalOpen(false);
    setNewWhName('');
    setNewWhContact('');
    setNewWhPhone('');
    setNewWhAddress('');
    setNewWhPincode('');
    setNewWhCity('');
    setNewWhState('');
    setNewWhIsDefault(false);
  };

  React.useEffect(() => {
    if (warehouses.length > 0) {
      if (!warehouseId || !warehouses.some((warehouse) => warehouse.id === warehouseId)) {
        const fallback = warehouses.find((w) => w.is_default) || warehouses[0];
        if (fallback) setWarehouseId(fallback.id);
      }
    }
  }, [warehouseId, warehouses]);

  const selectedWarehouse = warehouses.find((warehouse) => warehouse.id === warehouseId) || warehouses[0];
  const draftStorageKey = currentSeller?.id ? `shipfaster_order_draft_v1_${currentSeller.id}` : null;

  React.useEffect(() => {
    if (!draftStorageKey || !currentSeller?.id || draftHydratedForSeller.current === currentSeller.id) return;
    draftHydratedForSeller.current = currentSeller.id;
    if (statePrefill) return;
    try {
      const rawDraft = localStorage.getItem(draftStorageKey);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft) as Partial<SavedOrderDraft>;
      if (draft.version !== 1 || !Array.isArray(draft.items)) {
        localStorage.removeItem(draftStorageKey);
        return;
      }
      setExternalOrderId(draft.externalOrderId || '');
      setCustomerName(draft.customerName || '');
      setCustomerPhone(draft.customerPhone || '');
      setCustomerEmail(draft.customerEmail || '');
      setRawAddressInput(draft.rawAddressInput || '');
      setAddress1(draft.address1 || '');
      setCity(draft.city || '');
      setState(draft.state || '');
      setPincode(draft.pincode || '');
      setWarehouseId(draft.warehouseId || '');
      setPaymentType(draft.paymentType === 'COD' ? 'COD' : 'PREPAID');
      setWeightKg(draft.weightKg || '');
      setLengthCm(draft.lengthCm || '');
      setWidthCm(draft.widthCm || '');
      setHeightCm(draft.heightCm || '');
      setItems(draft.items.length ? draft.items : [{ sku: '', name: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
      setShippingCharges(Number(draft.shippingCharges) || 0);
      setCodCharges(Number(draft.codCharges) || 0);
      setGiftWrapCharges(Number(draft.giftWrapCharges) || 0);
      setTransactionCharges(Number(draft.transactionCharges) || 0);
      setOrderDiscount(Number(draft.orderDiscount) || 0);
      setRestoredDraftAt(draft.updatedAt || new Date().toISOString());
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [currentSeller?.id, draftStorageKey, setPincode, statePrefill]);

  React.useEffect(() => {
    if (!draftStorageKey || !currentSeller?.id || draftHydratedForSeller.current !== currentSeller.id) return;
    const hasProgress = Boolean(
      externalOrderId.trim() || customerName.trim() || customerPhone.trim() || customerEmail.trim() ||
      rawAddressInput.trim() || address1.trim() || city.trim() || state.trim() || pincode.trim() ||
      weightKg || lengthCm || widthCm || heightCm || paymentType === 'COD' ||
      shippingCharges || codCharges || giftWrapCharges || transactionCharges || orderDiscount ||
      items.some(item => item.sku.trim() || item.name.trim() || item.unitPrice !== 0 || item.quantity !== 1)
    );
    const timer = window.setTimeout(() => {
      if (!hasProgress) {
        localStorage.removeItem(draftStorageKey);
        return;
      }
      const draft: SavedOrderDraft = {
        version: 1,
        updatedAt: new Date().toISOString(),
        externalOrderId, customerName, customerPhone, customerEmail, rawAddressInput,
        address1, city, state, pincode, warehouseId, paymentType, weightKg, lengthCm,
        widthCm, heightCm, items, shippingCharges, codCharges, giftWrapCharges,
        transactionCharges, orderDiscount,
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [address1, city, codCharges, currentSeller?.id, customerEmail, customerName, customerPhone, draftStorageKey, externalOrderId, giftWrapCharges, heightCm, items, lengthCm, orderDiscount, paymentType, pincode, rawAddressInput, shippingCharges, state, transactionCharges, warehouseId, weightKg, widthCm]);

  const discardOrderDraft = () => {
    if (draftStorageKey) localStorage.removeItem(draftStorageKey);
    setExternalOrderId(''); setCustomerName(''); setCustomerPhone(''); setCustomerEmail('');
    setRawAddressInput(''); setAddress1(''); setCity(''); setState(''); setPincode('');
    setPaymentType('PREPAID'); setWeightKg(''); setLengthCm(''); setWidthCm(''); setHeightCm('');
    setItems([{ sku: '', name: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
    setShippingCharges(0); setCodCharges(0); setGiftWrapCharges(0); setTransactionCharges(0); setOrderDiscount(0);
    setRateQuotes([]); setSelectedQuoteId(''); setRestoredDraftAt(null);
    const fallback = warehouses.find(warehouse => warehouse.is_default) || warehouses[0];
    setWarehouseId(fallback?.id || '');
    toast.success('Saved order draft discarded.');
  };

  const openPickupVerification = () => {
    if (selectedWarehouse) {
      setPickupDraft({
        name: selectedWarehouse.name || '',
        contact_name: selectedWarehouse.contact_name || '',
        phone: (selectedWarehouse.phone || '').replace(/\D/g, '').slice(-10),
        address_line1: selectedWarehouse.address_line1 || '',
        address_line2: selectedWarehouse.address_line2 || '',
        city: selectedWarehouse.city || '',
        state: selectedWarehouse.state || '',
        pincode: selectedWarehouse.pincode || '',
      });
    }
    setIsEditingPickup(false);
    setOtpSent(false);
    setPickupOtp('');
    setIsPickupVerificationOpen(true);
  };

  const savePickupDetails = async () => {
    if (!selectedWarehouse) return;
    if (!pickupDraft.name.trim() || !pickupDraft.contact_name.trim() || !pickupDraft.address_line1.trim() || !pickupDraft.city.trim() || !pickupDraft.state.trim()) {
      toast.error('Complete all required pickup address fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(pickupDraft.phone)) {
      toast.error('Enter a valid 10-digit Indian pickup mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(pickupDraft.pincode)) {
      toast.error('Enter a valid 6-digit pickup pincode.');
      return;
    }
    setOtpBusy(true);
    try {
      const saved = await updatePickupDetailsInSupabase({
        ...selectedWarehouse,
        ...pickupDraft,
        name: pickupDraft.name.trim(),
        contact_name: pickupDraft.contact_name.trim(),
        address_line1: pickupDraft.address_line1.trim(),
        address_line2: pickupDraft.address_line2.trim() || undefined,
        city: pickupDraft.city.trim(),
        state: pickupDraft.state.trim(),
      });
      updateWarehouse(saved);
      setIsEditingPickup(false);
      setOtpSent(false);
      setPickupOtp('');
      toast.success('Pickup address saved. You can now send the verification OTP.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save pickup address.');
    } finally {
      setOtpBusy(false);
    }
  };

  const length = Number(lengthCm) || 0;
  const width = Number(widthCm) || 0;
  const height = Number(heightCm) || 0;
  const deadWeight = Number(weightKg) || 0;
  const volumetricWeight = Number(((length * width * height) / 5000).toFixed(2));
  const chargeableWeight = Math.max(deadWeight, volumetricWeight);
  const productSubtotal = items.reduce((sum, item) => sum + item.quantity * (Number(item.unitPrice) || 0), 0);
  const productDiscount = items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const productTax = items.reduce((sum, item) => { const taxable=Math.max(0,item.quantity*(Number(item.unitPrice)||0)-(Number(item.discount)||0)); return sum+taxable*(Number(item.taxRate)||0)/100; }, 0);
  const otherCharges = shippingCharges + (paymentType === 'COD' ? codCharges : 0) + giftWrapCharges + transactionCharges;
  const totalDiscount = productDiscount + orderDiscount;
  const totalValue = Math.max(0, productSubtotal + productTax + otherCharges - totalDiscount);
  const packagingGuides = [
    { title: 'Fit', image: '/pack-guide-fit-v2.png', description: 'Choose a package that fits the product closely without crushing it.' },
    { title: 'Fill', image: '/pack-guide-fill-v2.png', description: 'Fill empty space so the item cannot shift while in transit.' },
    { title: 'Secure', image: '/pack-guide-secure-v2.png', description: 'Seal the center seam and exposed edges with strong packing tape.' },
    { title: 'Measure', image: '/pack-guide-measure-v2.png', description: 'Measure the outside of the final sealed package, not the product.' },
  ];

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const handleCalculateRates = async () => {
    if (!selectedWarehouse || !/^\d{6}$/.test(pincode) || chargeableWeight <= 0) {
      toast.error('Select a warehouse and enter delivery pincode and package weight first');
      return;
    }
    setIsCalculatingRates(true);
    try {
      const quotes = await rateEngine.fetchComparisonQuotes({
        sellerId: currentSeller?.id || '', pickupPincode: selectedWarehouse.pincode,
        deliveryPincode: pincode, weightKg: chargeableWeight, lengthCm: length || undefined,
        widthCm: width || undefined, heightCm: height || undefined, paymentType, orderValue: totalValue,
      });
      const sorted = [...quotes].sort((a, b) => a.total_rate - b.total_rate);
      setRateQuotes(sorted);
      setSelectedQuoteId(sorted[0]?.id || '');
      if (!sorted.length) toast.error('No logistics company is serviceable for these details');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to calculate delivery prices');
    } finally {
      setIsCalculatingRates(false);
    }
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

    const eligibility = getSellerOrderEligibility(currentSeller);
    if (!eligibility.eligible) {
      toast.error(eligibility.reason);
      return;
    }

    const activeSellerId = currentSeller?.id || '32d724db-23c4-4cba-a76f-f78e4022194e';

    if (!warehouseId) {
      toast.error('Please add/select a pickup warehouse before creating an order');
      return;
    }
    if (!selectedWarehouse?.address_verified_at || !selectedWarehouse?.phone_verified_at) {
      openPickupVerification();
      toast.error('Verify the pickup address and associated mobile number first.');
      return;
    }
    if (!selectedWarehouse || !selectedWarehouse.address_line1?.trim() || !selectedWarehouse.city?.trim() || !selectedWarehouse.state?.trim() || !/^\d{6}$/.test(selectedWarehouse.pincode || '')) {
      toast.error('Selected pickup address is incomplete or its pincode is not verified. Update it in Settings first.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test((selectedWarehouse.phone || '').replace(/\D/g, '').slice(-10))) {
      toast.error('Selected pickup address has an invalid mobile number. Update it in Settings first.');
      return;
    }
    if (!customerName.trim() || !address1.trim() || !city.trim() || !state.trim()) {
      toast.error('Please complete customer name and delivery address');
      return;
    }
    if (!/^\d{10}$/.test(customerPhone.replace(/\D/g, '').slice(-10))) {
      toast.error('Please enter a valid 10-digit customer phone number');
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
    if (!items.every((item) => item.sku.trim() && item.name.trim() && item.quantity > 0 && item.unitPrice !== '' && Number(item.unitPrice) >= 0)) {
      toast.error('Please complete product SKU, name, quantity and price');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addOrder({
        seller_id: activeSellerId,
        warehouse_id: warehouseId,
        customer_id: '',
        external_order_id: externalOrderId.trim() || undefined,
        source: 'MANUAL',
        payment_type: paymentType,
        cod_amount: paymentType === 'COD' ? totalValue : 0,
        total_amount: totalValue,
        pricing_breakdown: { product_subtotal: productSubtotal, product_tax: productTax, product_discount: productDiscount, shipping_charges: shippingCharges, cod_charges: paymentType === 'COD' ? codCharges : 0, gift_wrap_charges: giftWrapCharges, transaction_charges: transactionCharges, order_discount: orderDiscount },
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
          unit_price: Number(item.unitPrice),
        })),
        current_status: 'NEW',
      });

      toast.success(`Order #${created.external_order_id || created.id} created. Total: Rs ${totalValue.toLocaleString('en-IN')}`);
      if (draftStorageKey) localStorage.removeItem(draftStorageKey);
      setRestoredDraftAt(null);
      // Open the saved order's courier-rate comparison immediately. The same
      // persisted order will also be present on Seller Home and Orders.
      const selectedQuote = rateQuotes.find((quote) => quote.id === selectedQuoteId);
      const courierParam = selectedQuote ? `&courierId=${encodeURIComponent(selectedQuote.courier_id)}` : '';
      navigate(`/app/orders?shipOrderId=${created.id}${courierParam}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsCheckingStatus(true);
    try {
      await loadSupabaseData();
      const updatedSeller = usePlatformStore.getState().currentSeller;
      const updatedEligibility = getSellerOrderEligibility(updatedSeller);
      if (updatedEligibility.eligible) {
        toast.success('Account verification confirmed! Order creation is now unlocked.');
        setIsVerificationModalOpen(false);
      } else {
        setIsVerificationModalOpen(true);
        toast.info(`Account status: ${updatedSeller?.status?.replace(/_/g, ' ') || 'Pending verification'}`);
      }
    } catch (err) {
      toast.error('Could not refresh verification status from server.');
      setIsVerificationModalOpen(true);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const orderEligibility = getSellerOrderEligibility(currentSeller);
  if (!orderEligibility.eligible) {
    const status = currentSeller?.status || 'DRAFT';
    const statusColor =
      status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
      status === 'UNDER_REVIEW' || status === 'KYC_PENDING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
      status === 'REJECTED' || status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
      'bg-amber-50 text-amber-700 border-amber-200';

    const hasProfile = Boolean(currentSeller?.company_name?.trim() && currentSeller?.pan?.trim());
    const verifiedWarehouses = warehouses.filter((w) => Boolean(w.pickup_verified || (w.address_verified_at && w.phone_verified_at)));

    return (
      <div className="mx-auto max-w-2xl py-6 animate-fadeIn">
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-3 border-amber-200 bg-amber-50 text-amber-800">
            Account Status: {status.replace(/_/g, ' ')}
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display">Order Creation is Locked</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm font-medium text-slate-600 leading-relaxed">
            {orderEligibility.reason}
          </p>

          {/* Quick Verification Progress Summary */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Profile &amp; PAN</span>
                {hasProfile ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                {hasProfile ? (currentSeller?.brand_name || currentSeller?.company_name) : 'Action Needed'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Pickup Hub</span>
                {verifiedWarehouses.length > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                {verifiedWarehouses.length > 0 ? `${verifiedWarehouses.length} Verified` : warehouses.length > 0 ? 'OTP Pending' : 'None Added'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Super Admin</span>
                {status === 'ACTIVE' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                {status === 'ACTIVE' ? 'Approved' : status.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/app/settings?tab=PROFILE">
              <Button variant="outline" className="font-bold text-xs">
                Complete Profile
              </Button>
            </Link>
            <Button
              className="font-bold text-xs"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              onClick={() => setIsVerificationModalOpen(true)}
            >
              Check Verification Status
            </Button>
            <Button
              variant="ghost"
              className="font-bold text-xs"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin text-indigo-600' : ''}`} />}
              isLoading={isCheckingStatus}
              onClick={handleCheckVerification}
            >
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Verification Status Modal */}
        <Modal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          title="Account Verification Details"
          maxWidth="lg"
        >
          <div className="space-y-5 text-slate-800">
            {/* Live Status Header */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${statusColor}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/70 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Super Admin Verification</div>
                  <div className="text-sm font-black">{status.replace(/_/g, ' ')}</div>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 border">
                {status === 'ACTIVE' ? 'Unlocked' : 'Order Creation Locked'}
              </span>
            </div>

            {/* Status Explanation */}
            <div className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {status === 'DRAFT' && (
                <p>Your business profile is currently in <strong>Draft</strong> mode. Complete your company legal name, GSTIN, and PAN details in Profile Settings, then save to submit for Super Admin verification.</p>
              )}
              {(status === 'UNDER_REVIEW' || status === 'KYC_PENDING') && (
                <p>Your seller profile has been submitted and is currently <strong>Under Review</strong> by the platform compliance team. Once verified by Super Admin, order creation will unlock automatically.</p>
              )}
              {status === 'REJECTED' && (
                <p className="text-rose-600 font-semibold">Your verification request was rejected. Please review your company and tax identification details in Settings and resubmit.</p>
              )}
              {status === 'SUSPENDED' && (
                <p className="text-rose-600 font-semibold">This seller account is suspended. Please contact platform support for resolution.</p>
              )}
              {status === 'ACTIVE' && (
                <p className="text-emerald-700 font-semibold">Your account is fully verified! You can create and ship orders.</p>
              )}
            </div>

            {/* Checklist breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Onboarding Verification Checklist</h4>

              <div className="space-y-2">
                <div className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="text-xs font-bold text-slate-900">1. Business Profile &amp; PAN Card</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Company: <span className="font-semibold text-slate-700">{currentSeller?.company_name || 'Not set'}</span> · PAN: <span className="font-mono font-semibold text-slate-700">{currentSeller?.pan || 'Not set'}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${hasProfile ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {hasProfile ? 'Completed' : 'Missing Details'}
                  </span>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="text-xs font-bold text-slate-900">2. Pickup Warehouse &amp; Mobile OTP</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {warehouses.length} warehouse(s) registered · {verifiedWarehouses.length} verified via OTP
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${verifiedWarehouses.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {verifiedWarehouses.length > 0 ? 'Verified' : 'OTP Pending'}
                  </span>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="text-xs font-bold text-slate-900">3. Super Admin Compliance Review</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Platform verification required for carrier dispatch and anti-fraud
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {status === 'ACTIVE' ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckVerification}
                isLoading={isCheckingStatus}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin text-indigo-600' : ''}`} />}
                className="w-full sm:w-auto font-bold text-xs"
              >
                Re-check From Server
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="text-xs font-bold w-full sm:w-auto"
                >
                  Close
                </Button>
                <Link to="/app/settings?tab=PROFILE" className="w-full sm:w-auto">
                  <Button size="sm" className="text-xs font-bold w-full sm:w-auto" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                    Open Profile Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

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

      {restoredDraftAt && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <span className="block font-extrabold">Your unfinished order draft was restored</span>
              <span className="font-medium text-amber-700">Last saved {new Date(restoredDraftAt).toLocaleString('en-IN')}. Review the details and continue where you left off.</span>
            </div>
          </div>
          <button type="button" onClick={discardOrderDraft} className="shrink-0 font-bold text-rose-600 hover:underline">Discard saved draft</button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
            <Button type="button" size="sm" variant="outline" className="text-xs font-bold" onClick={() => setItems([...items, { sku: '', name: '', quantity: 1, unitPrice: '', discount: 0, taxRate: 0 }])} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-2 lg:grid-cols-12 gap-3 items-end p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="col-span-2 lg:col-span-2">
                  <Input label="SKU" value={item.sku} onChange={(event) => updateItem(index, { sku: event.target.value })} required />
                </div>
                <div className="col-span-2 lg:col-span-3">
                  <Input label="Item Name" value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} required />
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label><div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white"><button type="button" className="w-10 bg-slate-50" onClick={()=>updateItem(index,{quantity:Math.max(1,item.quantity-1)})}>−</button><span className="grid flex-1 place-items-center font-bold">{item.quantity}</span><button type="button" className="w-10 bg-slate-50" onClick={()=>updateItem(index,{quantity:item.quantity+1})}>+</button></div>
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <Input label="Price (Rs)" type="number" min="0" step="0.01" value={item.unitPrice} onFocus={() => { if (item.unitPrice === 0) updateItem(index, { unitPrice: '' }); }} onChange={(event) => updateItem(index, { unitPrice: event.target.value === '' ? '' : Number(event.target.value) })} required />
                </div>
                <div className="col-span-1 lg:col-span-1"><Input label="Discount" type="number" min="0" value={item.discount} onChange={e=>updateItem(index,{discount:Number(e.target.value)||0})}/></div>
                <div className="col-span-1 lg:col-span-1"><Input label="Tax %" type="number" min="0" value={item.taxRate} onChange={e=>updateItem(index,{taxRate:Number(e.target.value)||0})}/></div>
                <div className="col-span-2 lg:col-span-1 text-right lg:text-center">
                  <button type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} className="text-slate-400 hover:text-rose-600 p-2 cursor-pointer" disabled={items.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-slate-50 p-4"><h4 className="mb-3 text-xs font-black">Add Other Charges &amp; Discount <span className="font-normal text-slate-400">(Optional)</span></h4><div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><Input label="Shipping Charges" type="number" min="0" value={shippingCharges} onChange={e=>setShippingCharges(Number(e.target.value)||0)}/><Input label="COD Charges" type="number" min="0" value={codCharges} disabled={paymentType!=='COD'} onChange={e=>setCodCharges(Number(e.target.value)||0)}/><Input label="Gift Wrap" type="number" min="0" value={giftWrapCharges} onChange={e=>setGiftWrapCharges(Number(e.target.value)||0)}/><Input label="Transaction Charges" type="number" min="0" value={transactionCharges} onChange={e=>setTransactionCharges(Number(e.target.value)||0)}/><Input label="Total Discount" type="number" min="0" value={orderDiscount} onChange={e=>setOrderDiscount(Number(e.target.value)||0)}/></div></div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span>Sub-total for Product</span><b>₹ {productSubtotal.toFixed(2)}</b></div><div className="mt-2 flex justify-between"><span>Tax</span><b>₹ {productTax.toFixed(2)}</b></div><div className="mt-2 flex justify-between"><span>Other Charges</span><b>₹ {otherCharges.toFixed(2)}</b></div><div className="mt-2 flex justify-between"><span>Discount</span><b>₹ {totalDiscount.toFixed(2)}</b></div><div className="mt-3 flex justify-between border-t pt-3 text-base font-black"><span>Total Order Value</span><span>₹ {totalValue.toFixed(2)}</span></div></div>

          <div className="space-y-4 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900"><CreditCard className="h-4 w-4 text-indigo-600" /> Payment &amp; Pickup Options</h4>
              <div className="flex items-center gap-3"><button type="button" onClick={() => setIsAddWhModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"><Plus className="h-3.5 w-3.5" /> Add Warehouse</button><Link to="/app/settings" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"><Building2 className="h-3.5 w-3.5" /> Manage Warehouses</Link></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select label="Pickup Warehouse" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} options={warehouses.length > 0 ? warehouses.map((warehouse) => ({ value: warehouse.id, label: `${warehouse.name} — ${warehouse.city}, ${warehouse.state} (${warehouse.pincode})${warehouse.is_default ? ' ★ Default Hub' : ''}` })) : [{ value: '', label: 'No warehouse found — Click "+ Add Warehouse"' }]} />
              <Select label="Payment Mode" value={paymentType} onChange={(event) => setPaymentType(event.target.value as 'PREPAID' | 'COD')} options={[{ value: 'PREPAID', label: 'Prepaid' }, { value: 'COD', label: 'Cash On Delivery' }]} />
              <Input label="COD Collectible (Rs)" type="number" value={paymentType === 'COD' ? totalValue : 0} disabled />
            </div>
            {selectedWarehouse && <div className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs"><div className="mt-0.5 shrink-0 rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-indigo-600"><Building2 className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-extrabold text-slate-900">{selectedWarehouse.name}</span>{selectedWarehouse.is_default && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Default Pickup Hub</span>}<span className="font-mono text-[11px] text-slate-400">PIN: {selectedWarehouse.pincode}</span></div><p className="mt-1 leading-relaxed text-slate-600"><span className="font-semibold text-slate-700">Pickup Address: </span>{selectedWarehouse.address_line1}{selectedWarehouse.address_line2 ? `, ${selectedWarehouse.address_line2}` : ''}, {selectedWarehouse.city}, {selectedWarehouse.state} - {selectedWarehouse.pincode}</p><div className="mt-1.5 flex gap-4 text-[11px] text-slate-500"><span>Contact: <strong className="text-slate-700">{selectedWarehouse.contact_name}</strong></span><span>Phone: <strong className="text-slate-700">{selectedWarehouse.phone}</strong></span></div></div></div>}
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

          <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900"><Calculator className="h-4 w-4 text-indigo-600" /> Delivery Price Calculator</h4><p className="mt-1 text-xs text-slate-500">Compare logistics companies using the selected route, weight and payment mode.</p></div>
              <Button type="button" variant="outline" onClick={handleCalculateRates} isLoading={isCalculatingRates}>Calculate Prices</Button>
            </div>
            {rateQuotes.length > 0 && <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{rateQuotes.map((quote, index) => <label key={quote.id} className={`cursor-pointer rounded-xl border bg-white p-4 transition ${selectedQuoteId === quote.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}><div className="flex items-start gap-3"><input type="radio" name="courierQuote" checked={selectedQuoteId === quote.id} onChange={() => setSelectedQuoteId(quote.id)} className="mt-1" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="text-sm text-slate-900">{quote.courier_name}</strong>{index === 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Lowest price</span>}</div><p className="mt-1 text-xs text-slate-500">{quote.service_name} · Delivery in {quote.estimated_days} day{quote.estimated_days === 1 ? '' : 's'}</p><p className="mt-2 text-lg font-black text-indigo-700">Rs {quote.total_rate.toFixed(2)}</p></div></div></label>)}</div>}
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

        <div className="hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Payment & Pickup Options
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddWhModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Warehouse</span>
              </button>
              <Link to="/app/settings" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                <Building2 className="w-3.5 h-3.5" />
                <span>Manage Warehouses</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Pickup Warehouse"
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              options={
                warehouses.length > 0
                  ? warehouses.map((warehouse) => ({
                      value: warehouse.id,
                      label: `${warehouse.name} — ${warehouse.city}, ${warehouse.state} (${warehouse.pincode})${warehouse.is_default ? ' ★ Default Hub' : ''}`,
                    }))
                  : [{ value: '', label: 'No warehouse found — Click "+ Add Warehouse"' }]
              }
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

          {/* Selected Warehouse Details Preview Card */}
          {selectedWarehouse && (
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
              <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900">{selectedWarehouse.name}</span>
                  {selectedWarehouse.is_default && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Default Pickup Hub
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">PIN: {selectedWarehouse.pincode}</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <span className="font-semibold text-slate-700">Pickup Address: </span>
                  {selectedWarehouse.address_line1}
                  {selectedWarehouse.address_line2 ? `, ${selectedWarehouse.address_line2}` : ''}, {selectedWarehouse.city}, {selectedWarehouse.state} - {selectedWarehouse.pincode}
                </p>
                <div className="flex items-center gap-4 mt-1.5 text-slate-500 text-[11px]">
                  <span>Contact: <strong className="text-slate-700">{selectedWarehouse.contact_name}</strong></span>
                  <span>Phone: <strong className="text-slate-700">{selectedWarehouse.phone}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display"><Calculator className="w-5 h-5 text-indigo-600" /> Delivery Price Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">Compare logistics companies using the selected route, weight and payment mode.</p>
            </div>
            <Button type="button" variant="outline" onClick={handleCalculateRates} isLoading={isCalculatingRates}>Calculate Prices</Button>
          </div>
          {rateQuotes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {rateQuotes.map((quote, index) => (
                <label key={quote.id} className={`cursor-pointer rounded-xl border p-4 transition ${selectedQuoteId === quote.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" name="courierQuote" checked={selectedQuoteId === quote.id} onChange={() => setSelectedQuoteId(quote.id)} className="mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><strong className="text-sm text-slate-900">{quote.courier_name}</strong>{index === 0 && <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Lowest price</span>}</div>
                      <p className="mt-1 text-xs text-slate-500">{quote.service_name} · Delivery in {quote.estimated_days} day{quote.estimated_days === 1 ? '' : 's'}</p>
                      <p className="mt-2 text-lg font-black text-indigo-700">Rs {quote.total_rate.toFixed(2)}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="block text-xs text-slate-500 font-bold uppercase">Total Order Value</span>
            <span className="block text-3xl font-black text-emerald-600 font-display">Rs {totalValue.toLocaleString('en-IN')}</span>
          </div>

          <Button type="submit" size="lg" className="font-bold" isLoading={isSubmitting}>
            Save & Create Order
          </Button>
        </div>
      </form>

      <Modal isOpen={isPickupVerificationOpen} onClose={() => setIsPickupVerificationOpen(false)} title="Pick Up Address Verification" maxWidth="xl">
        <div className="space-y-4">
          {isEditingPickup ? (
            <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Warehouse name" value={pickupDraft.name} onChange={e=>setPickupDraft(d=>({...d,name:e.target.value}))} required />
                <Input label="Contact person" value={pickupDraft.contact_name} onChange={e=>setPickupDraft(d=>({...d,contact_name:e.target.value}))} required />
              </div>
              <Input label="Pickup mobile" value={pickupDraft.phone} onChange={e=>setPickupDraft(d=>({...d,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} inputMode="numeric" maxLength={10} required />
              <Input label="Address line 1" value={pickupDraft.address_line1} onChange={e=>setPickupDraft(d=>({...d,address_line1:e.target.value}))} required />
              <Input label="Address line 2 (optional)" value={pickupDraft.address_line2} onChange={e=>setPickupDraft(d=>({...d,address_line2:e.target.value}))} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="City" value={pickupDraft.city} onChange={e=>setPickupDraft(d=>({...d,city:e.target.value}))} required />
                <Input label="State" value={pickupDraft.state} onChange={e=>setPickupDraft(d=>({...d,state:e.target.value}))} required />
                <Input label="Pincode" value={pickupDraft.pincode} onChange={e=>setPickupDraft(d=>({...d,pincode:e.target.value.replace(/\D/g,'').slice(0,6)}))} inputMode="numeric" maxLength={6} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={()=>setIsEditingPickup(false)} disabled={otpBusy}>Cancel</Button>
                <Button size="sm" onClick={savePickupDetails} isLoading={otpBusy}>Save pickup address</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-slate-700">
              <div className="mb-2 flex items-center justify-between gap-3"><span className="font-extrabold text-red-600">Unverified Address</span><button type="button" className="font-bold text-blue-600 hover:underline" onClick={()=>{setOtpSent(false);setPickupOtp('');setIsEditingPickup(true)}}>Edit pickup address</button></div>
              <div className="font-bold">{selectedWarehouse?.name}</div>
              <div>{selectedWarehouse?.contact_name}</div>
              <div>{selectedWarehouse?.address_line1}{selectedWarehouse?.address_line2 ? `, ${selectedWarehouse.address_line2}` : ''}, {selectedWarehouse?.city}, {selectedWarehouse?.state} {selectedWarehouse?.pincode}</div>
              <div className="mt-2">Mobile: +91 {selectedWarehouse?.phone}</div>
            </div>
          )}
          <div><div className="mb-2 text-sm font-bold">Verify phone number to verify address</div><p className="text-xs text-slate-500">OTP will be sent to this pickup phone number.</p></div>
          {!isEditingPickup && (!otpSent ? <Button className="w-full" isLoading={otpBusy} onClick={async()=>{if(!selectedWarehouse)return;setOtpBusy(true);try{const result=await sendPickupOtp(selectedWarehouse.id);if(result.testOtp){setPickupOtp(result.testOtp);toast.info('QA mode: verification OTP has been filled in below.')}else{toast.success('OTP sent to pickup mobile')}setOtpSent(true)}catch(e){toast.error(e instanceof Error?e.message:'Unable to send OTP')}finally{setOtpBusy(false)}}}>Send OTP</Button> : <form className="space-y-3" onSubmit={async(e)=>{e.preventDefault();if(!selectedWarehouse)return;setOtpBusy(true);try{await verifyPickupOtp(selectedWarehouse.id,pickupOtp);await loadSupabaseData();setIsPickupVerificationOpen(false);setOtpSent(false);setPickupOtp('');toast.success('Pickup address and mobile verified. You can now create the order.')}catch(err){toast.error(err instanceof Error?err.message:'Invalid OTP')}finally{setOtpBusy(false)}}}><Input label="Enter 6-digit OTP" value={pickupOtp} onChange={e=>setPickupOtp(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" maxLength={6} required helperText={pickupOtp.length===6?'OTP ready. Select Verify Address to continue.':undefined}/><Button type="submit" className="w-full" isLoading={otpBusy} disabled={pickupOtp.length!==6}>Verify Address</Button><button type="button" className="w-full text-xs font-bold text-indigo-600" onClick={()=>{setOtpSent(false);setPickupOtp('')}}>Resend OTP</button></form>)}
        </div>
      </Modal>

      {/* Quick Add Warehouse Modal */}
      <Modal
        isOpen={isAddWhModalOpen}
        onClose={() => setIsAddWhModalOpen(false)}
        title="Register & Select Pickup Warehouse"
        subtitle="Add fulfillment address for carrier pickup executive visits"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4 text-slate-900 text-xs">
          <Input
            label="Warehouse Nickname / Title"
            value={newWhName}
            onChange={(e) => setNewWhName(e.target.value)}
            placeholder="e.g. Bhiwandi Central Depot"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={newWhContact}
              onChange={(e) => setNewWhContact(e.target.value)}
              placeholder="e.g. Ramesh Patil"
              required
            />
            <Input
              label="Contact Mobile"
              value={newWhPhone}
              onChange={(e) => setNewWhPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9820192831"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              helperText={`${newWhPhone.length}/10 digits`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
            <textarea
              value={newWhAddress}
              onChange={(e) => setNewWhAddress(e.target.value)}
              rows={2}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Plot 14, Logistics Park, Old Agra Road..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Pincode"
              value={newWhPincode}
              onChange={(e) => handleWhPinChange(e.target.value)}
              placeholder="e.g. 421302"
              maxLength={6}
              required
              rightIcon={
                isWhPinLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                ) : undefined
              }
            />
            <Input
              label="City"
              value={newWhCity}
              onChange={(e) => setNewWhCity(e.target.value)}
              placeholder="e.g. Bhiwandi"
              required
            />
            <Input
              label="State"
              value={newWhState}
              onChange={(e) => setNewWhState(e.target.value)}
              placeholder="e.g. Maharashtra"
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newWhIsDefault}
              onChange={(e) => setNewWhIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700">Set as default pickup warehouse for new orders</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddWhModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="font-bold"
            >
              Save & Select Warehouse
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
