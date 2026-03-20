-- Add Stripe Connect fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_connect_status text NOT NULL DEFAULT 'not_connected',
  ADD COLUMN IF NOT EXISTS commission_percentage integer NOT NULL DEFAULT 6;

-- Add stripe_price_id to plans
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text,
  stripe_customer_id text,
  customer_email text NOT NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  amount_paid integer NOT NULL DEFAULT 0,
  slate_commission_earned integer NOT NULL DEFAULT 0,
  producer_net integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can view own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (producer_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  transaction_type text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  stripe_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can view own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (producer_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages transactions"
  ON public.transactions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Allow admins to read all profiles for admin dashboard
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));