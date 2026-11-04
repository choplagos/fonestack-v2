CREATE OR REPLACE VIEW public.customer_directory
WITH (security_invoker = true)
AS
WITH customer_events AS (
  SELECT
    CASE
      WHEN left(digits.phone_digits, 1) = '0'
        THEN '234' || substr(digits.phone_digits, 2)
      ELSE digits.phone_digits
    END AS customer_key,
    inv.customer_name AS name,
    inv.customer_phone AS phone,
    inv.customer_email AS email,
    inv.created_at AS activity_at,
    1::bigint AS invoice_count,
    coalesce(inv.total_amount, 0)::numeric AS total_billed,
    coalesce(inv.deposit_amount, 0)::numeric AS total_paid,
    coalesce(inv.amount_due, 0)::numeric AS balance_due,
    0::bigint AS trade_in_count,
    0::bigint AS request_count
  FROM public.invoices AS inv
  CROSS JOIN LATERAL (
    SELECT regexp_replace(coalesce(inv.customer_phone, ''), '\D', '', 'g') AS phone_digits
  ) AS digits
  WHERE inv.status IS DISTINCT FROM 'cancelled'

  UNION ALL

  SELECT
    CASE
      WHEN left(digits.phone_digits, 1) = '0'
        THEN '234' || substr(digits.phone_digits, 2)
      ELSE digits.phone_digits
    END,
    tr.customer_name,
    tr.customer_phone,
    NULL::text,
    tr.created_at,
    0::bigint,
    0::numeric,
    0::numeric,
    0::numeric,
    1::bigint,
    0::bigint
  FROM public.trade_in_requests AS tr
  CROSS JOIN LATERAL (
    SELECT regexp_replace(coalesce(tr.customer_phone, ''), '\D', '', 'g') AS phone_digits
  ) AS digits

  UNION ALL

  SELECT
    CASE
      WHEN left(digits.phone_digits, 1) = '0'
        THEN '234' || substr(digits.phone_digits, 2)
      ELSE digits.phone_digits
    END,
    dr.customer_name,
    dr.phone,
    NULL::text,
    dr.created_at,
    0::bigint,
    0::numeric,
    0::numeric,
    0::numeric,
    0::bigint,
    1::bigint
  FROM public.device_requests AS dr
  CROSS JOIN LATERAL (
    SELECT regexp_replace(coalesce(dr.phone, ''), '\D', '', 'g') AS phone_digits
  ) AS digits
),
keyed_events AS (
  SELECT *
  FROM customer_events
  WHERE customer_key <> ''
)
SELECT
  customer_key AS key,
  (array_agg(nullif(btrim(name), '') ORDER BY activity_at DESC NULLS LAST)
    FILTER (WHERE nullif(btrim(name), '') IS NOT NULL))[1] AS name,
  (array_agg(nullif(btrim(phone), '') ORDER BY activity_at DESC NULLS LAST)
    FILTER (WHERE nullif(btrim(phone), '') IS NOT NULL))[1] AS phone,
  (array_agg(nullif(btrim(email), '') ORDER BY activity_at DESC NULLS LAST)
    FILTER (WHERE nullif(btrim(email), '') IS NOT NULL))[1] AS email,
  sum(invoice_count)::bigint AS invoice_count,
  sum(total_billed)::numeric AS total_billed,
  sum(total_paid)::numeric AS total_paid,
  sum(balance_due)::numeric AS balance_due,
  sum(trade_in_count)::bigint AS trade_in_count,
  sum(request_count)::bigint AS request_count,
  min(activity_at) AS first_seen,
  max(activity_at) AS last_activity
FROM keyed_events
GROUP BY customer_key;

