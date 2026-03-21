
-- Customer profiles table
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, producer_id)
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Customers can read/update their own row
CREATE POLICY "Customers can read own profile"
  ON public.customer_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Customers can update own profile"
  ON public.customer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Customers can insert own profile"
  ON public.customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Producers can read their own customers
CREATE POLICY "Producers can read own customers"
  ON public.customer_profiles FOR SELECT
  TO authenticated
  USING (producer_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role manages customer_profiles"
  ON public.customer_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public SELECT policies for storefront browsing (anon + authenticated)
-- Profiles: public can read profiles that are publicly visible
CREATE POLICY "Public can view visible profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (public_visible = true);

-- Plans: public can read active plans that are shown on public page
CREATE POLICY "Public can view public plans"
  ON public.plans FOR SELECT
  TO anon
  USING (active = true AND show_on_public_page = true);

-- Drops: public can read non-draft drops
CREATE POLICY "Public can view published drops"
  ON public.drops FOR SELECT
  TO anon
  USING (status IN ('scheduled', 'live', 'ended'));

-- Content: public can read published content
CREATE POLICY "Public can view published content"
  ON public.content FOR SELECT
  TO anon
  USING (status = 'published');
