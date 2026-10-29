-- Scale target: 20k seller tenants and sustained 100-200 storefront orders/second.
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_active_hash_uidx ON api_keys(key_hash) WHERE is_active=true;
CREATE INDEX IF NOT EXISTS orders_seller_updated_idx ON orders(seller_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS orders_integration_created_idx ON orders(integration_account_id,created_at DESC) WHERE integration_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS shipments_seller_created_idx ON shipments(seller_id,created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_endpoints_seller_active_idx ON webhook_endpoints(seller_id,is_active);
CREATE INDEX IF NOT EXISTS integration_errors_open_idx ON integration_import_errors(seller_id,created_at DESC) WHERE status='OPEN';
CREATE INDEX IF NOT EXISTS sku_profiles_lookup_idx ON sku_shipping_profiles(seller_id,sku);

ALTER TABLE outbound_webhook_deliveries DROP CONSTRAINT IF EXISTS outbound_webhook_deliveries_status_check;
ALTER TABLE outbound_webhook_deliveries ADD CONSTRAINT outbound_webhook_deliveries_status_check CHECK(status IN ('PENDING','PROCESSING','DELIVERED','FAILED','DEAD'));
ALTER TABLE outbound_webhook_deliveries ADD COLUMN IF NOT EXISTS locked_at timestamptz;

CREATE OR REPLACE FUNCTION claim_outbound_webhooks(p_limit int DEFAULT 200)
RETURNS SETOF outbound_webhook_deliveries LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE outbound_webhook_deliveries d SET status='PROCESSING',locked_at=now()
  WHERE d.id IN (
    SELECT id FROM outbound_webhook_deliveries
    WHERE ((status IN ('PENDING','FAILED') AND next_attempt_at<=now()) OR (status='PROCESSING' AND locked_at<now()-interval '5 minutes'))
      AND attempt_count<5 ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT LEAST(p_limit,500)
  ) RETURNING d.*;
$$;
GRANT EXECUTE ON FUNCTION claim_outbound_webhooks(int) TO service_role;

-- One transaction replaces per-order API round trips and guarantees order/items atomicity.
CREATE OR REPLACE FUNCTION ingest_storefront_order(
  p_key_hash text, p_integration_id uuid, p_idempotency_key text, p_payload jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k api_keys%ROWTYPE; s sellers%ROWTYPE; i integration_accounts%ROWTYPE; w warehouses%ROWTYPE;
  existing_order orders%ROWTYPE; created_order orders%ROWTYPE; calculated_weight numeric:=COALESCE((p_payload->>'weight_kg')::numeric,0);
  item jsonb;
BEGIN
  SELECT * INTO k FROM api_keys WHERE key_hash=p_key_hash AND is_active=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_API_KEY' USING ERRCODE='28000'; END IF;
  IF NOT ('orders:write'=ANY(k.scopes)) THEN RAISE EXCEPTION 'MISSING_SCOPE' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM sellers WHERE id=k.seller_id;
  IF s.status::text<>'ACTIVE' OR nullif(trim(s.company_name),'') IS NULL OR nullif(trim(s.pan),'') IS NULL THEN RAISE EXCEPTION 'SELLER_NOT_VERIFIED' USING ERRCODE='42501'; END IF;
  IF k.last_used_at IS NULL OR k.last_used_at<now()-interval '5 minutes' THEN UPDATE api_keys SET last_used_at=now() WHERE id=k.id; END IF;
  SELECT * INTO i FROM integration_accounts WHERE id=p_integration_id AND seller_id=s.id AND status='CONNECTED';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_INTEGRATION' USING ERRCODE='42501'; END IF;
  SELECT * INTO w FROM warehouses WHERE id=COALESCE(nullif(p_payload->>'warehouse_id','')::uuid,i.default_warehouse_id) AND seller_id=s.id;
  IF NOT FOUND THEN RAISE EXCEPTION 'WAREHOUSE_MAPPING_REQUIRED' USING ERRCODE='23503'; END IF;
  IF nullif(p_payload->>'external_order_id','') IS NULL OR nullif(p_idempotency_key,'') IS NULL THEN RAISE EXCEPTION 'MISSING_ORDER_ID' USING ERRCODE='22023'; END IF;
  IF (p_payload#>>'{shipping_address,phone}') !~ '^\d{10}$' THEN RAISE EXCEPTION 'INVALID_PHONE' USING ERRCODE='22023'; END IF;
  IF (p_payload#>>'{shipping_address,pincode}') !~ '^\d{6}$' THEN RAISE EXCEPTION 'INVALID_PINCODE' USING ERRCODE='22023'; END IF;
  SELECT * INTO existing_order FROM orders WHERE seller_id=s.id AND idempotency_key=p_idempotency_key;
  IF FOUND THEN RETURN jsonb_build_object('accepted',true,'duplicate',true,'order',jsonb_build_object('id',existing_order.id,'external_order_id',existing_order.external_order_id,'status',existing_order.current_status)); END IF;
  IF calculated_weight<=0 THEN
    SELECT COALESCE(sum(COALESCE(sp.weight_kg,0)*COALESCE((x.item->>'quantity')::numeric,1)),0) INTO calculated_weight
    FROM jsonb_array_elements(COALESCE(p_payload->'items','[]'::jsonb)) x(item)
    LEFT JOIN sku_shipping_profiles sp ON sp.seller_id=s.id AND sp.sku=x.item->>'sku';
  END IF;
  IF calculated_weight<=0 THEN RAISE EXCEPTION 'WEIGHT_REQUIRED' USING ERRCODE='22023'; END IF;
  INSERT INTO orders(seller_id,warehouse_id,integration_account_id,external_order_id,idempotency_key,source,payment_type,cod_amount,total_amount,weight_kg,length_cm,width_cm,height_cm,shipping_address,current_status)
  VALUES(s.id,w.id,i.id,p_payload->>'external_order_id',p_idempotency_key,'API',CASE WHEN p_payload->>'payment_type'='COD' THEN 'COD'::payment_type ELSE 'PREPAID'::payment_type END,
    CASE WHEN p_payload->>'payment_type'='COD' THEN COALESCE((p_payload->>'total_amount')::numeric,0) ELSE 0 END,COALESCE((p_payload->>'total_amount')::numeric,0),calculated_weight,
    nullif(p_payload->>'length_cm','')::numeric,nullif(p_payload->>'width_cm','')::numeric,nullif(p_payload->>'height_cm','')::numeric,p_payload->'shipping_address','NEW') RETURNING * INTO created_order;
  FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'items','[]'::jsonb)) LOOP
    INSERT INTO order_items(order_id,sku,name,quantity,unit_price) VALUES(created_order.id,COALESCE(item->>'sku',''),COALESCE(item->>'name','Item'),COALESCE((item->>'quantity')::int,1),COALESCE((COALESCE(item->>'unit_price',item->>'price'))::numeric,0));
  END LOOP;
  INSERT INTO integration_sync_events(seller_id,integration_account_id,direction,event_type,external_id,status,message)
  VALUES(s.id,i.id,'INBOUND','ORDER_IMPORT',created_order.external_order_id,'SUCCESS','Order imported from website');
  RETURN jsonb_build_object('accepted',true,'duplicate',false,'order',jsonb_build_object('id',created_order.id,'external_order_id',created_order.external_order_id,'status',created_order.current_status,'created_at',created_order.created_at));
EXCEPTION WHEN unique_violation THEN
  SELECT * INTO existing_order FROM orders WHERE seller_id=s.id AND idempotency_key=p_idempotency_key;
  RETURN jsonb_build_object('accepted',true,'duplicate',true,'order',jsonb_build_object('id',existing_order.id,'external_order_id',existing_order.external_order_id,'status',existing_order.current_status));
END $$;
REVOKE ALL ON FUNCTION ingest_storefront_order(text,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ingest_storefront_order(text,uuid,text,jsonb) TO service_role;
