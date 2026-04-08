
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value integer NOT NULL,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage own discount codes" ON public.discount_codes
FOR ALL TO authenticated
USING (producer_id = auth.uid())
WITH CHECK (producer_id = auth.uid());

CREATE POLICY "Anyone can read active discount codes" ON public.discount_codes
FOR SELECT TO anon
USING (active = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT SELECT ON public.discount_codes TO anon;

ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason text;
