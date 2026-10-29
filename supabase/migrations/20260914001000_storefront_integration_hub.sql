-- Production storefront integration hub: mappings, import observability and reliable outbound webhooks.
ALTER TABLE integration_accounts ADD COLUMN IF NOT EXISTS default_warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL;
ALTER TABLE integration_accounts ADD COLUMN IF NOT EXISTS webhook_secret_hash text;
ALTER TABLE integration_accounts ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE integration_accounts ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE integration_accounts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE orders ADD COLUMN IF NOT EXISTS integration_account_id uuid REFERENCES integration_accounts(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_seller_idempotency_uidx ON orders(seller_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS integration_location_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  integration_account_id uuid NOT NULL REFERENCES integration_accounts(id) ON DELETE CASCADE,
  external_location_id text NOT NULL, external_location_name text,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(integration_account_id, external_location_id)
);

CREATE TABLE IF NOT EXISTS integration_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  integration_account_id uuid REFERENCES integration_accounts(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK(direction IN ('INBOUND','OUTBOUND')),
  event_type text NOT NULL, external_id text, status text NOT NULL CHECK(status IN ('SUCCESS','WARNING','FAILED','PENDING')),
  message text, payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS integration_sync_events_seller_created_idx ON integration_sync_events(seller_id, created_at DESC);

CREATE TABLE IF NOT EXISTS integration_import_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  integration_account_id uuid REFERENCES integration_accounts(id) ON DELETE CASCADE,
  external_order_id text, error_code text NOT NULL, error_message text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb, status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','RESOLVED','IGNORED')),
  created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS sku_shipping_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  sku text NOT NULL, weight_kg numeric(10,3) NOT NULL CHECK(weight_kg > 0), length_cm numeric(10,2), width_cm numeric(10,2), height_cm numeric(10,2),
  is_fragile boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(seller_id, sku)
);

CREATE TABLE IF NOT EXISTS shipping_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL, priority int NOT NULL DEFAULT 100, conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '{}'::jsonb, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outbound_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  webhook_endpoint_id uuid NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_id uuid NOT NULL DEFAULT gen_random_uuid(), event_type text NOT NULL, payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','DELIVERED','FAILED','DEAD')),
  attempt_count int NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_http_status int, last_error text, delivered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(webhook_endpoint_id, event_id)
);
CREATE INDEX IF NOT EXISTS outbound_webhooks_due_idx ON outbound_webhook_deliveries(status, next_attempt_at);

CREATE OR REPLACE FUNCTION enqueue_seller_webhook(p_seller_id uuid, p_event_type text, p_payload jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  INSERT INTO outbound_webhook_deliveries(seller_id, webhook_endpoint_id, event_type, payload)
  SELECT p_seller_id, id, p_event_type, p_payload FROM webhook_endpoints
  WHERE seller_id=p_seller_id AND is_active=true AND p_event_type=ANY(subscribed_events);
$$;

CREATE OR REPLACE FUNCTION enqueue_order_created_webhook() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM enqueue_seller_webhook(NEW.seller_id, 'order.created', jsonb_build_object(
    'order_id',NEW.id,'external_order_id',NEW.external_order_id,'status',NEW.current_status,'source',NEW.source,'total_amount',NEW.total_amount));
  RETURN NEW;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON integration_location_mappings, integration_import_errors, sku_shipping_profiles, shipping_automation_rules TO authenticated;
GRANT SELECT ON integration_sync_events, outbound_webhook_deliveries TO authenticated;
GRANT ALL ON integration_location_mappings, integration_sync_events, integration_import_errors, sku_shipping_profiles, shipping_automation_rules, outbound_webhook_deliveries TO service_role;
GRANT EXECUTE ON FUNCTION enqueue_seller_webhook(uuid,text,jsonb) TO service_role;
DROP TRIGGER IF EXISTS orders_enqueue_webhook ON orders;
CREATE TRIGGER orders_enqueue_webhook AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION enqueue_order_created_webhook();

CREATE OR REPLACE FUNCTION enqueue_shipment_status_webhook() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o orders%ROWTYPE; event_name text; courier_label text;
BEGIN
  IF TG_OP='UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  SELECT * INTO o FROM orders WHERE id=NEW.order_id;
  SELECT name INTO courier_label FROM couriers WHERE id=NEW.courier_id;
  event_name := CASE
    WHEN NEW.status::text IN ('RTO_INITIATED','RTO_IN_TRANSIT','RTO_DELIVERED') THEN 'shipment.rto'
    ELSE 'shipment.' || lower(NEW.status::text)
  END;
  PERFORM enqueue_seller_webhook(NEW.seller_id, event_name, jsonb_build_object(
    'shipment_id',NEW.id,'order_id',NEW.order_id,'external_order_id',o.external_order_id,
    'awb_number',NEW.awb_number,'courier_name',courier_label,'status',NEW.status));
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS shipments_enqueue_webhook ON shipments;
CREATE TRIGGER shipments_enqueue_webhook AFTER INSERT OR UPDATE OF status ON shipments FOR EACH ROW EXECUTE FUNCTION enqueue_shipment_status_webhook();

ALTER TABLE integration_location_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_shipping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_webhook_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['integration_location_mappings','integration_sync_events','integration_import_errors','sku_shipping_profiles','shipping_automation_rules','outbound_webhook_deliveries'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS seller_scope ON %I', t);
    EXECUTE format('CREATE POLICY seller_scope ON %I FOR ALL TO authenticated USING (seller_id=(auth.jwt()->''app_metadata''->>''seller_id'')::uuid) WITH CHECK (seller_id=(auth.jwt()->''app_metadata''->>''seller_id'')::uuid)', t);
  END LOOP;
END $$;
