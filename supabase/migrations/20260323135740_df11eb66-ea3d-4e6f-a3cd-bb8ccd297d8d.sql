-- Drop and recreate all leads RLS policies for clean state
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Public can insert validated leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view own data" ON public.leads;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can insert leads
CREATE POLICY "Anyone can submit a lead"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin users can read all leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);

-- Admin users can update leads
CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);

-- Admin users can delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);

-- Backfill any auth.users missing from leads
INSERT INTO public.leads (email, type, status, created_at)
SELECT u.email, 'signup', 'new', u.created_at
FROM auth.users u
WHERE u.email NOT IN (SELECT email FROM public.leads WHERE email IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Create/replace safety-net trigger
CREATE OR REPLACE FUNCTION public.capture_new_user_as_lead()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.leads (email, type, status, created_at)
  VALUES (NEW.email, 'signup', 'new', NOW())
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_user_capture_lead ON auth.users;
CREATE TRIGGER on_new_user_capture_lead
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_new_user_as_lead();