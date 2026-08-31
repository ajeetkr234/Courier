import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { LocationAutocomplete } from './LocationAutocomplete';
import { MobileInput } from './MobileInput';
import { ServiceabilityResultCard } from './ServiceabilityResultCard';
import { ServiceableLocationItem, ServiceabilityResponse } from '../../types/serviceability';
import { checkServiceability } from '../../services/serviceability';

interface ServiceabilityCheckFormProps {
  onSuccessContinue?: (result: ServiceabilityResponse) => void;
  className?: string;
}

export const ServiceabilityCheckForm: React.FC<ServiceabilityCheckFormProps> = ({
  onSuccessContinue,
  className = '',
}) => {
  const [pickupLocation, setPickupLocation] = useState<ServiceableLocationItem | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<ServiceableLocationItem | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');

  // Form State & Errors
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    mobile?: string;
    pickupLocation?: string;
    deliveryLocation?: string;
    general?: string;
  }>({});

  const [result, setResult] = useState<ServiceabilityResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: typeof formErrors = {};

    // 1. Mobile Number Frontend Validation
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobile = 'Please enter a valid 10-digit Indian mobile number.';
    }

    // 2. Pickup Location Frontend Validation
    if (!pickupLocation) {
      errors.pickupLocation = 'Pickup location is required. Please search and select a location.';
    }

    // 3. Delivery Location Frontend Validation
    if (!deliveryLocation) {
      errors.deliveryLocation = 'Delivery location is required. Please search and select a location.';
    }

    // 4. Same Location Check
    if (
      pickupLocation &&
      deliveryLocation &&
      pickupLocation.pincode === deliveryLocation.pincode &&
      pickupLocation.locality.toLowerCase() === deliveryLocation.locality.toLowerCase()
    ) {
      errors.deliveryLocation = 'Pickup and delivery locations cannot be identical.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Execute Backend / Service Layer Check
      const response = await checkServiceability({
        mobile: cleanMobile,
        pickupLocation,
        deliveryLocation,
      });

      if (!response.success && response.errors) {
        setFormErrors(response.errors);
      } else {
        setResult(response);
      }
    } catch (err: any) {
      setFormErrors({ general: 'Network error while checking serviceability. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = () => {
    setResult(null);
    setFormErrors({});
  };

  if (result) {
    return (
      <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
        <ServiceabilityResultCard
          result={result}
          onModify={handleModify}
          onContinue={() => {
            if (onSuccessContinue) onSuccessContinue(result);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="bg-slate-50 p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Top Form Header */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600 shrink-0" /> Delivery Availability &amp; Serviceability Check
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Search pickup/delivery localities or PIN codes to check courier availability and instant freight estimates.
            </p>
          </div>

          {/* General Error Banner */}
          {formErrors.general && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formErrors.general}</span>
            </div>
          )}

          {/* Form Fields Stack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Pickup Location */}
            <LocationAutocomplete
              label="Pickup Location"
              placeholder="Search city, area or PIN code"
              value={pickupLocation}
              onChange={(loc) => {
                setPickupLocation(loc);
                if (formErrors.pickupLocation) {
                  setFormErrors((prev) => ({ ...prev, pickupLocation: undefined }));
                }
              }}
              error={formErrors.pickupLocation}
              required
            />

            {/* 2. Delivery Location */}
            <LocationAutocomplete
              label="Delivery Location"
              placeholder="Search city, area or PIN code"
              value={deliveryLocation}
              onChange={(loc) => {
                setDeliveryLocation(loc);
                if (formErrors.deliveryLocation) {
                  setFormErrors((prev) => ({ ...prev, deliveryLocation: undefined }));
                }
              }}
              error={formErrors.deliveryLocation}
              required
            />

            {/* 3. Mobile Number */}
            <MobileInput
              value={mobileNumber}
              onChange={(val) => {
                setMobileNumber(val);
                if (formErrors.mobile) {
                  setFormErrors((prev) => ({ ...prev, mobile: undefined }));
                }
              }}
              error={formErrors.mobile}
              required
            />
          </div>

          {/* Primary CTA Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base font-display transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Checking Availability...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span>Check Delivery Availability</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
