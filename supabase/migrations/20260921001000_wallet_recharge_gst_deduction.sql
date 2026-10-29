-- Manual recharge flow used until a payment gateway is connected.
-- The submitted value is gross payment; 18% is GST and 82% is wallet credit.
ALTER TABLE public.wallet_recharge_requests
  ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2);

UPDATE public.wallet_recharge_requests
SET paid_amount = amount + gst_amount
WHERE paid_amount IS NULL;

ALTER TABLE public.wallet_recharge_requests
  ALTER COLUMN paid_amount SET NOT NULL;

ALTER TABLE public.wallet_recharge_requests
  ADD CONSTRAINT wallet_recharge_paid_amount_positive CHECK (paid_amount > 0);

CREATE OR REPLACE FUNCTION public.request_wallet_recharge(p_amount numeric,p_payment_ref text)
RETURNS public.wallet_recharge_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_request public.wallet_recharge_requests;
  v_seller uuid:=public.jwt_seller_id();
  v_paid numeric(12,2);
  v_gst numeric(12,2);
  v_credit numeric(12,2);
  v_reference text:=upper(trim(COALESCE(p_payment_ref,'')));
BEGIN
  IF auth.uid() IS NULL OR v_seller IS NULL THEN RAISE EXCEPTION 'Seller authentication required'; END IF;
  IF p_amount IS NULL OR p_amount<100 OR p_amount>1000000 THEN RAISE EXCEPTION 'Recharge amount must be between 100 and 1000000'; END IF;
  IF length(v_reference)<6 THEN RAISE EXCEPTION 'A valid bank UTR or payment reference is required'; END IF;

  v_paid:=round(p_amount,2);
  v_gst:=round(v_paid*0.18,2);
  v_credit:=v_paid-v_gst;

  INSERT INTO public.wallet_recharge_requests(seller_id,amount,paid_amount,gst_amount,payment_reference,requested_by)
  VALUES(v_seller,v_credit,v_paid,v_gst,v_reference,auth.uid()) RETURNING * INTO v_request;
  RETURN v_request;
END $$;

REVOKE ALL ON FUNCTION public.request_wallet_recharge(numeric,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_wallet_recharge(numeric,text) TO authenticated;
