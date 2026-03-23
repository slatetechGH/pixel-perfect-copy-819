-- Fix the security definer view issue by recreating with security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
  SELECT id, business_name, tagline, logo_url, cover_url,
         url_slug, accent_color, description, website,
         instagram, facebook, twitter, public_visible
  FROM public.profiles
  WHERE public_visible = true;

GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;