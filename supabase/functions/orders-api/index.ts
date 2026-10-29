import { admin } from '../_shared/supabase.ts';
import { corsHeaders, json } from '../_shared/http.ts';

const hex=(bytes:Uint8Array)=>[...bytes].map((v)=>v.toString(16).padStart(2,'0')).join('');
const sha256=async(value:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))));
const fail=(code:string,message:string,status=422)=>json({error:message,code},status);
const workerUrl=()=>`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-order-queue`;
const wakeWorker=()=>{
  const secret=Deno.env.get('QUEUE_WORKER_SECRET');
  // Keep admission and materialization workloads isolated by default. Production
  // should invoke the worker from a rate-controlled scheduler. Auto-wake is only
  // a low-volume fallback and must never fan out one worker per API request.
  const enabled=Deno.env.get('QUEUE_AUTO_WAKE_ENABLED')==='true';
  const probability=Math.min(0.01,Math.max(0,Number(Deno.env.get('QUEUE_AUTO_WAKE_PROBABILITY')||0.002)));
  if(!enabled||!secret||Math.random()>=probability) return;
  EdgeRuntime.waitUntil(fetch(workerUrl(),{method:'POST',headers:{'x-worker-secret':secret,'content-type':'application/json'},body:'{"batch_size":25}'}).catch(()=>undefined));
};

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  if(!token.startsWith('pk_live_')) return json({error:'Valid API key required'},401);
  const keyHash=await sha256(token);

  if(req.method==='GET'){
    const {data:key}=await admin.from('api_keys').select('id,seller_id,scopes').eq('key_hash',keyHash).eq('is_active',true).maybeSingle();
    if(!key) return json({error:'Invalid or revoked API key'},401);
    if(!key.scopes?.includes('orders:read')) return json({error:'Missing orders:read scope'},403);
    const {data:seller}=await admin.from('sellers').select('status,company_name,pan').eq('id',key.seller_id).single();
    if(!seller||seller.status!=='ACTIVE'||!seller.company_name||!seller.pan) return json({error:'Verified active seller profile required'},403);
    const url=new URL(req.url),queueId=url.searchParams.get('queue_id'),externalId=url.searchParams.get('external_order_id'),updatedAfter=url.searchParams.get('updated_after');
    if(queueId){
      const {data:receipt,error:receiptError}=await admin.from('order_ingestion_queue')
        .select('id,external_order_id,status,order_id,error_code,error_message,created_at,completed_at')
        .eq('id',queueId).eq('seller_id',key.seller_id).maybeSingle();
      return receiptError?json({error:receiptError.message},400):receipt?json({receipt}):json({error:'Queue receipt not found'},404);
    }
    let query=admin.from('orders').select('*,order_items(*),shipments(*)').eq('seller_id',key.seller_id).order('updated_at',{ascending:false}).limit(100);
    if(externalId) query=query.eq('external_order_id',externalId);
    if(updatedAfter) query=query.gte('updated_at',updatedAfter);
    const {data,error}=await query; return error?json({error:error.message},400):json({orders:data});
  }
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  let body:any; try{body=await req.json();}catch{return json({error:'Invalid JSON'},400);}
  const integrationId=req.headers.get('x-integration-account-id');
  if(Array.isArray(body.orders)){
    if(!integrationId) return fail('MISSING_INTEGRATION','Integration ID is required');
    if(body.orders.length<1||body.orders.length>100) return fail('INVALID_BATCH_SIZE','Batch must contain 1 to 100 orders',400);
    body.orders=body.orders.map((order:any)=>({...order,shipping_address:{...order.shipping_address,phone:String(order.shipping_address?.phone||'').replace(/\D/g,'')}}));
    const {data:batch,error:batchError}=await admin.rpc('enqueue_storefront_orders_batch',{p_key_hash:keyHash,p_integration_id:integrationId,p_orders:body.orders});
    if(batchError){
      const code=String(batchError.message||'BATCH_CREATE_FAILED').split(':').pop()?.trim()||'BATCH_CREATE_FAILED';
      return fail(code,code.replaceAll('_',' '),batchError.code==='28000'?401:batchError.code==='42501'?403:422);
    }
    wakeWorker();
    return json(batch,202);
  }
  const idempotency=req.headers.get('idempotency-key')||body.idempotency_key||body.external_order_id;
  if(!integrationId||!idempotency) return fail('MISSING_INTEGRATION','Integration ID and idempotency key are required');
  body.shipping_address={...body.shipping_address,phone:String(body.shipping_address?.phone||'').replace(/\D/g,'')};
  const preferAsync=(req.headers.get('prefer')||'').toLowerCase().includes('respond-async')||new URL(req.url).searchParams.get('async')==='true';
  const rpc=preferAsync?'enqueue_storefront_order':'ingest_storefront_order';
  const {data:result,error}=await admin.rpc(rpc,{p_key_hash:keyHash,p_integration_id:integrationId,p_idempotency_key:String(idempotency),p_payload:body});
  if(error){
    const code=String(error.message||'ORDER_CREATE_FAILED').split(':').pop()?.trim()||'ORDER_CREATE_FAILED';
    return fail(code,code.replaceAll('_',' '),error.code==='28000'?401:error.code==='42501'?403:422);
  }
  if(preferAsync){ wakeWorker(); return json(result,result?.duplicate?200:202); }
  return json(result,result?.duplicate?200:201);
});
