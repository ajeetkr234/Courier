import { useState, useCallback, useEffect, useRef } from 'react';
import { verifyPincode, PincodeLookupResult, isValidPincodeFormat } from '../services/pincodeService';

export interface UsePincodeLookupOptions {
  initialPincode?: string;
  onVerified?: (data: PincodeLookupResult) => void;
  autoVerifyOn6Digits?: boolean;
}

export function usePincodeLookup(options?: UsePincodeLookupOptions) {
  const { initialPincode = '', onVerified, autoVerifyOn6Digits = true } = options || {};

  const [pincode, setPincodeState] = useState(initialPincode);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<PincodeLookupResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onVerifiedRef = useRef(onVerified);
  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  const pincodeRef = useRef(pincode);
  useEffect(() => {
    pincodeRef.current = pincode;
  }, [pincode]);

  const verify = useCallback(async (pinToVerify?: string) => {
    const targetPin = (pinToVerify !== undefined ? pinToVerify : pincodeRef.current).replace(/\D/g, '').trim();

    if (!targetPin) {
      setStatus('idle');
      setResult(null);
      setErrorMsg(null);
      return null;
    }

    if (targetPin.length < 6) {
      setStatus('idle');
      setResult(null);
      setErrorMsg(null);
      return null;
    }

    if (!isValidPincodeFormat(targetPin)) {
      setStatus('error');
      const err = targetPin.startsWith('0')
        ? 'Indian PIN codes cannot start with 0'
        : 'Must be a valid 6-digit PIN code';
      setErrorMsg(err);
      setResult(null);
      return null;
    }

    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await verifyPincode(targetPin);
      if (res.isValid) {
        setStatus('success');
        setResult(res);
        setErrorMsg(null);
        if (onVerifiedRef.current) {
          onVerifiedRef.current(res);
        }
        return res;
      } else {
        setStatus('error');
        setResult(null);
        setErrorMsg(res.error || 'Invalid or unserviceable PIN code');
        return null;
      }
    } catch {
      setStatus('error');
      setResult(null);
      setErrorMsg('Could not verify PIN code. Please check again.');
      return null;
    }
  }, []);

  const setPincode = useCallback((newPin: string) => {
    // Only allow numeric input up to 6 digits
    const cleaned = newPin.replace(/\D/g, '').slice(0, 6);
    setPincodeState(cleaned);
    pincodeRef.current = cleaned;

    if (cleaned.length < 6) {
      setStatus('idle');
      setErrorMsg(null);
      setResult(null);
    } else if (autoVerifyOn6Digits && cleaned.length === 6) {
      verify(cleaned);
    }
  }, [autoVerifyOn6Digits, verify]);

  // Initial trigger if initialPincode is valid 6 digits
  useEffect(() => {
    if (initialPincode && initialPincode.replace(/\D/g, '').length === 6 && status === 'idle' && !result) {
      verify(initialPincode);
    }
  }, [initialPincode, status, result, verify]);

  const reset = useCallback(() => {
    setPincodeState('');
    setStatus('idle');
    setResult(null);
    setErrorMsg(null);
  }, []);

  return {
    pincode,
    setPincode,
    verify,
    reset,
    status,
    result,
    errorMsg,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    city: result?.city,
    state: result?.state,
    district: result?.district,
    localities: result?.localities || [],
  };
}
