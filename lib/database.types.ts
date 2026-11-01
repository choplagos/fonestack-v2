export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type ProductRow = {
  id: number
  name: string
  brand: string
  price: number
  spec: string | null
  rating: number | null
  reviews: number | null
  status: string
  in_stock: boolean | null
  created_at: string | null
  fts: unknown
  image_url: string | null
  stock_quantity: number | null
  reserved_quantity: number | null
  storage_gb: number | null
  ram_gb: number | null
  processor: string | null
  color: string | null
  battery_mah: number | null
  camera_mp: number | null
  screen_size: number | null
  condition_grade: string | null
  warranty_months: number | null
  imei: string | null
  low_stock_threshold: number
  updated_at: string | null
}

type InvoiceRow = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  product_id: number | null
  product_snapshot: Json | null
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number | null
  status: string
  payment_method: string | null
  notes: string | null
  created_at: string
  paid_at: string | null
  customer_email: string | null
  imei: string | null
  deposit_amount: number
  amount_due: number | null
  customer_id: string | null
  terms_snapshot: string | null
}

type InvoiceInsert = Partial<Omit<InvoiceRow, 'total_amount' | 'amount_due'>> &
  Pick<InvoiceRow, 'customer_name' | 'customer_phone' | 'unit_price'> & {
    total_amount?: never
    amount_due?: never
  }

type InvoiceUpdate = Partial<Omit<InvoiceRow, 'total_amount' | 'amount_due'>> & {
  total_amount?: never
  amount_due?: never
}

type TradeInRequestRow = {
  id: number
  customer_name: string
  customer_phone: string
  brand: string
  model: string
  storage_gb: number | null
  condition_description: string | null
  condition_grade: string | null
  has_box: boolean | null
  has_charger: boolean | null
  photos: string[] | null
  estimate_low: number | null
  estimate_high: number | null
  estimate_reasoning: string | null
  estimate_confidence: string | null
  status: string
  admin_notes: string | null
  final_offer: number | null
  reviewed_by: string | null
  reviewed_at: string | null
  converted_product_id: number | null
  created_at: string | null
}

type PublicInvoiceRow = Pick<
  InvoiceRow,
  | 'id'
  | 'invoice_number'
  | 'customer_name'
  | 'customer_phone'
  | 'customer_email'
  | 'product_id'
  | 'product_snapshot'
  | 'quantity'
  | 'unit_price'
  | 'discount_amount'
  | 'total_amount'
  | 'status'
  | 'payment_method'
  | 'notes'
  | 'created_at'
  | 'paid_at'
  | 'imei'
> & { settings: Json | null }

export type Database = {
  public: {
    Tables: {
      products: Table<
        ProductRow,
        Partial<ProductRow> & Pick<ProductRow, 'name' | 'brand' | 'price'>
      >
      invoices: Table<InvoiceRow, InvoiceInsert, InvoiceUpdate>
      admin_users: Table<
        { id: string; email: string; created_at: string; role: string; name: string | null },
        { id?: string; email: string; created_at?: string; role?: string; name?: string | null }
      >
      device_requests: Table<
        {
          id: number
          customer_name: string | null
          phone: string | null
          requested_device: string | null
          budget: number | null
          status: string | null
          created_at: string | null
          reference_id: string | null
          product_id: number | null
          source: string | null
        },
        {
          id?: never
          customer_name?: string | null
          phone?: string | null
          requested_device?: string | null
          budget?: number | null
          status?: string | null
          created_at?: string | null
          reference_id?: string | null
          product_id?: number | null
          source?: string | null
        }
      >
      trade_in_requests: Table<
        TradeInRequestRow,
        Partial<TradeInRequestRow> & Pick<TradeInRequestRow, 'customer_name' | 'customer_phone' | 'brand' | 'model'>
      >
      settings: Table<
        { key: string; value: string | null; updated_at: string | null },
        { key: string; value?: string | null; updated_at?: string | null }
      >
    }
    Views: Record<string, never>
    Functions: {
      get_public_invoice: {
        Args: { p_invoice_id: string }
        Returns: PublicInvoiceRow[]
      }
      next_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
