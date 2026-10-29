-- Wallet credits require platform-admin approval until a payment gateway and
-- verified webhook are configured.
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS contact_phone text;

UPDATE public.sellers s SET
  contact_email=COALESCE(s.contact_email,u.email),
  contact_phone=COALESCE(s.contact_phone,u.raw_user_meta_data->>'phone')
FROM public.seller_users su JOIN auth.users u ON u.id=su.user_id
WHERE su.seller_id=s.id;

CREATE OR REPLACE FUNCTION public.handle_new_seller_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE v_seller uuid; v_company text:=COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name',''),'New Seller');
BEGIN
  INSERT INTO public.sellers(company_name,brand_name,pan,status,contact_email,contact_phone)
  VALUES(v_company,v_company,'PENDING-'||upper(substr(replace(NEW.id::text,'-',''),1,10)),'DRAFT',NEW.email,NEW.raw_user_meta_data->>'phone') RETURNING id INTO v_seller;
  INSERT INTO public.seller_users(seller_id,user_id,role) VALUES(v_seller,NEW.id,'OWNER');
  INSERT INTO public.wallets(seller_id,balance) VALUES(v_seller,0);
  INSERT INTO public.return_policies(seller_id) VALUES(v_seller);
  UPDATE auth.users SET raw_app_meta_data=COALESCE(raw_app_meta_data,'{}'::jsonb)||jsonb_build_object('seller_id',v_seller,'role','OWNER') WHERE id=NEW.id;
  RETURN NEW;
END $$;

CREATE TABLE IF NOT EXISTS public.wallet_recharge_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK(amount > 0 AND amount <= 1000000),
  gst_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(gst_amount >= 0),
  payment_reference text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seller_id,payment_reference)
);

ALTER TABLE public.wallet_recharge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_recharge_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY recharge_request_select ON public.wallet_recharge_requests FOR SELECT TO authenticated
USING(public.is_platform_admin() OR seller_id=public.jwt_seller_id());

CREATE OR REPLACE FUNCTION public.request_wallet_recharge(p_amount numeric,p_payment_ref text)
RETURNS public.wallet_recharge_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_request public.wallet_recharge_requests; v_seller uuid:=public.jwt_seller_id();
BEGIN
  IF auth.uid() IS NULL OR v_seller IS NULL THEN RAISE EXCEPTION 'Seller authentication required'; END IF;
  IF p_amount IS NULL OR p_amount<=0 OR p_amount>1000000 THEN RAISE EXCEPTION 'Invalid recharge amount'; END IF;
  INSERT INTO public.wallet_recharge_requests(seller_id,amount,gst_amount,payment_reference,requested_by)
  VALUES(v_seller,round(p_amount,2),round(p_amount*0.18,2),p_payment_ref,auth.uid()) RETURNING * INTO v_request;
  RETURN v_request;
END $$;

CREATE OR REPLACE FUNCTION public.review_wallet_recharge(p_request_id uuid,p_approve boolean,p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_request public.wallet_recharge_requests; v_balance numeric; v_entry public.ledger_entries;
BEGIN
  IF NOT public.is_platform_admin() THEN RAISE EXCEPTION 'Platform administrator required'; END IF;
  SELECT * INTO v_request FROM public.wallet_recharge_requests WHERE id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recharge request not found'; END IF;
  IF v_request.status<>'PENDING' THEN RAISE EXCEPTION 'Recharge request was already reviewed'; END IF;
  UPDATE public.wallet_recharge_requests SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
    reviewed_by=auth.uid(),review_note=NULLIF(trim(COALESCE(p_note,'')),''),reviewed_at=now() WHERE id=p_request_id;
  IF NOT p_approve THEN RETURN jsonb_build_object('status','REJECTED'); END IF;
  INSERT INTO public.wallets(seller_id,balance) VALUES(v_request.seller_id,0) ON CONFLICT(seller_id) DO NOTHING;
  PERFORM 1 FROM public.wallets WHERE seller_id=v_request.seller_id FOR UPDATE;
  INSERT INTO public.ledger_entries(seller_id,type,amount,direction,reference_type,reference_id,idempotency_key,created_by)
  VALUES(v_request.seller_id,'RECHARGE',v_request.amount,'CREDIT','ADMIN_APPROVED_RECHARGE',v_request.payment_reference,
    'approved-recharge-'||v_request.id::text,auth.uid()) RETURNING * INTO v_entry;
  UPDATE public.wallets SET balance=balance+v_request.amount,updated_at=now() WHERE seller_id=v_request.seller_id RETURNING balance INTO v_balance;
  RETURN jsonb_build_object('status','APPROVED','balance',v_balance,'entry',to_jsonb(v_entry));
END $$;

REVOKE ALL ON FUNCTION public.request_wallet_recharge(numeric,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_wallet_recharge(uuid,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_wallet_recharge(numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_wallet_recharge(uuid,boolean,text) TO authenticated;

-- Generic trigger records differ between documents and bank accounts. JSON
-- field access avoids referencing a column absent from the other record shape.
CREATE OR REPLACE FUNCTION public.protect_verification_decisions() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_new jsonb:=to_jsonb(NEW); v_old jsonb:=CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE '{}'::jsonb END;
BEGIN
  IF auth.role()<>'service_role' AND NOT public.is_platform_admin() THEN
    IF TG_TABLE_NAME='seller_verification_documents' AND ((TG_OP='INSERT' AND (COALESCE(v_new->>'verification_status','PENDING')<>'PENDING' OR v_new->>'verified_by' IS NOT NULL OR v_new->>'verified_at' IS NOT NULL OR v_new->>'rejection_reason' IS NOT NULL)) OR (TG_OP='UPDATE' AND ((v_new->>'verification_status') IS DISTINCT FROM (v_old->>'verification_status') OR (v_new->>'verified_by') IS DISTINCT FROM (v_old->>'verified_by') OR (v_new->>'verified_at') IS DISTINCT FROM (v_old->>'verified_at') OR (v_new->>'rejection_reason') IS DISTINCT FROM (v_old->>'rejection_reason')))) THEN RAISE EXCEPTION 'Only platform administrators can decide verification'; END IF;
    IF TG_TABLE_NAME='seller_bank_accounts' AND ((TG_OP='INSERT' AND COALESCE((v_new->>'is_verified')::boolean,false)) OR (TG_OP='UPDATE' AND (v_new->>'is_verified') IS DISTINCT FROM (v_old->>'is_verified'))) THEN RAISE EXCEPTION 'Only platform administrators can verify bank accounts'; END IF;
  END IF;
  RETURN NEW;
END $$;
