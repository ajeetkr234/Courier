-- Courier rates are shared catalogue data. Sellers need read access in order to
-- calculate a quote, while catalogue writes remain restricted to administrators.
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_slabs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_rate_cards_read ON public.rate_cards;
CREATE POLICY authenticated_rate_cards_read
  ON public.rate_cards
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS authenticated_rate_slabs_read ON public.rate_slabs;
CREATE POLICY authenticated_rate_slabs_read
  ON public.rate_slabs
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON TABLE public.rate_cards TO authenticated;
GRANT SELECT ON TABLE public.rate_slabs TO authenticated;

DROP POLICY IF EXISTS platform_admin_rate_cards_write ON public.rate_cards;
CREATE POLICY platform_admin_rate_cards_write
  ON public.rate_cards
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS platform_admin_rate_slabs_write ON public.rate_slabs;
CREATE POLICY platform_admin_rate_slabs_write
  ON public.rate_slabs
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());
