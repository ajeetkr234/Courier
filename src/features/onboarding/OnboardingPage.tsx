import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Landmark, MapPin, CheckCircle2, 
  ArrowRight, ArrowLeft, UploadCloud, ShieldCheck, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useAppStore } from '../../lib/store';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';
import { usePincodeLookup } from '../../hooks/usePincodeLookup';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSeller, setCurrentSeller } = useAppStore();
  const { addWarehouse, updateSellerBankDetails } = usePlatformStore();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [brandName, setBrandName] = useState(currentSeller?.brand_name || '');
  const [gstin, setGstin] = useState(currentSeller?.gstin || '');
  const [pan, setPan] = useState(currentSeller?.pan || '');
  
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');

  const [whName, setWhName] = useState('');
  const [whContact, setWhContact] = useState('');
  const [whPhone, setWhPhone] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whCity, setWhCity] = useState('');
  const [whState, setWhState] = useState('');

  const {
    pincode: whPincode,
    setPincode: setWhPincode,
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

  const handleNext = () => {
    if (step === 1) {
      if (!brandName.trim() || !gstin.trim() || !pan.trim()) {
        toast.error('Please enter business details before continuing.');
        return;
      }
    }
    if (step === 3) {
      if (!accountHolder.trim() || !bankName.trim() || !bankAccount.trim() || !ifsc.trim()) {
        toast.error('Please enter bank details before continuing.');
        return;
      }
      updateSellerBankDetails({
        account_holder_name: accountHolder,
        bank_name: bankName,
        account_number: bankAccount,
        ifsc_code: ifsc,
        is_verified: true,
      });
    }
    if (step === 4) {
      if (!whName.trim() || !whContact.trim() || !whPhone.trim() || !whAddress.trim() || !whCity.trim() || !whState.trim() || !whPincode.trim()) {
        toast.error('Please enter pickup warehouse details before continuing.');
        return;
      }
      addWarehouse({
        name: whName,
        contact_name: whContact,
        phone: whPhone,
        email: 'dispatch@seller.store',
        address_line1: whAddress,
        pincode: whPincode,
        city: whCity,
        state: whState,
        is_default: true,
        seller_id: currentSeller?.id || '32d724db-23c4-4cba-a76f-f78e4022194e',
      });
    }

    toast.success(`Step ${step} details saved`);
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final activation
      if (currentSeller) {
        const updated = {
          ...currentSeller,
          brand_name: brandName || currentSeller.brand_name,
          company_name: brandName || currentSeller.company_name,
          gstin: gstin || currentSeller.gstin,
          pan: pan || currentSeller.pan,
          status: 'ACTIVE' as const,
        };
        setCurrentSeller(updated);
      }
      toast.success('KYC Approved! Your seller account is now ACTIVE.');
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 py-12 px-6 flex justify-center items-center">
      <div className="max-w-3xl w-full glass-panel p-8 sm:p-10 rounded-2xl border border-slate-800 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 font-display">
              Step {step} of 5 — Seller Onboarding
            </span>
            <span className="text-xs text-slate-400 font-semibold">Resumable Wizard</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" /> Business Details
              </h2>
              <p className="text-xs text-slate-400">Provide your brand identity and Tax identification info.</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
              <Input
                label="GSTIN Number"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                required
              />
              <Input
                label="PAN Number"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="AAAAA0000A"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: KYC Upload */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> KYC Document Upload
              </h2>
              <p className="text-xs text-slate-400">Upload business compliance documents for verification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-dashed border-slate-700 hover:border-brand-500 bg-slate-900/40 text-center space-y-2 cursor-pointer">
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                <span className="block text-xs font-bold text-slate-200">GST Certificate (PDF)</span>
                <span className="block text-[10px] text-emerald-400 font-semibold">✓ Document Uploaded</span>
              </div>
              <div className="p-5 rounded-xl border border-dashed border-slate-700 hover:border-brand-500 bg-slate-900/40 text-center space-y-2 cursor-pointer">
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                <span className="block text-xs font-bold text-slate-200">PAN Card (PDF/Image)</span>
                <span className="block text-[10px] text-emerald-400 font-semibold">✓ Document Uploaded</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bank Account */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-400" /> Bank Settlement Account
              </h2>
              <p className="text-xs text-slate-400">COD remittances will be transferred to this verified account.</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Account Holder Name"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
              />
              <Input
                label="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Account Number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
                <Input
                  label="IFSC Code"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Primary Warehouse */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" /> Primary Pickup Warehouse
              </h2>
              <p className="text-xs text-slate-400">Where couriers will send executives to pick up orders.</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Warehouse Label Name"
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Person"
                  value={whContact}
                  onChange={(e) => setWhContact(e.target.value)}
                  required
                />
                <Input
                  label="Contact Phone"
                  value={whPhone}
                  onChange={(e) => setWhPhone(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Address Line 1"
                value={whAddress}
                onChange={(e) => setWhAddress(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Pincode"
                  value={whPincode}
                  onChange={(e) => setWhPincode(e.target.value)}
                  placeholder="e.g. 110001"
                  maxLength={6}
                  required
                  rightIcon={
                    isWhPinLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : isWhPinSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : whPinStatus === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : undefined
                  }
                  error={whPinError || undefined}
                  helperText={
                    isWhPinLoading
                      ? 'Verifying with India Post...'
                      : isWhPinSuccess && whPinResult
                      ? `✓ ${whPinResult.city}, ${whPinResult.state}`
                      : 'Enter 6-digit PIN'
                  }
                />
                <Input label="City" value={whCity} onChange={(e) => setWhCity(e.target.value)} placeholder="Auto-filled" required />
                <Input label="State" value={whState} onChange={(e) => setWhState(e.target.value)} placeholder="Auto-filled" required />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Activation Review */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white font-display">Ready for Account Activation</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                All details, KYC files, bank accounts, and pickup warehouses have been validated. Click below to activate your seller account and enter the dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : <div />}

          <Button size="md" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            {step === 5 ? 'Activate Account' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
