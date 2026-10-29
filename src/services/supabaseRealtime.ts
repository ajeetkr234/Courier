import { supabase, isMockMode } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeListenerCallbacks {
  onOrdersChange?: (payload?: any) => void;
  onShipmentsChange?: () => void;
  onWalletChange?: () => void;
  onNDRChange?: () => void;
  onReturnsChange?: () => void;
  onDisputesChange?: () => void;
  onPickupsChange?: () => void;
  onWarehousesChange?: () => void;
  onCouriersChange?: () => void;
  onAuditLogsChange?: () => void;
  onStatusChange?: (status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED') => void;
}

let activeChannel: RealtimeChannel | null = null;

/**
 * Initialize a global Supabase Realtime subscription covering all operational tables
 */
export function initSupabaseRealtime(callbacks: RealtimeListenerCallbacks, sellerId?: string): () => void {
  if (isMockMode) {
    callbacks.onStatusChange?.('DISCONNECTED');
    return () => {};
  }

  // Clean up any existing subscription
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }

  callbacks.onStatusChange?.('CONNECTING');

  const tenantFilter = sellerId ? `seller_id=eq.${sellerId}` : undefined;
  const channel = supabase.channel(`realtime:seller:${sellerId || 'unscoped'}`);

  channel
    // 1. Orders & Items
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: tenantFilter }, (payload) => {
      callbacks.onOrdersChange?.(payload);
    })

    // 2. Shipments & Tracking
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments', filter: tenantFilter }, () => {
      callbacks.onShipmentsChange?.();
      callbacks.onOrdersChange?.();
    })

    // 3. Finance & Wallets
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: tenantFilter }, () => {
      callbacks.onWalletChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger_entries', filter: tenantFilter }, () => {
      callbacks.onWalletChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cod_remittances', filter: tenantFilter }, () => {
      callbacks.onWalletChange?.();
    })

    // 4. NDR & RTO
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ndr_cases', filter: tenantFilter }, () => {
      callbacks.onNDRChange?.();
    })
    // 5. Returns
    .on('postgres_changes', { event: '*', schema: 'public', table: 'returns', filter: tenantFilter }, () => {
      callbacks.onReturnsChange?.();
    })

    // 6. Weight Disputes
    .on('postgres_changes', { event: '*', schema: 'public', table: 'weight_discrepancies', filter: tenantFilter }, () => {
      callbacks.onDisputesChange?.();
    })

    // 7. Pickups
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests', filter: tenantFilter }, () => {
      callbacks.onPickupsChange?.();
    })

    // 8. Warehouses
    .on('postgres_changes', { event: '*', schema: 'public', table: 'warehouses', filter: tenantFilter }, () => {
      callbacks.onWarehousesChange?.();
    })

    // 9. Couriers
    .on('postgres_changes', { event: '*', schema: 'public', table: 'couriers' }, () => {
      callbacks.onCouriersChange?.();
    })

    // 10. Audit Logs
    .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs', filter: tenantFilter }, () => {
      callbacks.onAuditLogsChange?.();
    });

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      callbacks.onStatusChange?.('CONNECTED');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      callbacks.onStatusChange?.('DISCONNECTED');
    }
  });

  activeChannel = channel;

  return () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
      activeChannel = null;
    }
  };
}
