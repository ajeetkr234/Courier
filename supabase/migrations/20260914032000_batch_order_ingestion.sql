-- Set-based batch acceptance amortizes Edge/PostgREST and authentication overhead.
CREATE OR REPLACE FUNCTION enqueue_storefront_orders_batch(
  p_key_hash text, p_integration_id uuid, p_orders jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k api_keys%ROWTYPE; s sellers%ROWTYPE; i integration_accounts%ROWTYPE;
  default_warehouse warehouses%ROWTYPE; accepted_count int; received_count int; queue_ids jsonb;
BEGIN
  IF jsonb_typeof(p_orders)<>'array' THEN RAISE EXCEPTION 'ORDERS_ARRAY_REQUIRED' USING ERRCODE='22023'; END IF;
  received_count:=jsonb_array_length(p_orders);
  IF received_count<1 OR received_count>100 THEN RAISE EXCEPTION 'BATCH_SIZE_1_TO_100_REQUIRED' USING ERRCODE='22023'; END IF;
  SELECT * INTO k FROM api_keys WHERE key_hash=p_key_hash AND is_active=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_API_KEY' USING ERRCODE='28000'; END IF;
  IF NOT ('orders:write'=ANY(k.scopes)) THEN RAISE EXCEPTION 'MISSING_SCOPE' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM sellers WHERE id=k.seller_id;
  IF s.status::text<>'ACTIVE' OR nullif(trim(s.company_name),'') IS NULL OR nullif(trim(s.pan),'') IS NULL
    THEN RAISE EXCEPTION 'SELLER_NOT_VERIFIED' USING ERRCODE='42501'; END IF;
  SELECT * INTO i FROM integration_accounts WHERE id=p_integration_id AND seller_id=s.id AND status='CONNECTED';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_INTEGRATION' USING ERRCODE='42501'; END IF;
  SELECT * INTO default_warehouse FROM warehouses WHERE id=i.default_warehouse_id AND seller_id=s.id;
  IF NOT FOUND THEN RAISE EXCEPTION 'WAREHOUSE_MAPPING_REQUIRED' USING ERRCODE='23503'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_orders) x(order_payload)
    WHERE nullif(order_payload->>'external_order_id','') IS NULL
       OR (order_payload#>>'{shipping_address,phone}') !~ '^\d{10}$'
       OR (order_payload#>>'{shipping_address,pincode}') !~ '^\d{6}$')
    THEN RAISE EXCEPTION 'INVALID_BATCH_ORDER' USING ERRCODE='22023'; END IF;

  WITH payloads AS (
    SELECT order_payload,
      COALESCE(nullif(order_payload->>'idempotency_key',''),order_payload->>'external_order_id') AS idempotency_key,
      COALESCE(nullif(order_payload->>'warehouse_id','')::uuid,default_warehouse.id) AS warehouse_id
    FROM jsonb_array_elements(p_orders) x(order_payload)
  ), valid AS (
    SELECT p.* FROM payloads p JOIN warehouses w ON w.id=p.warehouse_id AND w.seller_id=s.id
  ), inserted AS (
    INSERT INTO order_ingestion_queue(seller_id,api_key_id,integration_account_id,warehouse_id,idempotency_key,external_order_id,payload)
    SELECT s.id,k.id,i.id,v.warehouse_id,v.idempotency_key,v.order_payload->>'external_order_id',
      jsonb_set(v.order_payload,'{warehouse_id}',to_jsonb(v.warehouse_id::text),true)
    FROM valid v ON CONFLICT (seller_id,idempotency_key) DO NOTHING RETURNING id
  ) SELECT count(*),COALESCE(jsonb_agg(id),'[]'::jsonb) INTO accepted_count,queue_ids FROM inserted;

  RETURN jsonb_build_object('accepted',true,'received_count',received_count,'accepted_count',accepted_count,
    'duplicate_count',received_count-accepted_count,'queue_ids',queue_ids);
END $$;
REVOKE ALL ON FUNCTION enqueue_storefront_orders_batch(text,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION enqueue_storefront_orders_batch(text,uuid,jsonb) TO service_role;
