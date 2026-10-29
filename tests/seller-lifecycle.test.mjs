import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('new sellers remain blocked until profile submission and admin approval', () => {
  const auth = read('src/services/supabaseAuth.ts');
  const eligibility = read('src/services/sellerEligibility.ts');
  const registration = read('src/features/auth/RegisterPage.tsx');
  assert.match(auth, /status: 'DRAFT'/);
  assert.doesNotMatch(auth, /status: 'ACTIVE'[\s\S]{0,300}Create a new seller record/);
  assert.match(eligibility, /company_name/);
  assert.match(eligibility, /seller\.pan/);
  assert.match(eligibility, /seller\.status !== 'ACTIVE'/);
  assert.match(registration, /navigate\('\/onboarding'\)/);
});

test('new seller hydration does not inject another tenant dummy data', () => {
  const store = read('src/services/store.ts');
  const auth = read('src/services/supabaseAuth.ts');
  const tracking = read('src/features/tracking/BrandedTrackingCustomizerPage.tsx');
  const settings = read('src/features/settings/SettingsPage.tsx');
  const onboarding = read('src/features/onboarding/OnboardingPage.tsx');
  assert.match(store, /warehouses: liveWarehouses \|\| \[\]/);
  assert.match(store, /warehouses: \[\]/);
  assert.doesNotMatch(store, /brandedTrackingConfig: DEFAULT_BRANDED_TRACKING/);
  assert.doesNotMatch(auth, /\+91 9876543210/);
  assert.doesNotMatch(tracking, /support@apexretail\.store/);
  assert.doesNotMatch(tracking, /track\.apexretail\.store/);
  assert.doesNotMatch(settings, /dispatch@apexretail\.store/);
  assert.match(settings, /useState\(sellerBankAccount\?\.account_number \|\| ''\)/);
  assert.doesNotMatch(onboarding, /dispatch@seller\.store/);
  assert.doesNotMatch(onboarding, /32d724db-23c4-4cba-a76f-f78e4022194e/);
});

test('onboarding persists through a tenant-scoped server function', () => {
  const migration = read('supabase/migrations/20260920001000_seller_onboarding_submission.sql');
  const onboarding = read('src/features/onboarding/OnboardingPage.tsx');
  assert.match(migration, /WHERE user_id = auth\.uid\(\)/);
  assert.match(migration, /status = 'KYC_PENDING'/);
  assert.match(migration, /INVALID_PAN/);
  assert.match(migration, /INVALID_GSTIN/);
  assert.match(onboarding, /await submitSellerOnboarding/);
});

test('pickup verification is required by the database and exposed in settings', () => {
  const orderGuard = read('supabase/migrations/20260919002000_pickup_otp_verification.sql');
  const settings = read('src/features/settings/SettingsPage.tsx');
  const createOrder = read('src/features/orders/CreateOrderPage.tsx');
  const warehouses = read('src/services/supabaseWarehouses.ts');
  assert.match(orderGuard, /PICKUP_ADDRESS_NOT_VERIFIED/);
  assert.match(settings, /sendPickupOtp/);
  assert.match(settings, /verifyPickupOtp/);
  assert.match(settings, /Verify pickup/);
  assert.match(createOrder, /Edit pickup address/);
  assert.match(createOrder, /updatePickupDetailsInSupabase/);
  assert.match(warehouses, /address_verified_at: null/);
  assert.match(warehouses, /phone_verified_at: null/);
  const verificationFunction = read('supabase/functions/verify-pickup-address/index.ts');
  assert.match(verificationFunction, /seller\.demo@shipfaster\.test/);
  assert.match(verificationFunction, /testOtp:otp/);
});

test('manual order creation restores a seller-scoped unfinished draft', () => {
  const createOrder = read('src/features/orders/CreateOrderPage.tsx');
  assert.match(createOrder, /shipfaster_order_draft_v1_/);
  assert.match(createOrder, /Your unfinished order draft was restored/);
  assert.match(createOrder, /localStorage\.removeItem\(draftStorageKey\)/);
  assert.match(createOrder, /Discard saved draft/);
});

test('manual order layout keeps payment with products and rates before packaging guidance', () => {
  const createOrder = read('src/features/orders/CreateOrderPage.tsx');
  const products = createOrder.indexOf('Products in Order');
  const payment = createOrder.indexOf('Payment &amp; Pickup Options');
  const calculator = createOrder.indexOf('Delivery Price Calculator');
  const packaging = createOrder.indexOf('Pack like a pro');
  assert.ok(products >= 0 && payment > products);
  assert.ok(calculator >= 0 && packaging > calculator);
});

test('wallet recharge requires admin approval and verification triggers support both record shapes', () => {
  const migration = read('supabase/migrations/20260920007000_wallet_recharge_approval_and_trigger_fix.sql');
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /UPDATE public\.wallets/);
  assert.match(migration, /INSERT INTO public\.ledger_entries/);
  assert.match(migration, /to_jsonb\(NEW\)/);
  assert.match(migration, /is_platform_admin/);
  assert.match(migration, /status<>'PENDING'/);
  const admin = read('src/admin/sellers/AdminSellersPage.tsx');
  assert.match(admin, /Verify &amp; Credit/);
});

test('manual wallet recharge deducts 18 percent GST from the amount paid', () => {
  const migration = read('supabase/migrations/20260921001000_wallet_recharge_gst_deduction.sql');
  const wallet = read('src/features/wallet/WalletPage.tsx');
  assert.match(migration, /v_gst:=round\(v_paid\*0\.18,2\)/);
  assert.match(migration, /v_credit:=v_paid-v_gst/);
  assert.match(migration, /amount,paid_amount,gst_amount/);
  assert.match(wallet, /Bank UTR \/ Payment Reference/);
  assert.match(wallet, /Wallet Credit After GST/);
});

test('weight dispute evidence and admin refunds are persisted atomically', () => {
  const migration = read('supabase/migrations/20260921000000_atomic_weight_dispute_arbitration.sql');
  const disputes = read('src/services/supabaseDisputes.ts');
  const store = read('src/services/store.ts');
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /INSERT INTO public\.ledger_entries/);
  assert.match(migration, /UPDATE public\.wallets SET balance=balance\+v_dispute\.excess_charge/);
  assert.match(migration, /is_platform_admin/);
  assert.match(migration, /status='RESOLVED'/);
  assert.match(disputes, /evidence_scale_url/);
  assert.match(disputes, /arbitrate_weight_dispute/);
  assert.match(store, /await arbitrateWeightDisputeInSupabase/);
});

test('seller cannot enter admin routes and finance submenu is interactive', () => {
  const router = read('src/app/router/index.tsx');
  const layout = read('src/components/layout/SellerLayout.tsx');
  assert.match(router, /admin && !user\.role\.startsWith\('PLATFORM_'\)/);
  assert.match(layout, /onClick=\{\(\) => setFinanceOpen/);
  assert.match(layout, /to="\/app\/wallet"/);
  assert.match(layout, /to="\/app\/cod"/);
  assert.match(layout, /to="\/app\/billing"/);
});

test('tenant policy reset removes legacy permissive policies', () => {
  const migration = read('supabase/migrations/20260920002000_enforce_tenant_policy_reset.sql');
  assert.match(migration, /FROM pg_policies/);
  assert.match(migration, /DROP POLICY %I/);
  assert.match(migration, /FORCE ROW LEVEL SECURITY/);
  assert.match(migration, /id=public\.jwt_seller_id\(\)/);
  assert.match(migration, /seller_id=public\.jwt_seller_id\(\)/);
});
