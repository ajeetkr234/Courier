-- End-to-end operational workflows: dispatch, communications, returns, claims and support.

CREATE TABLE IF NOT EXISTS public.manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  courier_id uuid NOT NULL REFERENCES couriers(id), warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  manifest_number text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','CLOSED','HANDED_OVER','CANCELLED')),
  closed_at timestamptz, handed_over_at timestamptz, handover_name text, handover_proof_path text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.manifest_shipments (
  manifest_id uuid NOT NULL REFERENCES manifests(id) ON DELETE CASCADE,
  shipment_id uuid NOT NULL UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(manifest_id,shipment_id)
);
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS expected_package_count int NOT NULL DEFAULT 0;
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS failure_reason text;
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS handed_over_at timestamptz;
CREATE TABLE IF NOT EXISTS public.pickup_shipments (
  pickup_id uuid NOT NULL REFERENCES pickup_requests(id) ON DELETE CASCADE,
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  PRIMARY KEY(pickup_id,shipment_id)
);

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  event_type text NOT NULL, channel text NOT NULL CHECK(channel IN ('EMAIL','SMS','WHATSAPP')),
  subject text, body text NOT NULL, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seller_id,event_type,channel)
);
CREATE TABLE IF NOT EXISTS public.notification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE, ndr_case_id uuid REFERENCES ndr_cases(id) ON DELETE SET NULL,
  event_type text NOT NULL, channel text NOT NULL CHECK(channel IN ('EMAIL','SMS','WHATSAPP','IVR')),
  destination_masked text NOT NULL, provider text, provider_message_id text,
  status text NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED','SENDING','DELIVERED','FAILED','SKIPPED')),
  attempt_count int NOT NULL DEFAULT 0, error_message text, next_retry_at timestamptz,
  idempotency_key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.return_policies (
  seller_id uuid PRIMARY KEY REFERENCES sellers(id) ON DELETE CASCADE,
  return_window_days int NOT NULL DEFAULT 7 CHECK(return_window_days BETWEEN 0 AND 90),
  auto_approve boolean NOT NULL DEFAULT false, allow_exchange boolean NOT NULL DEFAULT true,
  require_images boolean NOT NULL DEFAULT true, non_returnable_skus text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE returns ADD COLUMN IF NOT EXISTS request_token_hash text;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS resolution_type text CHECK(resolution_type IN ('REFUND','EXCHANGE'));
ALTER TABLE returns ADD COLUMN IF NOT EXISTS requested_amount numeric(12,2);
ALTER TABLE returns ADD COLUMN IF NOT EXISTS approved_amount numeric(12,2);
ALTER TABLE returns ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS qc_status text CHECK(qc_status IN ('PENDING','PASSED','FAILED','PARTIAL'));
ALTER TABLE returns ADD COLUMN IF NOT EXISTS evidence_paths text[] NOT NULL DEFAULT '{}';
ALTER TABLE returns ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE TABLE IF NOT EXISTS public.return_qc_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), return_id uuid NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  check_name text NOT NULL, result text NOT NULL CHECK(result IN ('PASS','FAIL','NOT_APPLICABLE')),
  notes text, evidence_paths text[] NOT NULL DEFAULT '{}', checked_by uuid, checked_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  return_id uuid NOT NULL UNIQUE REFERENCES returns(id) ON DELETE CASCADE, amount numeric(12,2) NOT NULL CHECK(amount>0),
  method text NOT NULL CHECK(method IN ('ORIGINAL_PAYMENT','BANK_TRANSFER','STORE_CREDIT','WALLET')),
  provider text, provider_reference text, status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PROCESSING','SETTLED','FAILED','CANCELLED')),
  idempotency_key text NOT NULL UNIQUE, failure_reason text, created_at timestamptz NOT NULL DEFAULT now(), settled_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.shipment_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  claim_type text NOT NULL CHECK(claim_type IN ('LOST','DAMAGED','TAMPERED','SHORT','POD_DISPUTE')),
  claimed_amount numeric(12,2) NOT NULL CHECK(claimed_amount>0), approved_amount numeric(12,2),
  description text NOT NULL, evidence_paths text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK(status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','MORE_INFO_REQUIRED','APPROVED','REJECTED','PAID')),
  resolution_notes text, submitted_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz,
  UNIQUE(shipment_id,claim_type)
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  ticket_number text NOT NULL UNIQUE, category text NOT NULL, subject text NOT NULL, description text NOT NULL,
  entity_type text, entity_id text, priority text NOT NULL DEFAULT 'NORMAL' CHECK(priority IN ('LOW','NORMAL','HIGH','URGENT')),
  status text NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','IN_PROGRESS','WAITING_ON_SELLER','RESOLVED','CLOSED')),
  assigned_to uuid, sla_due_at timestamptz NOT NULL, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id uuid, author_type text NOT NULL CHECK(author_type IN ('SELLER','PLATFORM','SYSTEM')),
  message text NOT NULL, attachment_paths text[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manifest_seller_status ON manifests(seller_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_retry ON notification_attempts(status,next_retry_at);
CREATE INDEX IF NOT EXISTS idx_returns_seller_updated ON returns(seller_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_seller_status ON shipment_claims(seller_id,status,submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_seller_status ON support_tickets(seller_id,status,updated_at DESC);

-- Atomic seller actions. Provider calls are performed by Edge Functions, which then update these records.
CREATE OR REPLACE FUNCTION public.create_manifest(p_courier_id uuid,p_warehouse_id uuid,p_shipment_ids uuid[])
RETURNS manifests LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_seller uuid:=jwt_seller_id(); v_manifest manifests; v_count int;
BEGIN
  IF v_seller IS NULL THEN RAISE EXCEPTION 'Seller identity missing'; END IF;
  IF cardinality(p_shipment_ids)=0 THEN RAISE EXCEPTION 'Select at least one shipment'; END IF;
  SELECT count(*) INTO v_count FROM shipments WHERE id=ANY(p_shipment_ids) AND seller_id=v_seller
    AND courier_id=p_courier_id AND status='CREATED';
  IF v_count<>cardinality(p_shipment_ids) THEN RAISE EXCEPTION 'Shipments must be owned, unmanifested CREATED shipments for one courier'; END IF;
  INSERT INTO manifests(seller_id,courier_id,warehouse_id,manifest_number)
    VALUES(v_seller,p_courier_id,p_warehouse_id,'MF-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))) RETURNING * INTO v_manifest;
  INSERT INTO manifest_shipments(manifest_id,shipment_id) SELECT v_manifest.id,unnest(p_shipment_ids);
  INSERT INTO audit_logs(seller_id,user_id,action,entity_type,entity_id,payload)
    VALUES(v_seller,auth.uid(),'CREATE_MANIFEST','MANIFEST',v_manifest.id::text,jsonb_build_object('shipment_count',v_count));
  RETURN v_manifest;
END $$;

CREATE OR REPLACE FUNCTION public.create_support_ticket(p_category text,p_subject text,p_description text,p_priority text DEFAULT 'NORMAL',p_entity_type text DEFAULT NULL,p_entity_id text DEFAULT NULL)
RETURNS support_tickets LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_ticket support_tickets; v_hours int:=CASE p_priority WHEN 'URGENT' THEN 4 WHEN 'HIGH' THEN 12 ELSE 24 END;
BEGIN
  INSERT INTO support_tickets(seller_id,ticket_number,category,subject,description,priority,entity_type,entity_id,sla_due_at,created_by)
  VALUES(jwt_seller_id(),'SF-'||to_char(now(),'YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),p_category,p_subject,p_description,p_priority,p_entity_type,p_entity_id,now()+make_interval(hours=>v_hours),auth.uid()) RETURNING * INTO v_ticket;
  INSERT INTO support_ticket_messages(ticket_id,author_id,author_type,message) VALUES(v_ticket.id,auth.uid(),'SELLER',p_description);
  RETURN v_ticket;
END $$;

CREATE OR REPLACE FUNCTION public.request_refund(p_return_id uuid,p_amount numeric,p_method text,p_idempotency_key text)
RETURNS refunds LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_refund refunds; v_return returns;
BEGIN
  SELECT * INTO v_return FROM returns WHERE id=p_return_id AND seller_id=jwt_seller_id() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Return not found'; END IF;
  IF v_return.qc_status NOT IN ('PASSED','PARTIAL') THEN RAISE EXCEPTION 'Return QC must pass before refund'; END IF;
  IF p_amount>COALESCE(v_return.approved_amount,v_return.requested_amount) THEN RAISE EXCEPTION 'Refund exceeds approved amount'; END IF;
  INSERT INTO refunds(seller_id,return_id,amount,method,idempotency_key)
    VALUES(v_return.seller_id,v_return.id,p_amount,p_method,p_idempotency_key)
    ON CONFLICT(idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING * INTO v_refund;
  RETURN v_refund;
END $$;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['manifests','notification_templates','notification_attempts','return_policies','refunds','shipment_claims','support_tickets'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('CREATE POLICY tenant_access ON public.%I FOR SELECT TO authenticated USING (is_platform_admin() OR seller_id=jwt_seller_id())',t);
  END LOOP;
END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['manifests','notification_templates','return_policies','shipment_claims','support_tickets'] LOOP
    EXECUTE format('CREATE POLICY seller_write ON public.%I FOR ALL TO authenticated USING (seller_id=jwt_seller_id() OR is_platform_admin()) WITH CHECK (seller_id=jwt_seller_id() OR is_platform_admin())',t);
  END LOOP;
END $$;
ALTER TABLE manifest_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY manifest_shipments_access ON manifest_shipments FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM manifests m WHERE m.id=manifest_id AND (m.seller_id=jwt_seller_id() OR is_platform_admin()))) WITH CHECK(EXISTS(SELECT 1 FROM manifests m WHERE m.id=manifest_id AND (m.seller_id=jwt_seller_id() OR is_platform_admin())));
ALTER TABLE pickup_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY pickup_shipments_access ON pickup_shipments FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM pickup_requests p WHERE p.id=pickup_id AND (p.seller_id=jwt_seller_id() OR is_platform_admin()))) WITH CHECK(EXISTS(SELECT 1 FROM pickup_requests p WHERE p.id=pickup_id AND (p.seller_id=jwt_seller_id() OR is_platform_admin())));
ALTER TABLE return_qc_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY return_qc_access ON return_qc_checks FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM returns r WHERE r.id=return_id AND (r.seller_id=jwt_seller_id() OR is_platform_admin()))) WITH CHECK(EXISTS(SELECT 1 FROM returns r WHERE r.id=return_id AND (r.seller_id=jwt_seller_id() OR is_platform_admin())));
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY ticket_messages_access ON support_ticket_messages FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM support_tickets t WHERE t.id=ticket_id AND (t.seller_id=jwt_seller_id() OR is_platform_admin()))) WITH CHECK(EXISTS(SELECT 1 FROM support_tickets t WHERE t.id=ticket_id AND (t.seller_id=jwt_seller_id() OR is_platform_admin())));

-- Only trusted backend/admin roles may mutate provider delivery logs, refunds or notification delivery state.
CREATE POLICY platform_notification_write ON notification_attempts FOR ALL TO authenticated USING(is_platform_admin()) WITH CHECK(is_platform_admin());
CREATE POLICY platform_refund_write ON refunds FOR ALL TO authenticated USING(is_platform_admin()) WITH CHECK(is_platform_admin());
REVOKE EXECUTE ON FUNCTION apply_shipment_status(uuid,shipment_status,text,text,text,timestamptz,text,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION create_manifest(uuid,uuid,uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION create_support_ticket(text,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION request_refund(uuid,numeric,text,text) TO authenticated;

INSERT INTO storage.buckets(id,name,public) VALUES('return-evidence','return-evidence',false),('claim-evidence','claim-evidence',false),('support-attachments','support-attachments',false),('handover-proofs','handover-proofs',false)
ON CONFLICT(id) DO UPDATE SET public=false;
CREATE POLICY logistics_private_objects ON storage.objects FOR ALL TO authenticated
USING(bucket_id IN ('return-evidence','claim-evidence','support-attachments','handover-proofs') AND (is_platform_admin() OR (storage.foldername(name))[1]=jwt_seller_id()::text))
WITH CHECK(bucket_id IN ('return-evidence','claim-evidence','support-attachments','handover-proofs') AND (is_platform_admin() OR (storage.foldername(name))[1]=jwt_seller_id()::text));

-- Auth bootstrap. New accounts start in DRAFT and cannot book until KYC activation.
ALTER TABLE seller_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_membership_read ON seller_users FOR SELECT TO authenticated USING(user_id=auth.uid() OR is_platform_admin());

CREATE OR REPLACE FUNCTION public.handle_new_seller_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE v_seller uuid; v_company text:=COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name',''),'New Seller');
BEGIN
  INSERT INTO public.sellers(company_name,brand_name,pan,status)
    VALUES(v_company,v_company,'PENDING-'||upper(substr(replace(NEW.id::text,'-',''),1,10)),'DRAFT') RETURNING id INTO v_seller;
  INSERT INTO public.seller_users(seller_id,user_id,role) VALUES(v_seller,NEW.id,'OWNER');
  INSERT INTO public.wallets(seller_id,balance) VALUES(v_seller,0);
  INSERT INTO public.return_policies(seller_id) VALUES(v_seller);
  UPDATE auth.users SET raw_app_meta_data=COALESCE(raw_app_meta_data,'{}'::jsonb)||jsonb_build_object('seller_id',v_seller,'role','OWNER') WHERE id=NEW.id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created_shipfaster ON auth.users;
CREATE TRIGGER on_auth_user_created_shipfaster AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_seller_user();
