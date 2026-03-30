
-- Fix plans RLS: allow authenticated users to also view active public plans
DROP POLICY IF EXISTS "Public can view public plans" ON public.plans;
CREATE POLICY "Anyone can view active public plans" ON public.plans
  FOR SELECT
  USING (active = true AND show_on_public_page = true);

-- Fix profiles RLS: allow anyone to read profiles (needed for storefront)
-- Keep existing specific policies, add a broad read for public storefront use
CREATE POLICY "Anyone can view profiles for storefront" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated customers also need to read producer profiles on storefront
CREATE POLICY "Authenticated can view any profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop the now-redundant narrower policies
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
