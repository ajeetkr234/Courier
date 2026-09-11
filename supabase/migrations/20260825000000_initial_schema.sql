-- Multi-Courier Logistics Aggregator Schema - Initial Migration

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. IDENTITY & MULTI-TENANCY
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'OWNER', 'ADMIN', 'OPERATIONS', 'WAREHOUSE', 'FINANCE', 'SUPPORT', 'VIEWER',
        'PLATFORM_ADMIN', 'PLATFORM_OPERATIONS', 'PLATFORM_FINANCE', 'PLATFORM_SUPPORT'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE seller_status AS ENUM (
        'DRAFT', 'KYC_PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    brand_name TEXT,
    gstin TEXT UNIQUE,
    pan TEXT NOT NULL,
    status seller_status DEFAULT 'DRAFT',
    rate_card_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role user_role DEFAULT 'OWNER',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(seller_id, user_id)
);

CREATE TABLE IF NOT EXISTS seller_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,
    gst_certificate_url TEXT,
    pan_card_url TEXT,
    address_proof_url TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ORDERS & CUSTOMERS
DO $$ BEGIN
    CREATE TYPE order_source AS ENUM ('MANUAL', 'CSV', 'SHOPIFY', 'WOOCOMMERCE', 'API');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'NEW', 'CONFIRMED', 'READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 
        'OUT_FOR_DELIVERY', 'DELIVERED', 'NDR', 'RTO', 'RETURNED', 'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('PREPAID', 'COD');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id),
    customer_id UUID REFERENCES customers(id),
    external_order_id TEXT,
    source order_source DEFAULT 'MANUAL',
    payment_type payment_type NOT NULL,
    cod_amount NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL,
    weight_kg NUMERIC(6,3) NOT NULL,
    length_cm NUMERIC(6,2), width_cm NUMERIC(6,2), height_cm NUMERIC(6,2),
    shipping_address JSONB NOT NULL,
    current_status order_status DEFAULT 'NEW',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    description TEXT,
    actor_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COURIERS & RATES
CREATE TABLE IF NOT EXISTS couriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courier_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID REFERENCES couriers(id) ON DELETE CASCADE,
    service_code TEXT NOT NULL,
    service_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_slabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id UUID REFERENCES rate_cards(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES couriers(id) ON DELETE CASCADE,
    zone TEXT NOT NULL,
    base_weight_kg NUMERIC(6,3) NOT NULL,
    base_freight_rate NUMERIC(10,2) NOT NULL,
    additional_weight_step_kg NUMERIC(6,3) NOT NULL,
    additional_freight_rate NUMERIC(10,2) NOT NULL,
    cod_flat_fee NUMERIC(10,2) NOT NULL,
    cod_percent_fee NUMERIC(5,2) NOT NULL,
    rto_multiplier NUMERIC(4,2) DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS rate_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES couriers(id),
    base_rate NUMERIC(10,2) NOT NULL,
    cod_charge NUMERIC(10,2) DEFAULT 0,
    surcharges NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_rate NUMERIC(10,2) NOT NULL,
    estimated_days INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SHIPMENTS & TRACKING
DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM (
        'CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 
        'OUT_FOR_DELIVERY', 'DELIVERED', 'NDR', 'RTO_INITIATED', 
        'RTO_IN_TRANSIT', 'RTO_DELIVERED', 'LOST', 'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES couriers(id),
    awb_number TEXT UNIQUE NOT NULL,
    label_url TEXT,
    status shipment_status DEFAULT 'CREATED',
    pickup_date DATE,
    applied_quote_id UUID REFERENCES rate_quotes(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    raw_status TEXT NOT NULL,
    normalized_status shipment_status NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id),
    courier_id UUID REFERENCES couriers(id),
    pickup_date DATE NOT NULL,
    status TEXT DEFAULT 'REQUESTED',
    pickup_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. NDR & RTO
CREATE TABLE IF NOT EXISTS ndr_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    shipment_id UUID UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    attempt_count INT DEFAULT 1,
    last_attempt_at TIMESTAMPTZ,
    status TEXT DEFAULT 'NDR_PENDING',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ndr_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ndr_case_id UUID REFERENCES ndr_cases(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_details JSONB,
    performed_by UUID,
    status TEXT DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RETURNS & EXCHANGES
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    original_order_id UUID REFERENCES orders(id),
    return_reason TEXT NOT NULL,
    return_awb TEXT UNIQUE,
    status TEXT DEFAULT 'REQUESTED',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WALLET & FINANCE
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM (
        'RECHARGE', 'SHIPMENT_DEBIT', 'RTO_DEBIT', 'COD_CHARGE', 
        'WEIGHT_ADJUSTMENT', 'REFUND', 'MANUAL_ADJUSTMENT'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS wallets (
    seller_id UUID PRIMARY KEY REFERENCES sellers(id) ON DELETE CASCADE,
    balance NUMERIC(12,2) DEFAULT 0.00 CHECK (balance >= -5000.00),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    direction TEXT CHECK (direction IN ('CREDIT', 'DEBIT')),
    reference_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID
);

CREATE TABLE IF NOT EXISTS cod_remittances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    remittance_reference TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. WEIGHT DISPUTES
CREATE TABLE IF NOT EXISTS weight_discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    declared_weight_kg NUMERIC(6,3) NOT NULL,
    charged_weight_kg NUMERIC(6,3) NOT NULL,
    excess_charge NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    deadline TIMESTAMPTZ NOT NULL,
    evidence_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. INTEGRATIONS & DEVELOPERS
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['read', 'write'],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    subscribed_events TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. BACKGROUND JOBS & AUDIT
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'QUEUED',
    progress INT DEFAULT 0,
    error_message TEXT,
    payload_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id),
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR HIGH-FREQUENCY QUERIES
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON orders (seller_id, current_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments (awb_number);
CREATE INDEX IF NOT EXISTS idx_shipments_seller_status ON shipments (seller_id, status);
CREATE INDEX IF NOT EXISTS idx_ledger_seller_created ON ledger_entries (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ndr_seller_status ON ndr_cases (seller_id, status);
