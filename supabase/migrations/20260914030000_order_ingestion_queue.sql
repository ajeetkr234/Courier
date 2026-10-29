-- High-throughput storefront ingestion.
-- API requests only validate tenant mappings and append to this durable queue;
-- workers materialize full orders without holding the request connection open.
CREATE TABLE IF NOT EXISTS order_ingestion_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  api_key_id uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  integration_account_id uuid NOT NULL REFERENCES integration_accounts(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  idempotency_key text NOT NULL,
  external_order_id text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','DEAD')),
  attempt_count int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (seller_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS order_ingestion_queue_claim_idx
  ON order_ingestion_queue (next_attempt_at, created_at)
  WHERE status IN ('PENDING','FAILED','PROCESSING');
CREATE INDEX IF NOT EXISTS order_ingestion_queue_seller_created_idx
  ON order_ingestion_queue (seller_id, created_at DESC);

ALTER TABLE order_ingestion_queue ENABLE ROW LEVEL SECURITY;
GRANT ALL ON order_ingestion_queue TO service_role;
GRANT SELECT ON order_ingestion_queue TO authenticated;
DROP POLICY IF EXISTS seller_queue_read ON order_ingestion_queue;
CREATE POLICY seller_queue_read ON order_ingestion_queue FOR SELECT TO authenticated
  USING (seller_id=jwt_seller_id() OR is_platform_admin());

-- Append-only acceptance path. It intentionally does not update api_keys.last_used_at:
-- updating one shared key row per request creates a severe lock convoy during bursts.
CREATE OR REPLACE FUNCTION enqueue_storefront_order(
  p_key_hash text, p_integration_id uuid, p_idempotency_key text, p_payload jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  k api_keys%ROWTYPE; s sellers%ROWTYPE; i integration_accounts%ROWTYPE;
  w warehouses%ROWTYPE; q order_ingestion_queue%ROWTYPE; was_duplicate boolean:=false;
BEGIN
  SELECT * INTO k FROM api_keys WHERE key_hash=p_key_hash AND is_active=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_API_KEY' USING ERRCODE='28000'; END IF;
  IF NOT ('orders:write'=ANY(k.scopes)) THEN RAISE EXCEPTION 'MISSING_SCOPE' USING ERRCODE='42501'; END IF;

  SELECT * INTO s FROM sellers WHERE id=k.seller_id;
  IF s.status::text<>'ACTIVE' OR nullif(trim(s.company_name),'') IS NULL OR nullif(trim(s.pan),'') IS NULL
    THEN RAISE EXCEPTION 'SELLER_NOT_VERIFIED' USING ERRCODE='42501'; END IF;

  SELECT * INTO i FROM integration_accounts
    WHERE id=p_integration_id AND seller_id=s.id AND status='CONNECTED';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_INTEGRATION' USING ERRCODE='42501'; END IF;

  SELECT * INTO w FROM warehouses
    WHERE id=COALESCE(nullif(p_payload->>'warehouse_id','')::uuid,i.default_warehouse_id)
      AND seller_id=s.id;
  IF NOT FOUND THEN RAISE EXCEPTION 'WAREHOUSE_MAPPING_REQUIRED' USING ERRCODE='23503'; END IF;
  IF nullif(p_payload->>'external_order_id','') IS NULL OR nullif(p_idempotency_key,'') IS NULL
    THEN RAISE EXCEPTION 'MISSING_ORDER_ID' USING ERRCODE='22023'; END IF;
  IF (p_payload#>>'{shipping_address,phone}') !~ '^\d{10}$'
    THEN RAISE EXCEPTION 'INVALID_PHONE' USING ERRCODE='22023'; END IF;
  IF (p_payload#>>'{shipping_address,pincode}') !~ '^\d{6}$'
    THEN RAISE EXCEPTION 'INVALID_PINCODE' USING ERRCODE='22023'; END IF;

  INSERT INTO order_ingestion_queue(
    seller_id,api_key_id,integration_account_id,warehouse_id,idempotency_key,external_order_id,payload
  ) VALUES (
    s.id,k.id,i.id,w.id,p_idempotency_key,p_payload->>'external_order_id',
    jsonb_set(p_payload,'{warehouse_id}',to_jsonb(w.id::text),true)
  )
  ON CONFLICT (seller_id,idempotency_key) DO NOTHING
  RETURNING * INTO q;

  IF NOT FOUND THEN
    was_duplicate:=true;
    SELECT * INTO q FROM order_ingestion_queue
      WHERE seller_id=s.id AND idempotency_key=p_idempotency_key;
  END IF;

  RETURN jsonb_build_object(
    'accepted',true,
    'duplicate',was_duplicate,
    'queued',q.status NOT IN ('COMPLETED'),
    'queue_id',q.id,
    'status',q.status,
    'order_id',q.order_id,
    'external_order_id',q.external_order_id,
    'created_at',q.created_at
  );
END $$;

REVOKE ALL ON FUNCTION enqueue_storefront_order(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION enqueue_storefront_order(text,uuid,text,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION claim_order_ingestion_queue(p_limit int DEFAULT 25)
RETURNS SETOF order_ingestion_queue LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE order_ingestion_queue q
  SET status='PROCESSING',locked_at=now(),attempt_count=attempt_count+1
  WHERE q.id IN (
    SELECT id FROM order_ingestion_queue
    WHERE (
      (status IN ('PENDING','FAILED') AND next_attempt_at<=now()) OR
      (status='PROCESSING' AND locked_at<now()-interval '2 minutes')
    ) AND attempt_count<5
    ORDER BY next_attempt_at,created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit,1),100)
  )
  RETURNING q.*;
$$;
REVOKE ALL ON FUNCTION claim_order_ingestion_queue(int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION claim_order_ingestion_queue(int) TO service_role;

CREATE OR REPLACE FUNCTION complete_order_ingestion(
  p_queue_id uuid, p_order_id uuid DEFAULT NULL, p_error_code text DEFAULT NULL, p_error_message text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF p_order_id IS NOT NULL THEN
    UPDATE order_ingestion_queue SET status='COMPLETED',order_id=p_order_id,completed_at=now(),locked_at=NULL,
      error_code=NULL,error_message=NULL WHERE id=p_queue_id AND status='PROCESSING';
  ELSE
    UPDATE order_ingestion_queue SET
      status=CASE WHEN attempt_count>=5 THEN 'DEAD' ELSE 'FAILED' END,
      next_attempt_at=now()+make_interval(secs=>LEAST(300,5*(2^GREATEST(attempt_count-1,0)))),
      locked_at=NULL,error_code=p_error_code,error_message=left(p_error_message,1000)
    WHERE id=p_queue_id AND status='PROCESSING';
  END IF;
END $$;
REVOKE ALL ON FUNCTION complete_order_ingestion(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION complete_order_ingestion(uuid,uuid,text,text) TO service_role;

-- Remove the API-key telemetry write from synchronous ingestion too. Usage can be
-- aggregated by a scheduled telemetry job without serializing customer traffic.
CREATE OR REPLACE FUNCTION touch_api_key_usage(p_key_ids uuid[])
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE api_keys SET last_used_at=now() WHERE id=ANY(p_key_ids);
$$;
REVOKE ALL ON FUNCTION touch_api_key_usage(uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION touch_api_key_usage(uuid[]) TO service_role;

-- Faster lookup for all hot-path tenant validations.
CREATE INDEX IF NOT EXISTS integration_accounts_connected_lookup_idx
  ON integration_accounts(id,seller_id) WHERE status='CONNECTED';
CREATE INDEX IF NOT EXISTS warehouses_seller_id_idx ON warehouses(seller_id,id);

-- Synchronous compatibility path, retained for clients that explicitly request it.
-- The shared api_keys row is read-only here, eliminating the burst lock convoy.
CREATE OR REPLACE FUNCTION ingest_storefront_order(
  p_key_hash text, p_integration_id uuid, p_idempotency_key text, p_payload jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k api_keys%ROWTYPE; s sellers%ROWTYPE; i integration_accounts%ROWTYPE; w warehouses%ROWTYPE;
  existing_order orders%ROWTYPE; created_order orders%ROWTYPE;
  calculated_weight numeric:=COALESCE((p_payload->>'weight_kg')::numeric,0); item jsonb;
BEGIN
  SELECT * INTO k FROM api_keys WHERE key_hash=p_key_hash AND is_active=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_API_KEY' USING ERRCODE='28000'; END IF;
  IF NOT ('orders:write'=ANY(k.scopes)) THEN RAISE EXCEPTION 'MISSING_SCOPE' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM sellers WHERE id=k.seller_id;
  IF s.status::text<>'ACTIVE' OR nullif(trim(s.company_name),'') IS NULL OR nullif(trim(s.pan),'') IS NULL
    THEN RAISE EXCEPTION 'SELLER_NOT_VERIFIED' USING ERRCODE='42501'; END IF;
  SELECT * INTO i FROM integration_accounts WHERE id=p_integration_id AND seller_id=s.id AND status='CONNECTED';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_INTEGRATION' USING ERRCODE='42501'; END IF;
  SELECT * INTO w FROM warehouses
    WHERE id=COALESCE(nullif(p_payload->>'warehouse_id','')::uuid,i.default_warehouse_id) AND seller_id=s.id;
  IF NOT FOUND THEN RAISE EXCEPTION 'WAREHOUSE_MAPPING_REQUIRED' USING ERRCODE='23503'; END IF;
  IF nullif(p_payload->>'external_order_id','') IS NULL OR nullif(p_idempotency_key,'') IS NULL
    THEN RAISE EXCEPTION 'MISSING_ORDER_ID' USING ERRCODE='22023'; END IF;
  IF (p_payload#>>'{shipping_address,phone}') !~ '^\d{10}$'
    THEN RAISE EXCEPTION 'INVALID_PHONE' USING ERRCODE='22023'; END IF;
  IF (p_payload#>>'{shipping_address,pincode}') !~ '^\d{6}$'
    THEN RAISE EXCEPTION 'INVALID_PINCODE' USING ERRCODE='22023'; END IF;
  SELECT * INTO existing_order FROM orders WHERE seller_id=s.id AND idempotency_key=p_idempotency_key;
  IF FOUND THEN RETURN jsonb_build_object('accepted',true,'duplicate',true,'order',jsonb_build_object(
    'id',existing_order.id,'external_order_id',existing_order.external_order_id,'status',existing_order.current_status)); END IF;
  IF calculated_weight<=0 THEN
    SELECT COALESCE(sum(COALESCE(sp.weight_kg,0)*COALESCE((x.item->>'quantity')::numeric,1)),0)
      INTO calculated_weight
    FROM jsonb_array_elements(COALESCE(p_payload->'items','[]'::jsonb)) x(item)
    LEFT JOIN sku_shipping_profiles sp ON sp.seller_id=s.id AND sp.sku=x.item->>'sku';
  END IF;
  IF calculated_weight<=0 THEN RAISE EXCEPTION 'WEIGHT_REQUIRED' USING ERRCODE='22023'; END IF;
  INSERT INTO orders(seller_id,warehouse_id,integration_account_id,external_order_id,idempotency_key,source,
    payment_type,cod_amount,total_amount,weight_kg,length_cm,width_cm,height_cm,shipping_address,current_status)
  VALUES(s.id,w.id,i.id,p_payload->>'external_order_id',p_idempotency_key,'API',
    CASE WHEN p_payload->>'payment_type'='COD' THEN 'COD'::payment_type ELSE 'PREPAID'::payment_type END,
    CASE WHEN p_payload->>'payment_type'='COD' THEN COALESCE((p_payload->>'total_amount')::numeric,0) ELSE 0 END,
    COALESCE((p_payload->>'total_amount')::numeric,0),calculated_weight,
    nullif(p_payload->>'length_cm','')::numeric,nullif(p_payload->>'width_cm','')::numeric,
    nullif(p_payload->>'height_cm','')::numeric,p_payload->'shipping_address','NEW') RETURNING * INTO created_order;
  FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'items','[]'::jsonb)) LOOP
    INSERT INTO order_items(order_id,sku,name,quantity,unit_price)
    VALUES(created_order.id,COALESCE(item->>'sku',''),COALESCE(item->>'name','Item'),
      COALESCE((item->>'quantity')::int,1),COALESCE((COALESCE(item->>'unit_price',item->>'price'))::numeric,0));
  END LOOP;
  INSERT INTO integration_sync_events(seller_id,integration_account_id,direction,event_type,external_id,status,message)
  VALUES(s.id,i.id,'INBOUND','ORDER_IMPORT',created_order.external_order_id,'SUCCESS','Order imported from website');
  RETURN jsonb_build_object('accepted',true,'duplicate',false,'order',jsonb_build_object(
    'id',created_order.id,'external_order_id',created_order.external_order_id,
    'status',created_order.current_status,'created_at',created_order.created_at));
EXCEPTION WHEN unique_violation THEN
  SELECT * INTO existing_order FROM orders WHERE seller_id=s.id AND idempotency_key=p_idempotency_key;
  RETURN jsonb_build_object('accepted',true,'duplicate',true,'order',jsonb_build_object(
    'id',existing_order.id,'external_order_id',existing_order.external_order_id,'status',existing_order.current_status));
END $$;
REVOKE ALL ON FUNCTION ingest_storefront_order(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ingest_storefront_order(text,uuid,text,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION materialize_queued_order(p_queue_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q order_ingestion_queue%ROWTYPE; key_hash_value text; result jsonb; materialized_order_id uuid;
BEGIN
  SELECT * INTO q FROM order_ingestion_queue WHERE id=p_queue_id AND status='PROCESSING' FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('processed',false,'reason','NOT_CLAIMED'); END IF;
  SELECT key_hash INTO key_hash_value FROM api_keys WHERE id=q.api_key_id AND is_active=true;
  IF key_hash_value IS NULL THEN RAISE EXCEPTION 'INVALID_API_KEY' USING ERRCODE='28000'; END IF;

  result:=ingest_storefront_order(key_hash_value,q.integration_account_id,q.idempotency_key,q.payload);
  materialized_order_id:=nullif(result#>>'{order,id}','')::uuid;
  IF materialized_order_id IS NULL THEN RAISE EXCEPTION 'ORDER_ID_MISSING'; END IF;
  UPDATE order_ingestion_queue SET status='COMPLETED',order_id=materialized_order_id,
    completed_at=now(),locked_at=NULL,error_code=NULL,error_message=NULL WHERE id=q.id;
  RETURN jsonb_build_object('processed',true,'queue_id',q.id,'order_id',materialized_order_id);
EXCEPTION WHEN OTHERS THEN
  UPDATE order_ingestion_queue SET
    status=CASE WHEN attempt_count>=5 THEN 'DEAD' ELSE 'FAILED' END,
    next_attempt_at=now()+make_interval(secs=>LEAST(300,5*(2^GREATEST(attempt_count-1,0)))),
    locked_at=NULL,error_code=SQLSTATE,error_message=left(SQLERRM,1000)
  WHERE id=p_queue_id;
  RETURN jsonb_build_object('processed',false,'queue_id',p_queue_id,'error_code',SQLSTATE,'error',SQLERRM);
END $$;
REVOKE ALL ON FUNCTION materialize_queued_order(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION materialize_queued_order(uuid) TO service_role;

CREATE OR REPLACE FUNCTION order_ingestion_queue_metrics()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT jsonb_build_object(
    'pending',count(*) FILTER (WHERE status IN ('PENDING','FAILED')),
    'processing',count(*) FILTER (WHERE status='PROCESSING'),
    'dead',count(*) FILTER (WHERE status='DEAD'),
    'oldest_pending_seconds',COALESCE(extract(epoch FROM now()-min(created_at)
      FILTER (WHERE status IN ('PENDING','FAILED'))),0),
    'completed_last_minute',count(*) FILTER (WHERE status='COMPLETED' AND completed_at>=now()-interval '1 minute')
  ) FROM order_ingestion_queue;
$$;
REVOKE ALL ON FUNCTION order_ingestion_queue_metrics() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION order_ingestion_queue_metrics() TO service_role;
