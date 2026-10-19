INSERT INTO public.products (
  brand,
  name,
  category,
  price,
  status,
  image_url,
  spec,
  stock_quantity
)
SELECT
  demo.brand,
  demo.name,
  demo.category,
  0,
  'demo',
  '',
  'Demo inventory only. Replace with real product details, price, and stock before launch.',
  0
FROM (
  VALUES
    ('Apple', 'DEMO - MacBook Air M2 13-inch', 'laptops'),
    ('Apple', 'DEMO - MacBook Pro 14-inch', 'laptops'),
    ('Dell', 'DEMO - Latitude 5420', 'laptops'),
    ('HP', 'DEMO - EliteBook 840', 'laptops'),
    ('Apple', 'DEMO - AirPods Pro (2nd generation)', 'audio')
) AS demo(brand, name, category)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.products existing
  WHERE existing.brand = demo.brand
    AND existing.name = demo.name
    AND existing.category = demo.category
);
