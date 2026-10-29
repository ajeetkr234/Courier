import { supabase } from '../lib/supabase';

async function invoke(body: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke('verify-pickup-address', { body });
  if (error) {
    let message = error.message || 'Pickup verification failed';
    const response = (error as { context?: Response }).context;
    if (response) {
      try {
        const payload = await response.clone().json() as { error?: string; message?: string };
        message = payload.error || payload.message || message;
      } catch {
        // Use the SDK message when the function response is not JSON.
      }
    }
    throw new Error(message);
  }
  if (!data?.ok) throw new Error(data?.error || 'Pickup verification failed');
  return data;
}

export const sendPickupOtp = (warehouseId: string) => invoke({ action: 'send', warehouseId });
export const verifyPickupOtp = (warehouseId: string, otp: string) => invoke({ action: 'verify', warehouseId, otp });
