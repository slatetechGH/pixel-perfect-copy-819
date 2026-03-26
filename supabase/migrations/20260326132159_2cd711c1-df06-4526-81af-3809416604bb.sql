ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS producer_stripe_subscription_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_updated_at timestamptz;