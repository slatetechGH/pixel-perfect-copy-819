CREATE TABLE public.admin_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  producer_id uuid REFERENCES public.profiles(id),
  title text NOT NULL,
  meeting_type text NOT NULL DEFAULT 'other',
  date timestamptz NOT NULL,
  notes text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage meetings" ON public.admin_meetings
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_meetings TO authenticated;