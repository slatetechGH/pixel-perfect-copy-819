-- Create a view exposing only safe public columns
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, business_name, tagline, logo_url, cover_url,
         url_slug, accent_color, description, website,
         instagram, facebook, twitter, public_visible
  FROM public.profiles
  WHERE public_visible = true;

-- Grant anon access to the view
GRANT SELECT ON public.public_profiles TO anon;

-- Drop the overly permissive anon policy on the raw profiles table
DROP POLICY IF EXISTS "Public can view visible profiles" ON public.profiles;