import { create } from 'zustand';
import { isMockMode } from '../lib/supabase';
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
  OrderStatus,
  ShipmentStatus,
  NDREscalation,
  BrandedTrackingConfig,
  CODPayoutBatch,
  SellerBankAccount,
  RTORiskLevel,
} from '../types';
import {
  fetchOrdersFromSupabase,
  createOrderInSupabase,
  bulkCreateOrdersInSupabase,
  updateOrderStatusInSupabase,
  subscribeToOrders,
} from './supabaseOrders';
import {
  fetchCouriersFromSupabase,
  fetchRateCardsFromSupabase,
} from './supabaseCouriers';
import {
  fetchWarehousesFromSupabase,
  createWarehouseInSupabase,
} from './supabaseWarehouses';
import {
  fetchWalletFromSupabase,
  fetchLedgerEntriesFromSupabase,
  rechargeWalletInSupabase,
  fetchCODRemittancesFromSupabase,
} from './supabaseFinance';
import {
  fetchShipmentsFromSupabase,
  createShipmentInSupabase,
  schedulePickupInSupabase,
  fetchPickupsFromSupabase,
  updateShipmentStatusInSupabase,
} from './supabaseShipments';
import {
  fetchNDRCasesFromSupabase,
  submitNDRActionInSupabase,
} from './supabaseNDR';
import {
  fetchReturnsFromSupabase,
  createReturnInSupabase,
} from './supabaseReturns';
import {
  fetchWeightDisputesFromSupabase,
  resolveWeightDisputeInSupabase,
} from './supabaseDisputes';
import {
  fetchAPIKeysFromSupabase,
  createAPIKeyInSupabase,
  revokeAPIKeyInSupabase,
  fetchWebhooksFromSupabase,
  createWebhookInSupabase,
  toggleWebhookInSupabase,
} from './supabaseDeveloper';
import {
  fetchAuditLogsFromSupabase,
  logAuditActionInSupabase,
} from './supabaseAudit';
import {
  fetchSellersFromSupabase,
  updateSellerStatusInSupabase,
  updateSellerKYCInSupabase,
  toggleCourierInSupabase,
  saveRateCardInSupabase,
  addTeamMemberInSupabase,
} from './supabaseAdmin';
import { initSupabaseRealtime } from './supabaseRealtime';
import {
  fetchBrandedTrackingConfig,
  fetchCODPayoutBatches,
  fetchIntegrations,
  fetchNDREscalations,
  fetchReconciliations,
  fetchSellerBankAccount,
  fetchTeamMembers,
  saveBankAccount,
  saveBrandedTrackingConfig,
  saveCODPayoutBatch,
  saveNDREscalation,
  toggleIntegration,
  toggleTeamMember,
  updateNDREscalation,
  updateReconciliation,
} from './supabaseExtended';

// Default live seller bound to primary Supabase tenant
const DEFAULT_PRIMARY_SELLER: Seller = {
  id: '32d724db-23c4-4cba-a76f-f78e4022194e',
  company_name: 'Seller Account',
  brand_name: 'Apex Retail',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  status: 'ACTIVE',
  created_at: '2026-09-08T07:55:49.261651+00:00',
  updated_at: '2026-09-08T07:55:49.261651+00:00',
};

const DEFAULT_PRIMARY_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Seller User',
  email: 'seller@shipfaster.local',
  role: 'OWNER',
  seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
  is_active: true,
};

const DEFAULT_BANK_ACCOUNT: SellerBankAccount = {
  id: 'bank-01',
  seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
  account_number: '9182390192834',
  ifsc_code: 'HDFC0001248',
  account_holder_name: 'Apex D2C Logistics Pvt Ltd',
  bank_name: 'HDFC Bank Ltd',
  is_primary: true,
  is_verified: true,
  created_at: '2026-08-10T10:00:00Z',
};

const DEFAULT_BRANDED_TRACKING: BrandedTrackingConfig = {
  seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
  brand_name: 'Apex Retail',
  logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
  brand_color: '#4f46e5',
  support_phone: '+91 98765 43210',
  support_email: 'support@apexretail.store',
  promotional_banner_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
  promotional_banner_link: 'https://apexretail.store/festive-sale',
  discount_coupon_code: 'FASTSHIP10',
  discount_percentage: 10,
  custom_domain: 'track.apexretail.store',
  help_whatsapp_number: '+91 98765 43210',
};

const INITIAL_ESCALATIONS: NDREscalation[] = [
  {
    id: 'esc-101',
    ndr_case_id: 'ndr-sample-1',
    awb_number: 'DEL9948271049',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    seller_name: 'Apex Retail',
    courier_code: 'DELHIVERY',
    customer_phone: '+91 98201 12938',
    customer_name: 'Rahul Sharma',
    reason: 'Delivery driver marked Customer Unavailable without visiting',
    evidence_notes: 'CCTV footage confirmed no courier agent arrived at building between 2 PM and 6 PM. Buyer was at home waiting.',
    carrier_escalation_status: 'OPEN',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'esc-102',
    ndr_case_id: 'ndr-sample-2',
    awb_number: 'BLU8829102931',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    seller_name: 'Apex Retail',
    courier_code: 'BLUEDART',
    customer_phone: '+91 98920 88392',
    customer_name: 'Pooja Verma',
    reason: 'Fake OTP refusal logged by rider',
    evidence_notes: 'Customer confirmed via WhatsApp recording that rider asked for OTP over call and hung up without reaching gate.',
    carrier_escalation_status: 'INVESTIGATING',
    admin_notes: 'Escalated to BlueDart North Hub Manager. Investigating driver GPS trail.',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
];

const INITIAL_COD_BATCHES: CODPayoutBatch[] = [
  {
    id: 'batch-2026-09-08',
    batch_reference: 'COD-REM-20260908-01',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    seller_name: 'Apex Retail',
    gross_cod_amount: 48500,
    freight_deductions: 6240,
    early_cod_fee: 582,
    net_payout_amount: 41678,
    shipment_count: 26,
    bank_name: 'HDFC Bank Ltd',
    account_number_masked: '•••••••••92834',
    utr_number: 'HDFCR92026090800341',
    payout_mode: 'EARLY_COD_T1',
    status: 'SETTLED',
    settled_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 50).toISOString(),
  },
  {
    id: 'batch-2026-09-10',
    batch_reference: 'COD-REM-20260910-02',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    seller_name: 'Apex Retail',
    gross_cod_amount: 62300,
    freight_deductions: 8450,
    early_cod_fee: 747.6,
    net_payout_amount: 53102.4,
    shipment_count: 34,
    bank_name: 'HDFC Bank Ltd',
    account_number_masked: '•••••••••92834',
    utr_number: 'HDFCR92026091000874',
    payout_mode: 'EARLY_COD_T1',
    status: 'PROCESSING',
    created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
];

const INITIAL_INTEGRATIONS: IntegrationAccount[] = [
  {
    id: 'int-shopify-01',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    platform: 'SHOPIFY',
    store_name: 'Apex Retail Official Store',
    store_url: 'https://apex-retail.myshopify.com',
    status: 'CONNECTED',
    auto_sync_orders: true,
    sync_tracking: true,
    last_synced_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
  },
  {
    id: 'int-woo-02',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    platform: 'WOOCOMMERCE',
    store_name: 'Apex Clearance Outlet',
    store_url: 'https://outlet.apexretail.store',
    status: 'DISCONNECTED',
    auto_sync_orders: false,
    sync_tracking: true,
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 14).toISOString(),
  },
];

