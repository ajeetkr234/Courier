# ShipFaster Website API

All authenticated calls use `Authorization: Bearer pk_live_...`. Create the key in **Seller → Developer Portal** and keep it on the website server. Never expose it to browser JavaScript.

## One-time setup

1. Create and verify a seller account and pickup warehouse.
2. In **Integrations**, connect a **Custom Website** and copy its integration ID.
3. In **Developer Portal**, create an API key with `orders:read`, `orders:write`, `rates:read`, and `shipments:write`.
4. Register an HTTPS webhook URL for outbound order/shipment status events.

## Create an order

`POST {SUPABASE_URL}/functions/v1/orders-api`

Headers: `Authorization`, `Idempotency-Key`, and `X-Integration-Account-Id`.

```json
{
  "external_order_id": "WEB-1042",
  "payment_type": "COD",
  "total_amount": 1299,
  "weight_kg": 1.2,
  "length_cm": 20,
  "width_cm": 15,
  "height_cm": 10,
  "shipping_address": {
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "address_line1": "21 MP Nagar",
    "city": "Bhopal",
    "state": "Madhya Pradesh",
    "pincode": "462028"
  },
  "items": [{ "sku": "TSHIRT-001", "name": "Cotton T-Shirt", "quantity": 1, "unit_price": 1299 }]
}
```

Add `Prefer: respond-async` for queued ingestion. Bulk requests may contain an `orders` array of up to 100 entries.

## Compare rates

`POST {SUPABASE_URL}/functions/v1/rates-api`

Pass `{ "order_id": "uuid" }`, or pass `pickup_pincode`, `delivery_pincode`, `weight_kg`, `payment_type`, and `order_value`.

## Book shipment

`POST {SUPABASE_URL}/functions/v1/shipments-api` with an `Idempotency-Key` header.

```json
{
  "order_id": "uuid",
  "courier_id": "uuid",
  "quote_id": "rate-slab-uuid-from-rates-api",
  "service_code": "SURFACE"
}
```

ShipFaster recalculates the quote server-side and charges the seller wallet; client-supplied prices are never trusted. The response includes the shipment and AWB after the configured carrier accepts the booking.

## Tracking

Public customer tracking: `GET {SUPABASE_URL}/functions/v1/public-tracking?q=AWB_OR_ORDER_ID`.

Authenticated shipment lookup: `GET {SUPABASE_URL}/functions/v1/shipments-api?awb=AWB`.

## Webhook verification

ShipFaster sends `X-ShipFaster-Event-Id`, `X-ShipFaster-Timestamp`, and `X-ShipFaster-Signature`. The signature is `sha256=HMAC_SHA256(webhook_secret, timestamp + "." + raw_body)`. Reject stale timestamps and deduplicate event IDs.

## Buyer messages

Enable WhatsApp/SMS in Developer Portal. Shipment changes enqueue messages automatically. Run `process-notifications` on a schedule with `Authorization: Bearer {NOTIFICATION_WORKER_SECRET}`. WhatsApp uses an approved Meta template with four body parameters: customer name, order ID, status, and tracking URL. SMS uses Twilio.
