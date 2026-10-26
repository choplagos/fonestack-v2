import type { ProductCategory } from '@/lib/productCategories'

export type StoreProduct = {
  id: number
  name: string
  brand: string
  price: number
  status: string
  image_url: string | null
  spec: string
  stock_quantity: number
  category?: ProductCategory
  rating?: number
  storage_gb?: number | null
  ram_gb?: number | null
  battery_mah?: number | null
  camera_mp?: number | null
}
