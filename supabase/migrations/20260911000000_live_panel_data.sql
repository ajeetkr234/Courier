-- Persistence for seller/admin features that were previously client-only.
CREATE TABLE IF NOT EXISTS seller_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'VIEWER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (seller_id, email)
);

CREATE TABLE IF NOT EXISTS integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('SHOPIFY','WOOCOMMERCE','CUSTOM_API')),
  store_name TEXT NOT NULL,
  store_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISCONNECTED' CHECK (status IN ('CONNECTED','DISCONNECTED','ERROR')),
  auto_sync_orders BOOLEAN NOT NULL DEFAULT false,
  sync_tracking BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branded_tracking_configs (
  seller_id UUID PRIMARY KEY REFERENCES sellers(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  brand_color TEXT NOT NULL DEFAULT '#4f46e5',
  support_phone TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  promotional_banner_url TEXT NOT NULL DEFAULT '',
  promotional_banner_link TEXT,
  discount_coupon_code TEXT,
  discount_percentage NUMERIC(5,2),
  custom_domain TEXT,
  help_whatsapp_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ndr_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ndr_case_id UUID REFERENCES ndr_cases(id) ON DELETE CASCADE,
  awb_number TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  seller_name TEXT,
  courier_code TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_notes TEXT NOT NULL,
  carrier_escalation_status TEXT NOT NULL DEFAULT 'OPEN',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cod_payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_reference TEXT NOT NULL UNIQUE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  gross_cod_amount NUMERIC(12,2) NOT NULL,
  freight_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  early_cod_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_payout_amount NUMERIC(12,2) NOT NULL,
  shipment_count INT NOT NULL DEFAULT 0,
  bank_name TEXT NOT NULL,
  account_number_masked TEXT NOT NULL,
  utr_number TEXT,
  payout_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awb_number TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  courier_code TEXT NOT NULL,
  courier_remitted_amount NUMERIC(12,2) NOT NULL,
  platform_expected_amount NUMERIC(12,2) NOT NULL,
  discrepancy_amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'FLAGGED',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_seller ON seller_team_members(seller_id);
CREATE INDEX IF NOT EXISTS idx_integrations_seller ON integration_accounts(seller_id);
CREATE INDEX IF NOT EXISTS idx_escalations_seller_status ON ndr_escalations(seller_id, carrier_escalation_status);
CREATE INDEX IF NOT EXISTS idx_payouts_seller_created ON cod_payout_batches(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_records(status, created_at DESC);

-- Grants for Supabase roles (public client anon & authenticated access)
GRANT ALL ON TABLE seller_team_members TO anon, authenticated, service_role;
GRANT ALL ON TABLE integration_accounts TO anon, authenticated, service_role;
GRANT ALL ON TABLE branded_tracking_configs TO anon, authenticated, service_role;
GRANT ALL ON TABLE ndr_escalations TO anon, authenticated, service_role;
GRANT ALL ON TABLE cod_payout_batches TO anon, authenticated, service_role;
GRANT ALL ON TABLE reconciliation_records TO anon, authenticated, service_role;

-- Seed default initial records for primary live seller
INSERT INTO seller_team_members (seller_id, email, name, phone, role, is_active)
VALUES
  ('32d724db-23c4-4cba-a76f-f78e4022194e', 'seller@shipfaster.local', 'Apex Admin', '+91 98765 43210', 'OWNER', true),
  ('32d724db-23c4-4cba-a76f-f78e4022194e', 'ops.lead@apexretail.in', 'Vikram Logistics Lead', '+91 98221 00293', 'OPERATIONS', true),
  ('32d724db-23c4-4cba-a76f-f78e4022194e', 'finance@apexretail.in', 'Neha Finance Desk', '+91 98110 39281', 'FINANCE', true)
ON CONFLICT (seller_id, email) DO NOTHING;

INSERT INTO integration_accounts (seller_id, platform, store_name, store_url, status, auto_sync_orders, sync_tracking)
VALUES
  ('32d724db-23c4-4cba-a76f-f78e4022194e', 'SHOPIFY', 'Apex Retail Official Store', 'https://apex-retail.myshopify.com', 'CONNECTED', true, true),
  ('32d724db-23c4-4cba-a76f-f78e4022194e', 'WOOCOMMERCE', 'Apex Outlet Hub', 'https://outlet.apexretail.store', 'DISCONNECTED', false, true)
ON CONFLICT DO NOTHING;

INSERT INTO branded_tracking_configs (seller_id, brand_name, logo_url, brand_color, support_phone, support_email, promotional_banner_url, promotional_banner_link, discount_coupon_code, discount_percentage, custom_domain, help_whatsapp_number)
VALUES
  ('32d724db-23c4-4cba-a76f-f78e4022194e', 'Apex Retail', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80', '#4f46e5', '+91 98765 43210', 'support@apexretail.store', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80', 'https://apexretail.store/festive-sale', 'FASTSHIP10', 10.00, 'track.apexretail.store', '+91 98765 43210')
ON CONFLICT (seller_id) DO NOTHING;

INSERT INTO cod_payout_batches (batch_reference, seller_id, seller_name, gross_cod_amount, freight_deductions, early_cod_fee, net_payout_amount, shipment_count, bank_name, account_number_masked, utr_number, payout_mode, status, settled_at)
VALUES
  ('COD-REM-20260908-01', '32d724db-23c4-4cba-a76f-f78e4022194e', 'Apex Retail', 48500.00, 6240.00, 582.00, 41678.00, 26, 'HDFC Bank Ltd', '•••••••••92834', 'HDFCR92026090800341', 'EARLY_COD_T1', 'SETTLED', now() - INTERVAL '2 days'),
  ('COD-REM-20260910-02', '32d724db-23c4-4cba-a76f-f78e4022194e', 'Apex Retail', 62300.00, 8450.00, 747.60, 53102.40, 34, 'HDFC Bank Ltd', '•••••••••92834', 'HDFCR92026091000874', 'EARLY_COD_T1', 'PROCESSING', null)
ON CONFLICT (batch_reference) DO NOTHING;

INSERT INTO reconciliation_records (awb_number, seller_id, courier_code, courier_remitted_amount, platform_expected_amount, discrepancy_amount, category, status, notes)
VALUES
  ('DEL9948271049', '32d724db-23c4-4cba-a76f-f78e4022194e', 'DELHIVERY', 1850.00, 1950.00, 100.00, 'COD_MISMATCH', 'FLAGGED', 'Courier remitted ₹100 less than collected cash receipt.'),
  ('BLU8829102931', '32d724db-23c4-4cba-a76f-f78e4022194e', 'BLUEDART', 420.00, 340.00, 80.00, 'WEIGHT_DISCREPANCY', 'RESOLVED', 'Charged for 1.5kg deadweight whereas volumetric audit was 0.8kg.')
ON CONFLICT DO NOTHING;
