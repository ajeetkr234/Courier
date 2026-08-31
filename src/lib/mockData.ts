import {
  Seller,
  UserProfile,
  Warehouse,
  Order,
  Courier,
  RateCard,
  Shipment,
  NDRCase,
  ReturnOrder,
  LedgerEntry,
  CODRemittance,
  ReconciliationRecord,
  WeightDiscrepancy,
  APIKey,
  WebhookEndpoint,
  IntegrationAccount,
  AuditLog,
  PickupRequest,
  Manifest,
} from '../types';

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 's-101',
    company_name: 'Apex Retail Labs',
    brand_name: 'Apex Gear',
    gstin: '27AAACA123411Z5',
    pan: 'ABCDE1234F',
    status: 'ACTIVE',
    rate_card_id: 'rc-standard',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 's-102',
    company_name: 'Urban Crafts India',
    brand_name: 'UrbanCraft',
    gstin: '07BBBCC567822Z9',
    pan: 'XYZPD9876Q',
    status: 'ACTIVE',
    rate_card_id: 'rc-pro',
    created_at: '2026-02-01T11:30:00Z',
    updated_at: '2026-02-01T11:30:00Z',
  },
  {
    id: 's-103',
    company_name: 'Velox Tech Traders',
    brand_name: 'Velox Mobile',
    pan: 'KLMNO4321P',
    status: 'KYC_PENDING',
    created_at: '2026-02-25T14:15:00Z',
    updated_at: '2026-02-25T14:15:00Z',
  },
];

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'u-owner-1',
    email: 'owner@apex.com',
    name: 'Ajeet Kumar',
    phone: '+91 9876543210',
    seller_id: 's-101',
    role: 'OWNER',
    is_active: true,
  },
  {
    id: 'u-ops-1',
    email: 'ops@apex.com',
    name: 'Rahul Sharma',
    phone: '+91 9811223344',
    seller_id: 's-101',
    role: 'OPERATIONS',
    is_active: true,
  },
  {
    id: 'u-admin-platform',
    email: 'admin@logisticsplatform.com',
    name: 'Platform Control Tower',
    phone: '+91 9900112233',
    role: 'PLATFORM_ADMIN',
    is_active: true,
  },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-mumbai',
    seller_id: 's-101',
    name: 'Bhiwandi Central Hub',
    contact_name: 'Suresh Patil',
    phone: '+91 9820011223',
    email: 'wh.mumbai@apex.com',
    address_line1: 'Plot 42, Logistics Park, Mankoli Naka',
    address_line2: 'Bhiwandi Bypass',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    pincode: '421302',
    is_default: true,
    created_at: '2026-01-11T09:00:00Z',
  },
  {
    id: 'wh-delhi',
    seller_id: 's-101',
    name: 'Gurugram Express Depot',
    contact_name: 'Amit Verma',
    phone: '+91 9810044556',
    email: 'wh.delhi@apex.com',
    address_line1: 'Building B, Sector 37 Industrial Area',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001',
    is_default: false,
    created_at: '2026-01-15T12:00:00Z',
  },
];

export const INITIAL_COURIERS: Courier[] = [
  {
    id: 'c-delhivery',
    code: 'delhivery',
    name: 'Delhivery Direct',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 180,
  },
  {
    id: 'c-xpressbees',
    code: 'xpressbees',
    name: 'Xpressbees Express',
    logo_url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 220,
  },
  {
    id: 'c-ecom',
    code: 'ecom',
    name: 'Ecom Express',
    logo_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 195,
  },
  {
    id: 'c-shadowfax',
    code: 'shadowfax',
    name: 'Shadowfax Air & Local',
    logo_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=100&h=100&fit=crop',
    is_active: true,
    api_health: 'HEALTHY',
    avg_latency_ms: 150,
  },
];

