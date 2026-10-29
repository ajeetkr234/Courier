-- Permanently remove only the five explicitly approved demo/test tenants.
DO $$
DECLARE
  target_sellers uuid[] := ARRAY[
    '32d724db-23c4-4cba-a76f-f78e4022194e'::uuid,
    'b4b6b40a-1f60-48a4-808a-2609098d3b9c'::uuid,
    '7d49cbc5-8ea3-4395-8cb4-e6ed2251d41b'::uuid,
    '4f4162bd-39d7-43c4-8ce3-c991bab46693'::uuid,
    'e0aedcd6-3c1f-4194-8a5a-d422f6cb18fa'::uuid
  ];
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.seller_users su
    JOIN auth.users u ON u.id=su.user_id
    WHERE su.seller_id=ANY(target_sellers)
      AND COALESCE(u.raw_app_meta_data->>'role','') LIKE 'PLATFORM_%'
  ) THEN
    RAISE EXCEPTION 'Cleanup refused: target list contains a platform administrator tenant';
  END IF;

  -- These two legacy foreign keys use RESTRICT rather than CASCADE.
  DELETE FROM public.audit_logs WHERE seller_id=ANY(target_sellers);
  DELETE FROM public.provider_operation_logs WHERE seller_id=ANY(target_sellers);

  -- Authentication identities and sessions cascade from the approved users.
  DELETE FROM auth.users u
  WHERE EXISTS (
    SELECT 1 FROM public.seller_users su
    WHERE su.user_id=u.id AND su.seller_id=ANY(target_sellers)
  );

  -- All remaining seller-owned records cascade from the approved tenants.
  DELETE FROM public.sellers WHERE id=ANY(target_sellers);

  IF EXISTS (SELECT 1 FROM public.sellers WHERE id=ANY(target_sellers)) THEN
    RAISE EXCEPTION 'Cleanup verification failed: an approved tenant remains';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE COALESCE(raw_app_meta_data->>'role','') LIKE 'PLATFORM_%'
  ) THEN
    RAISE EXCEPTION 'Cleanup verification failed: no platform administrator remains';
  END IF;
END $$;
