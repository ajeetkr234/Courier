-- Restore the documented seller QA account after the approved demo-tenant
-- cleanup. This account is used only by the ShipFaster test project.
DO $$
DECLARE
  v_seller_user uuid;
BEGIN
  SELECT id
  INTO v_seller_user
  FROM auth.users
  WHERE lower(email) = 'seller.demo@shipfaster.test';

  IF v_seller_user IS NULL THEN
    v_seller_user := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_seller_user,
      'authenticated', 'authenticated', 'seller.demo@shipfaster.test',
      extensions.crypt('SellerDemo@2026!', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"company_name":"ShipFaster Demo Seller","phone":"+91 9000000001"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_seller_user, 'seller.demo@shipfaster.test',
      jsonb_build_object(
        'sub', v_seller_user::text,
        'email', 'seller.demo@shipfaster.test',
        'email_verified', true
      ),
      'email', now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('SellerDemo@2026!', extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_seller_user;
  END IF;

  -- The auth-user trigger creates the tenant and membership. Make the QA
  -- seller immediately usable in the dashboard.
  UPDATE public.sellers AS s
  SET status = 'ACTIVE'
  FROM public.seller_users AS su
  WHERE su.seller_id = s.id
    AND su.user_id = v_seller_user;
END $$;
