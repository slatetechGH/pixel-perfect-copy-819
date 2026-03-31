
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

ALTER TABLE public.admin_meetings ADD COLUMN IF NOT EXISTS lead_id uuid;
ALTER TABLE public.admin_meetings ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30;
ALTER TABLE public.admin_meetings ADD COLUMN IF NOT EXISTS meeting_link text;
ALTER TABLE public.admin_meetings ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled';
