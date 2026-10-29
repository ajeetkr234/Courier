CREATE OR REPLACE FUNCTION public.submit_seller_onboarding(
  p_company_name text,
  p_brand_name text,
  p_gstin text,
  p_pan text
) RETURNS public.sellers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id uuid;
  v_seller public.sellers;
BEGIN
  SELECT seller_id INTO v_seller_id
  FROM public.seller_users
  WHERE user_id = auth.uid();

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'SELLER_MEMBERSHIP_NOT_FOUND' USING ERRCODE = '42501';
  END IF;
  IF length(trim(p_company_name)) < 2 OR length(trim(p_brand_name)) < 2 THEN
    RAISE EXCEPTION 'BUSINESS_NAME_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF upper(trim(p_pan)) !~ '^[A-Z]{5}[0-9]{4}[A-Z]$' THEN
    RAISE EXCEPTION 'INVALID_PAN' USING ERRCODE = '22023';
  END IF;
  IF upper(trim(p_gstin)) !~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$' THEN
    RAISE EXCEPTION 'INVALID_GSTIN' USING ERRCODE = '22023';
  END IF;

  UPDATE public.sellers
  SET company_name = trim(p_company_name),
      brand_name = trim(p_brand_name),
      gstin = upper(trim(p_gstin)),
      pan = upper(trim(p_pan)),
      status = 'KYC_PENDING',
      updated_at = now()
  WHERE id = v_seller_id
  RETURNING * INTO v_seller;

  RETURN v_seller;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_seller_onboarding(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_seller_onboarding(text,text,text,text) TO authenticated;
