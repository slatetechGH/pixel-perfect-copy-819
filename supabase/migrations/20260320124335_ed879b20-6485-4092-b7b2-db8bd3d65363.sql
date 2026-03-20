-- Restrict get_user_role to only return data for the calling user (or admins)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
    AND (_user_id = auth.uid() OR public.is_admin())
  ORDER BY
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'producer' THEN 2
      WHEN 'customer' THEN 3
    END
  LIMIT 1
$$;