export const INITIAL_RATE_CARDS: RateCard[] = [
  {
    id: 'rc-standard',
    name: 'Standard Gold Rate Card',
    courier_id: 'c-delhivery',
    courier_name: 'Delhivery Direct',
    plan_tier: 'STANDARD',
    cod_percent: 1.8,
    cod_flat_min: 20,
    rto_multiplier: 1.0,
    zones: [
      { zone_code: 'A', zone_name: 'Within City', base_weight_kg: 0.5, base_rate: 38, additional_weight_slab_kg: 0.5, additional_rate: 22 },
      { zone_code: 'B', zone_name: 'Regional Zone', base_weight_kg: 0.5, base_rate: 48, additional_weight_slab_kg: 0.5, additional_rate: 28 },
      { zone_code: 'C', zone_name: 'Metro to Metro', base_weight_kg: 0.5, base_rate: 58, additional_weight_slab_kg: 0.5, additional_rate: 35 },
      { zone_code: 'D', zone_name: 'Rest of India', base_weight_kg: 0.5, base_rate: 68, additional_weight_slab_kg: 0.5, additional_rate: 42 },
      { zone_code: 'E', zone_name: 'Special / NE / J&K', base_weight_kg: 0.5, base_rate: 95, additional_weight_slab_kg: 0.5, additional_rate: 65 },
    ],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rc-pro',
    name: 'Pro Platinum Enterprise Rate',
    courier_id: 'c-xpressbees',
    courier_name: 'Xpressbees Express',
    plan_tier: 'PRO',
    cod_percent: 1.5,
    cod_flat_min: 18,
    rto_multiplier: 0.85,
    zones: [
      { zone_code: 'A', zone_name: 'Within City', base_weight_kg: 0.5, base_rate: 32, additional_weight_slab_kg: 0.5, additional_rate: 18 },
      { zone_code: 'B', zone_name: 'Regional Zone', base_weight_kg: 0.5, base_rate: 42, additional_weight_slab_kg: 0.5, additional_rate: 24 },
      { zone_code: 'C', zone_name: 'Metro to Metro', base_weight_kg: 0.5, base_rate: 52, additional_weight_slab_kg: 0.5, additional_rate: 30 },
      { zone_code: 'D', zone_name: 'Rest of India', base_weight_kg: 0.5, base_rate: 62, additional_weight_slab_kg: 0.5, additional_rate: 38 },
      { zone_code: 'E', zone_name: 'Special / NE / J&K', base_weight_kg: 0.5, base_rate: 85, additional_weight_slab_kg: 0.5, additional_rate: 55 },
    ],
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    seller_id: 's-101',
    warehouse_id: 'wh-mumbai',
    customer_id: 'cust-1',
    external_order_id: 'SHOPIFY-#5491',
    source: 'SHOPIFY',
    payment_type: 'PREPAID',
    cod_amount: 0,
    total_amount: 1499,
    weight_kg: 0.45,
    length_cm: 20,
    width_cm: 15,
    height_cm: 10,
    shipping_address: {
      name: 'Priya Nambiar',
      phone: '+91 9876501122',
      address_line1: 'Flat 402, Sunshine Towers, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
    items: [
      { id: 'item-1', order_id: 'ord-1001', sku: 'APX-HEAD-01', name: 'Wireless Ergonomic Headphones', quantity: 1, unit_price: 1499 }
    ],
    current_status: 'SHIPPED',
    created_at: '2026-08-27T10:30:00Z',
    updated_at: '2026-08-27T11:00:00Z',
  },
  {
    id: 'ord-1002',
    seller_id: 's-101',
    warehouse_id: 'wh-mumbai',
    customer_id: 'cust-2',
    external_order_id: 'WOO-#8821',
    source: 'WOOCOMMERCE',
    payment_type: 'COD',
    cod_amount: 2899,
    total_amount: 2899,
    weight_kg: 1.2,
    length_cm: 30,
    width_cm: 20,
    height_cm: 15,
    shipping_address: {
      name: 'Vikram Mehta',
      phone: '+91 9811299887',
      address_line1: 'House 88, Sector 15',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
    },
    items: [
      { id: 'item-2', order_id: 'ord-1002', sku: 'APX-JACKET-L', name: 'Waterproof All-Weather Jacket', quantity: 1, unit_price: 2899 }
    ],
    current_status: 'READY_TO_SHIP',
    created_at: '2026-08-28T08:15:00Z',
    updated_at: '2026-08-28T08:15:00Z',
  },
  {
    id: 'ord-1003',
    seller_id: 's-101',
    warehouse_id: 'wh-mumbai',
    customer_id: 'cust-3',
    source: 'MANUAL',
    payment_type: 'COD',
    cod_amount: 850,
    total_amount: 850,
    weight_kg: 0.3,
    shipping_address: {
      name: 'Ananya Roy',
      phone: '+91 9733445566',
      address_line1: '12/1 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
    },
    items: [
      { id: 'item-3', order_id: 'ord-1003', sku: 'APX-MUG-BLK', name: 'Thermal Insulated Flask', quantity: 1, unit_price: 850 }
    ],
    current_status: 'NDR',
    created_at: '2026-08-25T14:20:00Z',
    updated_at: '2026-08-27T16:00:00Z',
  },
  {
    id: 'ord-1004',
    seller_id: 's-101',
    warehouse_id: 'wh-delhi',
    customer_id: 'cust-4',
    source: 'API',
    payment_type: 'PREPAID',
    cod_amount: 0,
    total_amount: 4500,
    weight_kg: 2.5,
    shipping_address: {
      name: 'Rohan Gupta',
      phone: '+91 9899112233',
      address_line1: 'B-404, Cyber City Heights',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    },
    items: [
      { id: 'item-4', order_id: 'ord-1004', sku: 'APX-CHAIR-01', name: 'Ergonomic Desk Chair Mesh', quantity: 1, unit_price: 4500 }
    ],
    current_status: 'DELIVERED',
    created_at: '2026-08-22T09:00:00Z',
    updated_at: '2026-08-25T15:30:00Z',
  },
  {
    id: 'ord-1005',
    seller_id: 's-101',
    warehouse_id: 'wh-mumbai',
    customer_id: 'cust-5',
    source: 'CSV',
    payment_type: 'COD',
    cod_amount: 1200,
    total_amount: 1200,
    weight_kg: 0.6,
    shipping_address: {
      name: 'Karan Johar',
      phone: '+91 9922334455',
      address_line1: '77 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
    },
    items: [
      { id: 'item-5', order_id: 'ord-1005', sku: 'APX-BAG-02', name: 'Leather Duffel Bag', quantity: 1, unit_price: 1200 }
    ],
    current_status: 'NEW',
    created_at: '2026-08-28T11:00:00Z',
    updated_at: '2026-08-28T11:00:00Z',
  },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'shp-501',
    seller_id: 's-101',
    order_id: 'ord-1001',
    order: INITIAL_ORDERS[0],
    courier_id: 'c-delhivery',
    courier_name: 'Delhivery Direct',
    courier_code: 'delhivery',
    awb_number: 'DEL992817261',
    label_url: '#',
    status: 'IN_TRANSIT',
    pickup_date: '2026-08-27T12:00:00Z',
    shipping_cost: 68,
    cod_charge: 0,
    created_at: '2026-08-27T11:00:00Z',
    updated_at: '2026-08-27T18:00:00Z',
  },
  {
    id: 'shp-502',
    seller_id: 's-101',
    order_id: 'ord-1003',
    order: INITIAL_ORDERS[2],
    courier_id: 'c-xpressbees',
    courier_name: 'Xpressbees Express',
    courier_code: 'xpressbees',
    awb_number: 'XPB882199341',
    label_url: '#',
    status: 'NDR',
    pickup_date: '2026-08-26T10:00:00Z',
    shipping_cost: 72,
    cod_charge: 20,
    created_at: '2026-08-25T15:00:00Z',
    updated_at: '2026-08-27T16:00:00Z',
  },
  {
    id: 'shp-503',
    seller_id: 's-101',
    order_id: 'ord-1004',
    order: INITIAL_ORDERS[3],
    courier_id: 'c-ecom',
    courier_name: 'Ecom Express',
    courier_code: 'ecom',
    awb_number: 'ECOM774411029',
    label_url: '#',
    status: 'DELIVERED',
    pickup_date: '2026-08-23T11:00:00Z',
    shipping_cost: 110,
    cod_charge: 0,
    created_at: '2026-08-22T10:00:00Z',
    updated_at: '2026-08-25T15:30:00Z',
  },
];

