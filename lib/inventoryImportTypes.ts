import type { Database } from '@/lib/database.types'

export const INVENTORY_IMPORT_FIELDS = [
  { key: 'brand', label: 'Brand', required: true },
  { key: 'name', label: 'Product name', required: true },
  { key: 'price', label: 'Price', required: true },
  { key: 'spec', label: 'Specifications', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'stock_quantity', label: 'Stock quantity', required: false },
  { key: 'low_stock_threshold', label: 'Low-stock threshold', required: false },
  { key: 'condition_grade', label: 'Condition grade', required: false },
  { key: 'warranty_months', label: 'Warranty months', required: false },
  { key: 'image_url', label: 'Image URL', required: false },
  { key: 'imei', label: 'IMEI / serial', required: false },
] as const

export type InventoryImportField = (typeof INVENTORY_IMPORT_FIELDS)[number]['key']
export type InventoryImportMapping = Record<InventoryImportField, string>
export type InventoryImportSource = {
  headers: string[]
  rows: string[][]
}

export type InventoryProductFields = Partial<Database['public']['Tables']['products']['Insert']>

export type InventoryImportAnalysisRow = {
  rowNumber: number
  values: string[]
  action: 'add' | 'update' | 'skip'
  fields: InventoryProductFields
  productId: number | null
  matchedProduct: string | null
  errors: string[]
}

export type InventoryImportOutcome = {
  rowNumber: number
  outcome: 'added' | 'updated' | 'skipped' | 'failed'
  message: string
}
