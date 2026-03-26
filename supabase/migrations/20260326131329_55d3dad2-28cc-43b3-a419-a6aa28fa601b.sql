
-- Part 1: Add collections_per_month to plans
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS collections_per_month integer NOT NULL DEFAULT 0;

-- Part 2: Create collections tracking table
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES public.profiles(id) NOT NULL,
  subscriber_id uuid REFERENCES public.subscribers(id) NOT NULL,
  plan_id uuid REFERENCES public.plans(id) NOT NULL,
  collected_at timestamptz NOT NULL DEFAULT now(),
  month_year text NOT NULL,
  notes text,
  marked_by text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage own collections" ON public.collections
FOR ALL TO authenticated
USING (producer_id = auth.uid());

CREATE POLICY "Admins can view all collections" ON public.collections
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;

-- Part 3: Create collection_reminders tracking table
CREATE TABLE public.collection_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES public.profiles(id) NOT NULL,
  sent_date date NOT NULL DEFAULT CURRENT_DATE,
  recipient_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collection_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage own reminders" ON public.collection_reminders
FOR ALL TO authenticated
USING (producer_id = auth.uid());

GRANT SELECT, INSERT ON public.collection_reminders TO authenticated;
