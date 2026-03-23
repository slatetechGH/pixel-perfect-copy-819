
-- Backfill leads from auth.users that don't already exist
INSERT INTO public.leads (email, type, status, created_at)
SELECT u.email, 'signup', 'new', u.created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads l WHERE l.email = u.email AND l.type = 'signup'
);

-- Update handle_new_user to also capture a lead row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'producer');

  -- Also capture as a lead (safety net)
  INSERT INTO public.leads (email, type, status, created_at)
  VALUES (NEW.email, 'signup', 'new', NEW.created_at)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;
