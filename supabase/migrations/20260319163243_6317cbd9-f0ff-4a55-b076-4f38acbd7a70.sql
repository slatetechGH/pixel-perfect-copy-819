
-- Add extra columns to profiles for settings/public page
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS url_slug text,
  ADD COLUMN IF NOT EXISTS public_visible boolean DEFAULT true;

-- ===== LEADS TABLE =====
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('signup', 'contact', 'newsletter')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted')),
  email text NOT NULL,
  name text,
  phone text,
  business_name text,
  business_type text,
  hear_about text,
  message text,
  newsletter boolean,
  website text,
  customer_count text,
  interests text[],
  additional_notes text,
  interested_plan text,
  terms boolean,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anon users can submit leads (marketing forms)
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Authenticated users can view all leads
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
-- Authenticated users can update leads
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
-- Authenticated users can delete leads
CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated USING (true);

-- ===== PLANS TABLE =====
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_num numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  benefits text[] DEFAULT '{}',
  description text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  show_on_public_page boolean NOT NULL DEFAULT true,
  subscriber_limit int,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own plans" ON public.plans FOR ALL TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());

-- ===== DROPS TABLE =====
CREATE TABLE public.drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  total int NOT NULL DEFAULT 10,
  remaining int NOT NULL DEFAULT 10,
  price_num numeric NOT NULL DEFAULT 0,
  drop_date text,
  drop_time text DEFAULT '09:00',
  end_date text,
  end_time text DEFAULT '18:00',
  eligible_plans text[] DEFAULT '{}',
  items jsonb DEFAULT '[]',
  notify boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own drops" ON public.drops FOR ALL TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());

-- ===== CONTENT TABLE =====
CREATE TABLE public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Recipe',
  body text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  tier text DEFAULT 'Free',
  views int DEFAULT 0,
  published_at text,
  ai boolean DEFAULT false,
  prep_time text,
  cook_time text,
  serves text,
  ingredients jsonb DEFAULT '[]',
  method_steps text[] DEFAULT '{}',
  eligible_plans text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own content" ON public.content FOR ALL TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());

-- ===== SUBSCRIBERS TABLE =====
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  joined_at text,
  revenue text DEFAULT '£0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subscribers" ON public.subscribers FOR ALL TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());

-- ===== CONVERSATIONS TABLE =====
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  plan text NOT NULL,
  avatar text DEFAULT '',
  unread boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());

-- ===== MESSAGES TABLE =====
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  text text NOT NULL,
  sender text NOT NULL,
  sent_at text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Users can manage messages in their own conversations
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.producer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.producer_id = auth.uid()));

-- ===== DEMO CONFIGS TABLE =====
CREATE TABLE public.demo_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  config jsonb NOT NULL,
  name text DEFAULT 'Untitled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own demo configs" ON public.demo_configs FOR ALL TO authenticated USING (producer_id = auth.uid()) WITH CHECK (producer_id = auth.uid());
