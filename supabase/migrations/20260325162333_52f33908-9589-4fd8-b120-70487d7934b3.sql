ALTER TABLE public.profiles ALTER COLUMN commission_percentage SET DEFAULT 8;
UPDATE public.profiles SET commission_percentage = 8 WHERE commission_percentage = 6;