export const INITIAL_NDR_CASES: NDRCase[] = [
  {
    id: 'ndr-301',
    seller_id: 's-101',
    shipment_id: 'shp-502',
    shipment: INITIAL_SHIPMENTS[1],
    reason: 'Customer Refused Delivery — Price Discrepancy',
    attempt_count: 2,
    last_attempt_at: '2026-08-27T15:30:00Z',
    status: 'ACTION_REQUIRED',
    created_at: '2026-08-27T16:00:00Z',
  },
];

export const INITIAL_RETURNS: ReturnOrder[] = [
  {
    id: 'ret-101',
    seller_id: 's-101',
    original_order_id: 'ord-1004',
    original_order: INITIAL_ORDERS[3],
    return_reason: 'Defective / Damaged product received',
    return_awb: 'RET-DEL-9001',
    is_exchange: true,
    exchange_item_name: 'Ergonomic Desk Chair Mesh (Black Edition)',
    status: 'APPROVED',
    created_at: '2026-08-26T14:00:00Z',
  },
];

export const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'led-1',
    seller_id: 's-101',
    type: 'RECHARGE',
    amount: 5000,
    direction: 'CREDIT',
    reference_type: 'PAYMENT_GATEWAY',
    reference_id: 'pay_M10098231',
    description: 'Wallet instant top-up via UPI',
    created_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'led-2',
    seller_id: 's-101',
    type: 'SHIPMENT_DEBIT',
    amount: 68,
    direction: 'DEBIT',
    reference_type: 'AWB',
    reference_id: 'DEL992817261',
    description: 'Shipping charge for Order #ord-1001',
    created_at: '2026-08-27T11:00:00Z',
  },
  {
    id: 'led-3',
    seller_id: 's-101',
    type: 'SHIPMENT_DEBIT',
    amount: 92,
    direction: 'DEBIT',
    reference_type: 'AWB',
    reference_id: 'XPB882199341',
    description: 'Shipping + COD fee for Order #ord-1003',
    created_at: '2026-08-25T15:00:00Z',
  },
  {
    id: 'led-4',
    seller_id: 's-101',
    type: 'WEIGHT_ADJUSTMENT',
    amount: 35,
    direction: 'DEBIT',
    reference_type: 'DISPUTE',
    reference_id: 'wd-901',
    description: 'Weight discrepancy excess charge debit (AWB DEL992817261)',
    created_at: '2026-08-26T09:30:00Z',
  },
];

