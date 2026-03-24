-- Broadcasts table
CREATE TABLE public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES public.profiles(id) NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  target_segments jsonb NOT NULL DEFAULT '[]',
  recipient_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage own broadcasts" ON public.broadcasts
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

CREATE POLICY "Admins can view all broadcasts" ON public.broadcasts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Broadcast recipients table
CREATE TABLE public.broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid REFERENCES public.broadcasts(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can view own broadcast recipients" ON public.broadcast_recipients
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.broadcasts
    WHERE broadcasts.id = broadcast_recipients.broadcast_id
    AND broadcasts.producer_id = auth.uid()
  )
);

CREATE POLICY "Producers can insert own broadcast recipients" ON public.broadcast_recipients
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.broadcasts
    WHERE broadcasts.id = broadcast_recipients.broadcast_id
    AND broadcasts.producer_id = auth.uid()
  )
);

-- Contacts table
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES public.profiles(id) NOT NULL,
  email text NOT NULL,
  name text,
  phone text,
  source text NOT NULL DEFAULT 'imported',
  status text NOT NULL DEFAULT 'imported',
  plan_id uuid REFERENCES public.plans(id),
  invited_at timestamptz,
  subscribed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(producer_id, email)
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage own contacts" ON public.contacts
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

CREATE POLICY "Admins can view all contacts" ON public.contacts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);