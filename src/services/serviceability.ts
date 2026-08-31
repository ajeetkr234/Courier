import { ServiceableLocationItem, ServiceabilityCheckParams, ServiceabilityResponse } from '../types/serviceability';

export const MASTER_LOCATIONS: ServiceableLocationItem[] = [
  {
    id: 'loc-hyd-500081',
    locality: 'Hitec City, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    country: 'India',
    latitude: 17.4435,
    longitude: 78.3772,
    isServiceable: true,
    displayText: 'Hitec City, Madhapur, Hyderabad, Telangana — 500081',
  },
  {
    id: 'loc-hyd-500032',
    locality: 'Gachibowli, Financial District',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    country: 'India',
    latitude: 17.4401,
    longitude: 78.3489,
    isServiceable: true,
    displayText: 'Gachibowli, Hyderabad, Telangana — 500032',
  },
  {
    id: 'loc-hyd-500003',
    locality: 'Secunderabad, MG Road',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500003',
    country: 'India',
    latitude: 17.4399,
    longitude: 78.4983,
    isServiceable: true,
    displayText: 'Secunderabad, Hyderabad, Telangana — 500003',
  },
  {
    id: 'loc-blr-560038',
    locality: 'Indiranagar, 100ft Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
    latitude: 12.9784,
    longitude: 77.6408,
    isServiceable: true,
    displayText: 'Indiranagar, Bangalore, Karnataka — 560038',
  },
  {
    id: 'loc-blr-560103',
    locality: 'Bellandur, Outer Ring Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560103',
    country: 'India',
    latitude: 12.9304,
    longitude: 77.6784,
    isServiceable: true,
    displayText: 'Bellandur, Outer Ring Road, Bangalore, Karnataka — 560103',
  },
  {
    id: 'loc-blr-560001',
    locality: 'MG Road, Commercial Street',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    isServiceable: true,
    displayText: 'MG Road, Central Bangalore, Karnataka — 560001',
  },
  {
    id: 'loc-bom-400001',
    locality: 'Fort, Marine Lines',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
    latitude: 18.9332,
    longitude: 72.8335,
    isServiceable: true,
    displayText: 'Fort, South Mumbai, Maharashtra — 400001',
  },
  {
    id: 'loc-bom-400051',
    locality: 'Bandra East, BKC Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    country: 'India',
    latitude: 19.0607,
    longitude: 72.8664,
    isServiceable: true,
    displayText: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra — 400051',
  },
  {
    id: 'loc-del-110020',
    locality: 'Okhla Industrial Area',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110020',
    country: 'India',
    latitude: 28.5355,
    longitude: 77.2711,
    isServiceable: true,
    displayText: 'Okhla Industrial Area, South Delhi — 110020',
  },
  {
    id: 'loc-del-110001',
    locality: 'Connaught Place, Janpath',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    country: 'India',
    latitude: 28.6315,
    longitude: 77.2167,
    isServiceable: true,
    displayText: 'Connaught Place, Central Delhi — 110001',
  },
  {
    id: 'loc-pun-411001',
    locality: 'Camp, Pune Railway Station',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    isServiceable: true,
    displayText: 'Camp, Pune City, Maharashtra — 411001',
  },
  {
    id: 'loc-pun-411057',
    locality: 'Hinjawadi IT Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    country: 'India',
    latitude: 18.5912,
    longitude: 73.7389,
    isServiceable: true,
    displayText: 'Hinjawadi Phase 1, IT Park, Pune, Maharashtra — 411057',
  },
  {
    id: 'loc-maa-600001',
    locality: 'Parrys, George Town',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    isServiceable: true,
    displayText: 'Parrys, Central Chennai, Tamil Nadu — 600001',
  },
  {
    id: 'loc-ccu-700001',
    locality: 'BBD Bagh, Dalhousie',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700001',
    country: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
    isServiceable: true,
    displayText: 'BBD Bagh, Central Kolkata, West Bengal — 700001',
  },
  {
    id: 'loc-gur-122002',
    locality: 'DLF Cyber City, Sector 24',
    city: 'Gurgaon',
    state: 'Haryana',
    pincode: '122002',
    country: 'India',
    latitude: 28.495,
    longitude: 77.0895,
    isServiceable: true,
    displayText: 'DLF Cyber City, Gurgaon, Haryana — 122002',
  },
  {
    id: 'loc-noi-201301',
    locality: 'Sector 18, Commercial Market',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    country: 'India',
    latitude: 28.5708,
    longitude: 77.3261,
    isServiceable: true,
    displayText: 'Sector 18 Market, Noida, Uttar Pradesh — 201301',
  },
  {
    id: 'loc-amd-380001',
    locality: 'Navrangpura, Ashram Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    isServiceable: true,
    displayText: 'Navrangpura, Ahmedabad, Gujarat — 380001',
  },
  {
    id: 'loc-jai-302001',
    locality: 'MI Road, Pink City',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    country: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
    isServiceable: true,
    displayText: 'MI Road, Jaipur, Rajasthan — 302001',
  },
  {
    id: 'loc-unserv-799999',
    locality: 'Remote Valley Restricted Zone',
    city: 'Leh Ladakh',
    state: 'Ladakh',
    pincode: '799999',
    country: 'India',
    latitude: 34.1526,
    longitude: 77.5771,
    isServiceable: false,
    displayText: 'Remote Valley, Leh Ladakh — 799999 (Unserviceable Demo)',
  },
];