export const INITIAL_COD_REMITTANCES: CODRemittance[] = [
  {
    id: 'cod-101',
    seller_id: 's-101',
    seller_name: 'Apex Retail Labs',
    remittance_reference: 'REM-2026-0824-001',
    amount: 4500,
    shipment_count: 3,
    status: 'SETTLED',
    settled_at: '2026-08-24T17:00:00Z',
    created_at: '2026-08-24T10:00:00Z',
  },
  {
    id: 'cod-102',
    seller_id: 's-101',
    seller_name: 'Apex Retail Labs',
    remittance_reference: 'REM-2026-0828-009',
    amount: 2899,
    shipment_count: 1,
    status: 'PENDING',
    created_at: '2026-08-28T09:00:00Z',
  },
];

export const INITIAL_RECONCILIATIONS: ReconciliationRecord[] = [
  {
    id: 'rec-1',
    awb_number: 'ECOM774411029',
    seller_id: 's-101',
    courier_code: 'ecom',
    courier_remitted_amount: 4500,
    platform_expected_amount: 4500,
    discrepancy_amount: 0,
    category: 'COD_MISMATCH',
    status: 'RESOLVED',
    notes: 'Exact match verified with bank statement.',
    created_at: '2026-08-25T16:00:00Z',
  },
  {
    id: 'rec-2',
    awb_number: 'XPB882199341',
    seller_id: 's-101',
    courier_code: 'xpressbees',
    courier_remitted_amount: 800,
    platform_expected_amount: 850,
    discrepancy_amount: 50,
    category: 'COD_MISMATCH',
    status: 'FLAGGED',
    notes: 'Short remittance by courier of ₹50 on COD collection.',
    created_at: '2026-08-27T18:00:00Z',
  },
];

export const INITIAL_WEIGHT_DISCREPANCIES: WeightDiscrepancy[] = [
  {
    id: 'wd-901',
    seller_id: 's-101',
    shipment_id: 'shp-501',
    shipment: INITIAL_SHIPMENTS[0],
    declared_weight_kg: 0.45,
    charged_weight_kg: 0.95,
    excess_charge: 35,
    status: 'PENDING',
    deadline: '2026-08-31T23:59:59Z',
    evidence_urls: [],
    created_at: '2026-08-26T09:00:00Z',
  },
];

export const INITIAL_API_KEYS: APIKey[] = [
  {
    id: 'key-1',
    seller_id: 's-101',
    name: 'Production API Key',
    key_prefix: 'pk_live_apx_',
    secret_key_masked: 'pk_live_apx_9921****8811',
    scopes: ['orders:read', 'orders:write', 'rates:read', 'shipments:write'],
    is_active: true,
    last_used_at: '2026-08-28T10:00:00Z',
    created_at: '2026-01-15T10:00:00Z',
  },
];

