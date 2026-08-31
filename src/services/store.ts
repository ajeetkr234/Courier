import { create } from 'zustand';
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
} from '../types';
import {
  INITIAL_SELLERS,
  INITIAL_USER_PROFILES,
  INITIAL_WAREHOUSES,
  INITIAL_ORDERS,
  INITIAL_COURIERS,
  INITIAL_RATE_CARDS,
  INITIAL_SHIPMENTS,
  INITIAL_NDR_CASES,
  INITIAL_RETURNS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_COD_REMITTANCES,
  INITIAL_RECONCILIATIONS,
  INITIAL_WEIGHT_DISCREPANCIES,
  INITIAL_API_KEYS,
  INITIAL_WEBHOOKS,
  INITIAL_INTEGRATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PICKUPS,
  INITIAL_MANIFESTS,
} from '../lib/mockData';

interface PlatformStore {
  // Active User / Tenant Context
  currentSeller: Seller | null;
  currentUser: UserProfile | null;

  // Data Collections
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

  // Wallet Calculated Balance
  walletBalance: number;

  // Actions — User & Onboarding
  setCurrentSeller: (seller: Seller) => void;
  updateSellerStatus: (sellerId: string, status: Seller['status']) => void;
  updateSellerKYC: (sellerId: string, isApproved: boolean, reason?: string) => void;
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'created_at'>) => Warehouse;

  // Actions — Orders & Shipping
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Order;
  bulkImportOrders: (newOrders: Array<Omit<Order, 'id' | 'created_at' | 'updated_at'>>) => number;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createShipment: (orderId: string, courierId: string, courierName: string, courierCode: string, shippingCost: number, codCharge: number) => Shipment | null;
  generateManifest: (courierId: string, warehouseId: string, shipmentIds: string[]) => Manifest;

  // Actions — Pickup & Tracking
  schedulePickup: (courierId: string, warehouseId: string, pickupDate: string, count: number) => PickupRequest;
  addTrackingEvent: (awbNumber: string, status: ShipmentStatus, message: string, location?: string) => void;

  // Actions — NDR, Returns & Weight Disputes
  resolveNDR: (ndrCaseId: string, actionType: 'REATTEMPT' | 'ADDRESS_UPDATE' | 'PHONE_UPDATE' | 'RTO', details?: any) => void;
  createReturnOrder: (originalOrderId: string, reason: string, isExchange?: boolean, exchangeItem?: string) => ReturnOrder;
  createReturnRequest: (originalOrderId: string, reason: string) => ReturnOrder;
  resolveWeightDispute: (disputeId: string, acceptOrStatus: boolean | string, evidenceUrl?: string) => void;

  // Actions — Wallet & Finance
  rechargeWallet: (amount: number, paymentRef: string) => void;
  creditWallet: (amount: number, paymentRef: string) => void;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'created_at'>) => void;
  settleCODRemittance: (remittanceId: string) => void;
  addReconciliationOverride: (recId: string, newStatus: ReconciliationRecord['status'], notes?: string) => void;

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
  currentSeller: INITIAL_SELLERS[0],
  currentUser: INITIAL_USER_PROFILES[0],

  sellers: INITIAL_SELLERS,
  userProfiles: INITIAL_USER_PROFILES,
  warehouses: INITIAL_WAREHOUSES,
  orders: INITIAL_ORDERS,
  couriers: INITIAL_COURIERS,
  rateCards: INITIAL_RATE_CARDS,
  shipments: INITIAL_SHIPMENTS,
  ndrCases: INITIAL_NDR_CASES,
  returns: INITIAL_RETURNS,
  returnRequests: INITIAL_RETURNS,
  ledgerEntries: INITIAL_LEDGER_ENTRIES,
  codRemittances: INITIAL_COD_REMITTANCES,
  reconciliations: INITIAL_RECONCILIATIONS,
  weightDiscrepancies: INITIAL_WEIGHT_DISCREPANCIES,
  apiKeys: INITIAL_API_KEYS,
  webhooks: INITIAL_WEBHOOKS,
  integrations: INITIAL_INTEGRATIONS,
  auditLogs: INITIAL_AUDIT_LOGS,
  pickups: INITIAL_PICKUPS,
  manifests: INITIAL_MANIFESTS,

  walletBalance: INITIAL_LEDGER_ENTRIES.reduce((acc, entry) => {
    return entry.direction === 'CREDIT' ? acc + entry.amount : acc - entry.amount;
  }, 0),

  setCurrentSeller: (seller) => set({ currentSeller: seller }),

  updateSellerStatus: (sellerId, status) => {
    set((state) => ({
      sellers: state.sellers.map((s) => (s.id === sellerId ? { ...s, status, updated_at: new Date().toISOString() } : s)),
      currentSeller: state.currentSeller?.id === sellerId ? { ...state.currentSeller, status, updated_at: new Date().toISOString() } : state.currentSeller,
    }));
    get().logAuditAction('UPDATE_SELLER_STATUS', 'SELLER', sellerId, '', status);
  },

  updateSellerKYC: (sellerId, isApproved, reason) => {
    const newStatus: Seller['status'] = isApproved ? 'ACTIVE' : 'REJECTED';
    get().updateSellerStatus(sellerId, newStatus);
    get().logAuditAction(isApproved ? 'APPROVE_KYC' : 'REJECTED_KYC', 'SELLER_KYC', sellerId, 'KYC_PENDING', newStatus);
  },

  addWarehouse: (warehouseData) => {
    const newWh: Warehouse = {
      ...warehouseData,
      id: `wh-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ warehouses: [newWh, ...state.warehouses] }));
    get().logAuditAction('ADD_WAREHOUSE', 'WAREHOUSE', newWh.id);
    return newWh;
  },

  addOrder: (orderData) => {
    const id = `ord-${1000 + get().orders.length + 1}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id,
      created_at: now,
      updated_at: now,
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    get().logAuditAction('CREATE_ORDER', 'ORDER', id);
    return newOrder;
  },

  bulkImportOrders: (newOrdersData) => {
    const now = new Date().toISOString();
    const createdOrders: Order[] = newOrdersData.map((data, idx) => ({
      ...data,
      id: `ord-bulk-${Date.now()}-${idx + 1}`,
      created_at: now,
      updated_at: now,
    }));

    set((state) => ({ orders: [...createdOrders, ...state.orders] }));
    get().logAuditAction('BULK_IMPORT_ORDERS', 'ORDER', `Count: ${createdOrders.length}`);
    return createdOrders.length;
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, current_status: status, updated_at: new Date().toISOString() } : o)),
    }));
  },

  createShipment: (orderId, courierId, courierName, courierCode, shippingCost, codCharge) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const totalDeduction = shippingCost + codCharge;
    if (state.walletBalance < totalDeduction) {
      throw new Error(`Insufficient wallet balance. Total required: ₹${totalDeduction}, Available: ₹${state.walletBalance}`);
    }

    const awbPrefix = courierCode.substring(0, 3).toUpperCase();
    const awbNumber = `${awbPrefix}${Math.floor(100000000 + Math.random() * 900000000)}`;
    const shipmentId = `shp-${Date.now()}`;
    const now = new Date().toISOString();

    const newShipment: Shipment = {
      id: shipmentId,
      seller_id: order.seller_id,
      order_id: order.id,
      order: { ...order, current_status: 'READY_TO_SHIP' },
      courier_id: courierId,
      courier_name: courierName,
      courier_code: courierCode,
      awb_number: awbNumber,
      label_url: '#',
      status: 'CREATED',
      shipping_cost: shippingCost,
      cod_charge: codCharge,
      total_freight_charge: shippingCost + codCharge,
      created_at: now,
      updated_at: now,
    };

    // Ledger Debit Entry
    const ledgerDebit: LedgerEntry = {
      id: `led-${Date.now()}`,
      seller_id: order.seller_id,
      type: 'SHIPMENT_DEBIT',
      amount: totalDeduction,
      direction: 'DEBIT',
      reference_type: 'AWB',
      reference_id: awbNumber,
      description: `Shipping debit for AWB ${awbNumber} (${courierName})`,
      created_at: now,
    };

    set((prevState) => ({
      shipments: [newShipment, ...prevState.shipments],
      orders: prevState.orders.map((o) => (o.id === orderId ? { ...o, current_status: 'READY_TO_SHIP', updated_at: now } : o)),
      ledgerEntries: [ledgerDebit, ...prevState.ledgerEntries],
      walletBalance: prevState.walletBalance - totalDeduction,
    }));

    get().logAuditAction('CREATE_SHIPMENT', 'SHIPMENT', shipmentId, '', awbNumber);
    return newShipment;
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
      seller_id: state.currentSeller?.id || 's-101',
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
    const pickupRef = `PKP-${courier?.code.toUpperCase().substring(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;

    const pickup: PickupRequest = {
      id: `pick-${Date.now()}`,
      seller_id: state.currentSeller?.id || 's-101',
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
    return pickup;
  },

  addTrackingEvent: (awbNumber, status, message, location) => {
    set((state) => {
      const shipment = state.shipments.find((s) => s.awb_number === awbNumber);
      if (!shipment) return state;

      const updatedShipments = state.shipments.map((s) =>
        s.awb_number === awbNumber ? { ...s, status, updated_at: new Date().toISOString() } : s
      );

      const updatedOrders = state.orders.map((o) =>
        o.id === shipment.order_id ? { ...o, current_status: status as OrderStatus, updated_at: new Date().toISOString() } : o
      );

      return { shipments: updatedShipments, orders: updatedOrders };
    });
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
  },

  createReturnOrder: (originalOrderId, reason, isExchange, exchangeItem) => {
    const state = get();
    const origOrder = state.orders.find((o) => o.id === originalOrderId);
    const newReturn: ReturnOrder = {
      id: `ret-${Date.now()}`,
      seller_id: state.currentSeller?.id || 's-101',
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
    return newReturn;
  },

  createReturnRequest: (originalOrderId, reason) => {
    return get().createReturnOrder(originalOrderId, reason);
  },

  resolveWeightDispute: (disputeId, acceptOrStatus, evidenceUrl) => {
    set((state) => {
      const dispute = state.weightDiscrepancies.find((w) => w.id === disputeId);
      if (!dispute) return state;

      const newStatus = typeof acceptOrStatus === 'boolean' ? (acceptOrStatus ? 'ACCEPTED' : 'DISPUTED') : acceptOrStatus;
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
  },

  rechargeWallet: (amount, paymentRef) => {
    const now = new Date().toISOString();
    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      seller_id: get().currentSeller?.id || 's-101',
      type: 'RECHARGE',
      amount,
      direction: 'CREDIT',
      reference_type: 'PAYMENT_GATEWAY',
      reference_id: paymentRef,
      description: `Instant wallet recharge via Razorpay/UPI (${paymentRef})`,
      created_at: now,
    };

    set((state) => ({
      ledgerEntries: [entry, ...state.ledgerEntries],
      walletBalance: state.walletBalance + amount,
    }));
    get().logAuditAction('RECHARGE_WALLET', 'WALLET', paymentRef, '', `+₹${amount}`);
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
  },

  toggleCourierStatus: (courierId) => {
    set((state) => ({
      couriers: state.couriers.map((c) => (c.id === courierId ? { ...c, is_active: !c.is_active } : c)),
    }));
    get().logAuditAction('TOGGLE_COURIER_STATUS', 'COURIER', courierId);
  },

  saveRateCard: (rateCardData) => {
    const rateCard: RateCard = {
      ...rateCardData,
      id: `rc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ rateCards: [rateCard, ...state.rateCards] }));
    get().logAuditAction('CREATE_RATE_CARD', 'RATE_CARD', rateCard.id, '', rateCard.name);
    return rateCard;
  },

  addTeamMember: (memberData) => {
    const member: UserProfile = {
      ...memberData,
      id: `u-${Date.now()}`,
      seller_id: get().currentSeller?.id || 's-101',
      is_active: true,
    };
    set((state) => ({ userProfiles: [...state.userProfiles, member] }));
    get().logAuditAction('ADD_TEAM_MEMBER', 'USER_PROFILE', member.id, '', member.email);
  },

  toggleTeamMemberStatus: (userId) => {
    set((state) => ({
      userProfiles: state.userProfiles.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)),
    }));
    get().logAuditAction('TOGGLE_TEAM_MEMBER', 'USER_PROFILE', userId);
  },

  createAPIKey: (name, scopes) => {
    const prefix = `pk_live_${Math.random().toString(36).substring(2, 6)}_`;
    const masked = `${prefix}****${Math.floor(1000 + Math.random() * 9000)}`;
    const apiKey: APIKey = {
      id: `key-${Date.now()}`,
      seller_id: get().currentSeller?.id || 's-101',
      name,
      key_prefix: prefix,
      secret_key_masked: masked,
      scopes,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ apiKeys: [apiKey, ...state.apiKeys] }));
    get().logAuditAction('CREATE_API_KEY', 'API_KEY', apiKey.id, '', name);
    return apiKey;
  },

  revokeAPIKey: (keyId) => {
    set((state) => ({
      apiKeys: state.apiKeys.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)),
    }));
    get().logAuditAction('REVOKE_API_KEY', 'API_KEY', keyId);
  },

  addWebhookEndpoint: (url, events) => {
    const webhook: WebhookEndpoint = {
      id: `whk-${Date.now()}`,
      seller_id: get().currentSeller?.id || 's-101',
      url,
      secret: `whsec_${Math.random().toString(36).substring(2, 14)}`,
      subscribed_events: events,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ webhooks: [webhook, ...state.webhooks] }));
    get().logAuditAction('CREATE_WEBHOOK', 'WEBHOOK', webhook.id, '', url);
    return webhook;
  },

  toggleWebhookStatus: (webhookId) => {
    set((state) => ({
      webhooks: state.webhooks.map((w) => (w.id === webhookId ? { ...w, is_active: !w.is_active } : w)),
    }));
    get().logAuditAction('TOGGLE_WEBHOOK', 'WEBHOOK', webhookId);
  },

  toggleIntegrationSync: (integrationId) => {
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
  },
}));
