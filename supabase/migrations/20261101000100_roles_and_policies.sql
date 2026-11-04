CREATE OR REPLACE FUNCTION public.admin_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.role
  FROM public.admin_users AS au
  WHERE lower(au.email) = lower(auth.jwt() ->> 'email')
    AND au.role IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.admin_role() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    AND public.admin_role() NOT IN ('staff', 'technician');
$$;

CREATE OR REPLACE FUNCTION public.can_write()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    AND public.admin_role() <> 'technician';
$$;

REVOKE ALL ON FUNCTION public.admin_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_write() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write() TO authenticated;

DROP POLICY IF EXISTS "owner only delete products" ON public.products;
CREATE POLICY "owner only delete products"
  ON public.products AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "owner only delete invoices" ON public.invoices;
CREATE POLICY "owner only delete invoices"
  ON public.invoices AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "owner only delete trade in requests" ON public.trade_in_requests;
CREATE POLICY "owner only delete trade in requests"
  ON public.trade_in_requests AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "owner only delete device requests" ON public.device_requests;
CREATE POLICY "owner only delete device requests"
  ON public.device_requests AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "owner only insert settings" ON public.settings;
CREATE POLICY "owner only insert settings"
  ON public.settings AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "owner only update settings" ON public.settings;
CREATE POLICY "owner only update settings"
  ON public.settings AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "owner only delete settings" ON public.settings;
CREATE POLICY "owner only delete settings"
  ON public.settings AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "owner only insert admin users" ON public.admin_users;
CREATE POLICY "owner only insert admin users"
  ON public.admin_users AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "owner only update admin users" ON public.admin_users;
CREATE POLICY "owner only update admin users"
  ON public.admin_users AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "owner only delete admin users" ON public.admin_users;
CREATE POLICY "owner only delete admin users"
  ON public.admin_users AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "writers insert products" ON public.products;
CREATE POLICY "writers insert products"
  ON public.products AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "writers update products" ON public.products;
CREATE POLICY "writers update products"
  ON public.products AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.can_write())
  WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "writers insert invoices" ON public.invoices;
CREATE POLICY "writers insert invoices"
  ON public.invoices AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.can_write());

DROP POLICY IF EXISTS "writers update invoices" ON public.invoices;
CREATE POLICY "writers update invoices"
  ON public.invoices AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.can_write())
  WITH CHECK (public.can_write());
