-- Remove any legacy permissive policies before rebuilding tenant isolation.
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'sellers','seller_kyc','seller_bank_accounts','warehouses','customers','orders',
    'rate_quotes','shipments','pickup_requests','ndr_cases','returns','wallets',
    'ledger_entries','cod_remittances','weight_discrepancies','api_keys',
    'webhook_endpoints','background_jobs','audit_logs','seller_team_members',
    'integration_accounts','branded_tracking_configs','ndr_escalations',
    'cod_payout_batches','reconciliation_records','seller_verification_documents',
    'provider_operation_logs','manifests','notification_templates',
    'notification_attempts','return_policies','refunds','shipment_claims',
    'support_tickets','seller_notification_settings','integration_location_mappings',
    'integration_sync_events','integration_import_errors','sku_shipping_profiles',
    'shipping_automation_rules','outbound_webhook_deliveries','order_ingestion_queue'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
      FOR policy_name IN
        SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=table_name
      LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', policy_name, table_name);
      END LOOP;

      IF table_name = 'sellers' THEN
        EXECUTE 'CREATE POLICY tenant_select ON public.sellers FOR SELECT TO authenticated USING (public.is_platform_admin() OR id=public.jwt_seller_id())';
        EXECUTE 'CREATE POLICY platform_admin_all ON public.sellers FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())';
      ELSE
        EXECUTE format('CREATE POLICY tenant_select ON public.%I FOR SELECT TO authenticated USING (public.is_platform_admin() OR seller_id=public.jwt_seller_id())', table_name);
        EXECUTE format('CREATE POLICY platform_admin_all ON public.%I FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())', table_name);
      END IF;
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'warehouses','customers','orders','rate_quotes','pickup_requests','ndr_cases',
    'returns','weight_discrepancies','api_keys','webhook_endpoints','background_jobs',
    'seller_team_members','integration_accounts','branded_tracking_configs',
    'seller_verification_documents','seller_bank_accounts','manifests',
    'notification_templates','return_policies','shipment_claims','support_tickets',
    'seller_notification_settings','integration_location_mappings',
    'integration_import_errors','sku_shipping_profiles','shipping_automation_rules'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('CREATE POLICY seller_owned_write ON public.%I FOR ALL TO authenticated USING (seller_id=public.jwt_seller_id()) WITH CHECK (seller_id=public.jwt_seller_id())', table_name);
    END IF;
  END LOOP;
END $$;
