ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS pickup_details jsonb NOT NULL DEFAULT '{}'::jsonb;
