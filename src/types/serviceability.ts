export interface LocationAddress {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ServiceableLocationItem {
  id: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  isServiceable: boolean;
  displayText: string;
}

export interface ServiceabilityCheckParams {
  mobile: string;
  pickupLocation: ServiceableLocationItem | null;
  deliveryLocation: ServiceableLocationItem | null;
  weightKg?: number;
}

export interface ServiceabilityResponse {
  success: boolean;
  available: boolean;
  pickupLocation?: ServiceableLocationItem;
  deliveryLocation?: ServiceableLocationItem;
  pickupCity?: string;
  pickupPincode?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  estimatedDays?: string;
  estimatedPrice?: number;
  message?: string;
  errors?: {
    mobile?: string;
    pickupLocation?: string;
    deliveryLocation?: string;
    general?: string;
  };
}
