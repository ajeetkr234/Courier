// User & Multi-Tenancy Roles
export type UserRole = 
  | 'OWNER' | 'ADMIN' | 'OPERATIONS' | 'WAREHOUSE' | 'FINANCE' | 'SUPPORT' | 'VIEWER'
  | 'PLATFORM_ADMIN' | 'PLATFORM_OPERATIONS' | 'PLATFORM_FINANCE' | 'PLATFORM_SUPPORT';

export type SellerStatus = 'DRAFT' | 'KYC_PENDING' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface Seller {
  id: string;
  company_name: string;
  brand_name?: string;
  contact_email?: string;
  contact_phone?: string;
  gstin?: string;
  pan: string;
  status: SellerStatus;
  rate_card_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  seller_id?: string;
  role: UserRole;
  is_active?: boolean;
}

export interface SellerKYC {
  id: string;
  seller_id: string;
  gst_certificate_url?: string;
  pan_card_url?: string;
  address_proof_url?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface SellerBankAccount {
  id: string;
  seller_id: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  bank_name: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Warehouse {
  id: string;
  seller_id: string;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  address_verified_at?: string;
  phone_verified_at?: string;
  pickup_verified?: boolean;
  created_at: string;
}

// Orders
export type OrderSource = 'MANUAL' | 'CSV' | 'SHOPIFY' | 'WOOCOMMERCE' | 'API';
export type OrderStatus = 
  | 'NEW' | 'CONFIRMED' | 'READY_TO_SHIP' | 'SHIPPED' | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'NDR' | 'RTO' | 'RETURNED' | 'CANCELLED';

export type PaymentType = 'PREPAID' | 'COD';

export interface Customer {
  id: string;
  seller_id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export type RTORiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Order {
  id: string;
  seller_id: string;
  warehouse_id: string;
  customer_id: string;
  customer?: Customer;
  warehouse?: Warehouse;
  external_order_id?: string;
  source: OrderSource;
  payment_type: PaymentType;
  cod_amount: number;
  total_amount: number;
  pricing_breakdown?: {
    product_subtotal: number; product_tax: number; product_discount: number;
    shipping_charges: number; cod_charges: number; gift_wrap_charges: number;
    transaction_charges: number; order_discount: number;
  };
  weight_kg: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  shipping_address: ShippingAddress;
  items?: OrderItem[];
  current_status: OrderStatus;
  rto_risk_level?: RTORiskLevel;
  rto_risk_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  description?: string;
  actor_id?: string;
  created_at: string;
}

// Couriers & Rate Cards
export interface Courier {
  id: string;
  code: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
  api_health?: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  avg_latency_ms?: number;
  api_key_encrypted?: string;
}

export interface CourierService {
  id: string;
  courier_id: string;
  service_code: string;
  service_name: string;
  is_active: boolean;
}

export interface RateQuote {
  id: string;
  seller_id: string;
  order_id?: string;
  courier_id: string;
  courier_name: string;
  courier_code: string;
  service_name: string;
  base_rate: number;
  cod_charge: number;
  surcharges: number;
  tax_amount: number;
  total_rate: number;
  estimated_days: number;
  recommendation_badge?: 'Cheapest' | 'Fastest' | 'Recommended';
  expires_at: string;
}

export interface RateCardZone {
  zone_code: string;
  zone_name: string; // e.g. Within City, Regional, Metro to Metro, Rest of India, Special Zone
  base_weight_kg: number;
  base_rate: number;
  additional_weight_slab_kg: number;
  additional_rate: number;
}

export interface RateCard {
  id: string;
  name: string;
  courier_id: string;
  courier_name: string;
  plan_tier: 'STANDARD' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
  cod_percent: number;
  cod_flat_min: number;
  rto_multiplier: number; // e.g. 1.0x or 0.8x forward rate
  zones: RateCardZone[];
  created_at: string;
}

// Shipments, Manifests & Tracking
export type ShipmentStatus = 
  | 'CREATED' | 'PICKUP_SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'NDR' | 'RTO_INITIATED'
  | 'RTO_IN_TRANSIT' | 'RTO_DELIVERED' | 'LOST' | 'CANCELLED';

export interface Shipment {
  id: string;
  seller_id: string;
  order_id: string;
  order?: Order;
  courier_id: string;
  courier_name?: string;
  courier_code?: string;
  awb_number: string;
  label_url?: string;
  status: ShipmentStatus;
  pickup_date?: string;
  shipping_cost?: number;
  cod_charge?: number;
  total_freight_charge?: number;
  applied_quote_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Manifest {
  id: string;
  manifest_number: string;
  seller_id: string;
  courier_id: string;
  courier_name: string;
  warehouse_id: string;
  shipment_ids: string[];
  total_packages: number;
  total_weight_kg: number;
  status: 'GENERATED' | 'HANDED_OVER' | 'CANCELLED';
  created_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  raw_status: string;
  normalized_status: ShipmentStatus;
  event_time: string;
  location?: string;
  message?: string;
}

export interface PickupRequest {
  id: string;
  seller_id: string;
  warehouse_id: string;
  courier_id: string;
  courier_name?: string;
  pickup_date: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'PICKED_UP' | 'FAILED' | 'CANCELLED';
  pickup_reference?: string;
  expected_package_count?: number;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  seller_id: string;
  ticket_number: string;
  category: string;
  subject: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_SELLER' | 'RESOLVED' | 'CLOSED';
  sla_due_at: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentClaim {
  id: string;
  seller_id: string;
  shipment_id: string;
  claim_type: 'LOST' | 'DAMAGED' | 'TAMPERED' | 'SHORT' | 'POD_DISPUTE';
  claimed_amount: number;
  approved_amount?: number;
  description: string;
  evidence_paths: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'PAID';
  resolution_notes?: string;
  submitted_at: string;
  resolved_at?: string;
  shipment?: Shipment;
}

// NDR & RTO
export interface NDRCase {
  id: string;
  seller_id: string;
  shipment_id: string;
  shipment?: Shipment;
  reason: string;
  attempt_count: number;
  last_attempt_at?: string;
  status: 'ACTION_REQUIRED' | 'REATTEMPT_REQUESTED' | 'RTO_REQUESTED' | 'RESOLVED';
  created_at: string;
}

export interface NDRAction {
  id: string;
  ndr_case_id: string;
  action_type: 'REATTEMPT' | 'ADDRESS_UPDATE' | 'PHONE_UPDATE' | 'RTO';
  action_details?: Record<string, any>;
  performed_by?: string;
  status: 'SUBMITTED' | 'PROCESSED' | 'FAILED';
  created_at: string;
}

export interface NDREscalation {
  id: string;
  ndr_case_id: string;
  awb_number: string;
  seller_id: string;
  seller_name?: string;
  courier_code: string;
  customer_phone: string;
  customer_name: string;
  reason: string;
  evidence_notes: string;
  carrier_escalation_status: 'OPEN' | 'INVESTIGATING' | 'CARRIER_WARNED' | 'RESOLVED_REATTEMPT' | 'PENALIZED';
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
}

// Returns & Exchanges
export interface ReturnOrder {
  id: string;
  seller_id: string;
  original_order_id: string;
  original_order?: Order;
  return_reason: string;
  return_awb?: string;
  reverse_awb_number?: string;
  reason?: string;
  is_exchange?: boolean;
  exchange_item_name?: string;
  pickup_details?: Record<string, string>;
  status: 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'RECEIVED' | 'REJECTED';
  created_at: string;
}

// Wallet, COD & Finance
export type TransactionType = 
  | 'RECHARGE' | 'SHIPMENT_DEBIT' | 'RTO_DEBIT' | 'COD_CHARGE' 
  | 'WEIGHT_ADJUSTMENT' | 'REFUND' | 'MANUAL_ADJUSTMENT';

export interface Wallet {
  seller_id: string;
  balance: number;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  seller_id: string;
  type: TransactionType;
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  reference_type: string;
  reference_id: string;
  idempotency_key?: string;
  description?: string;
  created_at: string;
  created_by?: string;
}

export interface CODRemittance {
  id: string;
  seller_id: string;
  seller_name?: string;
  remittance_reference: string;
  amount: number;
  shipment_count: number;
  status: 'PENDING' | 'SETTLED' | 'MISMATCHED';
  settled_at?: string;
  created_at: string;
}

export interface CODPayoutBatch {
  id: string;
  batch_reference: string;
  seller_id: string;
  seller_name: string;
  gross_cod_amount: number;
  freight_deductions: number;
  early_cod_fee: number;
  net_payout_amount: number;
  shipment_count: number;
  bank_name: string;
  account_number_masked: string;
  utr_number?: string;
  payout_mode: 'STANDARD_T3' | 'EARLY_COD_T1';
  status: 'PENDING_APPROVAL' | 'PROCESSING' | 'SETTLED' | 'REJECTED';
  settled_at?: string;
  created_at: string;
}

export interface ReconciliationRecord {
  id: string;
  awb_number: string;
  seller_id: string;
  courier_code: string;
  courier_remitted_amount: number;
  platform_expected_amount: number;
  discrepancy_amount: number;
  category: 'COD_MISMATCH' | 'WEIGHT_DISCREPANCY' | 'DUPLICATE_CHARGE' | 'UNKNOWN_AWB';
  status: 'FLAGGED' | 'RESOLVED' | 'WRITTEN_OFF';
  notes?: string;
  created_at: string;
}

// Weight Disputes
export interface WeightDiscrepancy {
  id: string;
  seller_id: string;
  shipment_id: string;
  shipment?: Shipment;
  declared_weight_kg: number;
  charged_weight_kg: number;
  excess_charge: number;
  status: 'PENDING' | 'ACCEPTED' | 'DISPUTED' | 'RESOLVED';
  deadline: string;
  evidence_urls?: string[];
  evidence_scale_url?: string;
  evidence_tape_url?: string;
  sku_master_weight?: number;
  admin_arbitration_notes?: string;
  resolution_outcome?: 'SELLER_REFUNDED' | 'COURIER_UPHELD';
  created_at: string;
}

export interface BrandedTrackingConfig {
  seller_id: string;
  brand_name: string;
  logo_url: string;
  brand_color: string;
  support_phone: string;
  support_email: string;
  promotional_banner_url: string;
  promotional_banner_link?: string;
  discount_coupon_code?: string;
  discount_percentage?: number;
  custom_domain?: string;
  help_whatsapp_number?: string;
}

// Developer, Integrations & Audit Logs
export interface APIKey {
  id: string;
  seller_id: string;
  name: string;
  key_prefix: string;
  secret_key_masked: string;
  secret?: string;
  scopes: string[];
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  seller_id: string;
  url: string;
  secret: string;
  subscribed_events: string[];
  is_active: boolean;
  created_at: string;
}

export interface IntegrationAccount {
  id: string;
  seller_id: string;
  platform: 'SHOPIFY' | 'WOOCOMMERCE' | 'CUSTOM_API';
  store_name: string;
  store_url: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  auto_sync_orders: boolean;
  sync_tracking: boolean;
  last_synced_at?: string;
  default_warehouse_id?: string;
  settings?: Record<string, unknown>;
  last_error?: string;
  updated_at?: string;
  created_at: string;
}

export interface WalletRechargeRequest {
  id: string;
  seller_id: string;
  amount: number;
  paid_amount?: number;
  gst_amount: number;
  payment_reference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  reviewed_by?: string;
  review_note?: string;
  reviewed_at?: string;
  created_at: string;
  sellers?: { company_name?: string; brand_name?: string };
}

export interface IntegrationSyncEvent {
  id: string; seller_id: string; integration_account_id?: string; direction: 'INBOUND' | 'OUTBOUND';
  event_type: string; external_id?: string; status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'PENDING';
  message?: string; created_at: string;
}

export interface IntegrationImportError {
  id: string; seller_id: string; integration_account_id?: string; external_order_id?: string;
  error_code: string; error_message: string; status: 'OPEN' | 'RESOLVED' | 'IGNORED'; created_at: string;
}

export interface BackgroundJob {
  id: string;
  seller_id?: string;
  job_type: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  error_message?: string;
  payload_reference?: string;
  created_at: string;
  completed_at?: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_email: string;
  role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  ip_address: string;
  timestamp: string;
}

