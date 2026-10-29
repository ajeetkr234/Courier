ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS address_verified_at timestamptz;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

-- Preserve service for warehouses that passed the earlier database validation.
-- Newly created warehouses remain unverified; editing protected fields below
-- also clears verification and requires OTP again.
UPDATE public.warehouses
SET address_verified_at = COALESCE(address_verified_at, now()),
    phone_verified_at = COALESCE(phone_verified_at, now())
WHERE nullif(trim(address_line1), '') IS NOT NULL
  AND nullif(trim(city), '') IS NOT NULL
  AND nullif(trim(state), '') IS NOT NULL
  AND pincode ~ '^[0-9]{6}$'
  AND right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10) ~ '^[6-9][0-9]{9}$';

CREATE TABLE IF NOT EXISTS public.pickup_verification_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  otp_hash text NOT NULL, expires_at timestamptz NOT NULL, attempts int NOT NULL DEFAULT 0,
  used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pickup_verification_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pickup_verification_challenges FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.reset_pickup_verification() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.phone IS DISTINCT FROM OLD.phone OR NEW.address_line1 IS DISTINCT FROM OLD.address_line1 OR
     NEW.address_line2 IS DISTINCT FROM OLD.address_line2 OR NEW.city IS DISTINCT FROM OLD.city OR
     NEW.state IS DISTINCT FROM OLD.state OR NEW.pincode IS DISTINCT FROM OLD.pincode THEN
    NEW.address_verified_at := NULL; NEW.phone_verified_at := NULL;
  END IF; RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_reset_pickup_verification ON public.warehouses;
CREATE TRIGGER trg_reset_pickup_verification BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.reset_pickup_verification();

CREATE OR REPLACE FUNCTION public.require_valid_order_pickup() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pickup public.warehouses%ROWTYPE; normalized_phone text;
BEGIN
  IF NEW.warehouse_id IS NULL THEN RAISE EXCEPTION 'PICKUP_ADDRESS_REQUIRED' USING ERRCODE='23502'; END IF;
  SELECT * INTO pickup FROM public.warehouses WHERE id=NEW.warehouse_id AND seller_id=NEW.seller_id;
  IF NOT FOUND OR pickup.address_verified_at IS NULL OR pickup.phone_verified_at IS NULL THEN RAISE EXCEPTION 'PICKUP_ADDRESS_NOT_VERIFIED' USING ERRCODE='42501'; END IF;
  normalized_phone:=right(regexp_replace(coalesce(pickup.phone,''),'[^0-9]','','g'),10);
  IF normalized_phone !~ '^[6-9][0-9]{9}$' THEN RAISE EXCEPTION 'PICKUP_MOBILE_NOT_VERIFIED' USING ERRCODE='22023'; END IF;
  RETURN NEW;
END $$;
