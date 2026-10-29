-- Forward-only security migration: Secure Server-Verified Payment Gateway Recharges
-- Production wallet credits must ONLY be issued after server verification of signed
-- payment provider webhooks (e.g., Razorpay, Cashfree, Stripe) via process_verified_payment_credit.
-- Demo recharges are strictly isolated, prevented from running in production, and tagged non-transferable.

-- 1. Create table for verified payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_payment_id text NOT NULL,
  provider_order_id text,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
  currency text NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  paid_amount numeric(12,2) NOT NULL CHECK (paid_amount >= 100 AND paid_amount <= 1000000),
  gst_amount numeric(12,2) NOT NULL CHECK (gst_amount >= 0),
  net_credit numeric(12,2) NOT NULL CHECK (net_credit > 0),
  status text NOT NULL CHECK (status IN ('COMPLETED', 'FAILED', 'REFUNDED')),
  raw_payload jsonb DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_payment_provider_payment_id UNIQUE (provider, provider_payment_id)
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions FORCE ROW LEVEL SECURITY;

CREATE POLICY payment_tx_select ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (public.is_platform_admin() OR seller_id = public.jwt_seller_id());

CREATE INDEX IF NOT EXISTS idx_payment_tx_seller ON public.payment_transactions(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_tx_lookup ON public.payment_transactions(provider, provider_payment_id);

-- 2. Atomic server-side payment credit processing function
-- Strictly callable ONLY by service_role (Edge Functions receiving verified webhooks)
CREATE OR REPLACE FUNCTION public.process_verified_payment_credit(
  p_provider text,
  p_provider_payment_id text,
  p_provider_order_id text,
  p_seller_id uuid,
  p_paid_amount numeric,
  p_currency text,
  p_raw_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_seller public.sellers%ROWTYPE;
  v_paid numeric(12,2);
  v_gst numeric(12,2);
  v_net numeric(12,2);
  v_balance numeric(12,2);
  v_entry public.ledger_entries%ROWTYPE;
  v_tx public.payment_transactions%ROWTYPE;
  v_idempotency_key text;
  v_provider text;
  v_payment_id text;
BEGIN
  -- Strict privilege check: Only service_role (Edge Functions / backend workers) may execute
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Only backend service_role can record verified payment credits';
  END IF;

  v_provider := upper(trim(COALESCE(p_provider, '')));
  v_payment_id := trim(COALESCE(p_provider_payment_id, ''));

  IF v_provider = '' THEN
    RAISE EXCEPTION 'Provider name is required';
  END IF;
  IF v_payment_id = '' THEN
    RAISE EXCEPTION 'Provider payment ID is required';
  END IF;

  -- Validate currency
  IF upper(trim(COALESCE(p_currency, ''))) <> 'INR' THEN
    RAISE EXCEPTION 'Invalid currency: Only INR is accepted for wallet recharge';
  END IF;

  -- Validate amount limits & positive precision
  IF p_paid_amount IS NULL OR p_paid_amount < 100 OR p_paid_amount > 1000000 THEN
    RAISE EXCEPTION 'Invalid payment amount: Must be between 100 and 1000000 INR';
  END IF;

  -- Validate seller existence and status
  SELECT * INTO v_seller FROM public.sellers WHERE id = p_seller_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller account not found: %', p_seller_id;
  END IF;
  IF v_seller.status NOT IN ('ACTIVE', 'KYC_PENDING') THEN
    RAISE EXCEPTION 'Seller account is not eligible for wallet credits (status: %)', v_seller.status;
  END IF;

  v_idempotency_key := 'pay-' || lower(v_provider) || '-' || v_payment_id;

  -- Concurrency / Replay guard: If already recorded in payment_transactions or ledger, return existing idempotently
  SELECT * INTO v_tx FROM public.payment_transactions
  WHERE provider = v_provider AND provider_payment_id = v_payment_id;

  IF FOUND THEN
    SELECT balance INTO v_balance FROM public.wallets WHERE seller_id = p_seller_id;
    RETURN jsonb_build_object(
      'status', 'ALREADY_PROCESSED',
      'transaction_id', v_tx.id,
      'net_credit', v_tx.net_credit,
      'balance', COALESCE(v_balance, 0),
      'duplicate', true
    );
  END IF;

  -- Calculate GST deduction (18% GST standard on logistics SaaS recharge)
  v_paid := round(p_paid_amount, 2);
  v_gst := round(v_paid * 0.18, 2);
  v_net := v_paid - v_gst;

  -- Lock wallet row to guarantee atomic serialization
  INSERT INTO public.wallets (seller_id, balance) VALUES (p_seller_id, 0)
  ON CONFLICT (seller_id) DO NOTHING;
  PERFORM 1 FROM public.wallets WHERE seller_id = p_seller_id FOR UPDATE;

  -- Insert payment transaction record (guaranteed unique by uq_payment_provider_payment_id)
  INSERT INTO public.payment_transactions (
    provider, provider_payment_id, provider_order_id, seller_id,
    currency, paid_amount, gst_amount, net_credit, status, raw_payload
  ) VALUES (
    v_provider, v_payment_id, p_provider_order_id, p_seller_id,
    'INR', v_paid, v_gst, v_net, 'COMPLETED', p_raw_payload
  ) RETURNING * INTO v_tx;

  -- Insert immutable ledger entry with strict idempotency key
  INSERT INTO public.ledger_entries (
    seller_id, type, amount, direction, reference_type, reference_id,
    idempotency_key, created_by
  ) VALUES (
    p_seller_id, 'RECHARGE', v_net, 'CREDIT', 'PAYMENT_GATEWAY',
    v_payment_id, v_idempotency_key, auth.uid()
  ) RETURNING * INTO v_entry;

  -- Atomically increment wallet balance
  UPDATE public.wallets
  SET balance = balance + v_net, updated_at = now()
  WHERE seller_id = p_seller_id
  RETURNING balance INTO v_balance;

  RETURN jsonb_build_object(
    'status', 'COMPLETED',
    'transaction_id', v_tx.id,
    'paid_amount', v_paid,
    'gst_amount', v_gst,
    'net_credit', v_net,
    'balance', v_balance,
    'ledger_entry_id', v_entry.id,
    'duplicate', false
  );
END $$;

REVOKE ALL ON FUNCTION public.process_verified_payment_credit(text,text,text,uuid,numeric,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_verified_payment_credit(text,text,text,uuid,numeric,text,jsonb) TO service_role;

-- 3. Harden demo wallet recharge:
-- Demo recharge MUST NOT run in production, MUST be explicitly enabled, and CANNOT credit real production funds.
CREATE OR REPLACE FUNCTION public.recharge_demo_wallet(
  p_amount numeric,
  p_payment_ref text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_seller uuid := public.jwt_seller_id();
  v_balance numeric;
  v_entry public.ledger_entries;
  v_env text;
BEGIN
  -- 1. Strict Environment Isolation Guard: Disabled in production by default
  v_env := lower(COALESCE(current_setting('app.environment', true), 'production'));
  IF v_env IN ('production', 'prod') OR COALESCE(current_setting('app.enable_demo_recharge', true), 'off') <> 'on' THEN
    RAISE EXCEPTION 'Demo wallet recharge is disabled in production environments.';
  END IF;

  -- 2. Authorization Guard
  IF auth.uid() IS NULL OR lower(COALESCE(auth.jwt()->>'email','')) <> 'seller.demo@shipfaster.test' THEN
    RAISE EXCEPTION 'Demo recharge is not available for this account';
  END IF;
  IF v_seller IS NULL THEN RAISE EXCEPTION 'Seller account is not linked'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'Demo recharge amount must be between 1 and 50000';
  END IF;
  IF trim(COALESCE(p_payment_ref,'')) = '' THEN RAISE EXCEPTION 'Payment reference is required'; END IF;

  INSERT INTO public.wallets(seller_id,balance) VALUES(v_seller,0)
  ON CONFLICT (seller_id) DO NOTHING;
  PERFORM 1 FROM public.wallets WHERE seller_id=v_seller FOR UPDATE;

  -- Tag explicitly as non-transferable demo credit, not a real cash recharge
  INSERT INTO public.ledger_entries(
    seller_id,type,amount,direction,reference_type,reference_id,idempotency_key,created_by
  ) VALUES (
    v_seller,'MANUAL_ADJUSTMENT',round(p_amount,2),'CREDIT','DEMO_CREDIT_NON_TRANSFERABLE',p_payment_ref,
    'demo-recharge-'||v_seller::text||'-'||p_payment_ref,auth.uid()
  ) RETURNING * INTO v_entry;

  UPDATE public.wallets
  SET balance=balance+round(p_amount,2),updated_at=now()
  WHERE seller_id=v_seller
  RETURNING balance INTO v_balance;

  RETURN jsonb_build_object('balance',v_balance,'entry',to_jsonb(v_entry));
END $$;

REVOKE ALL ON FUNCTION public.recharge_demo_wallet(numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recharge_demo_wallet(numeric,text) TO authenticated;
