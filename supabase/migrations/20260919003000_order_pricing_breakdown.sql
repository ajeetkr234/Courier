ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pricing_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb;
