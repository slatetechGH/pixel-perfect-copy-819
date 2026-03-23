-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('drop-images', 'drop-images', true) ON CONFLICT (id) DO NOTHING;

-- Public read access for all buckets
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'logos');
CREATE POLICY "Public read covers" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'covers');
CREATE POLICY "Public read content-images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'content-images');
CREATE POLICY "Public read drop-images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'drop-images');

-- Authenticated users can upload to all buckets
CREATE POLICY "Auth upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Auth upload covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');
CREATE POLICY "Auth upload content-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-images');
CREATE POLICY "Auth upload drop-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'drop-images');

-- Authenticated users can update/delete their own uploads
CREATE POLICY "Auth manage logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Auth manage covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'covers');
CREATE POLICY "Auth delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Auth delete covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers');

-- Admin override policies on data tables
-- Plans: admin can manage all
DROP POLICY IF EXISTS "Admins can manage all plans" ON public.plans;
CREATE POLICY "Admins can manage all plans" ON public.plans FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- Content: admin can manage all
DROP POLICY IF EXISTS "Admins can manage all content" ON public.content;
CREATE POLICY "Admins can manage all content" ON public.content FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- Drops: admin can manage all
DROP POLICY IF EXISTS "Admins can manage all drops" ON public.drops;
CREATE POLICY "Admins can manage all drops" ON public.drops FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- Subscribers: admin can manage all
DROP POLICY IF EXISTS "Admins can manage all subscribers" ON public.subscribers;
CREATE POLICY "Admins can manage all subscribers" ON public.subscribers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- Profiles: admin can update all (select already exists)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);