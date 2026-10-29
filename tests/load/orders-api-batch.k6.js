import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const apiUrl=__ENV.ORDERS_API_URL;
const apiKey=__ENV.SHIPFASTER_API_KEY;
const integrationId=__ENV.INTEGRATION_ID;
const warehouseId=__ENV.WAREHOUSE_ID;
const batchSize=Math.min(100,Math.max(1,Number(__ENV.BATCH_SIZE||10)));
const errors=new Rate('batch_error_rate');
const latency=new Trend('batch_acceptance_latency',true);
const acceptedOrders=new Counter('accepted_orders');

export const options={scenarios:{batch_ingestion:{executor:'constant-arrival-rate',rate:Number(__ENV.TARGET_RPS||20),timeUnit:'1s',duration:__ENV.DURATION||'30s',preAllocatedVUs:100,maxVUs:500}},thresholds:{http_req_duration:['p(95)<750','p(99)<1500'],batch_error_rate:['rate<0.01'],http_req_failed:['rate<0.01']}};

export function setup(){if(!apiUrl||!apiKey||!integrationId||!warehouseId) throw new Error('Missing load-test environment variables');}
export default function(){
  const seed=`BATCH-${__VU}-${__ITER}-${Date.now()}`;
  const orders=Array.from({length:batchSize},(_,index)=>({external_order_id:`${seed}-${index}`,warehouse_id:warehouseId,payment_type:'PREPAID',total_amount:999,weight_kg:0.5,shipping_address:{name:'Capacity Test Buyer',phone:'9876543210',address_line1:'Load Test Address',city:'Delhi',state:'Delhi',pincode:'110001'},items:[{sku:'LOAD-SKU',name:'Load test product',quantity:1,unit_price:999}]}));
  const response=http.post(apiUrl,JSON.stringify({orders}),{headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','X-Integration-Account-Id':integrationId},tags:{endpoint:'enqueue_order_batch'}});
  latency.add(response.timings.duration);
  let body={};try{body=response.json();}catch{/* checked below */}
  const ok=check(response,{'status is 202':r=>r.status===202,'batch accepted':()=>body.accepted===true,'all orders accounted for':()=>Number(body.accepted_count||0)+Number(body.duplicate_count||0)===batchSize});
  errors.add(!ok);if(ok) acceptedOrders.add(batchSize);
}
