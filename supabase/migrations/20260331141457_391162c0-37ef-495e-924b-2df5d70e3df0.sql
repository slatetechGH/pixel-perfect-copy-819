-- Replace the overly broad "Authenticated can view any profile" policy
-- with two scoped policies: own profile + admin can view all
DROP POLICY IF EXISTS "Authenticated can view any profile" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admins can read all profiles (needed for admin pages)
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());