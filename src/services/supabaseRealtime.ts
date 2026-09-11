import { supabase, isMockMode } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeListenerCallbacks {
  onOrdersChange?: () => void;
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
export function initSupabaseRealtime(callbacks: RealtimeListenerCallbacks): () => void {
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

  const channel = supabase.channel('realtime:all-tables');

  channel
    // 1. Orders & Items
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      callbacks.onOrdersChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
      callbacks.onOrdersChange?.();
    })

    // 2. Shipments & Tracking
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
      callbacks.onShipmentsChange?.();
      callbacks.onOrdersChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_events' }, () => {
      callbacks.onShipmentsChange?.();
    })

    // 3. Finance & Wallets
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
      callbacks.onWalletChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger_entries' }, () => {
      callbacks.onWalletChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cod_remittances' }, () => {
      callbacks.onWalletChange?.();
    })

    // 4. NDR & RTO
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ndr_cases' }, () => {
      callbacks.onNDRChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ndr_actions' }, () => {
      callbacks.onNDRChange?.();
    })

    // 5. Returns
    .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, () => {
      callbacks.onReturnsChange?.();
    })

    // 6. Weight Disputes
    .on('postgres_changes', { event: '*', schema: 'public', table: 'weight_discrepancies' }, () => {
      callbacks.onDisputesChange?.();
    })

    // 7. Pickups
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => {
      callbacks.onPickupsChange?.();
    })

    // 8. Warehouses
    .on('postgres_changes', { event: '*', schema: 'public', table: 'warehouses' }, () => {
      callbacks.onWarehousesChange?.();
    })

    // 9. Couriers
    .on('postgres_changes', { event: '*', schema: 'public', table: 'couriers' }, () => {
      callbacks.onCouriersChange?.();
    })

    // 10. Audit Logs
    .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
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
