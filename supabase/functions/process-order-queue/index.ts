import { admin } from '../_shared/supabase.ts';
import { json } from '../_shared/http.ts';

const asMessage=(error:unknown)=>error instanceof Error?error.message:typeof error==='object'?JSON.stringify(error):String(error);

Deno.serve(async(req)=>{
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  const expected=Deno.env.get('QUEUE_WORKER_SECRET');
  if(!expected||req.headers.get('x-worker-secret')!==expected) return json({error:'Unauthorized'},401);

  let requested=25;
  try{ requested=Number((await req.json())?.batch_size||25); }catch{ /* default batch */ }
  const batchSize=Math.min(100,Math.max(1,requested));
  const {data:result,error:processError}=await admin.rpc('process_order_ingestion_batch',{p_limit:batchSize});
  if(processError) return json({error:processError.message},500);
  const {data:metrics,error:metricsError}=await admin.rpc('order_ingestion_queue_metrics');
  return json({...result,metrics:metricsError?{error:asMessage(metricsError)}:metrics});
});