const INITIAL_RECONCILIATIONS: ReconciliationRecord[] = [
  {
    id: 'rec-001',
    awb_number: 'DEL9948271049',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    courier_code: 'DELHIVERY',
    courier_remitted_amount: 1850,
    platform_expected_amount: 1950,
    discrepancy_amount: 100,
    category: 'COD_MISMATCH',
    status: 'FLAGGED',
    notes: 'Courier remitted ₹100 less than invoice receipt.',
    created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'rec-002',
    awb_number: 'BLU8829102931',
    seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
    courier_code: 'BLUEDART',
    courier_remitted_amount: 420,
    platform_expected_amount: 340,
    discrepancy_amount: 80,
    category: 'WEIGHT_DISCREPANCY',
    status: 'RESOLVED',
    notes: 'Excess freight charge auto-refunded to wallet.',
    created_at: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
  },
];

interface PlatformStore {
  // Active User / Tenant Context
  currentSeller: Seller | null;
  currentUser: UserProfile | null;

  // Realtime WebSocket Status
  realtimeStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

  // Dynamic Data Collections from Database
  sellers: Seller[];
  userProfiles: UserProfile[];
  warehouses: Warehouse[];
  orders: Order[];
  couriers: Courier[];
  rateCards: RateCard[];
  shipments: Shipment[];
  ndrCases: NDRCase[];
  returns: ReturnOrder[];
  returnRequests: ReturnOrder[];
  ledgerEntries: LedgerEntry[];
  codRemittances: CODRemittance[];
  reconciliations: ReconciliationRecord[];
  weightDiscrepancies: WeightDiscrepancy[];
  apiKeys: APIKey[];
  webhooks: WebhookEndpoint[];
  integrations: IntegrationAccount[];
  auditLogs: AuditLog[];
  pickups: PickupRequest[];
  manifests: Manifest[];

  // Extended Advanced Platform State
  ndrEscalations: NDREscalation[];
  sellerBankAccount: SellerBankAccount | null;
  brandedTrackingConfig: BrandedTrackingConfig;
  codPayoutBatches: CODPayoutBatch[];
  isEarlyCODEnabled: boolean;
  lastOrderNotification: { order: Order; sellerName: string; timestamp: number } | null;

  // Wallet Calculated Balance
  walletBalance: number;

  // Loading & Hydration State
  isLoadingData: boolean;
  isInitialHydrated: boolean;

  // Lifecycle Actions
  setCurrentSeller: (seller: Seller | null) => void;
  loadSupabaseData: (forceAllOrders?: boolean) => Promise<void>;
  initRealtimeSubscription: () => (() => void);
  subscribeOrders: () => (() => void);
  clearLastOrderNotification: () => void;
  getSellerForOrder: (sellerId: string) => Seller | undefined;

