import { admin } from '../_shared/supabase.ts';
import { hmacHex, json } from '../_shared/http.ts';

Deno.serve(async(req)=>{
  const expected=Deno.env.get('WEBHOOK_DISPATCH_SECRET');
  if(!expected||req.headers.get('authorization')!==`Bearer ${expected}`) return json({error:'Unauthorized'},401);
  const {data:claimed,error}=await admin.rpc('claim_outbound_webhooks',{p_limit:200});
  if(error) return json({error:error.message},500);
  const jobs=claimed||[];
  const endpointIds=[...new Set(jobs.map((job:any)=>job.webhook_endpoint_id))];
  const {data:endpoints}=endpointIds.length?await admin.from('webhook_endpoints').select('id,url,secret').in('id',endpointIds):{data:[]};
  const endpointMap=new Map((endpoints||[]).map((endpoint:any)=>[endpoint.id,endpoint]));

  const results=await Promise.all(jobs.map(async(job:any)=>{
    const endpoint:any=endpointMap.get(job.webhook_endpoint_id),attempts=job.attempt_count+1;
    if(!endpoint){await admin.from('outbound_webhook_deliveries').update({status:'DEAD',attempt_count:attempts,last_error:'Webhook endpoint missing'}).eq('id',job.id);return false;}
    const timestamp=new Date().toISOString(),raw=JSON.stringify({event_id:job.event_id,event:job.event_type,created_at:job.created_at,data:job.payload});
    const signature=await hmacHex(endpoint.secret,`${timestamp}.${raw}`);
    try{
      const response=await fetch(endpoint.url,{method:'POST',headers:{'content-type':'application/json','x-shipfaster-event-id':job.event_id,'x-shipfaster-timestamp':timestamp,'x-shipfaster-signature':`sha256=${signature}`},body:raw,signal:AbortSignal.timeout(10000)});
      const ok=response.ok;
      await admin.from('outbound_webhook_deliveries').update({status:ok?'DELIVERED':attempts>=5?'DEAD':'FAILED',attempt_count:attempts,locked_at:null,last_http_status:response.status,last_error:ok?null:`HTTP ${response.status}`,delivered_at:ok?new Date().toISOString():null,next_attempt_at:new Date(Date.now()+Math.pow(4,attempts)*60000).toISOString()}).eq('id',job.id);
      await admin.from('integration_sync_events').insert({seller_id:job.seller_id,direction:'OUTBOUND',event_type:job.event_type,external_id:job.event_id,status:ok?'SUCCESS':'FAILED',message:ok?'Status delivered to seller website':`Website returned HTTP ${response.status}`});
      return ok;
    }catch(e){
      await admin.from('outbound_webhook_deliveries').update({status:attempts>=5?'DEAD':'FAILED',attempt_count:attempts,locked_at:null,last_error:e instanceof Error?e.message:'Network error',next_attempt_at:new Date(Date.now()+Math.pow(4,attempts)*60000).toISOString()}).eq('id',job.id);
      return false;
    }
  }));
  return json({processed:jobs.length,delivered:results.filter(Boolean).length});
});
