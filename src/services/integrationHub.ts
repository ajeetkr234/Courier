import { supabase, getEffectiveSellerId, supabaseUrl } from '../lib/supabase';
import { IntegrationAccount, IntegrationImportError, IntegrationSyncEvent } from '../types';

export const getOrdersApiUrl = () => `${supabaseUrl}/functions/v1/orders-api`;
export const getRatesApiUrl = () => `${supabaseUrl}/functions/v1/rates-api`;
export const getShipmentsApiUrl = () => `${supabaseUrl}/functions/v1/shipments-api`;
export const getTrackingApiUrl = () => `${supabaseUrl}/functions/v1/public-tracking`;

export type NotificationSettings = {
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  shipment_updates_enabled: boolean;
  tracking_base_url: string;
  whatsapp_template_name: string;
  whatsapp_language_code: string;
};

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const sellerId = await getEffectiveSellerId();
  const { data, error } = await supabase.from('seller_notification_settings').select('*').eq('seller_id', sellerId).maybeSingle();
  if (error) throw error;
  return data || { whatsapp_enabled:false, sms_enabled:false, shipment_updates_enabled:true, tracking_base_url:window.location.origin, whatsapp_template_name:'shipment_update', whatsapp_language_code:'en' };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  const sellerId = await getEffectiveSellerId();
  const { error } = await supabase.from('seller_notification_settings').upsert({ seller_id:sellerId, ...settings, updated_at:new Date().toISOString() }, { onConflict:'seller_id' });
  if (error) throw error;
}

export async function createCustomIntegration(input: { storeName:string; storeUrl:string; warehouseId:string }): Promise<IntegrationAccount> {
  const sellerId=await getEffectiveSellerId();
  const url=new URL(input.storeUrl);
  if (!['http:','https:'].includes(url.protocol)) throw new Error('Enter a valid website URL');
  const {data,error}=await supabase.from('integration_accounts').insert({seller_id:sellerId,platform:'CUSTOM_API',store_name:input.storeName.trim(),store_url:url.toString(),status:'CONNECTED',auto_sync_orders:true,sync_tracking:true,default_warehouse_id:input.warehouseId,settings:{order_status_map:{pending:'NEW',processing:'CONFIRMED',completed:'DELIVERED'}}}).select().single();
  if(error) throw error;
  return data as IntegrationAccount;
}

export async function updateIntegrationConnection(id:string, patch:Partial<IntegrationAccount>):Promise<void>{
  const {error}=await supabase.from('integration_accounts').update({...patch,updated_at:new Date().toISOString()}).eq('id',id);
  if(error) throw error;
}

export async function fetchIntegrationTelemetry():Promise<{events:IntegrationSyncEvent[];errors:IntegrationImportError[]}>{
  const sellerId=await getEffectiveSellerId();
  const [eventsResult,errorsResult]=await Promise.all([
    supabase.from('integration_sync_events').select('*').eq('seller_id',sellerId).order('created_at',{ascending:false}).limit(20),
    supabase.from('integration_import_errors').select('*').eq('seller_id',sellerId).eq('status','OPEN').order('created_at',{ascending:false}).limit(20),
  ]);
  return {events:(eventsResult.data||[]) as IntegrationSyncEvent[],errors:(errorsResult.data||[]) as IntegrationImportError[]};
}

export async function resolveImportError(id:string):Promise<void>{
  const {error}=await supabase.from('integration_import_errors').update({status:'RESOLVED',resolved_at:new Date().toISOString()}).eq('id',id);
  if(error) throw error;
}

export async function saveSkuShippingProfile(input:{sku:string;weightKg:number;lengthCm?:number;widthCm?:number;heightCm?:number}):Promise<void>{
  const sellerId=await getEffectiveSellerId();
  const {error}=await supabase.from('sku_shipping_profiles').upsert({seller_id:sellerId,sku:input.sku.trim(),weight_kg:input.weightKg,length_cm:input.lengthCm||null,width_cm:input.widthCm||null,height_cm:input.heightCm||null,updated_at:new Date().toISOString()},{onConflict:'seller_id,sku'});
  if(error) throw error;
}

export async function createShippingRule(input:{name:string;strategy:'CHEAPEST'|'FASTEST'|'MANUAL';paymentType?:'COD'|'PREPAID'}):Promise<void>{
  const sellerId=await getEffectiveSellerId();
  const {error}=await supabase.from('shipping_automation_rules').insert({seller_id:sellerId,name:input.name.trim(),conditions:input.paymentType?{payment_type:input.paymentType}:{},actions:{courier_strategy:input.strategy},is_active:true});
  if(error) throw error;
}
