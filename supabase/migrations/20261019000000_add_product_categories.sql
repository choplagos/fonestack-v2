ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'phones';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_check
      CHECK (category IN ('phones', 'laptops', 'audio'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS products_category_idx
  ON public.products (category);
