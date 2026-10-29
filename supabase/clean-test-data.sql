-- DESTRUCTIVE: removes every application user and all tenant/transaction data.
-- Required courier/rate catalogues, transition rules, and notification templates
-- are preserved so a clean environment remains usable.
--
-- Before running in the Supabase SQL Editor, replace NO below with:
-- DELETE_ALL_TEST_DATA

DO $$
BEGIN
  IF 'NO' <> 'DELETE_ALL_TEST_DATA' THEN
    RAISE EXCEPTION 'Cleanup refused. Read this file and replace NO with DELETE_ALL_TEST_DATA.';
  END IF;
END $$;

BEGIN;

TRUNCATE TABLE
  public.sellers,
  public.background_jobs,
  public.inbound_webhook_events,
  public.provider_operation_logs,
  public.notification_attempts,
  public.outbound_webhook_deliveries,
  public.order_ingestion_queue,
  public.audit_logs
RESTART IDENTITY CASCADE;

DELETE FROM storage.objects
WHERE bucket_id IN (
  'kyc-documents',
  'return-evidence',
  'claim-evidence',
  'support-attachments',
  'handover-proofs'
);

-- Authentication identities/sessions cascade from auth.users.
DELETE FROM auth.users;

COMMIT;

-- Expected result after cleanup: zero application users and sellers.
SELECT
  (SELECT count(*) FROM auth.users) AS auth_users,
  (SELECT count(*) FROM public.sellers) AS sellers,
  (SELECT count(*) FROM public.orders) AS orders,
  (SELECT count(*) FROM public.shipments) AS shipments;
