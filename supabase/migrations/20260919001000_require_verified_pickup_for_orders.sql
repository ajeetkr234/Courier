-- Prevent every order-ingestion path from bypassing pickup validation.
-- Phone ownership/OTP verification requires an external OTP provider; this
-- guard verifies that a complete pickup address and valid Indian mobile are
-- already stored before accepting an order.
CREATE OR REPLACE FUNCTION public.require_valid_order_pickup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pickup public.warehouses%ROWTYPE;
  normalized_phone text;
BEGIN
  IF NEW.warehouse_id IS NULL THEN
    RAISE EXCEPTION 'PICKUP_ADDRESS_REQUIRED' USING ERRCODE = '23502';
  END IF;

  SELECT * INTO pickup
  FROM public.warehouses
  WHERE id = NEW.warehouse_id AND seller_id = NEW.seller_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PICKUP_ADDRESS_NOT_VERIFIED' USING ERRCODE = '23503';
  END IF;

  IF nullif(trim(pickup.address_line1), '') IS NULL
     OR nullif(trim(pickup.city), '') IS NULL
     OR nullif(trim(pickup.state), '') IS NULL
     OR pickup.pincode !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'PICKUP_ADDRESS_NOT_VERIFIED' USING ERRCODE = '22023';
  END IF;

  normalized_phone := right(regexp_replace(coalesce(pickup.phone, ''), '[^0-9]', '', 'g'), 10);
  IF normalized_phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'PICKUP_MOBILE_NOT_VERIFIED' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_require_valid_order_pickup ON public.orders;
CREATE TRIGGER trg_require_valid_order_pickup
BEFORE INSERT OR UPDATE OF seller_id, warehouse_id ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.require_valid_order_pickup();
