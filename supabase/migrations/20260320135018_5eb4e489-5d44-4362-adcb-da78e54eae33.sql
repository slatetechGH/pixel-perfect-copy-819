-- Replace overly permissive public INSERT policy on leads with validated anonymous inserts
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

CREATE POLICY "Public can insert validated leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(btrim(email)) BETWEEN 5 AND 254
  AND position('@' IN email) > 1
  AND type IN ('signup', 'contact', 'newsletter')
);