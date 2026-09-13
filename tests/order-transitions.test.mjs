import test from 'node:test';
import assert from 'node:assert/strict';

const allowed = new Set([
  'NEW>CONFIRMED','NEW>CANCELLED','CONFIRMED>READY_TO_SHIP','CONFIRMED>CANCELLED',
  'READY_TO_SHIP>SHIPPED','READY_TO_SHIP>CANCELLED','SHIPPED>IN_TRANSIT','SHIPPED>NDR','SHIPPED>RTO','SHIPPED>CANCELLED',
  'IN_TRANSIT>OUT_FOR_DELIVERY','IN_TRANSIT>NDR','IN_TRANSIT>RTO','IN_TRANSIT>DELIVERED',
  'OUT_FOR_DELIVERY>DELIVERED','OUT_FOR_DELIVERY>NDR','OUT_FOR_DELIVERY>RTO',
  'NDR>OUT_FOR_DELIVERY','NDR>RTO','NDR>DELIVERED','RTO>RETURNED',
]);

test('happy-path delivery transitions are allowed', () => {
  const path = ['NEW','CONFIRMED','READY_TO_SHIP','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'];
  for (let i=1;i<path.length;i++) assert.ok(allowed.has(`${path[i-1]}>${path[i]}`));
});
test('NDR and RTO branches are allowed', () => {
  for (const edge of ['OUT_FOR_DELIVERY>NDR','NDR>OUT_FOR_DELIVERY','NDR>RTO','RTO>RETURNED']) assert.ok(allowed.has(edge));
});
test('terminal states cannot regress', () => {
  for (const terminal of ['DELIVERED','RETURNED','CANCELLED']) assert.equal([...allowed].some((edge) => edge.startsWith(`${terminal}>`)), false);
});
