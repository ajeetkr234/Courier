-- Timeout-safe cleanup for automated capacity fixtures. The company-name guard
-- prevents this maintenance RPC from deleting real sellers.
CREATE OR REPLACE FUNCTION cleanup_capacity_test_seller(p_seller_id uuid,p_limit int DEFAULT 2000)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE removed_queue int:=0; removed_orders int:=0; queue_left bigint; orders_left bigint; seller_deleted boolean:=false;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM sellers WHERE id=p_seller_id AND company_name='ShipFaster Automated Capacity Test')
    THEN RAISE EXCEPTION 'NOT_A_CAPACITY_TEST_SELLER' USING ERRCODE='42501'; END IF;
  WITH targets AS (SELECT id FROM order_ingestion_queue WHERE seller_id=p_seller_id LIMIT LEAST(GREATEST(p_limit,1),5000))
  DELETE FROM order_ingestion_queue q USING targets t WHERE q.id=t.id;
  GET DIAGNOSTICS removed_queue=ROW_COUNT;
  SELECT count(*) INTO queue_left FROM order_ingestion_queue WHERE seller_id=p_seller_id;
  IF queue_left=0 THEN
    WITH targets AS (SELECT id FROM orders WHERE seller_id=p_seller_id LIMIT LEAST(GREATEST(p_limit,1),5000))
    DELETE FROM orders o USING targets t WHERE o.id=t.id;
    GET DIAGNOSTICS removed_orders=ROW_COUNT;
  END IF;
  SELECT count(*) INTO orders_left FROM orders WHERE seller_id=p_seller_id;
  IF queue_left=0 AND orders_left=0 THEN DELETE FROM sellers WHERE id=p_seller_id; seller_deleted:=FOUND; END IF;
  RETURN jsonb_build_object('removed_queue',removed_queue,'removed_orders',removed_orders,
    'queue_left',queue_left,'orders_left',orders_left,'seller_deleted',seller_deleted);
END $$;
REVOKE ALL ON FUNCTION cleanup_capacity_test_seller(uuid,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cleanup_capacity_test_seller(uuid,int) TO service_role;
