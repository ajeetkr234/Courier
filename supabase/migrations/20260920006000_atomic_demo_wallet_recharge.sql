-- Atomic QA wallet recharge. Real-money wallet credits must be issued only by
-- a verified payment webhook; this initial version is deliberately restricted
-- to the documented demo seller account and is widened for QA in 007000.
CREATE OR REPLACE FUNCTION public.recharge_demo_wallet(
  p_amount numeric,
  p_payment_ref text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid := public.jwt_seller_id();
  v_balance numeric;
  v_entry public.ledger_entries;
BEGIN
  IF auth.uid() IS NULL OR lower(COALESCE(auth.jwt()->>'email','')) <> 'seller.demo@shipfaster.test' THEN
    RAISE EXCEPTION 'Demo recharge is not available for this account';
  END IF;
  IF v_seller IS NULL THEN RAISE EXCEPTION 'Seller account is not linked'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000000 THEN
    RAISE EXCEPTION 'Recharge amount must be between 0.01 and 1000000';
  END IF;
  IF trim(COALESCE(p_payment_ref,'')) = '' THEN RAISE EXCEPTION 'Payment reference is required'; END IF;

  INSERT INTO public.wallets(seller_id,balance) VALUES(v_seller,0)
  ON CONFLICT (seller_id) DO NOTHING;
  PERFORM 1 FROM public.wallets WHERE seller_id=v_seller FOR UPDATE;

  INSERT INTO public.ledger_entries(
    seller_id,type,amount,direction,reference_type,reference_id,idempotency_key,created_by
  ) VALUES (
    v_seller,'RECHARGE',round(p_amount,2),'CREDIT','DEMO_RECHARGE',p_payment_ref,
    'demo-recharge-'||v_seller::text||'-'||p_payment_ref,auth.uid()
  ) RETURNING * INTO v_entry;

  UPDATE public.wallets
  SET balance=balance+round(p_amount,2),updated_at=now()
  WHERE seller_id=v_seller
  RETURNING balance INTO v_balance;

  RETURN jsonb_build_object('balance',v_balance,'entry',to_jsonb(v_entry));
END $$;

REVOKE ALL ON FUNCTION public.recharge_demo_wallet(numeric,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recharge_demo_wallet(numeric,text) TO authenticated;
