
-- Fix: the old policy name was kept, drop it explicitly
DROP POLICY IF EXISTS "Public can view public plans" ON public.plans;

-- Also fix drops: authenticated customers can't see drops on storefront
DROP POLICY IF EXISTS "Public can view published drops" ON public.drops;
CREATE POLICY "Anyone can view published drops" ON public.drops
  FOR SELECT
  USING (status = ANY (ARRAY['scheduled'::text, 'live'::text, 'ended'::text]));

-- Also fix content: authenticated customers can't see content on storefront
DROP POLICY IF EXISTS "Public can view published content" ON public.content;
CREATE POLICY "Anyone can view published content" ON public.content
  FOR SELECT
  USING (status = 'published'::text);
