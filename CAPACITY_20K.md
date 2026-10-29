# ShipFaster 20k-seller capacity target

## Verified staging results (2026-09-14)

### 10-minute deep test

- 120,000/120,000 orders durably accepted in 10 minutes (199.91 orders/sec).
- 12,000/12,000 batch requests passed all response checks; HTTP error rate 0%.
- Average acceptance latency 290.77ms, p95 359.58ms, p99 595.53ms, max 2.49s.
- The acceptance SLO passed, but draining 120,000 orders only after the load phase caused
  queue age to exceed 10 minutes. Production must run the eight workers continuously while
  accepting traffic, not wait until the end of a test.
- The test exposed statement-timeout cleanup on a large cascade. Migration
  `20260914035000_chunked_capacity_cleanup.sql` and runner retries now remove fixtures in
  guarded 2,000-row chunks. The residual deep-test fixture was fully removed.

- Original synchronous 100 RPS: 25.8 completed requests/sec, p95 47.41s.
- After removing the shared API-key hot-row write: 41.8 requests/sec, p95 16.85s.
- Batch acceptance (10 orders/request at 20 requests/sec): 6,000/6,000 accepted,
  zero errors, 198.7 orders/sec; p90 721ms and p95 1.89s.
- One pooled worker: 100 orders in 2.594s (38.6 orders/sec).
- Four workers: 400 orders in 2.972s (134.58 orders/sec), zero failures.
- Eight workers: 800 orders in 3.403s (235.06 orders/sec), zero failures.

The throughput target is met through batch acceptance plus eight controlled workers. The
strict p95 below 750ms target is not yet met on this staging tier. Use a production project
in the closest seller region with sufficient Edge/database compute and repeat the soak test.

## Production ingestion topology

1. Websites send batches of up to 100 orders with an API key and integration ID.
2. `orders-api` validates the verified seller once and returns `202` after a durable insert.
3. A rate-controlled scheduler runs eight `process-order-queue` calls concurrently with
   `batch_size=100`. Per-request worker fan-out stays disabled.
4. Workers use `FOR UPDATE SKIP LOCKED`, one pooled database RPC per batch, exponential
   retry and a dead-letter state.
5. Alert when queue age exceeds 60 seconds, dead rows appear, or acceptance remains above
   completion throughput for five minutes.

## Target workload

- 20,000 seller tenants stored in the platform.
- 100 orders/second sustained normal traffic.
- 200 orders/second peak traffic.
- API error rate below 1%.
- Order-ingestion latency p95 below 750 ms and p99 below 1.5 seconds.
- No duplicate orders when clients retry with the same idempotency key.
- No duplicate outbound webhook processing across concurrent workers.

## Implemented controls

- Atomic `ingest_storefront_order` database transaction for verification, warehouse mapping, SKU-weight resolution, order and item insertion, and audit event creation.
- Partial unique indexes for active API-key lookup and open import errors.
- Seller/time indexes for orders, shipments and integration telemetry.
- API-key usage writes removed from the request hot path and aggregated by queue workers.
- Durable async ingestion queue with idempotent seller-scoped receipts.
- Set-based batches of up to 100 orders per request to reduce connection pressure.
- Single-connection pooled workers with `FOR UPDATE SKIP LOCKED` claims.
- Seller-scoped realtime subscriptions; high-volume child tables are not subscribed globally.
- Dashboard reads capped to the newest 200 orders and shipments.
- Outbound webhook jobs claimed using `FOR UPDATE SKIP LOCKED`, with stale-lease recovery.
- Batched webhook claims of 200 jobs and five-attempt exponential retry/dead-letter behavior.
- HMAC signatures, API scopes, ACTIVE-seller verification and idempotency enforcement.

## Required staging test

Use [tests/load/orders-api.k6.js](tests/load/orders-api.k6.js) against an isolated staging project. Run 100 RPS for 15 minutes, 200 RPS for 15 minutes, and 200 RPS for a 60-minute soak. Do not approve production until all thresholds pass and database CPU remains below 70%, pool utilization below 70%, and webhook queue age remains below 60 seconds.

The test requires a staging `pk_live_` secret and integration ID. API-key plaintext is intentionally shown only once and cannot be recovered from the database. Generate a new staging key from Developer Portal immediately before testing.

## Production infrastructure requirements

- Paid/dedicated Postgres compute sized from the staging result; free-tier infrastructure is not an acceptable basis for 200 RPS.
- Transaction-mode connection pooling.
- At least two independently scheduled webhook-dispatch invocations per interval; atomic claiming prevents duplicates.
- Monitoring/alerts for API p95/p99, 5xx rate, DB CPU/IOPS/connections, Realtime lag, webhook queue depth/oldest age and dead-letter count.
- Point-in-time recovery, tested backups and an incident rollback procedure.

Capacity is an operational property, not a code-only guarantee. Re-run the load and soak tests after schema changes, provider changes or major releases.
