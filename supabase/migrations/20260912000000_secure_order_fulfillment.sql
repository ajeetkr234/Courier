-- Secure, transactional order fulfilment foundation.
-- JWT contract (when auth is enabled): app_metadata.seller_id and app_metadata.role.

CREATE OR REPLACE FUNCTION public.jwt_seller_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.jwt() -> 'app_metadata' ->> 'seller_id', '')::uuid
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN
    ('PLATFORM_ADMIN','PLATFORM_OPERATIONS','PLATFORM_FINANCE','PLATFORM_SUPPORT')
$$;

CREATE TABLE IF NOT EXISTS public.order_transition_rules (
  from_status order_status NOT NULL,
  to_status order_status NOT NULL,
  PRIMARY KEY (from_status, to_status)
);

INSERT INTO public.order_transition_rules VALUES
 ('NEW','CONFIRMED'), ('NEW','CANCELLED'),
 ('CONFIRMED','READY_TO_SHIP'), ('CONFIRMED','CANCELLED'),
 ('READY_TO_SHIP','SHIPPED'), ('READY_TO_SHIP','CANCELLED'),
 ('SHIPPED','IN_TRANSIT'), ('SHIPPED','NDR'), ('SHIPPED','RTO'), ('SHIPPED','CANCELLED'),
 ('IN_TRANSIT','OUT_FOR_DELIVERY'), ('IN_TRANSIT','NDR'), ('IN_TRANSIT','RTO'), ('IN_TRANSIT','DELIVERED'),
 ('OUT_FOR_DELIVERY','DELIVERED'), ('OUT_FOR_DELIVERY','NDR'), ('OUT_FOR_DELIVERY','RTO'),
 ('NDR','OUT_FOR_DELIVERY'), ('NDR','RTO'), ('NDR','DELIVERED'),
 ('RTO','RETURNED')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.courier_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('sandbox','production')),
  secret_name text NOT NULL,
  base_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(courier_id, environment)
);

CREATE TABLE IF NOT EXISTS public.provider_operation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid REFERENCES sellers(id),
  provider text NOT NULL, operation text NOT NULL, idempotency_key text NOT NULL UNIQUE,
  request_reference jsonb NOT NULL DEFAULT '{}', response_reference jsonb,
  status text NOT NULL CHECK(status IN ('PENDING','SUCCEEDED','FAILED','RETRYING')),
  attempt_count int NOT NULL DEFAULT 0, next_retry_at timestamptz, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inbound_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider text NOT NULL,
  provider_event_id text NOT NULL, payload_hash text NOT NULL, event_type text,
  payload jsonb NOT NULL, status text NOT NULL DEFAULT 'RECEIVED', error_message text,
  received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz,
  UNIQUE(provider, provider_event_id), UNIQUE(provider, payload_hash)
);

CREATE TABLE IF NOT EXISTS public.delivery_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), shipment_id uuid NOT NULL UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
  otp_verified boolean NOT NULL DEFAULT false, recipient_name text, delivered_at timestamptz,
  latitude numeric(10,7), longitude numeric(10,7), pod_object_path text,
  carrier_reference text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seller_verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK(document_type IN ('PAN','GST','ADDRESS','IDENTITY','BANK_PROOF','ACCEPTANCE')),
  object_path text NOT NULL, verification_status text NOT NULL DEFAULT 'PENDING'
    CHECK(verification_status IN ('PENDING','VERIFIED','REJECTED')),
  provider_reference text, rejection_reason text, verified_by uuid, verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(seller_id, document_type)
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_seller_idempotency ON orders(seller_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS carrier_shipment_id text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS pod_verified boolean NOT NULL DEFAULT false;
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS reversal_of uuid REFERENCES ledger_entries(id);

CREATE OR REPLACE FUNCTION public.guard_order_transition() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.current_status = OLD.current_status THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM order_transition_rules WHERE from_status=OLD.current_status AND to_status=NEW.current_status) THEN
    RAISE EXCEPTION 'Invalid order transition: % -> %', OLD.current_status, NEW.current_status USING ERRCODE='check_violation';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_order_transition ON orders;
CREATE TRIGGER trg_guard_order_transition BEFORE UPDATE OF current_status ON orders
FOR EACH ROW EXECUTE FUNCTION public.guard_order_transition();