export function searchLocations(query: string): ServiceableLocationItem[] {
  if (!query || query.trim().length < 2) return [];
  const cleanQ = query.trim().toLowerCase();

  return MASTER_LOCATIONS.filter((loc) => {
    const matchLocality = loc.locality.toLowerCase().includes(cleanQ);
    const matchCity = loc.city.toLowerCase().includes(cleanQ);
    const matchState = loc.state.toLowerCase().includes(cleanQ);
    const matchPincode = loc.pincode.startsWith(cleanQ);
    return matchLocality || matchCity || matchState || matchPincode;
  }).slice(0, 6);
}

export async function checkServiceability(
  params: ServiceabilityCheckParams
): Promise<ServiceabilityResponse> {
  // Simulate asynchronous backend API latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const errors: ServiceabilityResponse['errors'] = {};

  // 1. Mobile Number Backend Validation
  const cleanMobile = (params.mobile || '').replace(/\D/g, '');
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!cleanMobile) {
    errors.mobile = 'Mobile number is required.';
  } else if (!indianMobileRegex.test(cleanMobile)) {
    errors.mobile = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
  }

  // 2. Pickup Location Validation
  if (!params.pickupLocation) {
    errors.pickupLocation = 'Please search and select a valid pickup location.';
  } else if (!/^\d{6}$/.test(params.pickupLocation.pincode)) {
    errors.pickupLocation = 'Invalid pickup PIN code format.';
  }

  // 3. Delivery Location Validation
  if (!params.deliveryLocation) {
    errors.deliveryLocation = 'Please search and select a valid delivery location.';
  } else if (!/^\d{6}$/.test(params.deliveryLocation.pincode)) {
    errors.deliveryLocation = 'Invalid delivery PIN code format.';
  }

  // 4. Same Location Check
  if (
    params.pickupLocation &&
    params.deliveryLocation &&
    params.pickupLocation.pincode === params.deliveryLocation.pincode &&
    params.pickupLocation.locality.toLowerCase() === params.deliveryLocation.locality.toLowerCase()
  ) {
    errors.deliveryLocation = 'Pickup and delivery locations cannot be identical.';
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      available: false,
      errors,
      message: 'Validation failed. Please correct the errors above.',
    };
  }

  const pickup = params.pickupLocation!;
  const delivery = params.deliveryLocation!;

  // 5. Serviceability Check (Unserviceable flag check)
  if (!pickup.isServiceable || !delivery.isServiceable) {
    return {
      success: true,
      available: false,
      pickupCity: pickup.city,
      pickupPincode: pickup.pincode,
      deliveryCity: delivery.city,
      deliveryPincode: delivery.pincode,
      pickupLocation: pickup,
      deliveryLocation: delivery,
      message: "We currently don't provide delivery between these locations.",
    };
  }

  // 6. Calculate Price & SLA based on zone/city match
  const isIntraCity = pickup.city.toLowerCase() === delivery.city.toLowerCase();
  const estimatedDays = isIntraCity ? 'Same Day – 1 Day' : '1–2 Days';
  const baseRate = isIntraCity ? 89 : 149;
  const weight = params.weightKg || 0.5;
  const estimatedPrice = Math.round(baseRate + (weight > 0.5 ? (weight - 0.5) * 40 : 0));

  return {
    success: true,
    available: true,
    pickupCity: pickup.city,
    pickupPincode: pickup.pincode,
    deliveryCity: delivery.city,
    deliveryPincode: delivery.pincode,
    pickupLocation: pickup,
    deliveryLocation: delivery,
    estimatedDays,
    estimatedPrice,
    message: 'Delivery Available',
  };
}
