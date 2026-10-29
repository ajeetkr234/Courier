-- Re-runnable QA accounts for the ShipFaster test project.
-- These credentials are intentionally for testing only and must not be used
-- for a production deployment.
DO $$
DECLARE
  v_seller_user uuid;
  v_admin_user uuid;
BEGIN
  SELECT id INTO v_seller_user FROM auth.users WHERE lower(email) = 'seller.demo@shipfaster.test';
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
      jsonb_build_object('sub', v_seller_user::text, 'email', 'seller.demo@shipfaster.test', 'email_verified', true),
      'email', now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('SellerDemo@2026!', extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()), updated_at = now()
    WHERE id = v_seller_user;
  END IF;

  SELECT id INTO v_admin_user FROM auth.users WHERE lower(email) = 'admin.demo@shipfaster.test';
  IF v_admin_user IS NULL THEN
    v_admin_user := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_admin_user,
      'authenticated', 'authenticated', 'admin.demo@shipfaster.test',
      extensions.crypt('AdminDemo@2026!', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"company_name":"ShipFaster Control Tower","phone":"+91 9000000002"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_admin_user, 'admin.demo@shipfaster.test',
      jsonb_build_object('sub', v_admin_user::text, 'email', 'admin.demo@shipfaster.test', 'email_verified', true),
      'email', now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('AdminDemo@2026!', extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()), updated_at = now()
    WHERE id = v_admin_user;
  END IF;

  -- The standard signup trigger creates tenant records for both users. Keep
  -- the seller test tenant active and elevate only the platform account.
  UPDATE public.sellers s SET status = 'ACTIVE'
  FROM public.seller_users su
  WHERE su.seller_id = s.id AND su.user_id = v_seller_user;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"PLATFORM_ADMIN"}'::jsonb,
      updated_at = now()
  WHERE id = v_admin_user;
END $$;
