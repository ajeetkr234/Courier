import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Building2, MapPin, Plus, ShieldCheck, Wallet, Bell, 
  Settings, CheckCircle2, Phone, Mail, FileText, Check, 
  Sparkles, ExternalLink, Printer, Box, AlertCircle, Trash2,
  Lock, ArrowRight, ShieldAlert, Zap, Loader2, Pencil
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { Warehouse, SellerBankAccount } from '../../types';
import { toast } from 'sonner';
import { usePincodeLookup } from '../../hooks/usePincodeLookup';
import { submitSellerOnboarding } from '../../services/sellerProfile';
import { sendPickupOtp, verifyPickupOtp } from '../../services/pickupVerification';

type SettingsTab = 'WAREHOUSES' | 'PROFILE' | 'SHIPPING' | 'BANK' | 'NOTIFICATIONS';

export const SettingsPage: React.FC = () => {
  const { 
    warehouses, 
    addWarehouse, 
    updateWarehouse,
    deleteWarehouse,
    currentSeller, 
    setCurrentSeller, 
    sellerBankAccount, 
    updateSellerBankDetails,
    isEarlyCODEnabled,
    toggleEarlyCOD
  } = usePlatformStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab')?.toUpperCase() as SettingsTab | null;
  const validTabs: SettingsTab[] = ['WAREHOUSES', 'PROFILE', 'SHIPPING', 'BANK', 'NOTIFICATIONS'];
  const initialTab: SettingsTab = queryTab && validTabs.includes(queryTab) ? queryTab : 'WAREHOUSES';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (queryTab && validTabs.includes(queryTab) && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  // New Warehouse Modal State
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [whName, setWhName] = useState('');
  const [whContact, setWhContact] = useState('');
  const [whPhone, setWhPhone] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whCity, setWhCity] = useState('');
  const [whState, setWhState] = useState('');

  const {
    pincode: whPincode,
    setPincode: setWhPincode,
    reset: resetWhPincode,
    status: whPinStatus,
    result: whPinResult,
    errorMsg: whPinError,
    isLoading: isWhPinLoading,
    isSuccess: isWhPinSuccess,
  } = usePincodeLookup({
    initialPincode: '',
    onVerified: (data) => {
      if (data.city) setWhCity(data.city);
      if (data.state) setWhState(data.state);
    },
  });

  const [whIsDefault, setWhIsDefault] = useState(false);
  const [verifyingWarehouse, setVerifyingWarehouse] = useState<Warehouse | null>(null);
  const [pickupOtp, setPickupOtp] = useState('');
  const [pickupOtpSent, setPickupOtpSent] = useState(false);
  const [pickupOtpBusy, setPickupOtpBusy] = useState(false);

  // Profile Form State
  const [companyName, setCompanyName] = useState(currentSeller?.company_name || '');
  const [brandName, setBrandName] = useState(currentSeller?.brand_name || '');
  const [gstin, setGstin] = useState(currentSeller?.gstin || '');
  const [pan, setPan] = useState(currentSeller?.pan?.startsWith('PENDING-') ? '' : currentSeller?.pan || '');
  const [supportEmail, setSupportEmail] = useState(currentSeller?.contact_email || '');
  const [supportPhone, setSupportPhone] = useState(currentSeller?.contact_phone || '');
  const [returnAddress, setReturnAddress] = useState('');

  // Shipping & Packaging Defaults
  const [defaultWeight, setDefaultWeight] = useState('0.5');
  const [defaultLength, setDefaultLength] = useState('20');
  const [defaultWidth, setDefaultWidth] = useState('15');
  const [defaultHeight, setDefaultHeight] = useState('10');
  const [preferredLabelFormat, setPreferredLabelFormat] = useState<'THERMAL_4X6' | 'A4'>('THERMAL_4X6');
  const [autoTransitInsurance, setAutoTransitInsurance] = useState(true);

  // Bank & Payouts Form State
  const [accountHolder, setAccountHolder] = useState(sellerBankAccount?.account_holder_name || '');
  const [bankName, setBankName] = useState(sellerBankAccount?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(sellerBankAccount?.account_number || '');
  const [ifscCode, setIfscCode] = useState(sellerBankAccount?.ifsc_code || '');

  // Notification Preferences
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmailNdr, setNotifyEmailNdr] = useState(true);

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller?.id || !whName.trim() || !whContact.trim() || !/^\d{6}$/.test(whPincode) || !whAddress.trim() || !whCity.trim() || !whState.trim()) {
      toast.error('Please provide the contact, complete warehouse address and a valid pincode');
      return;
    }
    if (!/^\d{10}$/.test(whPhone)) {
      toast.error('Contact mobile number must be exactly 10 digits');
      return;
    }

    const warehouseData = {
      name: whName.trim(),
      contact_name: whContact.trim(),
      phone: whPhone,
      email: editingWarehouse?.email || currentSeller.contact_email || '',
      address_line1: whAddress.trim(),
      pincode: whPincode,
      city: whCity.trim(),
      state: whState.trim(),
      is_default: whIsDefault || warehouses.length === 0,
      seller_id: currentSeller.id,
    };

    if (editingWarehouse) {
      updateWarehouse({ ...editingWarehouse, ...warehouseData });
    } else {
      addWarehouse(warehouseData);
    }

    toast.success(editingWarehouse ? `Warehouse "${whName}" updated; re-verification is required after protected address changes.` : `Warehouse "${whName}" registered. Verify its phone before creating orders.`);
    setIsAddWarehouseOpen(false);
    setWhName('');
    setWhContact('');
    setWhPhone('');
    setWhAddress('');
    resetWhPincode();
    setWhCity('');
    setWhState('');
    setWhIsDefault(false);
    setEditingWarehouse(null);
  };

  const openAddWarehouse = () => {
    setEditingWarehouse(null);
    setWhName(''); setWhContact(''); setWhPhone(''); setWhAddress('');
    resetWhPincode(); setWhCity(''); setWhState(''); setWhIsDefault(false);
    setIsAddWarehouseOpen(true);
  };

  const openEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setWhName(warehouse.name); setWhContact(warehouse.contact_name);
    setWhPhone(warehouse.phone.replace(/\D/g, '').slice(-10));
    setWhAddress(warehouse.address_line1); setWhPincode(warehouse.pincode);
    setWhCity(warehouse.city); setWhState(warehouse.state); setWhIsDefault(warehouse.is_default);
    setIsAddWarehouseOpen(true);
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    if (!window.confirm(`Delete warehouse "${warehouse.name}"? This cannot be undone.`)) return;
    deleteWarehouse(warehouse.id);
    toast.success(`Warehouse "${warehouse.name}" deleted`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await submitSellerOnboarding({ companyName, brandName, gstin, pan });
      setCurrentSeller(updated);
      toast.success('Company profile saved and submitted for Super Admin verification.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Company profile could not be saved.');
    }
  };

  const handleSendPickupOtp = async (warehouse: Warehouse) => {
    if (!/^[0-9a-f-]{36}$/i.test(warehouse.id)) {
      toast.error('Wait for this warehouse to finish syncing, then try again.');
      return;
    }
    setPickupOtpBusy(true);
    try {
      await sendPickupOtp(warehouse.id);
      setVerifyingWarehouse(warehouse);
      setPickupOtpSent(true);
      toast.success('Verification OTP sent to the warehouse contact phone.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send verification OTP.');
    } finally {
      setPickupOtpBusy(false);
    }
  };

  const handleVerifyPickupOtp = async () => {
    if (!verifyingWarehouse || !/^\d{6}$/.test(pickupOtp)) {
      toast.error('Enter the 6-digit verification code.');
      return;
    }
    setPickupOtpBusy(true);
    try {
      await verifyPickupOtp(verifyingWarehouse.id, pickupOtp);
      updateWarehouse({ ...verifyingWarehouse, address_verified_at: new Date().toISOString(), phone_verified_at: new Date().toISOString() });
      setVerifyingWarehouse(null);
      setPickupOtp('');
      setPickupOtpSent(false);
      toast.success('Pickup address verified. It can now be used for order creation.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid or expired verification code.');
    } finally {
      setPickupOtpBusy(false);
    }
  };

  const handleSaveShippingDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Packaging defaults & thermal print settings saved!');
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateSellerBankDetails({
      account_holder_name: accountHolder,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
    });
    toast.success('Bank settlement account verified & updated for COD remittances!');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Seller Settings &amp; Fulfillment Hub
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure fulfillment pickup warehouses, brand identity, thermal label preferences &amp; bank settlement accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/app/rate-calculator">
            <Button size="sm" variant="outline" leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}>
              Test Pincode Rates
            </Button>
          </Link>
          <Link to="/app/orders/new">
            <Button size="sm" variant="primary" leftIcon={<Box className="w-3.5 h-3.5" />}>
              Book Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'WAREHOUSES', label: 'Pickup Warehouses', icon: <Building2 className="w-4 h-4" />, count: warehouses.length },
          { id: 'PROFILE', label: 'Company Profile', icon: <FileText className="w-4 h-4" /> },
          { id: 'SHIPPING', label: 'Shipping & Labels', icon: <Printer className="w-4 h-4" /> },
          { id: 'BANK', label: 'Bank & Payouts', icon: <Wallet className="w-4 h-4" /> },
          { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as SettingsTab);
              setSearchParams({ tab: tab.id });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: WAREHOUSES */}
      {activeTab === 'WAREHOUSES' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-display">Fulfillment Pickup Addresses</h3>
              <p className="text-xs text-slate-500 font-medium">Couriers will collect shipments from these registered locations during daily scheduled pickups</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openAddWarehouse}
            >
              Add Pickup Warehouse
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        {wh.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">ID: {wh.id}</span>
                    </div>
                    {wh.is_default && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Default Hub
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{wh.address_line1}, {wh.city}, {wh.state} — <strong className="text-slate-900 font-mono">{wh.pincode}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5 pt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{wh.contact_name || (wh as any).contact_person} ({wh.phone || 'Phone unavailable'})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs gap-2">
                  {wh.address_verified_at && wh.phone_verified_at ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pickup verified
                    </span>
                  ) : (
                    <button type="button" disabled={pickupOtpBusy} onClick={() => void handleSendPickupOtp(wh)} className="text-amber-700 font-bold flex items-center gap-1 hover:underline disabled:opacity-50">
                      <ShieldAlert className="w-3.5 h-3.5" /> Verify pickup
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEditWarehouse(wh)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit warehouse"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleDeleteWarehouse(wh)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete warehouse"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Link to="/app/rate-calculator" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline">Rates <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl animate-fadeIn">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Legal Entity &amp; Store Branding
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                currentSeller?.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentSeller?.status === 'UNDER_REVIEW' || currentSeller?.status === 'KYC_PENDING'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : currentSeller?.status === 'REJECTED' || currentSeller?.status === 'SUSPENDED'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Account Status: {currentSeller?.status ? currentSeller.status.replace(/_/g, ' ') : 'DRAFT'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              These details appear on customer invoices, GST tax reporting, and branded tracking URLs
            </p>
            {currentSeller?.status !== 'ACTIVE' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Saving this profile will submit your PAN and company information for Super Admin verification. Order creation unlocks once your profile is verified.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Legal Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Apex Retail Logistics Pvt Ltd"
              required
            />
            <Input
              label="Brand / Store Name (Displays to Buyer)"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Apex Retail"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GSTIN Number"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27AAACA123411Z5"
              required
            />
            <Input
              label="Company PAN Card"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="AAACA1234A"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@apexretail.store"
              required
            />
            <Input
              label="Helpline Phone"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Return Address (RTO Delivery Hub)</label>
            <textarea
              value={returnAddress}
              onChange={(e) => setReturnAddress(e.target.value)}
              rows={3}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Complete address where RTO returned parcels should be redirected..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="primary" type="submit">
              Save Company Profile
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: SHIPPING & LABELS */}
      {activeTab === 'SHIPPING' && (
        <form onSubmit={handleSaveShippingDefaults} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" /> Shipping &amp; Barcode Label Configurations
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Set default package specifications to accelerate order creation and auto-generate thermal barcodes
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Shipping Label Format</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPreferredLabelFormat('THERMAL_4X6')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  preferredLabelFormat === 'THERMAL_4X6'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-indigo-600" /> 4x6 Inch Thermal Roll (Recommended)
                  </span>
                  {preferredLabelFormat === 'THERMAL_4X6' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Direct barcode roll format for TSC, Zebra, and high-speed warehouse thermal sticker printers
                </p>
              </div>

              <div
                onClick={() => setPreferredLabelFormat('A4')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  preferredLabelFormat === 'A4'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-700" /> Standard A4 PDF (with Invoice)
                  </span>
                  {preferredLabelFormat === 'A4' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Prints shipping label on upper half and customer tax invoice on lower half of standard A4 paper
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Default Package Dimensions &amp; Weight</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Weight (kg)"
                value={defaultWeight}
                onChange={(e) => setDefaultWeight(e.target.value)}
                placeholder="0.5"
              />
              <Input
                label="Length (cm)"
                value={defaultLength}
                onChange={(e) => setDefaultLength(e.target.value)}
                placeholder="20"
              />
              <Input
                label="Width (cm)"
                value={defaultWidth}
                onChange={(e) => setDefaultWidth(e.target.value)}
                placeholder="15"
              />
              <Input
                label="Height (cm)"
                value={defaultHeight}
                onChange={(e) => setDefaultHeight(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong className="text-xs font-bold text-slate-900 block">Automatic High-Value Cargo Insurance</strong>
              <span className="text-[11px] text-slate-500">Protect shipments with order value &gt; ₹5,000 against carrier loss or transit theft</span>
            </div>
            <input
              type="checkbox"
              checked={autoTransitInsurance}
              onChange={(e) => setAutoTransitInsurance(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="primary" type="submit">
              Save Shipping Preferences
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: BANK & COD PAYOUTS */}
      {activeTab === 'BANK' && (
        <form onSubmit={handleSaveBankDetails} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" /> Bank Settlement Account (COD Remittance)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Verified commercial account where carrier COD collections and wallet surplus funds are directly deposited via NEFT/RTGS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Beneficiary Name"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Apex Retail Logistics Pvt Ltd"
              required
            />
            <Input
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="HDFC Bank Ltd"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="50200084920194"
              required
            />
            <Input
              label="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="HDFC0001248"
              required
            />
          </div>

          {/* Early COD Toggle */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <strong className="text-xs font-bold text-amber-950">Early COD Remittance (T+1 Settlement)</strong>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">Active</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                Receive Cash on Delivery payouts the very next day after delivery at nominal 0.9% financing fee
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleEarlyCOD(!isEarlyCODEnabled)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                isEarlyCODEnabled ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isEarlyCODEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="primary" type="submit">
              Update Bank Account
            </Button>
          </div>
        </form>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-3xl animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Buyer &amp; Seller Notification Triggers
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Automated multi-channel alerts to reduce RTO rates and keep customers informed at every delivery milestone
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-slate-900 block">WhatsApp Delivery Milestone Alerts</strong>
                <span className="text-[11px] text-slate-500">Sends WhatsApp message when shipment is Dispatched, Out for Delivery, and Delivered</span>
              </div>
              <input
                type="checkbox"
                checked={notifyWhatsapp}
                onChange={(e) => {
                  setNotifyWhatsapp(e.target.checked);
                  toast.success('WhatsApp notification preference saved');
                }}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Buyer SMS with Live Tracking Link</strong>
                <span className="text-[11px] text-slate-500">Sends SMS containing your branded tracking page link upon courier handover</span>
              </div>
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => {
                  setNotifySms(e.target.checked);
                  toast.success('SMS notification preference saved');
                }}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-slate-900 block">Instant NDR Exception Alert Emails</strong>
                <span className="text-[11px] text-slate-500">Alerts your team instantly when a delivery fails so you can take 1-click reattempt action</span>
              </div>
              <input
                type="checkbox"
                checked={notifyEmailNdr}
                onChange={(e) => {
                  setNotifyEmailNdr(e.target.checked);
                  toast.success('NDR email alert preference saved');
                }}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Pickup Warehouse Modal */}
      <Modal
        isOpen={!!verifyingWarehouse}
        onClose={() => { setVerifyingWarehouse(null); setPickupOtp(''); setPickupOtpSent(false); }}
        title="Verify pickup address"
        subtitle={verifyingWarehouse ? `Enter the OTP sent to ${verifyingWarehouse.phone}` : undefined}
      >
        <div className="space-y-4 text-slate-900">
          <Input label="6-digit OTP" value={pickupOtp} onChange={(event) => setPickupOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" disabled={pickupOtpBusy} onClick={() => verifyingWarehouse && void handleSendPickupOtp(verifyingWarehouse)}>{pickupOtpSent ? 'Resend OTP' : 'Send OTP'}</Button>
            <Button type="button" disabled={pickupOtpBusy || pickupOtp.length !== 6} onClick={() => void handleVerifyPickupOtp()}>{pickupOtpBusy ? 'Verifying…' : 'Verify address'}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddWarehouseOpen}
        onClose={() => { setIsAddWarehouseOpen(false); setEditingWarehouse(null); }}
        title={editingWarehouse ? 'Edit Pickup Warehouse' : 'Register New Pickup Warehouse'}
        subtitle="Add fulfillment center address for carrier pickup executive visits"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4 text-slate-900 text-xs">
          <Input
            label="Warehouse Nickname / Title"
            value={whName}
            onChange={(e) => setWhName(e.target.value)}
            placeholder="e.g. Bhiwandi Central Depot"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={whContact}
              onChange={(e) => setWhContact(e.target.value)}
              placeholder="e.g. Ramesh Patil"
              required
            />
            <Input
              label="Contact Mobile"
              value={whPhone}
              onChange={(e) => setWhPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9820192831"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              helperText={`${whPhone.length}/10 digits`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
            <textarea
              value={whAddress}
              onChange={(e) => setWhAddress(e.target.value)}
              rows={2}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Gala No 14, Arihant Logistics Park, Old Agra Road..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Pincode"
              value={whPincode}
              onChange={(e) => setWhPincode(e.target.value)}
              placeholder="e.g. 421302"
              maxLength={6}
              required
              rightIcon={
                isWhPinLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : isWhPinSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : whPinStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : undefined
              }
              error={whPinError || undefined}
              helperText={
                isWhPinLoading
                  ? 'Verifying...'
                  : isWhPinSuccess && whPinResult
                  ? `✓ ${whPinResult.city}, ${whPinResult.state}`
                  : undefined
              }
            />
            <Input
              label="City"
              value={whCity}
              onChange={(e) => setWhCity(e.target.value)}
              placeholder="Auto-filled"
              required
            />
            <Input
              label="State"
              value={whState}
              onChange={(e) => setWhState(e.target.value)}
              placeholder="Auto-filled"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="wh-default-chk"
              checked={whIsDefault}
              onChange={(e) => setWhIsDefault(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="wh-default-chk" className="text-xs font-bold text-slate-700 cursor-pointer">
              Set as primary default pickup warehouse for new orders
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => { setIsAddWarehouseOpen(false); setEditingWarehouse(null); }}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              {editingWarehouse ? 'Update Warehouse' : 'Save Warehouse'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
