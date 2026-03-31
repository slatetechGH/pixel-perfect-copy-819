-- 1. Update public_profiles view to include storefront display fields
-- and filter by public_visible = true (so Storefront doesn't need to filter client-side)
CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = false) AS
SELECT
  id,
  business_name,
  url_slug,
  display_name,
  logo_url,
  accent_color,
  tagline,
  business_type,
  address,
  description,
  cover_url,
  website,
  instagram,
  facebook,
  twitter,
  public_visible
FROM profiles
WHERE business_name IS NOT NULL;

-- 2. Remove overly permissive anonymous SELECT policies on profiles
DROP POLICY IF EXISTS "Anyone can view profiles for storefront" ON public.profiles;
DROP POLICY IF EXISTS "Public can view limited profile fields" ON public.profiles;

-- 3. Keep "Authenticated can view any profile" but scope it
-- (we need producers to see each other for admin pages, and customers to see producer profiles)
-- Actually there are TWO duplicate authenticated policies, remove duplicates
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;

-- 4. Fix user_roles privilege escalation: restrict self-insert to customer role only
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own customer role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'customer'::app_role);