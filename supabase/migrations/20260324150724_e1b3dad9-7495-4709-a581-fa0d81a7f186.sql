-- 1) RPC for customer role assignment (fixes CLIENT_SIDE_AUTH)
CREATE OR REPLACE FUNCTION public.assign_customer_role()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_roles
  SET role = 'customer'
  WHERE user_id = auth.uid() AND role = 'producer';
$$;

-- 2) Fix storage policies: scope writes to owner's files (prefix = auth.uid())
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Auth upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload content-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload drop-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth manage logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth manage covers" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete covers" ON storage.objects;

-- Owner-scoped INSERT policies (file name must start with user's ID)
CREATE POLICY "Owner upload logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner upload covers" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner upload content-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner upload drop-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'drop-images' AND name LIKE (auth.uid()::text || '_%'));

-- Owner-scoped UPDATE policies
CREATE POLICY "Owner manage logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner manage covers" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'covers' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner manage content-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner manage drop-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'drop-images' AND name LIKE (auth.uid()::text || '_%'));

-- Owner-scoped DELETE policies
CREATE POLICY "Owner delete logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner delete covers" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner delete content-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'content-images' AND name LIKE (auth.uid()::text || '_%'));

CREATE POLICY "Owner delete drop-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'drop-images' AND name LIKE (auth.uid()::text || '_%'));

-- Admin override for all storage operations
CREATE POLICY "Admin manage all storage" ON storage.objects FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());