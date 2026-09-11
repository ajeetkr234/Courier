import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, MapPin, Plus, ShieldCheck, Wallet, Bell, 
  Settings, CheckCircle2, Phone, Mail, FileText, Check, 
  Sparkles, ExternalLink, Printer, Box, AlertCircle, Trash2,
  Lock, ArrowRight, ShieldAlert, Zap, Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { usePlatformStore } from '../../services/store';
import { Warehouse, SellerBankAccount } from '../../types';
import { toast } from 'sonner';
import { usePincodeLookup } from '../../hooks/usePincodeLookup';

type SettingsTab = 'WAREHOUSES' | 'PROFILE' | 'SHIPPING' | 'BANK' | 'NOTIFICATIONS';

export const SettingsPage: React.FC = () => {
  const { 
    warehouses, 
    addWarehouse, 
    currentSeller, 
    setCurrentSeller, 
    sellerBankAccount, 
    updateSellerBankDetails,
    isEarlyCODEnabled,
    toggleEarlyCOD
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('WAREHOUSES');

  // New Warehouse Modal State
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
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

  // Profile Form State
  const [companyName, setCompanyName] = useState(currentSeller?.company_name || 'Apex Retail Logistics Private Limited');
  const [brandName, setBrandName] = useState(currentSeller?.brand_name || 'Apex Retail');
  const [gstin, setGstin] = useState(currentSeller?.gstin || '27AAACA123411Z5');
  const [pan, setPan] = useState(currentSeller?.pan || 'AAACA1234A');
  const [supportEmail, setSupportEmail] = useState('support@apexretail.store');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [returnAddress, setReturnAddress] = useState('Central Returns Hub, Unit 4B, Bhiwandi, Maharashtra 421302');

  // Shipping & Packaging Defaults
  const [defaultWeight, setDefaultWeight] = useState('0.5');
  const [defaultLength, setDefaultLength] = useState('20');
  const [defaultWidth, setDefaultWidth] = useState('15');
  const [defaultHeight, setDefaultHeight] = useState('10');
  const [preferredLabelFormat, setPreferredLabelFormat] = useState<'THERMAL_4X6' | 'A4'>('THERMAL_4X6');
  const [autoTransitInsurance, setAutoTransitInsurance] = useState(true);

  // Bank & Payouts Form State
  const [accountHolder, setAccountHolder] = useState(sellerBankAccount?.account_holder_name || 'Apex Retail Pvt Ltd');
  const [bankName, setBankName] = useState(sellerBankAccount?.bank_name || 'HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState(sellerBankAccount?.account_number || '50200084920194');
  const [ifscCode, setIfscCode] = useState(sellerBankAccount?.ifsc_code || 'HDFC0001248');

  // Notification Preferences
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmailNdr, setNotifyEmailNdr] = useState(true);

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whPincode || !whAddress) {
      toast.error('Please provide warehouse name, address and valid 6-digit pincode');
      return;
    }

    addWarehouse({
      name: whName,
      contact_name: whContact || 'Warehouse Dispatch Incharge',
      phone: whPhone || '9876543210',
      email: 'dispatch@apexretail.store',
      address_line1: whAddress,
      pincode: whPincode,
      city: whCity || 'City Hub',
      state: whState || 'State Hub',
      is_default: whIsDefault || warehouses.length === 0,
      seller_id: currentSeller?.id || '32d724db-23c4-4cba-a76f-f78e4022194e',
    });

    toast.success(`Warehouse "${whName}" registered & verified for carrier pickups!`);
    setIsAddWarehouseOpen(false);
    setWhName('');
    setWhContact('');
    setWhPhone('');
    setWhAddress('');
    resetWhPincode();
    setWhCity('');
    setWhState('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSeller) {
      setCurrentSeller({
        ...currentSeller,
        company_name: companyName,
        brand_name: brandName,
        gstin,
        pan,
      });
    }
    toast.success('Company legal profile & brand identity updated successfully!');
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
            onClick={() => setActiveTab(tab.id as SettingsTab)}
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
              onClick={() => setIsAddWarehouseOpen(true)}
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
                      <span>{wh.contact_name || (wh as any).contact_person} ({wh.phone || '9876543210'})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Serviceable for Pickups
                  </span>
                  <Link
                    to={`/app/rate-calculator`}
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    Rates <ArrowRight className="w-3 h-3" />
                  </Link>
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
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Legal Entity &amp; Store Branding
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              These details appear on customer invoices, GST tax reporting, and branded tracking URLs
            </p>
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
            <div className="grid grid-cols-4 gap-3">
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
        isOpen={isAddWarehouseOpen}
        onClose={() => setIsAddWarehouseOpen(false)}
        title="Register New Pickup Warehouse"
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
              onChange={(e) => setWhPhone(e.target.value)}
              placeholder="e.g. 9820192831"
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
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddWarehouseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Warehouse
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
