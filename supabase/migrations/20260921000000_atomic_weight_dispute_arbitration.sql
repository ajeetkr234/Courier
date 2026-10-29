ALTER TABLE public.weight_discrepancies
  ADD COLUMN IF NOT EXISTS evidence_scale_url text,
  ADD COLUMN IF NOT EXISTS evidence_tape_url text,
  ADD COLUMN IF NOT EXISTS sku_master_weight numeric(6,3),
  ADD COLUMN IF NOT EXISTS admin_arbitration_notes text,
  ADD COLUMN IF NOT EXISTS resolution_outcome text
    CHECK (resolution_outcome IS NULL OR resolution_outcome IN ('SELLER_REFUNDED','COURIER_UPHELD')),
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

CREATE OR REPLACE FUNCTION public.arbitrate_weight_dispute(
  p_dispute_id uuid, p_outcome text, p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v_dispute public.weight_discrepancies; v_balance numeric;
BEGIN
  IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'Platform administrator access required'; END IF;
  IF p_outcome NOT IN ('SELLER_REFUNDED','COURIER_UPHELD') THEN RAISE EXCEPTION 'Invalid arbitration outcome'; END IF;
  SELECT * INTO v_dispute FROM public.weight_discrepancies WHERE id=p_dispute_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Weight dispute not found'; END IF;
  IF v_dispute.status='RESOLVED' THEN RAISE EXCEPTION 'Weight dispute was already resolved'; END IF;
  UPDATE public.weight_discrepancies SET status='RESOLVED',resolution_outcome=p_outcome,
    admin_arbitration_notes=p_notes,resolved_at=now() WHERE id=p_dispute_id;
  IF p_outcome='SELLER_REFUNDED' THEN
    INSERT INTO public.wallets(seller_id,balance) VALUES(v_dispute.seller_id,0) ON CONFLICT(seller_id) DO NOTHING;
    PERFORM 1 FROM public.wallets WHERE seller_id=v_dispute.seller_id FOR UPDATE;
    INSERT INTO public.ledger_entries(seller_id,type,amount,direction,reference_type,reference_id,idempotency_key,created_by)
    VALUES(v_dispute.seller_id,'REFUND',v_dispute.excess_charge,'CREDIT','WEIGHT_DISPUTE_REFUND',
      v_dispute.id::text,'weight-refund-'||v_dispute.id::text,auth.uid());
    UPDATE public.wallets SET balance=balance+v_dispute.excess_charge,updated_at=now()
      WHERE seller_id=v_dispute.seller_id RETURNING balance INTO v_balance;
  END IF;
  INSERT INTO public.audit_logs(seller_id,user_id,action,entity_type,entity_id,payload)
  VALUES(v_dispute.seller_id,auth.uid(),'ARBITRATE_WEIGHT_DISPUTE','WEIGHT_DISCREPANCY',v_dispute.id::text,
    jsonb_build_object('outcome',p_outcome,'notes',p_notes));
  RETURN jsonb_build_object('status','RESOLVED','outcome',p_outcome,'balance',v_balance);
END $$;

REVOKE ALL ON FUNCTION public.arbitrate_weight_dispute(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.arbitrate_weight_dispute(uuid,text,text) TO authenticated;