  // Actions — User & Onboarding
  updateSellerStatus: (sellerId: string, status: Seller['status']) => void;
  updateSellerKYC: (sellerId: string, isApproved: boolean, reason?: string) => void;
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'created_at'>) => Warehouse;

  // Actions — Orders & Shipping
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Order;
  bulkImportOrders: (newOrders: Array<Omit<Order, 'id' | 'created_at' | 'updated_at'>>) => number;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  createShipment: (orderId: string, courierId: string, courierName: string, courierCode: string, shippingCost: number, codCharge: number) => Promise<Shipment>;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus, message?: string, location?: string) => void;
  generateManifest: (courierId: string, warehouseId: string, shipmentIds: string[]) => Manifest;
  bulkAssignShipments: (orderIds: string[], courierId?: string) => Promise<number>;

  // Actions — Pickup & Tracking
  schedulePickup: (courierId: string, warehouseId: string, pickupDate: string, count: number) => PickupRequest;
  addTrackingEvent: (awbNumber: string, status: ShipmentStatus, message: string, location?: string) => void;

  // Actions — NDR, Returns & Weight Disputes
  resolveNDR: (ndrCaseId: string, actionType: 'REATTEMPT' | 'ADDRESS_UPDATE' | 'PHONE_UPDATE' | 'RTO', details?: any) => void;
  escalateFakeNDR: (ndrCaseId: string, reason: string, notes: string) => NDREscalation;
  resolveAdminNDREscalation: (escalationId: string, action: NDREscalation['carrier_escalation_status'], adminNotes?: string) => void;
  createReturnOrder: (originalOrderId: string, reason: string, isExchange?: boolean, exchangeItem?: string) => ReturnOrder;
  createReturnRequest: (originalOrderId: string, reason: string) => ReturnOrder;
  resolveWeightDispute: (disputeId: string, acceptOrStatus: boolean | string, evidenceUrl?: string) => void;
  contestWeightDisputeWithProof: (disputeId: string, data: { scaleUrl?: string; tapeUrl?: string; skuMasterWeight?: number; notes?: string }) => void;
  arbitrateWeightDispute: (disputeId: string, outcome: 'SELLER_REFUNDED' | 'COURIER_UPHELD', notes: string) => void;

  // Actions — Wallet & Finance
  rechargeWallet: (amount: number, paymentRef: string) => void;
  creditWallet: (amount: number, paymentRef: string) => void;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'created_at'>) => void;
  settleCODRemittance: (remittanceId: string) => void;
  addReconciliationOverride: (recId: string, newStatus: ReconciliationRecord['status'], notes?: string) => void;
  updateSellerBankDetails: (bankDetails: Partial<SellerBankAccount>) => void;
  toggleEarlyCOD: (enabled: boolean) => void;
  requestInstantCODPayout: (amount: number, fee: number) => void;
  createAdminCODPayoutBatch: (batch: Omit<CODPayoutBatch, 'id' | 'created_at'>) => CODPayoutBatch;
  updateBrandedTrackingConfig: (config: Partial<BrandedTrackingConfig>) => void;

  // Actions — Couriers & Rate Cards (Admin)
  toggleCourierStatus: (courierId: string) => void;
  saveRateCard: (rateCard: Omit<RateCard, 'id' | 'created_at'>) => RateCard;

  // Actions — Team & Developer API
  addTeamMember: (member: Omit<UserProfile, 'id'>) => void;
  toggleTeamMemberStatus: (userId: string) => void;
  createAPIKey: (name: string, scopes: string[]) => APIKey;
  revokeAPIKey: (keyId: string) => void;
  addWebhookEndpoint: (url: string, events: string[]) => WebhookEndpoint;
  toggleWebhookStatus: (webhookId: string) => void;
  toggleIntegrationSync: (integrationId: string) => void;

  // Logging Helper
  logAuditAction: (action: string, entityType: string, entityId: string, oldValue?: string, newValue?: string) => void;
}

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  currentSeller: DEFAULT_PRIMARY_SELLER,
  currentUser: DEFAULT_PRIMARY_USER,

  realtimeStatus: 'CONNECTING',

  sellers: [],
  userProfiles: [],
  warehouses: [],
  orders: [],
  couriers: [],
  rateCards: [],
  shipments: [],
  ndrCases: [],
  returns: [],
  returnRequests: [],
  ledgerEntries: [],
  codRemittances: [],
  reconciliations: [],
  weightDiscrepancies: [],
  apiKeys: [],
  webhooks: [],
  integrations: [],
  auditLogs: [],
  pickups: [],
  manifests: [],

  // Extended Advanced Platform State
  ndrEscalations: [],
  sellerBankAccount: null,
  brandedTrackingConfig: DEFAULT_BRANDED_TRACKING,
  codPayoutBatches: [],
  isEarlyCODEnabled: true,
  lastOrderNotification: null,

  walletBalance: 0,
  isLoadingData: false,
  isInitialHydrated: false,

  clearLastOrderNotification: () => set({ lastOrderNotification: null }),
  getSellerForOrder: (sellerId: string): Seller | undefined => {
    const found = get().sellers.find((s) => s.id === sellerId);
    if (found) return found;
    const current = get().currentSeller;
    if (current && current.id === sellerId) return current;
    return undefined;
  },

  setCurrentSeller: (seller) => {
    set({ currentSeller: seller });
    if (seller) {
      get().loadSupabaseData();
    }
  },

  loadSupabaseData: async (forceAllOrders?: boolean) => {
    const isPlatformAdmin = forceAllOrders || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
    const sellerId = get().currentSeller?.id;
    const scopedSellerId = isPlatformAdmin ? undefined : sellerId;
    set({ isLoadingData: true });

    try {
      const [
        liveSellers,
        couriers,
        rateCards,
        liveWarehouses,
        liveOrders,
        liveShipments,
        liveBalance,
        liveLedger,
        liveRemittances,
        liveNDR,
        liveReturns,
        liveDisputes,
        liveAPIKeys,
        liveWebhooks,
        liveAuditLogs,
        livePickups,
        liveTeamMembers,
        liveIntegrations,
        liveReconciliations,
        liveEscalations,
        liveBankAccount,
        liveTrackingConfig,
        livePayoutBatches,
      ] = await Promise.all([
        fetchSellersFromSupabase(),
        fetchCouriersFromSupabase(),
        fetchRateCardsFromSupabase(),
        fetchWarehousesFromSupabase(scopedSellerId),
        fetchOrdersFromSupabase(scopedSellerId),
        fetchShipmentsFromSupabase(scopedSellerId),
        fetchWalletFromSupabase(sellerId),
        fetchLedgerEntriesFromSupabase(sellerId),
        fetchCODRemittancesFromSupabase(sellerId),
        fetchNDRCasesFromSupabase(scopedSellerId),
        fetchReturnsFromSupabase(scopedSellerId),
        fetchWeightDisputesFromSupabase(scopedSellerId),
        fetchAPIKeysFromSupabase(sellerId),
        fetchWebhooksFromSupabase(sellerId),
        fetchAuditLogsFromSupabase(scopedSellerId),
        fetchPickupsFromSupabase(scopedSellerId),
        fetchTeamMembers(sellerId),
        fetchIntegrations(sellerId),
        fetchReconciliations(scopedSellerId),
        fetchNDREscalations(scopedSellerId),
        fetchSellerBankAccount(sellerId),
        fetchBrandedTrackingConfig(sellerId),
        fetchCODPayoutBatches(scopedSellerId),
      ]);

      // Enrich orders with AI RTO Risk Assessment
      const enrichedOrders = (liveOrders || []).map((ord) => {
        if (ord.rto_risk_level) return ord;
        let riskLevel: RTORiskLevel = 'LOW';
        let riskReason = 'Prepaid Verified / Standard Metro Address';
        if (ord.payment_type === 'COD') {
          if (ord.total_amount >= 2400) {
            riskLevel = 'HIGH';
            riskReason = 'High Cart Value COD (> ₹2,400) in Sensitive Pincode';
          } else if (ord.shipping_address?.pincode?.startsWith('8') || ord.shipping_address?.pincode?.startsWith('7')) {
            riskLevel = 'MEDIUM';
            riskReason = 'Tier 3 Remote Delivery Hub (Medium RTO Risk)';
          } else {
            riskLevel = 'LOW';
            riskReason = 'Verified Buyer Address (Low RTO Probability)';
          }
        }
        return { ...ord, rto_risk_level: riskLevel, rto_risk_reason: riskReason };
      });

      // Sample fallback NDR cases with rich data if empty
      const sampleNDRCases: NDRCase[] = [
        {
          id: 'ndr-sample-1',
          seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
          shipment_id: 'shp-sample-1',
          shipment: {
            id: 'shp-sample-1',
            seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
            order_id: 'ord-sample-1',
            order: {
              id: 'ord-sample-1',
              seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
              warehouse_id: 'wh-1',
              customer_id: 'cust-1',
              customer: { id: 'cust-1', seller_id: 's1', name: 'Rahul Sharma', phone: '+91 98201 12938', created_at: new Date().toISOString() },
              source: 'SHOPIFY',
              payment_type: 'COD',
              cod_amount: 1850,
              total_amount: 1850,
              weight_kg: 0.8,
              shipping_address: { name: 'Rahul Sharma', phone: '+91 98201 12938', address_line1: 'Flat 402, Sunshine Heights', city: 'Mumbai', state: 'Maharashtra', pincode: '400053' },
              current_status: 'NDR',
              created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
              updated_at: new Date().toISOString(),
            },
            courier_id: 'c-delhivery',
            courier_name: 'Delhivery Surface',
            courier_code: 'DELHIVERY',
            awb_number: 'DEL9948271049',
            status: 'NDR',
            created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
            updated_at: new Date().toISOString(),
          },
          reason: 'Customer Not Available / Door Locked',
          attempt_count: 1,
          last_attempt_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
          status: 'ACTION_REQUIRED',
          created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
        },
        {
          id: 'ndr-sample-2',
          seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
          shipment_id: 'shp-sample-2',
          shipment: {
            id: 'shp-sample-2',
            seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
            order_id: 'ord-sample-2',
            order: {
              id: 'ord-sample-2',
              seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
              warehouse_id: 'wh-1',
              customer_id: 'cust-2',
              customer: { id: 'cust-2', seller_id: 's1', name: 'Pooja Verma', phone: '+91 98920 88392', created_at: new Date().toISOString() },
              source: 'WOOCOMMERCE',
              payment_type: 'COD',
              cod_amount: 2499,
              total_amount: 2499,
              weight_kg: 1.2,
              shipping_address: { name: 'Pooja Verma', phone: '+91 98920 88392', address_line1: 'B-12, Green Glen Layout, Bellandur', city: 'Bengaluru', state: 'Karnataka', pincode: '560103' },
              current_status: 'NDR',
              created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
            courier_id: 'c-bluedart',
            courier_name: 'BlueDart Express',
            courier_code: 'BLUEDART',
            awb_number: 'BLU8829102931',
            status: 'NDR',
            created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
            updated_at: new Date().toISOString(),
          },
          reason: 'Customer Refused Delivery / Fake OTP',
          attempt_count: 2,
          last_attempt_at: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
          status: 'ACTION_REQUIRED',
          created_at: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
        }
      ];

      // Sample fallback weight disputes with rich visual audit data if empty
      const sampleDisputes: WeightDiscrepancy[] = [
        {
          id: 'wd-001',
          seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
          shipment_id: 'shp-wd-1',
          shipment: {
            id: 'shp-wd-1',
            seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
            order_id: 'ord-wd-1',
            courier_id: 'c-delhivery',
            courier_name: 'Delhivery Surface',
            awb_number: 'DEL4920193821',
            status: 'DELIVERED',
            created_at: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
            updated_at: new Date().toISOString(),
          },
          declared_weight_kg: 0.5,
          charged_weight_kg: 1.5,
          excess_charge: 88,
          status: 'PENDING',
          deadline: new Date(Date.now() + 3600 * 1000 * 38).toISOString(), // 38 hours remaining
          evidence_urls: [],
          created_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
        },
        {
          id: 'wd-002',
          seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
          shipment_id: 'shp-wd-2',
          shipment: {
            id: 'shp-wd-2',
            seller_id: sellerId || DEFAULT_PRIMARY_SELLER.id,
            order_id: 'ord-wd-2',
            courier_id: 'c-xpressbees',
            courier_name: 'Xpressbees Surface',
            awb_number: 'XPB7719203912',
            status: 'DELIVERED',
            created_at: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
            updated_at: new Date().toISOString(),
          },
          declared_weight_kg: 1.0,
          charged_weight_kg: 2.2,
          excess_charge: 114,
          status: 'DISPUTED',
          deadline: new Date(Date.now() + 3600 * 1000 * 18).toISOString(),
          evidence_scale_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
          evidence_tape_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80',
          sku_master_weight: 0.98,
          admin_arbitration_notes: 'Seller uploaded digital weighing scale proof and measurement tape showing 20x15x10 cm.',
          created_at: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
        }
      ];

      set((state) => ({
        sellers: liveSellers,
        currentSeller:
          (state.currentSeller && liveSellers.find((s) => s.id === state.currentSeller?.id)) ||
          liveSellers.find((s) => s.id === DEFAULT_PRIMARY_SELLER.id) ||
          liveSellers[0] ||
          state.currentSeller ||
          DEFAULT_PRIMARY_SELLER,
        couriers,
        rateCards,
        warehouses: liveWarehouses,
        orders: enrichedOrders,
        shipments: liveShipments,
        walletBalance: liveBalance,
        ledgerEntries: liveLedger,
        codRemittances: liveRemittances,
        ndrCases: liveNDR,
        returns: liveReturns,
        returnRequests: liveReturns,
        weightDiscrepancies: liveDisputes,
        apiKeys: liveAPIKeys,
        webhooks: liveWebhooks,
        auditLogs: liveAuditLogs,
        pickups: livePickups,
        userProfiles: (liveTeamMembers && liveTeamMembers.length > 0) ? liveTeamMembers : [DEFAULT_PRIMARY_USER],
        integrations: (liveIntegrations && liveIntegrations.length > 0) ? liveIntegrations : INITIAL_INTEGRATIONS,
        reconciliations: (liveReconciliations && liveReconciliations.length > 0) ? liveReconciliations : INITIAL_RECONCILIATIONS,
        ndrEscalations: (liveEscalations && liveEscalations.length > 0) ? liveEscalations : INITIAL_ESCALATIONS,
        sellerBankAccount: liveBankAccount || DEFAULT_BANK_ACCOUNT,
        brandedTrackingConfig: liveTrackingConfig || { ...DEFAULT_BRANDED_TRACKING, seller_id: sellerId || state.currentSeller?.id || DEFAULT_PRIMARY_SELLER.id, brand_name: state.currentSeller?.brand_name || state.currentSeller?.company_name || '' },
        codPayoutBatches: (livePayoutBatches && livePayoutBatches.length > 0) ? livePayoutBatches : INITIAL_COD_BATCHES,
        isLoadingData: false,
        isInitialHydrated: true,
      }));
    } catch (err) {
      console.error('Failed to hydrate store from Supabase:', err);
      set({ isLoadingData: false, isInitialHydrated: true });
    }
  },

  initRealtimeSubscription: () => {
    const sellerId = get().currentSeller?.id;

    const cleanup = initSupabaseRealtime({
      onStatusChange: (status) => set({ realtimeStatus: status }),
      onOrdersChange: () => {
        fetchOrdersFromSupabase(get().currentSeller?.id).then((orders) => {
          set({ orders });
        });
      },
      onShipmentsChange: () => {
        fetchShipmentsFromSupabase(get().currentSeller?.id).then((shipments) => {
          set({ shipments });
        });
      },
      onWalletChange: () => {
        Promise.all([
          fetchWalletFromSupabase(get().currentSeller?.id),
          fetchLedgerEntriesFromSupabase(get().currentSeller?.id),
          fetchCODRemittancesFromSupabase(get().currentSeller?.id),
        ]).then(([walletBalance, ledgerEntries, codRemittances]) => {
          set({ walletBalance, ledgerEntries, codRemittances });
        });
      },
      onNDRChange: () => {
        fetchNDRCasesFromSupabase(get().currentSeller?.id).then((ndrCases) => {
          set({ ndrCases });
        });
      },
      onReturnsChange: () => {
        fetchReturnsFromSupabase(get().currentSeller?.id).then((returns) => {
          set({ returns, returnRequests: returns });
        });
      },
      onDisputesChange: () => {
        fetchWeightDisputesFromSupabase(get().currentSeller?.id).then((weightDiscrepancies) => {
          set({ weightDiscrepancies });
        });
      },
      onPickupsChange: () => {
        fetchPickupsFromSupabase(get().currentSeller?.id).then((pickups) => {
          set({ pickups });
        });
      },
      onWarehousesChange: () => {
        fetchWarehousesFromSupabase(get().currentSeller?.id).then((warehouses) => {
          set({ warehouses });
        });
      },
      onCouriersChange: () => {
        fetchCouriersFromSupabase().then((couriers) => {
          set({ couriers });
        });
      },
      onAuditLogsChange: () => {
        fetchAuditLogsFromSupabase(get().currentSeller?.id).then((auditLogs) => {
          set({ auditLogs });
        });
      },
    });

    return cleanup;
  },

  subscribeOrders: () => {
    return subscribeToOrders(get().currentSeller?.id, () => {
      fetchOrdersFromSupabase(get().currentSeller?.id).then((orders) => {
        if (orders) {
          set({ orders });
        }
      });
    });
  },

  updateSellerStatus: (sellerId, status) => {
    set((state) => ({
      sellers: state.sellers.map((s) => (s.id === sellerId ? { ...s, status, updated_at: new Date().toISOString() } : s)),
      currentSeller: state.currentSeller?.id === sellerId ? { ...state.currentSeller, status, updated_at: new Date().toISOString() } : state.currentSeller,
    }));
    get().logAuditAction('UPDATE_SELLER_STATUS', 'SELLER', sellerId, '', status);

    if (!isMockMode) {
      updateSellerStatusInSupabase(sellerId, status);
    }
  },

  updateSellerKYC: (sellerId, isApproved, reason) => {
    const newStatus: Seller['status'] = isApproved ? 'ACTIVE' : 'REJECTED';
    get().updateSellerStatus(sellerId, newStatus);
    get().logAuditAction(isApproved ? 'APPROVE_KYC' : 'REJECTED_KYC', 'SELLER_KYC', sellerId, 'KYC_PENDING', newStatus);

    if (!isMockMode) {
      updateSellerKYCInSupabase(sellerId, isApproved, reason);
    }
  },

  addWarehouse: (warehouseData) => {
    const tempId = `wh-${Date.now()}`;
    const newWh: Warehouse = {
      ...warehouseData,
      id: tempId,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ warehouses: [newWh, ...state.warehouses] }));
    get().logAuditAction('ADD_WAREHOUSE', 'WAREHOUSE', newWh.id, '', warehouseData.name);

    if (!isMockMode) {
      createWarehouseInSupabase(warehouseData, get().currentSeller?.id).then((saved) => {
        set((state) => ({
          warehouses: state.warehouses.map((w) => (w.id === tempId ? saved : w)),
        }));
      });
    }

    return newWh;
  },

  addOrder: (orderData) => {
    const tempId = `ord-${1000 + get().orders.length + 1}`;
    const now = new Date().toISOString();
    const effectiveSellerId = orderData.seller_id || get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id;
    const seller = get().sellers.find((s) => s.id === effectiveSellerId) || get().currentSeller;
    const sellerName = seller?.brand_name || seller?.company_name || 'Apex Retail';

    const newOrder: Order = {
      ...orderData,
      seller_id: effectiveSellerId,
      id: tempId,
      created_at: now,
      updated_at: now,
    };
    set((state) => ({
      orders: [newOrder, ...state.orders],
      lastOrderNotification: { order: newOrder, sellerName, timestamp: Date.now() },
    }));
    get().logAuditAction('CREATE_ORDER', 'ORDER', tempId, '', `Seller: ${sellerName}`);

    if (!isMockMode) {
      createOrderInSupabase({ ...orderData, seller_id: effectiveSellerId }, effectiveSellerId)
        .then((savedOrder) => {
          set((state) => ({
            orders: state.orders.map((o) => (o.id === tempId ? savedOrder : o)),
          }));
        })
        .catch((err) => {
          console.error('Supabase live order sync failed:', err);
        });
    }

    return newOrder;
  },

  bulkImportOrders: (newOrdersData) => {
    const now = new Date().toISOString();
    const effectiveSellerId = get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id;
    const seller = get().sellers.find((s) => s.id === effectiveSellerId) || get().currentSeller;
    const sellerName = seller?.brand_name || seller?.company_name || 'Apex Retail';

    const createdOrders: Order[] = newOrdersData.map((data, idx) => ({
      ...data,
      seller_id: data.seller_id || effectiveSellerId,
      id: `ord-bulk-${Date.now()}-${idx + 1}`,
      created_at: now,
      updated_at: now,
    }));

    set((state) => ({
      orders: [...createdOrders, ...state.orders],
      lastOrderNotification: createdOrders.length > 0 ? { order: createdOrders[0], sellerName, timestamp: Date.now() } : state.lastOrderNotification,
    }));
    get().logAuditAction('BULK_IMPORT_ORDERS', 'ORDER', `Count: ${createdOrders.length}`, '', `Seller: ${sellerName}`);

    if (!isMockMode) {
      bulkCreateOrdersInSupabase(newOrdersData.map((d) => ({ ...d, seller_id: d.seller_id || effectiveSellerId })), effectiveSellerId)
        .then((savedList) => {
          if (savedList.length > 0) {
            get().loadSupabaseData();
          }
        })
        .catch((err) => console.error('Bulk order sync failed:', err));
    }

    return createdOrders.length;
  },

  updateOrderStatus: async (orderId, status) => {
    const previous = get().orders.find((order) => order.id === orderId);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, current_status: status, updated_at: new Date().toISOString() } : o)),
    }));

    try {
      await updateOrderStatusInSupabase(orderId, status);
    } catch (error) {
      if (previous) {
        set((state) => ({ orders: state.orders.map((order) => order.id === orderId ? previous : order) }));
      }
      throw error;
    }
  },

  createShipment: async (orderId, courierId, courierName, courierCode, shippingCost, codCharge) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const totalDeduction = shippingCost + codCharge;
    if (state.walletBalance < totalDeduction) {
      throw new Error(`Insufficient wallet balance. Total required: ₹${totalDeduction}, Available: ₹${state.walletBalance}`);
    }

    const savedShipment = await createShipmentInSupabase(orderId, courierId, courierName, courierCode, shippingCost, codCharge, get().currentSeller?.id);
    set((previous) => ({
      shipments: [savedShipment, ...previous.shipments.filter((shipment) => shipment.order_id !== orderId)],
      orders: previous.orders.map((item) => item.id === orderId ? { ...item, current_status: 'READY_TO_SHIP', updated_at: savedShipment.updated_at } : item),
      walletBalance: previous.walletBalance - totalDeduction,
    }));
    await get().loadSupabaseData();
    return savedShipment;
  },

  updateShipmentStatus: (shipmentId, status, message, location) => {
    const orderStatusByShipment: Partial<Record<ShipmentStatus, OrderStatus>> = {
      CREATED: 'READY_TO_SHIP',
      PICKUP_SCHEDULED: 'READY_TO_SHIP',
      PICKED_UP: 'SHIPPED',
      IN_TRANSIT: 'IN_TRANSIT',
      OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      DELIVERED: 'DELIVERED',
      NDR: 'NDR',
      RTO_INITIATED: 'RTO',
      RTO_IN_TRANSIT: 'RTO',
      RTO_DELIVERED: 'RETURNED',
      LOST: 'RTO',
      CANCELLED: 'CANCELLED',
    };
    const now = new Date().toISOString();
    let linkedOrderId = '';

    set((state) => {
      const target = state.shipments.find((shipment) => shipment.id === shipmentId);
      linkedOrderId = target?.order_id || '';
      const orderStatus = orderStatusByShipment[status];
      return {
        shipments: state.shipments.map((shipment) =>
          shipment.id === shipmentId
            ? { ...shipment, status, updated_at: now, order: shipment.order ? { ...shipment.order, current_status: orderStatus || shipment.order.current_status, updated_at: now } : shipment.order }
            : shipment
        ),
        orders: orderStatus
          ? state.orders.map((order) => order.id === linkedOrderId ? { ...order, current_status: orderStatus, updated_at: now } : order)
          : state.orders,
      };
    });

    get().logAuditAction('UPDATE_SHIPMENT_STATUS', 'SHIPMENT', shipmentId, '', status);

    if (!isMockMode) {
      updateShipmentStatusInSupabase(shipmentId, status, message, location)
        .catch((err) => console.error('Supabase shipment status update failed:', err));
    }
  },

  generateManifest: (courierId, warehouseId, shipmentIds) => {
    const state = get();
    const selectedShipments = state.shipments.filter((s) => shipmentIds.includes(s.id));
    const courier = state.couriers.find((c) => c.id === courierId);
    const totalWeight = selectedShipments.reduce((acc, s) => acc + (s.order?.weight_kg || 0.5), 0);
    const manifestNum = `MNF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;

    const manifest: Manifest = {
      id: `mnf-${Date.now()}`,
      manifest_number: manifestNum,
      seller_id: state.currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      courier_id: courierId,
      courier_name: courier?.name || 'Courier Partner',
      warehouse_id: warehouseId,
      shipment_ids: shipmentIds,
      total_packages: shipmentIds.length,
      total_weight_kg: Number(totalWeight.toFixed(2)),
      status: 'GENERATED',
      created_at: new Date().toISOString(),
    };

    set((prevState) => ({ manifests: [manifest, ...prevState.manifests] }));
    get().logAuditAction('GENERATE_MANIFEST', 'MANIFEST', manifest.id, '', manifestNum);
    return manifest;
  },

  schedulePickup: (courierId, warehouseId, pickupDate, count) => {
    const state = get();
    const courier = state.couriers.find((c) => c.id === courierId);
    const pickupRef = `PKP-${(courier?.code || 'DEL').toUpperCase().substring(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;

    const pickup: PickupRequest = {
      id: `pick-${Date.now()}`,
      seller_id: state.currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      warehouse_id: warehouseId,
      courier_id: courierId,
      courier_name: courier?.name || 'Courier Partner',
      pickup_date: pickupDate,
      status: 'SCHEDULED',
      pickup_reference: pickupRef,
      expected_package_count: count,
      created_at: new Date().toISOString(),
    };

    set((prevState) => ({ pickups: [pickup, ...prevState.pickups] }));
    get().logAuditAction('SCHEDULE_PICKUP', 'PICKUP', pickup.id, '', pickupRef);

    if (!isMockMode) {
      schedulePickupInSupabase(courierId, warehouseId, pickupDate, count, state.currentSeller?.id)
        .then((saved) => {
          set((s) => ({
            pickups: s.pickups.map((p) => (p.id === pickup.id ? saved : p)),
          }));
        })
        .catch((err) => console.error('Supabase pickup sync error:', err));
    }

    return pickup;
  },

  addTrackingEvent: (awbNumber, status, message, location) => {
    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.awb_number === awbNumber
          ? {
              ...s,
              status,
              updated_at: new Date().toISOString(),
            }
          : s
      ),
    }));
  },

  resolveNDR: (ndrCaseId, actionType, details) => {
    set((state) => ({
      ndrCases: state.ndrCases.map((n) =>
        n.id === ndrCaseId
          ? {
              ...n,
              status: actionType === 'RTO' ? 'RTO_REQUESTED' : 'REATTEMPT_REQUESTED',
            }
          : n
      ),
    }));
    get().logAuditAction('RESOLVE_NDR', 'NDR_CASE', ndrCaseId, '', actionType);

    if (!isMockMode) {
      submitNDRActionInSupabase(ndrCaseId, actionType, details).catch((err) =>
        console.error('Supabase NDR action sync error:', err)
      );
    }
  },

  createReturnOrder: (originalOrderId, reason, isExchange, exchangeItem) => {
    const state = get();
    const origOrder = state.orders.find((o) => o.id === originalOrderId);
    const newReturn: ReturnOrder = {
      id: `ret-${Date.now()}`,
      seller_id: state.currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      original_order_id: originalOrderId,
      original_order: origOrder,
      return_reason: reason,
      return_awb: `RET-AWB-${Math.floor(100000 + Math.random() * 900000)}`,
      reverse_awb_number: `REV${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      reason,
      is_exchange: isExchange || false,
      exchange_item_name: exchangeItem,
      status: 'APPROVED',
      created_at: new Date().toISOString(),
    };

    set((prevState) => ({
      returns: [newReturn, ...prevState.returns],
      returnRequests: [newReturn, ...prevState.returnRequests],
    }));
    get().logAuditAction('CREATE_RETURN', 'RETURN_ORDER', newReturn.id);

    if (!isMockMode) {
      createReturnInSupabase(originalOrderId, reason, isExchange, exchangeItem, state.currentSeller?.id)
        .then((saved) => {
          set((s) => ({
            returns: s.returns.map((r) => (r.id === newReturn.id ? saved : r)),
            returnRequests: s.returnRequests.map((r) => (r.id === newReturn.id ? saved : r)),
          }));
        })
        .catch((err) => console.error('Supabase return order sync error:', err));
    }

    return newReturn;
  },

  createReturnRequest: (originalOrderId, reason) => {
    return get().createReturnOrder(originalOrderId, reason);
  },

  resolveWeightDispute: (disputeId, acceptOrStatus, evidenceUrl) => {
    const newStatus = typeof acceptOrStatus === 'boolean' ? (acceptOrStatus ? 'ACCEPTED' : 'DISPUTED') : acceptOrStatus;
    set((state) => {
      const dispute = state.weightDiscrepancies.find((w) => w.id === disputeId);
      if (!dispute) return state;

      const updatedDisputes = state.weightDiscrepancies.map((w) =>
        w.id === disputeId
          ? {
              ...w,
              status: newStatus as WeightDiscrepancy['status'],
              evidence_urls: evidenceUrl ? [...(w.evidence_urls || []), evidenceUrl] : w.evidence_urls,
            }
          : w
      );

      return { weightDiscrepancies: updatedDisputes };
    });
    get().logAuditAction('RESOLVE_WEIGHT_DISPUTE', 'WEIGHT_DISCREPANCY', disputeId);

    if (!isMockMode) {
      resolveWeightDisputeInSupabase(disputeId, newStatus, evidenceUrl).catch((err) =>
        console.error('Supabase weight dispute sync error:', err)
      );
    }
  },

  rechargeWallet: (amount, paymentRef) => {
    const now = new Date().toISOString();
    const tempEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      seller_id: get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      type: 'RECHARGE',
      amount,
      direction: 'CREDIT',
      reference_type: 'MANUAL_WALLET_CREDIT',
      reference_id: paymentRef,
      description: `Verified wallet credit recorded in ledger (${paymentRef})`,
      created_at: now,
    };

    set((state) => ({
      ledgerEntries: [tempEntry, ...state.ledgerEntries],
      walletBalance: state.walletBalance + amount,
    }));
    get().logAuditAction('RECHARGE_WALLET', 'WALLET', paymentRef, '', `+₹${amount}`);

    if (!isMockMode) {
      rechargeWalletInSupabase(get().currentSeller?.id, amount, paymentRef)
        .then(({ balance, entry }) => {
          set((s) => ({
            walletBalance: balance,
            ledgerEntries: s.ledgerEntries.map((l) => (l.id === tempEntry.id ? entry : l)),
          }));
        })
        .catch((err) => console.error('Supabase recharge sync error:', err));
    }
  },

  creditWallet: (amount, paymentRef) => {
    get().rechargeWallet(amount, paymentRef);
  },

  addLedgerEntry: (entryData) => {
    const entry: LedgerEntry = {
      ...entryData,
      id: `led-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      ledgerEntries: [entry, ...state.ledgerEntries],
      walletBalance: entry.direction === 'CREDIT' ? state.walletBalance + entry.amount : state.walletBalance - entry.amount,
    }));
  },

  settleCODRemittance: (remittanceId) => {
    set((state) => ({
      codRemittances: state.codRemittances.map((c) =>
        c.id === remittanceId ? { ...c, status: 'SETTLED', settled_at: new Date().toISOString() } : c
      ),
    }));
    get().logAuditAction('SETTLE_COD', 'COD_REMITTANCE', remittanceId);
  },

  addReconciliationOverride: (recId, newStatus, notes) => {
    set((state) => ({
      reconciliations: state.reconciliations.map((r) => (r.id === recId ? { ...r, status: newStatus, notes: notes || r.notes } : r)),
    }));
    get().logAuditAction('RECONCILIATION_OVERRIDE', 'RECONCILIATION', recId, '', newStatus);
    updateReconciliation(recId, newStatus, notes);
  },

  toggleCourierStatus: (courierId) => {
    let nextActive = false;
    set((state) => {
      const target = state.couriers.find((c) => c.id === courierId);
      nextActive = target ? !target.is_active : false;
      return {
        couriers: state.couriers.map((c) => (c.id === courierId ? { ...c, is_active: !c.is_active } : c)),
      };
    });
    get().logAuditAction('TOGGLE_COURIER_STATUS', 'COURIER', courierId);

    if (!isMockMode) {
      toggleCourierInSupabase(courierId, nextActive);
    }
  },

  saveRateCard: (rateCardData) => {
    const tempId = `rc-${Date.now()}`;
    const rateCard: RateCard = {
      ...rateCardData,
      id: tempId,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ rateCards: [rateCard, ...state.rateCards] }));
    get().logAuditAction('CREATE_RATE_CARD', 'RATE_CARD', rateCard.id, '', rateCard.name);

    if (!isMockMode) {
      saveRateCardInSupabase(rateCardData).then((saved) => {
        set((s) => ({
          rateCards: s.rateCards.map((r) => (r.id === tempId ? saved : r)),
        }));
      });
    }

    return rateCard;
  },

  addTeamMember: (memberData) => {
    const tempId = `u-${Date.now()}`;
    const member: UserProfile = {
      ...memberData,
      id: tempId,
      seller_id: get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      is_active: true,
    };
    set((state) => ({ userProfiles: [...state.userProfiles, member] }));
    get().logAuditAction('ADD_TEAM_MEMBER', 'USER_PROFILE', member.id, '', member.email);

    if (!isMockMode) {
      addTeamMemberInSupabase(get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id, memberData).then((saved) => {
        set((s) => ({
          userProfiles: s.userProfiles.map((u) => (u.id === tempId ? saved : u)),
        }));
      });
    }
  },

  toggleTeamMemberStatus: (userId) => {
    const nextStatus = !get().userProfiles.find((user) => user.id === userId)?.is_active;
    set((state) => ({
      userProfiles: state.userProfiles.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)),
    }));
    get().logAuditAction('TOGGLE_TEAM_MEMBER', 'USER_PROFILE', userId);
    toggleTeamMember(userId, nextStatus);
  },

  createAPIKey: (name, scopes) => {
    const prefix = `pk_live_${Math.random().toString(36).substring(2, 6)}_`;
    const masked = `${prefix}••••${Math.floor(1000 + Math.random() * 9000)}`;
    const tempKey: APIKey = {
      id: `key-${Date.now()}`,
      seller_id: get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      name,
      key_prefix: prefix,
      secret_key_masked: masked,
      scopes,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ apiKeys: [tempKey, ...state.apiKeys] }));
    get().logAuditAction('CREATE_API_KEY', 'API_KEY', tempKey.id, '', name);

    if (!isMockMode) {
      createAPIKeyInSupabase(get().currentSeller?.id, name, scopes)
        .then((saved) => {
          set((s) => ({
            apiKeys: s.apiKeys.map((k) => (k.id === tempKey.id ? saved : k)),
          }));
        })
        .catch((err) => console.error('Supabase API key sync error:', err));
    }

    return tempKey;
  },

  revokeAPIKey: (keyId) => {
    set((state) => ({
      apiKeys: state.apiKeys.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)),
    }));
    get().logAuditAction('REVOKE_API_KEY', 'API_KEY', keyId);

    if (!isMockMode) {
      revokeAPIKeyInSupabase(keyId);
    }
  },

  addWebhookEndpoint: (url, events) => {
    const tempWebhook: WebhookEndpoint = {
      id: `whk-${Date.now()}`,
      seller_id: get().currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
      url,
      secret: `whsec_${Math.random().toString(36).substring(2, 14)}`,
      subscribed_events: events,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ webhooks: [tempWebhook, ...state.webhooks] }));
    get().logAuditAction('CREATE_WEBHOOK', 'WEBHOOK', tempWebhook.id, '', url);

    if (!isMockMode) {
      createWebhookInSupabase(get().currentSeller?.id, url, events)
        .then((saved) => {
          set((s) => ({
            webhooks: s.webhooks.map((w) => (w.id === tempWebhook.id ? saved : w)),
          }));
        })
        .catch((err) => console.error('Supabase webhook sync error:', err));
    }

    return tempWebhook;
  },

  toggleWebhookStatus: (webhookId) => {
    let nextStatus = false;
    set((state) => {
      const target = state.webhooks.find((w) => w.id === webhookId);
      nextStatus = target ? !target.is_active : false;
      return {
        webhooks: state.webhooks.map((w) => (w.id === webhookId ? { ...w, is_active: !w.is_active } : w)),
      };
    });
    get().logAuditAction('TOGGLE_WEBHOOK', 'WEBHOOK', webhookId);

    if (!isMockMode) {
      toggleWebhookInSupabase(webhookId, nextStatus);
    }
  },

  toggleIntegrationSync: (integrationId) => {
    const nextStatus = !get().integrations.find((item) => item.id === integrationId)?.auto_sync_orders;
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.id === integrationId
          ? {
              ...i,
              auto_sync_orders: !i.auto_sync_orders,
              last_synced_at: new Date().toISOString(),
            }
          : i
      ),
    }));
    get().logAuditAction('TOGGLE_INTEGRATION_SYNC', 'INTEGRATION', integrationId);
    toggleIntegration(integrationId, nextStatus);
  },

  logAuditAction: (action, entityType, entityId, oldValue, newValue) => {
    const user = get().currentUser;
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      user_name: user?.name || 'System User',
      user_email: user?.email || 'system@logistics.com',
      role: user?.role || 'OWNER',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ auditLogs: [log, ...state.auditLogs] }));

    if (!isMockMode) {
      logAuditActionInSupabase(action, entityType, entityId, user, oldValue, newValue, get().currentSeller?.id);
    }
  },

  bulkAssignShipments: async (orderIds, courierId) => {
    const state = get();
    const targetOrders = state.orders.filter((o) => orderIds.includes(o.id));
    const selectedCourier = courierId
      ? state.couriers.find((c) => c.id === courierId) || state.couriers[0]
      : state.couriers[0] || { id: 'c-delhivery', name: 'Delhivery Surface', code: 'DELHIVERY' };

    let count = 0;
    for (const order of targetOrders) {
      const shippingCost = 45 + Math.round((order.weight_kg || 0.5) * 20);
      const codCharge = order.payment_type === 'COD' ? Math.max(30, Math.round(order.total_amount * 0.015)) : 0;
      await state.createShipment(
        order.id,
        selectedCourier.id,
        selectedCourier.name,
        selectedCourier.code,
        shippingCost,
        codCharge
      );
      count++;
    }
    return count;
  },

  escalateFakeNDR: (ndrCaseId, reason, notes) => {
    const state = get();
    const ndrCase = state.ndrCases.find((n) => n.id === ndrCaseId);
    const seller = state.currentSeller || DEFAULT_PRIMARY_SELLER;
    const escalation: NDREscalation = {
      id: `esc-${Date.now()}`,
      ndr_case_id: ndrCaseId,
      awb_number: ndrCase?.shipment?.awb_number || 'DEL9948271049',
      seller_id: seller.id,
      seller_name: seller.company_name || 'Apex Retail',
      courier_code: ndrCase?.shipment?.courier_code || 'DELHIVERY',
      customer_phone: ndrCase?.shipment?.order?.shipping_address?.phone || '+91 98201 12938',
      customer_name: ndrCase?.shipment?.order?.shipping_address?.name || 'Rahul Sharma',
      reason,
      evidence_notes: notes,
      carrier_escalation_status: 'OPEN',
      created_at: new Date().toISOString(),
    };

    set((s) => ({
      ndrEscalations: [escalation, ...s.ndrEscalations],
    }));
    saveNDREscalation(escalation).then((saved) => {
      if (saved) set((s) => ({ ndrEscalations: s.ndrEscalations.map((item) => item.id === escalation.id ? saved : item) }));
    });
    get().logAuditAction('ESCALATE_FAKE_NDR', 'NDR_CASE', ndrCaseId, '', reason);
    return escalation;
  },

  resolveAdminNDREscalation: (escalationId, action, adminNotes) => {
    const targetEscalation = get().ndrEscalations.find((e) => e.id === escalationId);
    set((state) => ({
      ndrEscalations: state.ndrEscalations.map((e) =>
        e.id === escalationId
          ? {
              ...e,
              carrier_escalation_status: action,
              admin_notes: adminNotes || e.admin_notes,
              resolved_at: new Date().toISOString(),
            }
          : e
      ),
      ndrCases: targetEscalation
        ? state.ndrCases.map((n) =>
            n.id === targetEscalation.ndr_case_id
              ? {
                  ...n,
                  status: action === 'RESOLVED_REATTEMPT' ? 'REATTEMPT_REQUESTED' : 'RESOLVED',
                }
              : n
          )
        : state.ndrCases,
    }));
    get().logAuditAction('RESOLVE_ADMIN_ESCALATION', 'NDR_ESCALATION', escalationId, '', action);
    updateNDREscalation(escalationId, action, adminNotes);
  },

  contestWeightDisputeWithProof: (disputeId, data) => {
    set((state) => ({
      weightDiscrepancies: state.weightDiscrepancies.map((w) =>
        w.id === disputeId
          ? {
              ...w,
              status: 'DISPUTED',
              evidence_scale_url: data.scaleUrl || w.evidence_scale_url,
              evidence_tape_url: data.tapeUrl || w.evidence_tape_url,
              sku_master_weight: data.skuMasterWeight || w.sku_master_weight,
              admin_arbitration_notes: data.notes || w.admin_arbitration_notes,
            }
          : w
      ),
    }));
    get().logAuditAction('CONTEST_WEIGHT_DISPUTE', 'WEIGHT_DISCREPANCY', disputeId);
  },

  arbitrateWeightDispute: (disputeId, outcome, notes) => {
    const state = get();
    const dispute = state.weightDiscrepancies.find((w) => w.id === disputeId);
    if (!dispute) return;

    if (outcome === 'SELLER_REFUNDED') {
      get().addLedgerEntry({
        seller_id: dispute.seller_id,
        type: 'REFUND',
        amount: dispute.excess_charge,
        direction: 'CREDIT',
        reference_type: 'WEIGHT_DISPUTE_REFUND',
        reference_id: dispute.id,
        description: `Weight dispute resolved in seller favor. Refunded excess charge: ₹${dispute.excess_charge} (${notes})`,
      });
    }

    set((s) => ({
      weightDiscrepancies: s.weightDiscrepancies.map((w) =>
        w.id === disputeId
          ? {
              ...w,
              status: 'RESOLVED',
              resolution_outcome: outcome,
              admin_arbitration_notes: notes,
            }
          : w
      ),
    }));
    get().logAuditAction('ARBITRATE_WEIGHT_DISPUTE', 'WEIGHT_DISCREPANCY', disputeId, '', outcome);
  },

  updateSellerBankDetails: (bankDetails) => {
    set((state) => ({
      sellerBankAccount: state.sellerBankAccount
        ? { ...state.sellerBankAccount, ...bankDetails, is_verified: true }
        : {
            id: `bank-${Date.now()}`,
            seller_id: state.currentSeller?.id || DEFAULT_PRIMARY_SELLER.id,
            account_number: bankDetails.account_number || '',
            ifsc_code: bankDetails.ifsc_code || '',
            account_holder_name: bankDetails.account_holder_name || '',
            bank_name: bankDetails.bank_name || 'HDFC Bank Ltd',
            is_primary: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          },
    }));
    get().logAuditAction('UPDATE_BANK_DETAILS', 'SELLER_BANK', 'BANK_PROFILE');
    const account = get().sellerBankAccount;
    if (account) saveBankAccount(account).then((saved) => saved && set({ sellerBankAccount: saved }));
  },

  toggleEarlyCOD: (enabled) => {
    set({ isEarlyCODEnabled: enabled });
    get().logAuditAction('TOGGLE_EARLY_COD', 'FINANCE', 'CONFIG', '', enabled ? 'ENABLED' : 'DISABLED');
  },

  requestInstantCODPayout: (amount, fee) => {
    const state = get();
    const seller = state.currentSeller || DEFAULT_PRIMARY_SELLER;
    const batchId = `COD-INST-${Date.now().toString().slice(-6)}`;
    const newBatch: CODPayoutBatch = {
      id: `batch-${Date.now()}`,
      batch_reference: batchId,
      seller_id: seller.id,
      seller_name: seller.company_name || 'Apex Retail',
      gross_cod_amount: amount,
      freight_deductions: 0,
      early_cod_fee: fee,
      net_payout_amount: amount - fee,
      shipment_count: Math.max(1, Math.round(amount / 1200)),
      bank_name: state.sellerBankAccount?.bank_name || 'HDFC Bank Ltd',
      account_number_masked: `•••••••••${state.sellerBankAccount?.account_number.slice(-5) || '92834'}`,
      utr_number: `HDFCR9${Date.now().toString().slice(-8)}`,
      payout_mode: 'EARLY_COD_T1',
      status: 'PROCESSING',
      created_at: new Date().toISOString(),
    };

    set((s) => ({
      codPayoutBatches: [newBatch, ...s.codPayoutBatches],
    }));
    saveCODPayoutBatch(newBatch).then((saved) => {
      if (saved) set((s) => ({ codPayoutBatches: s.codPayoutBatches.map((item) => item.id === newBatch.id ? saved : item) }));
    });
    get().logAuditAction('REQUEST_EARLY_COD_PAYOUT', 'COD_PAYOUT', batchId, '', `Net: ₹${amount - fee}`);
  },

  createAdminCODPayoutBatch: (batchData) => {
    const newBatch: CODPayoutBatch = {
      ...batchData,
      id: `batch-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      codPayoutBatches: [newBatch, ...state.codPayoutBatches],
    }));
    saveCODPayoutBatch(newBatch).then((saved) => {
      if (saved) set((state) => ({ codPayoutBatches: state.codPayoutBatches.map((item) => item.id === newBatch.id ? saved : item) }));
    });
    get().logAuditAction('CREATE_COD_PAYOUT_BATCH', 'COD_BATCH', newBatch.id, '', newBatch.batch_reference);
    return newBatch;
  },

  updateBrandedTrackingConfig: (config) => {
    set((state) => ({
      brandedTrackingConfig: { ...state.brandedTrackingConfig, ...config },
    }));
    get().logAuditAction('UPDATE_BRANDED_TRACKING', 'TRACKING_CONFIG', 'CUSTOMIZER');
    saveBrandedTrackingConfig(get().brandedTrackingConfig);
  },
}));
