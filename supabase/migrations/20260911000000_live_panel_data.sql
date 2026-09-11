-- Persistence for seller/admin features that were previously client-only.
CREATE TABLE IF NOT EXISTS seller_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  email TEXT NOT NULL, name TEXT NOT NULL, phone TEXT, role user_role NOT NULL DEFAULT 'VIEWER', is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (seller_id, email)
);
CREATE TABLE IF NOT EXISTS integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('SHOPIFY','WOOCOMMERCE','CUSTOM_API')), store_name TEXT NOT NULL, store_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISCONNECTED' CHECK (status IN ('CONNECTED','DISCONNECTED','ERROR')),
  auto_sync_orders BOOLEAN NOT NULL DEFAULT false, sync_tracking BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS branded_tracking_configs (
  seller_id UUID PRIMARY KEY REFERENCES sellers(id) ON DELETE CASCADE, brand_name TEXT NOT NULL DEFAULT '', logo_url TEXT NOT NULL DEFAULT '',
  brand_color TEXT NOT NULL DEFAULT '#4f46e5', support_phone TEXT NOT NULL DEFAULT '', support_email TEXT NOT NULL DEFAULT '',
  promotional_banner_url TEXT NOT NULL DEFAULT '', promotional_banner_link TEXT, discount_coupon_code TEXT, discount_percentage NUMERIC(5,2),
  custom_domain TEXT, help_whatsapp_number TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ndr_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ndr_case_id UUID NOT NULL REFERENCES ndr_cases(id) ON DELETE CASCADE,
  awb_number TEXT NOT NULL, seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE, seller_name TEXT, courier_code TEXT NOT NULL,
  customer_phone TEXT NOT NULL, customer_name TEXT NOT NULL, reason TEXT NOT NULL, evidence_notes TEXT NOT NULL,
  carrier_escalation_status TEXT NOT NULL DEFAULT 'OPEN', admin_notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), resolved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS cod_payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), batch_reference TEXT NOT NULL UNIQUE, seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL, gross_cod_amount NUMERIC(12,2) NOT NULL, freight_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  early_cod_fee NUMERIC(12,2) NOT NULL DEFAULT 0, net_payout_amount NUMERIC(12,2) NOT NULL, shipment_count INT NOT NULL DEFAULT 0,
  bank_name TEXT NOT NULL, account_number_masked TEXT NOT NULL, utr_number TEXT, payout_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', settled_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reconciliation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), awb_number TEXT NOT NULL, seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  courier_code TEXT NOT NULL, courier_remitted_amount NUMERIC(12,2) NOT NULL, platform_expected_amount NUMERIC(12,2) NOT NULL,
  discrepancy_amount NUMERIC(12,2) NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'FLAGGED', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_team_seller ON seller_team_members(seller_id);
CREATE INDEX IF NOT EXISTS idx_integrations_seller ON integration_accounts(seller_id);
CREATE INDEX IF NOT EXISTS idx_escalations_seller_status ON ndr_escalations(seller_id, carrier_escalation_status);
CREATE INDEX IF NOT EXISTS idx_payouts_seller_created ON cod_payout_batches(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_records(status, created_at DESC);
