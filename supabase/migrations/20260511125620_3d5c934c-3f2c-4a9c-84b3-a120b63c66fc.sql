
-- Public can view menu items (so homepage Pre-Order Now / menu page works without login)
DROP POLICY IF EXISTS "Anyone authed can view menu" ON public.menu_items;
CREATE POLICY "Anyone can view menu"
ON public.menu_items FOR SELECT
USING (true);

-- Enable realtime for menu_items and orders
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Category settings (closing time per category)
CREATE TABLE IF NOT EXISTS public.category_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL UNIQUE,
  closing_time time,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view category settings"
ON public.category_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage category settings"
ON public.category_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.category_settings (category, closing_time) VALUES
  ('Breakfast', '11:00'),
  ('Lunch',     '15:00'),
  ('Snacks',    '18:00'),
  ('Drinks',    '20:00')
ON CONFLICT (category) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.category_settings;

-- UPI id on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS upi_id text;
