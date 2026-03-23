CREATE OR REPLACE FUNCTION public.get_all_producers()
RETURNS TABLE (id uuid, email text, business_name text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.business_name, p.created_at
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'producer'::app_role
  ORDER BY p.created_at DESC;
END;
$$;