export const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'whk-1',
    seller_id: 's-101',
    url: 'https://api.apexgear.in/webhooks/shipping',
    secret: 'whsec_99381726351412',
    subscribed_events: ['shipment.created', 'shipment.delivered', 'shipment.ndr', 'cod.remitted'],
    is_active: true,
    created_at: '2026-02-01T12:00:00Z',
  },
];

export const INITIAL_INTEGRATIONS: IntegrationAccount[] = [
  {
    id: 'int-1',
    seller_id: 's-101',
    platform: 'SHOPIFY',
    store_name: 'Apex Gear Flagship Store',
    store_url: 'apexgear.myshopify.com',
    status: 'CONNECTED',
    auto_sync_orders: true,
    sync_tracking: true,
    last_synced_at: '2026-08-28T11:15:00Z',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'int-2',
    seller_id: 's-101',
    platform: 'WOOCOMMERCE',
    store_name: 'Apex Gear Outlet WP',
    store_url: 'outlet.apexgear.in',
    status: 'CONNECTED',
    auto_sync_orders: true,
    sync_tracking: true,
    last_synced_at: '2026-08-28T08:00:00Z',
    created_at: '2026-02-05T14:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    user_name: 'Platform Control Tower',
    user_email: 'admin@logisticsplatform.com',
    role: 'PLATFORM_ADMIN',
    action: 'SELLER_KYC_APPROVED',
    entity_type: 'SELLER',
    entity_id: 's-101',
    old_value: 'KYC_PENDING',
    new_value: 'ACTIVE',
    ip_address: '103.22.140.5',
    timestamp: '2026-01-11T11:00:00Z',
  },
  {
    id: 'audit-2',
    user_name: 'Ajeet Kumar',
    user_email: 'owner@apex.com',
    role: 'OWNER',
    action: 'RATE_CARD_ASSIGNED',
    entity_type: 'SELLER',
    entity_id: 's-101',
    old_value: 'NONE',
    new_value: 'rc-standard',
    ip_address: '49.36.12.80',
    timestamp: '2026-01-11T11:05:00Z',
  },
];

export const INITIAL_PICKUPS: PickupRequest[] = [
  {
    id: 'pick-101',
    seller_id: 's-101',
    warehouse_id: 'wh-mumbai',
    courier_id: 'c-delhivery',
    courier_name: 'Delhivery Direct',
    pickup_date: '2026-08-29',
    status: 'SCHEDULED',
    pickup_reference: 'PKP-DEL-882910',
    expected_package_count: 5,
    created_at: '2026-08-28T09:00:00Z',
  },
];

export const INITIAL_MANIFESTS: Manifest[] = [
  {
    id: 'mnf-1',
    manifest_number: 'MNF-20260827-01',
    seller_id: 's-101',
    courier_id: 'c-delhivery',
    courier_name: 'Delhivery Direct',
    warehouse_id: 'wh-mumbai',
    shipment_ids: ['shp-501'],
    total_packages: 1,
    total_weight_kg: 0.45,
    status: 'HANDED_OVER',
    created_at: '2026-08-27T11:30:00Z',
  },
];

// Backwards compatibility aliases
export const MOCK_USER = INITIAL_USER_PROFILES[0];
export const MOCK_ADMIN_USER = INITIAL_USER_PROFILES[2];
export const MOCK_WAREHOUSES = INITIAL_WAREHOUSES;
export const MOCK_ORDERS = INITIAL_ORDERS;
export const MOCK_SHIPMENTS = INITIAL_SHIPMENTS;
export const MOCK_COURIERS = INITIAL_COURIERS;
export const MOCK_NDR_CASES = INITIAL_NDR_CASES;
export const MOCK_WEIGHT_DISPUTES = INITIAL_WEIGHT_DISCREPANCIES;
export const MOCK_LEDGER_ENTRIES = INITIAL_LEDGER_ENTRIES;
export const MOCK_API_KEYS = INITIAL_API_KEYS;
export const MOCK_WEBHOOKS = INITIAL_WEBHOOKS;
export const MOCK_WALLETS = {
  'seller-1': { balance: 4805 }
};

