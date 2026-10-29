import { supabase } from '../lib/supabase';
import type { Seller } from '../types';

export async function submitSellerOnboarding(input: {
  companyName: string;
  brandName: string;
  gstin: string;
  pan: string;
}): Promise<Seller> {
  const { data, error } = await supabase.rpc('submit_seller_onboarding', {
    p_company_name: input.companyName.trim(),
    p_brand_name: input.brandName.trim(),
    p_gstin: input.gstin.trim().toUpperCase(),
    p_pan: input.pan.trim().toUpperCase(),
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Seller profile was not saved.');
  return data as Seller;
}
