import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const apiUrl=__ENV.ORDERS_API_URL;
const apiKey=__ENV.SHIPFASTER_API_KEY;
const integrationId=__ENV.INTEGRATION_ID;
const warehouseId=__ENV.WAREHOUSE_ID || undefined;
const asyncMode=String(__ENV.ASYNC_MODE||'false').toLowerCase()==='true';
const errors=new Rate('order_error_rate');
const duplicates=new Counter('idempotent_duplicates');
const latency=new Trend('order_ingestion_latency',true);

export const options={
  scenarios:{
    sustained_orders:{executor:'constant-arrival-rate',rate:Number(__ENV.TARGET_RPS||200),timeUnit:'1s',duration:__ENV.DURATION||'5m',preAllocatedVUs:250,maxVUs:1000},
  },
  thresholds:{http_req_duration:['p(95)<750','p(99)<1500'],order_ingestion_latency:['p(95)<750'],order_error_rate:['rate<0.01'],http_req_failed:['rate<0.01']},
  noConnectionReuse:false,userAgent:'ShipFaster-capacity-test/1.0',
};

export function setup(){
  if(!apiUrl||!apiKey||!integrationId) throw new Error('Set ORDERS_API_URL, SHIPFASTER_API_KEY and INTEGRATION_ID');
}

export default function(){
  const externalId=`LOAD-${__VU}-${__ITER}-${Date.now()}`;
  const payload=JSON.stringify({external_order_id:externalId,warehouse_id:warehouseId,payment_type:'PREPAID',total_amount:999,weight_kg:0.5,shipping_address:{name:'Capacity Test Buyer',phone:'9876543210',address_line1:'Load Test Address',city:'Delhi',state:'Delhi',pincode:'110001'},items:[{sku:'LOAD-SKU',name:'Load test product',quantity:1,unit_price:999}]});
  const headers={Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':externalId,'X-Integration-Account-Id':integrationId};
  if(asyncMode) headers.Prefer='respond-async';
  const response=http.post(apiUrl,payload,{headers,tags:{endpoint:asyncMode?'enqueue_order':'create_order'}});
  latency.add(response.timings.duration);
  let body={}; try{body=response.json();}catch{ /* response validation below */ }
  const ok=check(response,{
    'status is successful':(r)=>r.status===200||r.status===201||r.status===202,
    'order accepted':()=>body.accepted===true,
    'receipt returned':()=>asyncMode?Boolean(body.queue_id):Boolean(body.order?.id),
  });
  errors.add(!ok);
  if(body.duplicate) duplicates.add(1);
}
