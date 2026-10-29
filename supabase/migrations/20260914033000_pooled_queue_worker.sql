-- Process a claimed batch in one pooled PostgREST connection. Multiple workers
-- can call this concurrently; SKIP LOCKED assigns disjoint queue rows.
CREATE OR REPLACE FUNCTION process_order_ingestion_batch(p_limit int DEFAULT 50)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q record; result jsonb; claimed_count int:=0; completed_count int:=0; failed_count int:=0; key_ids uuid[]:='{}';
BEGIN
  FOR q IN
    SELECT id,api_key_id FROM order_ingestion_queue
    WHERE (
      (status IN ('PENDING','FAILED') AND next_attempt_at<=now()) OR
      (status='PROCESSING' AND locked_at<now()-interval '2 minutes')
    ) AND attempt_count<5
    ORDER BY next_attempt_at,created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit,1),100)
  LOOP
    UPDATE order_ingestion_queue SET status='PROCESSING',locked_at=now(),attempt_count=attempt_count+1 WHERE id=q.id;
    claimed_count:=claimed_count+1;
    key_ids:=array_append(key_ids,q.api_key_id);
    result:=materialize_queued_order(q.id);
    IF COALESCE((result->>'processed')::boolean,false) THEN completed_count:=completed_count+1;
    ELSE failed_count:=failed_count+1; END IF;
  END LOOP;
  IF cardinality(key_ids)>0 THEN PERFORM touch_api_key_usage(ARRAY(SELECT DISTINCT unnest(key_ids))); END IF;
  RETURN jsonb_build_object('claimed',claimed_count,'completed',completed_count,'failed',failed_count);
END $$;
REVOKE ALL ON FUNCTION process_order_ingestion_batch(int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION process_order_ingestion_batch(int) TO service_role;
