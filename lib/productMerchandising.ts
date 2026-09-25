export interface MerchandisingProduct {
  brand?: string | null
  image_url?: string | null
}

const DEFAULT_PAGE_SIZE = 12
const IPHONE_PAGE_TARGET = 8

function hasProductImage(product: MerchandisingProduct) {
  return typeof product.image_url === 'string' && product.image_url.trim().length > 0
}

export function isIPhoneProduct(product: MerchandisingProduct) {
  const normalizedBrand = product.brand?.trim().toLowerCase()
  return normalizedBrand === 'apple' || normalizedBrand === 'iphone'
}

function takeProducts(
  source: MerchandisingProduct[],
  count: number,
  selected: Set<MerchandisingProduct>
) {
  const products: MerchandisingProduct[] = []

  for (const product of source) {
    if (products.length >= count) break
    if (selected.has(product)) continue

    selected.add(product)
    products.push(product)
  }

  return products
}

export function sortProductsForCatalogue<T extends MerchandisingProduct>(
  products: T[],
  pageSize = DEFAULT_PAGE_SIZE
) {
  if (pageSize <= 0) return [...products]

  const picturedIPhones = products.filter(product => hasProductImage(product) && isIPhoneProduct(product))
  const picturedOthers = products.filter(product => hasProductImage(product) && !isIPhoneProduct(product))
  const unpicturedIPhones = products.filter(product => !hasProductImage(product) && isIPhoneProduct(product))
  const unpicturedOthers = products.filter(product => !hasProductImage(product) && !isIPhoneProduct(product))
  const pools = [picturedIPhones, picturedOthers, unpicturedIPhones, unpicturedOthers]
  const selected = new Set<MerchandisingProduct>()
  const ordered: T[] = []

  while (ordered.length < products.length) {
    const pageSelection: T[] = []
    const remaining = products.length - ordered.length
    const targetCount = Math.min(pageSize, remaining)
    const targetIPhones = Math.min(IPHONE_PAGE_TARGET, targetCount)
    const targetOthers = targetCount - targetIPhones

    pageSelection.push(...takeProducts(picturedIPhones as T[], targetIPhones, selected) as T[])
    pageSelection.push(...takeProducts(picturedOthers as T[], targetOthers, selected) as T[])

    if (pageSelection.length < targetCount) {
      for (const pool of pools) {
        pageSelection.push(...takeProducts(pool as T[], targetCount - pageSelection.length, selected) as T[])
        if (pageSelection.length >= targetCount) break
      }
    }

    if (pageSelection.length === 0) break
    ordered.push(...pageSelection)
  }

  return ordered
}

export function sortProductsForSearch<T extends MerchandisingProduct>(
  products: T[],
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return [...products]

  return products
    .filter(product => {
      const name = 'name' in product && typeof product.name === 'string' ? product.name : ''
      const brand = product.brand ?? ''
      return `${name} ${brand}`.toLowerCase().includes(normalizedQuery)
    })
    .sort((left, right) => Number(hasProductImage(right)) - Number(hasProductImage(left)))
}