CREATE OR REPLACE FUNCTION public.apply_shipment_status(
  p_shipment_id uuid, p_status shipment_status, p_raw_status text DEFAULT NULL,
  p_message text DEFAULT NULL, p_location text DEFAULT NULL, p_event_time timestamptz DEFAULT now(),
  p_recipient_name text DEFAULT NULL, p_pod_object_path text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_order uuid; v_seller uuid; v_order_status order_status;
BEGIN
  SELECT order_id,seller_id INTO v_order,v_seller FROM shipments WHERE id=p_shipment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Shipment not found'; END IF;
  IF auth.role() <> 'service_role' AND NOT (is_platform_admin() OR v_seller=jwt_seller_id()) THEN
    RAISE EXCEPTION 'Shipment is not accessible' USING ERRCODE='insufficient_privilege';
  END IF;
  v_order_status := CASE p_status
    WHEN 'CREATED' THEN 'READY_TO_SHIP' WHEN 'PICKUP_SCHEDULED' THEN 'READY_TO_SHIP'
    WHEN 'PICKED_UP' THEN 'SHIPPED' WHEN 'IN_TRANSIT' THEN 'IN_TRANSIT'
    WHEN 'OUT_FOR_DELIVERY' THEN 'OUT_FOR_DELIVERY' WHEN 'DELIVERED' THEN 'DELIVERED'
    WHEN 'NDR' THEN 'NDR' WHEN 'RTO_INITIATED' THEN 'RTO' WHEN 'RTO_IN_TRANSIT' THEN 'RTO'
    WHEN 'RTO_DELIVERED' THEN 'RETURNED' WHEN 'LOST' THEN 'RTO' WHEN 'CANCELLED' THEN 'CANCELLED' END;
  UPDATE shipments SET status=p_status, updated_at=p_event_time,
    pod_verified=CASE WHEN p_status='DELIVERED' THEN (p_recipient_name IS NOT NULL OR p_pod_object_path IS NOT NULL) ELSE pod_verified END
    WHERE id=p_shipment_id;
  INSERT INTO tracking_events(shipment_id,raw_status,normalized_status,event_time,location,message)
    VALUES(p_shipment_id,COALESCE(p_raw_status,p_status::text),p_status,p_event_time,p_location,p_message);
  IF (SELECT current_status FROM orders WHERE id=v_order) <> v_order_status THEN
    UPDATE orders SET current_status=v_order_status WHERE id=v_order;
    INSERT INTO order_status_events(order_id,status,description,actor_id)
      VALUES(v_order,v_order_status,COALESCE(p_message,'Carrier status: '||p_status::text),auth.uid());
  END IF;
  IF p_status='NDR' THEN
    INSERT INTO ndr_cases(seller_id,shipment_id,reason,attempt_count,last_attempt_at,status)
      VALUES(v_seller,p_shipment_id,COALESCE(p_message,'Carrier delivery exception'),1,p_event_time,'NDR_PENDING')
      ON CONFLICT(shipment_id) DO UPDATE SET attempt_count=ndr_cases.attempt_count+1,last_attempt_at=EXCLUDED.last_attempt_at,reason=EXCLUDED.reason;
  END IF;
  IF p_status='DELIVERED' THEN
    INSERT INTO delivery_proofs(shipment_id,recipient_name,delivered_at,pod_object_path)
      VALUES(p_shipment_id,p_recipient_name,p_event_time,p_pod_object_path)
      ON CONFLICT(shipment_id) DO UPDATE SET recipient_name=EXCLUDED.recipient_name,delivered_at=EXCLUDED.delivered_at,pod_object_path=EXCLUDED.pod_object_path;
    UPDATE cod_remittances SET status='PENDING' WHERE seller_id=v_seller AND status='AWAITING_DELIVERY';
  END IF;
  INSERT INTO audit_logs(seller_id,user_id,action,entity_type,entity_id,payload)
    VALUES(v_seller,COALESCE(auth.uid(),'00000000-0000-0000-0000-000000000000'),'SHIPMENT_STATUS_CHANGED','SHIPMENT',p_shipment_id::text,jsonb_build_object('status',p_status));
END $$;

-- Tenant RLS. Service-role Edge Functions bypass these policies.
CREATE OR REPLACE FUNCTION public.finalize_shipment_booking(
  p_seller_id uuid, p_order_id uuid, p_courier_id uuid, p_awb_number text,
  p_carrier_shipment_id text, p_label_url text, p_shipping_cost numeric,
  p_cod_charge numeric, p_idempotency_key text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_balance numeric; v_status order_status; v_shipment shipments; v_total numeric := p_shipping_cost+p_cod_charge;
BEGIN
  IF EXISTS(SELECT 1 FROM shipments WHERE order_id=p_order_id) THEN RAISE EXCEPTION 'Order already has a shipment'; END IF;
  SELECT current_status INTO v_status FROM orders WHERE id=p_order_id AND seller_id=p_seller_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not owned by seller'; END IF;
  IF v_status NOT IN ('NEW','CONFIRMED') THEN RAISE EXCEPTION 'Order cannot be shipped from %',v_status; END IF;
  IF NOT EXISTS(SELECT 1 FROM sellers WHERE id=p_seller_id AND status='ACTIVE') THEN RAISE EXCEPTION 'Seller is not active'; END IF;
  IF NOT EXISTS(SELECT 1 FROM couriers WHERE id=p_courier_id AND is_active) THEN RAISE EXCEPTION 'Courier is not active'; END IF;
  SELECT balance INTO v_balance FROM wallets WHERE seller_id=p_seller_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance<v_total THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;
  INSERT INTO shipments(seller_id,order_id,courier_id,awb_number,label_url,status,pickup_date,carrier_shipment_id)
    VALUES(p_seller_id,p_order_id,p_courier_id,p_awb_number,p_label_url,'CREATED',CURRENT_DATE,p_carrier_shipment_id) RETURNING * INTO v_shipment;
  UPDATE wallets SET balance=balance-v_total,updated_at=now() WHERE seller_id=p_seller_id;
  INSERT INTO ledger_entries(seller_id,type,amount,direction,reference_type,reference_id,idempotency_key,created_by)
    VALUES(p_seller_id,'SHIPMENT_DEBIT',v_total,'DEBIT','AWB',p_awb_number,p_idempotency_key,auth.uid());
  IF v_status='NEW' THEN
    UPDATE orders SET current_status='CONFIRMED' WHERE id=p_order_id;
    INSERT INTO order_status_events(order_id,status,description,actor_id) VALUES(p_order_id,'CONFIRMED','Confirmed during shipment booking',auth.uid());
  END IF;
  UPDATE orders SET current_status='READY_TO_SHIP' WHERE id=p_order_id;
  INSERT INTO order_status_events(order_id,status,description,actor_id) VALUES(p_order_id,'READY_TO_SHIP','Courier booking completed',auth.uid());
  INSERT INTO tracking_events(shipment_id,raw_status,normalized_status,event_time,location,message)
    VALUES(v_shipment.id,'MANIFESTED','CREATED',now(),'Origin fulfilment centre','Shipment booked with courier');
  INSERT INTO audit_logs(seller_id,user_id,action,entity_type,entity_id,payload)
    VALUES(p_seller_id,COALESCE(auth.uid(),'00000000-0000-0000-0000-000000000000'),'CREATE_SHIPMENT','SHIPMENT',v_shipment.id::text,jsonb_build_object('awb',p_awb_number,'charge',v_total));
  RETURN jsonb_build_object('id',v_shipment.id,'seller_id',v_shipment.seller_id,'order_id',v_shipment.order_id,'courier_id',v_shipment.courier_id,'awb_number',v_shipment.awb_number,'label_url',v_shipment.label_url,'status',v_shipment.status,'pickup_date',v_shipment.pickup_date,'shipping_cost',p_shipping_cost,'cod_charge',p_cod_charge,'total_freight_charge',v_total,'created_at',v_shipment.created_at,'updated_at',v_shipment.updated_at);
END $$;

CREATE OR REPLACE FUNCTION public.transition_order_status(p_order_id uuid,p_status order_status,p_description text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_seller uuid;
BEGIN
  SELECT seller_id INTO v_seller FROM orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found or not accessible'; END IF;
  UPDATE orders SET current_status=p_status WHERE id=p_order_id;
  INSERT INTO order_status_events(order_id,status,description,actor_id) VALUES(p_order_id,p_status,p_description,auth.uid());
  INSERT INTO audit_logs(seller_id,user_id,action,entity_type,entity_id,payload)
    VALUES(v_seller,auth.uid(),'ORDER_STATUS_CHANGED','ORDER',p_order_id::text,jsonb_build_object('status',p_status));
END $$;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['sellers','seller_kyc','seller_bank_accounts','warehouses','customers','orders','order_items','order_status_events','rate_quotes','shipments','tracking_events','pickup_requests','ndr_cases','ndr_actions','returns','wallets','ledger_entries','cod_remittances','weight_discrepancies','api_keys','webhook_endpoints','background_jobs','audit_logs','seller_team_members','integration_accounts','branded_tracking_configs','ndr_escalations','cod_payout_batches','reconciliation_records','seller_verification_documents','provider_operation_logs','delivery_proofs'] LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t); END IF;
  END LOOP;
END $$;

-- Direct seller-owned tables.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['seller_kyc','seller_bank_accounts','warehouses','customers','orders','rate_quotes','shipments','pickup_requests','ndr_cases','returns','wallets','ledger_entries','cod_remittances','weight_discrepancies','api_keys','webhook_endpoints','background_jobs','audit_logs','seller_team_members','integration_accounts','branded_tracking_configs','ndr_escalations','cod_payout_batches','reconciliation_records','seller_verification_documents','provider_operation_logs'] LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS tenant_access ON public.%I',t);
      EXECUTE format('CREATE POLICY tenant_access ON public.%I FOR SELECT TO authenticated USING (public.is_platform_admin() OR seller_id=public.jwt_seller_id())',t);
      EXECUTE format('DROP POLICY IF EXISTS platform_admin_write ON public.%I',t);
      EXECUTE format('CREATE POLICY platform_admin_write ON public.%I FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())',t);
    END IF;
  END LOOP;
END $$;

-- Seller-owned records that sellers may create or maintain themselves. Financial,
-- audit, provider, payout and reconciliation tables intentionally remain read-only.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['warehouses','customers','orders','rate_quotes','pickup_requests','ndr_cases','returns','weight_discrepancies','api_keys','webhook_endpoints','background_jobs','seller_team_members','integration_accounts','branded_tracking_configs','seller_verification_documents','seller_bank_accounts'] LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS seller_write ON public.%I',t);
      EXECUTE format('CREATE POLICY seller_write ON public.%I FOR ALL TO authenticated USING (seller_id=public.jwt_seller_id()) WITH CHECK (seller_id=public.jwt_seller_id())',t);
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS tenant_access ON sellers;
CREATE POLICY tenant_access ON sellers FOR SELECT TO authenticated USING (is_platform_admin() OR id=jwt_seller_id());
DROP POLICY IF EXISTS platform_admin_write ON sellers;
CREATE POLICY platform_admin_write ON sellers FOR ALL TO authenticated USING(is_platform_admin()) WITH CHECK(is_platform_admin());
DROP POLICY IF EXISTS order_item_tenant_access ON order_items;
CREATE POLICY order_item_tenant_access ON order_items FOR ALL TO authenticated
 USING (EXISTS(SELECT 1 FROM orders o WHERE o.id=order_id AND (o.seller_id=jwt_seller_id() OR is_platform_admin())))
 WITH CHECK (EXISTS(SELECT 1 FROM orders o WHERE o.id=order_id AND (o.seller_id=jwt_seller_id() OR is_platform_admin())));
DROP POLICY IF EXISTS order_event_tenant_access ON order_status_events;
CREATE POLICY order_event_tenant_access ON order_status_events FOR ALL TO authenticated
 USING (EXISTS(SELECT 1 FROM orders o WHERE o.id=order_id AND (o.seller_id=jwt_seller_id() OR is_platform_admin())))
 WITH CHECK (EXISTS(SELECT 1 FROM orders o WHERE o.id=order_id AND (o.seller_id=jwt_seller_id() OR is_platform_admin())));
DROP POLICY IF EXISTS tracking_event_tenant_access ON tracking_events;
CREATE POLICY tracking_event_tenant_access ON tracking_events FOR SELECT TO authenticated
 USING (EXISTS(SELECT 1 FROM shipments s WHERE s.id=shipment_id AND (s.seller_id=jwt_seller_id() OR is_platform_admin())));
DROP POLICY IF EXISTS delivery_proof_tenant_access ON delivery_proofs;
CREATE POLICY delivery_proof_tenant_access ON delivery_proofs FOR SELECT TO authenticated
 USING (EXISTS(SELECT 1 FROM shipments s WHERE s.id=shipment_id AND (s.seller_id=jwt_seller_id() OR is_platform_admin())));

DROP POLICY IF EXISTS ndr_action_tenant_access ON ndr_actions;
CREATE POLICY ndr_action_tenant_access ON ndr_actions FOR ALL TO authenticated
 USING (EXISTS(SELECT 1 FROM ndr_cases n WHERE n.id=ndr_case_id AND (n.seller_id=jwt_seller_id() OR is_platform_admin())))
 WITH CHECK (EXISTS(SELECT 1 FROM ndr_cases n WHERE n.id=ndr_case_id AND (n.seller_id=jwt_seller_id() OR is_platform_admin())));

CREATE OR REPLACE FUNCTION public.protect_verification_decisions() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NOT is_platform_admin() THEN
    IF TG_TABLE_NAME='seller_verification_documents' AND
      ((TG_OP='INSERT' AND (NEW.verification_status<>'PENDING' OR NEW.verified_by IS NOT NULL OR NEW.verified_at IS NOT NULL OR NEW.rejection_reason IS NOT NULL)) OR
       (TG_OP='UPDATE' AND (NEW.verification_status IS DISTINCT FROM OLD.verification_status OR NEW.verified_by IS DISTINCT FROM OLD.verified_by OR NEW.verified_at IS DISTINCT FROM OLD.verified_at OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason)))
    THEN RAISE EXCEPTION 'Only platform administrators can decide verification'; END IF;
    IF TG_TABLE_NAME='seller_bank_accounts' AND ((TG_OP='INSERT' AND NEW.is_verified) OR (TG_OP='UPDATE' AND NEW.is_verified IS DISTINCT FROM OLD.is_verified))
    THEN RAISE EXCEPTION 'Only platform administrators can verify bank accounts'; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_protect_document_verification ON seller_verification_documents;
CREATE TRIGGER trg_protect_document_verification BEFORE INSERT OR UPDATE ON seller_verification_documents FOR EACH ROW EXECUTE FUNCTION protect_verification_decisions();
DROP TRIGGER IF EXISTS trg_protect_bank_verification ON seller_bank_accounts;
CREATE TRIGGER trg_protect_bank_verification BEFORE INSERT OR UPDATE ON seller_bank_accounts FOR EACH ROW EXECUTE FUNCTION protect_verification_decisions();

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON FUNCTION apply_shipment_status(uuid,shipment_status,text,text,text,timestamptz,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION finalize_shipment_booking(uuid,uuid,uuid,text,text,text,numeric,numeric,text) FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE ALL ON courier_credentials,inbound_webhook_events,provider_operation_logs FROM authenticated,anon;
GRANT EXECUTE ON FUNCTION apply_shipment_status(uuid,shipment_status,text,text,text,timestamptz,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION apply_shipment_status(uuid,shipment_status,text,text,text,timestamptz,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION finalize_shipment_booking(uuid,uuid,uuid,text,text,text,numeric,numeric,text) TO service_role;
GRANT EXECUTE ON FUNCTION transition_order_status(uuid,order_status,text) TO authenticated;

INSERT INTO storage.buckets(id,name,public) VALUES('seller-verification','seller-verification',false),('proof-of-delivery','proof-of-delivery',false)
ON CONFLICT(id) DO UPDATE SET public=false;

DROP POLICY IF EXISTS seller_private_documents ON storage.objects;
CREATE POLICY seller_private_documents ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id IN ('seller-verification','proof-of-delivery')
  AND (is_platform_admin() OR (storage.foldername(name))[1]=jwt_seller_id()::text)
)
WITH CHECK (
  bucket_id IN ('seller-verification','proof-of-delivery')
  AND (is_platform_admin() OR (storage.foldername(name))[1]=jwt_seller_id()::text)
);

CREATE OR REPLACE VIEW public.fulfilment_health WITH (security_invoker=true) AS
SELECT
  (SELECT count(*) FROM shipments WHERE status NOT IN ('DELIVERED','RTO_DELIVERED','CANCELLED') AND updated_at<now()-interval '48 hours') AS stale_shipments,
  (SELECT count(*) FROM provider_operation_logs WHERE status IN ('FAILED','RETRYING')) AS failed_provider_operations,
  (SELECT count(*) FROM inbound_webhook_events WHERE status='FAILED') AS failed_webhooks,
  (SELECT count(*) FROM reconciliation_records WHERE status='FLAGGED') AS reconciliation_flags,
  (SELECT count(*) FROM shipments GROUP BY awb_number HAVING count(*)>1 LIMIT 1) AS duplicate_awb_groups;
GRANT SELECT ON public.fulfilment_health TO authenticated;
