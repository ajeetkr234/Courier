# Fulfilment Edge Functions

Deploy `book-shipment`, `carrier-webhook`, `public-tracking`, `storefront-webhook`, and `poll-carrier-tracking` after applying the latest migration.

Required secrets:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `COURIER_WEBHOOK_SECRET_<PROVIDER>` for each carrier
- The credential secret named by each `courier_credentials.secret_name` row
- `STOREFRONT_SECRET_<INTEGRATION_ACCOUNT_UUID>` (hyphens replaced by underscores)

Schedule `poll-carrier-tracking` every 15–30 minutes with `Authorization: Bearer <CRON_SECRET>`. Courier implementations must expose the configured `base_url` endpoints `/shipments` and `/tracking/:awb`, or the function must be adapted to that provider's official API schema.

All verification and POD objects must use `<seller_id>/...` paths in their private storage buckets.
