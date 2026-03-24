ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
UPDATE public.profiles SET display_name = 'Noah' WHERE email = 'sales@slatetech.co.uk';
UPDATE public.profiles SET business_name = 'Slate HQ' WHERE email = 'sales@slatetech.co.uk';