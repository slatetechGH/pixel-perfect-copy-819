
-- Add columns to subscribers table for customer account management
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS current_period_start timestamptz;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- RLS: Customers can view their own subscription
CREATE POLICY "Customers can view own subscription"
ON public.subscribers
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- RLS: Customers can view their own collections via subscriber link
CREATE POLICY "Customers can view own collections"
ON public.collections
FOR SELECT TO authenticated
USING (subscriber_id IN (
  SELECT id FROM public.subscribers WHERE user_id = auth.uid()
));
