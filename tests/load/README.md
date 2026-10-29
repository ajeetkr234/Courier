# ShipFaster capacity test

Run against an isolated staging Supabase project, never production. Apply all migrations and deploy `orders-api` first, then create one ACTIVE test seller, warehouse, custom integration and `orders:write` API key.

```powershell
$env:ORDERS_API_URL='https://PROJECT.supabase.co/functions/v1/orders-api'
$env:SHIPFASTER_API_KEY='pk_live_...'
$env:INTEGRATION_ID='...'
$env:WAREHOUSE_ID='...'
$env:TARGET_RPS='200'
$env:DURATION='10m'
$env:ASYNC_MODE='true'
k6 run tests/load/orders-api.k6.js
```

`ASYNC_MODE=true` sends `Prefer: respond-async`. A successful response is `202 Accepted`
with a durable `queue_id`; query `GET /orders-api?queue_id=...` using the same API key
to observe `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, or `DEAD`. Keep a scheduled
call to `process-order-queue` running even when inbound traffic stops so the queue drains.

Measure two capacities separately: API acceptance RPS and completed orders/minute. Passing
the acceptance test while queue age continuously grows is a failure, not usable capacity.

For 200 orders/second with lower connection pressure, send 10 orders per batch at 20 requests/second:

```powershell
$env:TARGET_RPS='20'
$env:BATCH_SIZE='10'
$env:DURATION='5m'
k6 run tests/load/orders-api-batch.k6.js
```

Acceptance gates: error rate below 1%, p95 below 750 ms, p99 below 1.5 seconds. Run soak testing for 60 minutes and inspect Postgres CPU, IOPS, connection pool saturation, WAL growth, Edge Function concurrency, Realtime lag and outbound webhook backlog.

## Repeatable end-to-end runner

`run-capacity.mjs` creates a unique staging seller, warehouse, integration and one-time API
key using the staging service role. It runs the batch test, drains the queue with controlled
workers, rejects dead letters or a drain timeout, and always deletes the fixture in `finally`.
Never provide production credentials.

```powershell
$env:STAGING_SUPABASE_URL='https://PROJECT.supabase.co'
$env:STAGING_SERVICE_ROLE_KEY='staging-service-role-only'
$env:QUEUE_WORKER_SECRET='staging-worker-secret'
$env:DURATION='10m'
npm.cmd run test:capacity
```

The manual GitHub Actions workflow `.github/workflows/capacity.yml` runs the same test and
serializes executions so two capacity runs cannot collide.

For tenant-cardinality validation, seed 20,000 seller rows in staging and run `EXPLAIN (ANALYZE, BUFFERS)` for seller-scoped order, shipment, integration-error and webhook queries. The indexes in `20260914010000_scale_20k_sellers.sql` are designed for those access paths.
