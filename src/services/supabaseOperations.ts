import { supabase, getEffectiveSellerId } from '../lib/supabase';
import type { PickupRequest, ShipmentClaim, SupportTicket } from '../types';

export async function fetchPickupOperations(): Promise<PickupRequest[]> {
  const sellerId = await getEffectiveSellerId();
  const { data, error } = await supabase.from('pickup_requests').select('*, couriers(name)').eq('seller_id', sellerId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({ ...row, courier_name: row.couriers?.name, expected_package_count: Number(row.expected_package_count || 0) }));
}

export async function updatePickupRequest(id: string, status: PickupRequest['status'], failureReason?: string): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (failureReason) updates.failure_reason = failureReason;
  if (status === 'PICKED_UP') updates.handed_over_at = new Date().toISOString();
  const { error } = await supabase.from('pickup_requests').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const sellerId = await getEffectiveSellerId();
  const { data, error } = await supabase.from('support_tickets').select('*').eq('seller_id', sellerId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as SupportTicket[];
}

export async function createSupportTicket(input: { category: string; subject: string; description: string; priority: SupportTicket['priority']; entityType?: string; entityId?: string }): Promise<SupportTicket> {
  const { data, error } = await supabase.rpc('create_support_ticket', { p_category: input.category, p_subject: input.subject, p_description: input.description, p_priority: input.priority, p_entity_type: input.entityType || null, p_entity_id: input.entityId || null });
  if (error) throw new Error(error.message);
  return data as SupportTicket;
}

export async function fetchShipmentClaims(): Promise<ShipmentClaim[]> {
  const sellerId = await getEffectiveSellerId();
  const { data, error } = await supabase.from('shipment_claims').select('*, shipments(*, couriers(name))').eq('seller_id', sellerId).order('submitted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({ ...row, claimed_amount: Number(row.claimed_amount), approved_amount: row.approved_amount == null ? undefined : Number(row.approved_amount), shipment: row.shipments ? { ...row.shipments, courier_name: row.shipments.couriers?.name } : undefined }));
}

export async function createShipmentClaim(input: { shipmentId: string; claimType: ShipmentClaim['claim_type']; amount: number; description: string }): Promise<void> {
  const sellerId = await getEffectiveSellerId();
  const { error } = await supabase.from('shipment_claims').insert({ seller_id: sellerId, shipment_id: input.shipmentId, claim_type: input.claimType, claimed_amount: input.amount, description: input.description, status: 'SUBMITTED' });
  if (error) throw new Error(error.message);
}