GRANT SELECT ON public.customer_directory TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_search(q text)
RETURNS TABLE(kind text, id text, title text, subtitle text, url text)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_query text := btrim(coalesce(q, ''));
BEGIN
  IF char_length(v_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM (
    (
      SELECT
        'invoice'::text,
        i.id::text,
        i.invoice_number::text,
        concat_ws(' · ', i.customer_name, i.customer_phone),
        '/admin/invoices/' || i.id::text
      FROM public.invoices AS i
      WHERE i.invoice_number ILIKE '%' || v_query || '%'
        OR i.customer_name ILIKE '%' || v_query || '%'
        OR i.customer_phone ILIKE '%' || v_query || '%'
        OR i.imei ILIKE '%' || v_query || '%'
      ORDER BY i.created_at DESC
      LIMIT 6
    )
    UNION ALL
    (
      SELECT
        'product'::text,
        p.id::text,
        p.name::text,
        concat_ws(' · ', p.brand, p.imei),
        '/admin/inventory?q=' || replace(p.name, ' ', '%20')
      FROM public.products AS p
      WHERE p.name ILIKE '%' || v_query || '%'
        OR p.brand ILIKE '%' || v_query || '%'
        OR p.imei ILIKE '%' || v_query || '%'
      ORDER BY p.name
      LIMIT 6
    )
    UNION ALL
    (
      SELECT
        'customer'::text,
        c.key::text,
        coalesce(c.name, c.phone, c.key)::text,
        c.phone::text,
        '/admin/customers/' || c.key::text
      FROM public.customer_directory AS c
      WHERE c.name ILIKE '%' || v_query || '%'
        OR c.phone ILIKE '%' || v_query || '%'
        OR c.email ILIKE '%' || v_query || '%'
      ORDER BY c.last_activity DESC NULLS LAST
      LIMIT 6
    )
    UNION ALL
    (
      SELECT
        'trade_in'::text,
        tr.id::text,
        concat_ws(' ', tr.brand, tr.model),
        concat_ws(' · ', tr.customer_name, tr.customer_phone),
        '/admin/trade-ins?focus=' || tr.id::text
      FROM public.trade_in_requests AS tr
      WHERE tr.customer_name ILIKE '%' || v_query || '%'
        OR tr.customer_phone ILIKE '%' || v_query || '%'
        OR tr.model ILIKE '%' || v_query || '%'
      ORDER BY tr.created_at DESC NULLS LAST
      LIMIT 6
    )
    UNION ALL
    (
      SELECT
        'request'::text,
        dr.id::text,
        coalesce(dr.requested_device, 'Device request')::text,
        concat_ws(' · ', dr.customer_name, dr.phone),
        '/admin/leads'
      FROM public.device_requests AS dr
      WHERE dr.customer_name ILIKE '%' || v_query || '%'
        OR dr.phone ILIKE '%' || v_query || '%'
        OR dr.requested_device ILIKE '%' || v_query || '%'
      ORDER BY dr.created_at DESC NULLS LAST
      LIMIT 6
    )
  ) AS matches;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_search(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_search(text) TO authenticated;

CREATE OR REPLACE VIEW public.tradein_performance
WITH (security_invoker = true)
AS
WITH first_sales AS (
  SELECT DISTINCT ON (i.product_id)
    i.product_id,
    i.unit_price AS sold_price,
    i.created_at AS sold_at
  FROM public.invoices AS i
  WHERE i.product_id IS NOT NULL
    AND i.status IS DISTINCT FROM 'cancelled'
  ORDER BY i.product_id, i.created_at ASC, i.id ASC
)
SELECT
  tr.id,
  tr.brand,
  tr.model,
  tr.estimate_low,
  tr.estimate_high,
  (tr.estimate_low + tr.estimate_high) / 2.0 AS estimate_mid,
  tr.final_offer,
  CASE
    WHEN tr.estimate_low IS NULL OR tr.estimate_high IS NULL
      OR (tr.estimate_low + tr.estimate_high) = 0
      OR tr.final_offer IS NULL
      THEN NULL
    ELSE ((tr.final_offer - ((tr.estimate_low + tr.estimate_high) / 2.0))
      / ((tr.estimate_low + tr.estimate_high) / 2.0)) * 100
  END AS offer_vs_estimate_pct,
  p.price AS listed_price,
  s.sold_price,
  s.sold_at,
  CASE
    WHEN s.sold_at IS NULL OR tr.created_at IS NULL THEN NULL
    ELSE s.sold_at::date - tr.created_at::date
  END AS days_to_sell,
  CASE
    WHEN s.sold_price IS NULL OR tr.final_offer IS NULL THEN NULL
    ELSE s.sold_price - tr.final_offer
  END AS profit
FROM public.trade_in_requests AS tr
LEFT JOIN public.products AS p ON p.id = tr.converted_product_id
LEFT JOIN first_sales AS s ON s.product_id = tr.converted_product_id
WHERE tr.converted_product_id IS NOT NULL;

GRANT SELECT ON public.tradein_performance TO authenticated;
