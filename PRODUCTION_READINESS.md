# ShipFaster production readiness

## Implemented

- Versioned Supabase migrations with tenant RLS, strict shipment transitions, durable order ingestion, public APIs, and notification delivery.
- Edge Functions for booking, carrier/storefront webhooks, public tracking, polling, and secure developer credentials.
- API keys are generated with Web Crypto in an authenticated Edge Function and stored as SHA-256 hashes; secrets are returned only on creation.
- Webhook signing secrets are generated server-side; webhook URLs must use HTTPS.
- Frontend Supabase configuration has no embedded project URL or key.
- Function JWT policy is committed in `supabase/config.toml`.

## Deploy

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
npx.cmd supabase db push --dry-run
npx.cmd supabase db push
npx.cmd supabase functions deploy book-shipment
npx.cmd supabase functions deploy manage-developer-credentials
npx.cmd supabase functions deploy carrier-webhook
npx.cmd supabase functions deploy storefront-webhook
npx.cmd supabase functions deploy public-tracking
npx.cmd supabase functions deploy poll-carrier-tracking
npx.cmd supabase functions deploy orders-api
npx.cmd supabase functions deploy rates-api
npx.cmd supabase functions deploy shipments-api
npx.cmd supabase functions deploy process-order-queue
npx.cmd supabase functions deploy dispatch-webhooks
npx.cmd supabase functions deploy process-notifications
```

Schedule `process-order-queue`, `dispatch-webhooks`, and `process-notifications` with their corresponding worker secrets. Schedule `poll-carrier-tracking` with `CRON_SECRET`.

## External setup still required

- Contract and credentials for at least one courier; adapt its official schemas in the booking, pickup, tracking, cancellation, NDR and return paths.
- Payment-gateway account and signed webhook flow for wallet recharge.
- Shopify/WooCommerce application credentials and webhook registrations.
- SMTP and optional SMS/WhatsApp provider credentials.
- A hosting target, domain, Auth site/redirect URLs, monitoring, and a cron caller carrying `CRON_SECRET`.

Do not enable real-money or real-shipment traffic until tenant-isolation, duplicate-booking, webhook replay, wallet concurrency, and end-to-end carrier sandbox tests pass.
