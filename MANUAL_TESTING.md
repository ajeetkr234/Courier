# Clean manual testing guide

This procedure uses the hosted Supabase project configured in `.env`; Docker is not required.

## 1. Clean the test database

1. Back up the Supabase project if it contains anything you may need.
2. Open `supabase/clean-test-data.sql` and review the preserved tables.
3. Change the confirmation literal `NO` to `DELETE_ALL_TEST_DATA`.
4. Paste the script into Supabase **SQL Editor** and run it.
5. Confirm the result row reports zero users, sellers, orders, and shipments.
6. Change the literal back to `NO` after the cleanup.

Do not run that script against a production project.

## 2. Apply the current schema and reference catalogue

In the Supabase SQL Editor, ensure all files in `supabase/migrations` have been applied in filename order. Apply `supabase/seed.sql` once to install only the required courier and rate catalogue. It creates no users or transactional records.

## 3. Create the platform administrator

1. In Supabase, open **Authentication -> Users -> Add user**.
2. Create `admin.test@yourdomain.com` with a unique test password and enable **Auto Confirm User**.
3. In the SQL Editor run:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"PLATFORM_ADMIN"}'::jsonb
WHERE email = 'admin.test@yourdomain.com';
```

4. Sign out and back in after changing a role so the JWT is refreshed.

## 4. Start the application

```powershell
npm.cmd install
npm.cmd run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## 5. Test the public website

1. Visit Home, Features, Solutions, Couriers, Pricing, About, Contact, and Integrations.
2. Check desktop and mobile navigation.
3. Submit every public form with invalid values, then valid values.
4. Test the rate calculator with serviceable and unserviceable pincodes.
5. Test public tracking with an unknown AWB; it should show a safe not-found state.

## 6. Test seller registration and onboarding

1. Register a new seller with a different email.
2. Verify the email if confirmations are enabled, then sign in.
3. Confirm the seller starts in `DRAFT` and cannot ship yet.
4. Complete company, GST/PAN, bank, pickup-address, and warehouse details.
5. Upload KYC documents and submit for review.
6. Confirm the seller can only see its own tenant records.

## 7. Test administrator approval

1. Sign out and sign in as `admin.test@yourdomain.com`.
2. Open `/admin` and confirm seller, courier, rate, finance, dispute, and audit pages load.
3. Find the new seller, review KYC, and approve it as `ACTIVE`.
4. Verify the action appears in the audit log.
5. Sign out, then sign back in as the seller.

## 8. Test the seller workflow

Run these in order so every record originates from your manual actions:

1. Create and edit a warehouse.
2. Recharge the wallet using only a configured payment sandbox.
3. Create one prepaid and one COD order.
4. Import a CSV containing valid rows, a duplicate, and an invalid row.
5. Compare courier rates and verify weight/COD calculations.
6. Book a shipment using a carrier sandbox; verify AWB and label creation.
7. Create a manifest and schedule a pickup.
8. Send carrier webhook events through picked-up, in-transit, out-for-delivery, and delivered.
9. Verify customer tracking and notification queue entries.
10. Exercise NDR reattempt and RTO paths on a separate shipment.
11. Create a return, QC decision, refund, and weight dispute.
12. Check wallet ledger, COD remittance, reports, and reconciliation totals.

## 9. Test integrations and developer API

1. Connect a Custom Website integration.
2. Create an API key with only the scopes needed by each test.
3. Test order creation with an idempotency key; repeat it and confirm no duplicate.
4. Test rate lookup and shipment booking.
5. Register an HTTPS webhook endpoint and verify its HMAC signature and retry behavior.
6. Revoke the API key and verify subsequent requests return unauthorized.

## 10. Final isolation and security checks

1. Register a second seller.
2. Confirm neither seller can read or mutate the other's orders, shipments, wallet, keys, or files.
3. Confirm a seller cannot open `/admin`.
4. Confirm unauthenticated users are redirected from `/app` and `/admin`.
5. Test duplicate booking, replayed webhooks, insufficient wallet balance, invalid transitions, and expired sessions.
6. Run `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build` before release.
