CREATE OR REPLACE FUNCTION public.add_admin_user_by_email(
  p_email text,
  p_name text,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_email text := lower(btrim(p_email));
  v_user_id uuid;
BEGIN
  IF public.is_owner() IS NOT TRUE THEN
    RAISE EXCEPTION 'Owner access required' USING ERRCODE = '42501';
  END IF;

  IF v_email = '' OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Enter a valid email address' USING ERRCODE = '22023';
  END IF;

  IF p_role IS NULL OR p_role NOT IN ('owner', 'staff', 'technician') THEN
    RAISE EXCEPTION 'Choose a valid admin role' USING ERRCODE = '22023';
  END IF;

  SELECT users.id
  INTO v_user_id
  FROM auth.users AS users
  WHERE lower(users.email) = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Create this person in Supabase Authentication before adding them here' USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = v_email) THEN
    RAISE EXCEPTION 'This email is already on the admin allowlist' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.admin_users (id, email, name, role)
  VALUES (v_user_id, v_email, nullif(btrim(p_name), ''), p_role);

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.add_admin_user_by_email(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_admin_user_by_email(text, text, text) TO authenticated;
