export const PRODUCT_CATEGORIES = [
  { id: 'phones', label: 'Phones' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'audio', label: 'Audio' },
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['id']

export function getProductCategory(category: unknown): ProductCategory {
  if (category === 'laptops' || category === 'audio' || category === 'phones') {
    return category
  }
  return 'phones'
}
