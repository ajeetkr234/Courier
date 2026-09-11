import { supabase, getEffectiveSellerId, isValidUUID } from '../lib/supabase';
import { AuditLog } from '../types';

/**
 * Fetch audit trail logs from Supabase
 */
export async function fetchAuditLogsFromSupabase(sellerId?: string): Promise<AuditLog[]> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (sellerId && isValidUUID(sellerId)) {
      query = query.eq('seller_id', sellerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((a: any) => ({
      id: a.id,
      user_name: a.payload?.user_name || 'System User',
      user_email: a.payload?.user_email || 'system@logistics.com',
      role: a.payload?.role || 'OWNER',
      action: a.action,
      entity_type: a.entity_type,
      entity_id: a.entity_id,
      old_value: a.payload?.old_value,
      new_value: a.payload?.new_value,
      ip_address: a.payload?.ip_address || '127.0.0.1',
      timestamp: a.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch audit logs from Supabase:', err);
    return [];
  }
}

/**
 * Log an audit action to Supabase
 */
export async function logAuditActionInSupabase(
  action: string,
  entityType: string,
  entityId: string,
  user: { name?: string; email?: string; role?: string } | null,
  oldValue?: string,
  newValue?: string,
  sellerId?: string
): Promise<void> {
  try {
    const effectiveSellerId = await getEffectiveSellerId(sellerId);
    const userId = isValidUUID(user?.name) ? (user as any).id : '00000000-0000-0000-0000-000000000001';

    await supabase.from('audit_logs').insert({
      seller_id: effectiveSellerId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      payload: {
        user_name: user?.name || 'System Operator',
        user_email: user?.email || 'admin@shipfaster.com',
        role: user?.role || 'ADMIN',
        old_value: oldValue,
        new_value: newValue,
        ip_address: '127.0.0.1',
      },
    });
  } catch (err) {
    // Non-blocking error for audit logs
    console.warn('Failed to record audit log to Supabase:', err);
  }
}
