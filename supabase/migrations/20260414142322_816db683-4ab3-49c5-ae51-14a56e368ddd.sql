
-- Fix RLS for plans
DROP POLICY IF EXISTS "Producers can manage own plans" ON public.plans;
CREATE POLICY "Producers can manage own plans" ON public.plans
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
CREATE POLICY "Anyone can view active plans" ON public.plans
FOR SELECT
USING (active = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT SELECT ON public.plans TO anon;

-- Fix RLS for drops
DROP POLICY IF EXISTS "Producers can manage own drops" ON public.drops;
CREATE POLICY "Producers can manage own drops" ON public.drops
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drops TO authenticated;

-- Fix RLS for content
DROP POLICY IF EXISTS "Producers can manage own content" ON public.content;
CREATE POLICY "Producers can manage own content" ON public.content
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content TO authenticated;

-- Fix RLS for broadcasts
DROP POLICY IF EXISTS "Producers can manage own broadcasts" ON public.broadcasts;
CREATE POLICY "Producers can manage own broadcasts" ON public.broadcasts
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.broadcasts TO authenticated;
