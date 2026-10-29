import { Seller } from '../types';

export function getSellerOrderEligibility(seller: Seller | null | undefined) {
  if (!seller) return { eligible: false, reason: 'Seller profile could not be found.' };
  if (!seller.company_name?.trim() || !seller.pan?.trim()) {
    return { eligible: false, reason: 'Complete your business profile and PAN details first.' };
  }
  if (seller.status !== 'ACTIVE') {
    const status = seller.status.replace(/_/g, ' ');
    return {
      eligible: false,
      reason: `Your profile is ${status}. Order creation is enabled only after Super Admin verification.`,
    };
  }
  return { eligible: true, reason: '' };
}
