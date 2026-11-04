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

type View<Row> = {
  Row: Row
  Relationships: []
}

type ProductRow = {
  id: number
  name: string
  brand: string
  price: number
  category: string
  cost_price: number | null
  description: string | null
  seo_title: string | null
  seo_description: string | null
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
  unit_cost: number | null
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
  items_stock_applied: boolean
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
      suppliers: Table<
        {
          id: number
          name: string
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
        },
        {
          id?: number
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
        }
      >
      purchases: Table<
        {
          id: number
          supplier_id: number | null
          purchase_date: string | null
          reference: string | null
          notes: string | null
          total_cost: number | null
          received_at: string | null
          created_by: string | null
          created_at: string
        },
        {
          id?: number
          supplier_id?: number | null
          purchase_date?: string | null
          reference?: string | null
          notes?: string | null
          total_cost?: number | null
          received_at?: string | null
          created_by?: string | null
          created_at?: string
        }
      >
      purchase_items: Table<
        {
          id: number
          purchase_id: number
          product_id: number | null
          description: string | null
          quantity: number
          unit_cost: number
          imei: string | null
        },
        {
          id?: number
          purchase_id: number
          product_id?: number | null
          description?: string | null
          quantity: number
          unit_cost: number
          imei?: string | null
        }
      >
      stock_movements: Table<
        {
          id: number
          product_id: number | null
          old_qty: number | null
          new_qty: number | null
          delta: number | null
          reason: string | null
          actor_email: string | null
          created_at: string
        },
        {
          id?: number
          product_id?: number | null
          old_qty?: number | null
          new_qty?: number | null
          delta?: number | null
          reason?: string | null
          actor_email?: string | null
          created_at?: string
        }
      >
      invoice_items: Table<
        {
          id: number
          invoice_id: string
          product_id: number | null
          name: string
          brand: string | null
          spec: string | null
          imei: string | null
          quantity: number
          unit_price: number
          unit_cost: number | null
          position: number | null
          created_at: string
        },
        {
          id?: number
          invoice_id: string
          product_id?: number | null
          name: string
          brand?: string | null
          spec?: string | null
          imei?: string | null
          quantity?: number
          unit_price: number
          unit_cost?: number | null
          position?: number | null
          created_at?: string
        }
      >
      whatsapp_templates: Table<
        {
          id: number
          key: string
          title: string
          body: string
          sort_order: number
          is_active: boolean
          updated_at: string
        },
        {
          id?: number
          key: string
          title: string
          body: string
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
      >
      activity_log: Table<
        {
          id: number
          created_at: string
          actor_email: string | null
          action: string
          table_name: string
          record_id: string | null
          summary: string | null
          changes: Json | null
        },
        {
          id?: number
          created_at?: string
          actor_email?: string | null
          action: string
          table_name: string
          record_id?: string | null
          summary?: string | null
          changes?: Json | null
        }
      >
      login_events: Table<
        {
          id: number
          created_at: string
          email: string | null
          ip: string | null
          user_agent: string | null
          device_hash: string | null
          success: boolean
          is_new_device: boolean
        },
        {
          id?: number
          created_at?: string
          email?: string | null
          ip?: string | null
          user_agent?: string | null
          device_hash?: string | null
          success: boolean
          is_new_device?: boolean
        }
      >
      admin_users: Table<
        { id: string; email: string; created_at: string; role: string | null; name: string | null },
        { id?: string; email: string; created_at?: string; role?: string | null; name?: string | null }
      >
      admin_rate_limit_events: Table<
        { id: number; user_id: string; scope: string; created_at: string },
        { id?: number; user_id: string; scope: string; created_at?: string }
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
    Views: {
      customer_directory: View<{
        key: string
        name: string | null
        phone: string | null
        email: string | null
        invoice_count: number
        total_billed: number
        total_paid: number
        balance_due: number
        trade_in_count: number
        request_count: number
        first_seen: string | null
        last_activity: string | null
      }>
      tradein_performance: View<{
        id: number
        brand: string
        model: string
        estimate_low: number | null
        estimate_high: number | null
        estimate_mid: number | null
        final_offer: number | null
        offer_vs_estimate_pct: number | null
        listed_price: number | null
        sold_price: number | null
        sold_at: string | null
        days_to_sell: number | null
        profit: number | null
      }>
    }
    Functions: {
      admin_role: {
        Args: Record<PropertyKey, never>
        Returns: string | null
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_write: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      receive_purchase: {
        Args: { p_purchase_id: number }
        Returns: undefined
      }
      sync_invoice_items_stock: {
        Args: { p_invoice_id: string }
        Returns: undefined
      }
      trigger_sync_invoice_items_stock: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      create_multi_item_invoice: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_customer_email: string | null
          p_items: Json
          p_discount: number
          p_deposit: number
          p_payment_method: string | null
          p_notes: string | null
          p_terms: string | null
        }
        Returns: InvoiceRow
      }
      admin_search: {
        Args: { q: string }
        Returns: {
          kind: string
          id: string
          title: string
          subtitle: string | null
          url: string
        }[]
      }
      get_public_invoice: {
        Args: { p_invoice_id: string }
        Returns: PublicInvoiceRow[]
      }
      next_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      add_admin_user_by_email: {
        Args: { p_email: string; p_name: string; p_role: string }
        Returns: string
      }
      consume_admin_rate_limit: {
        Args: { p_scope: string }
        Returns: Json
      }
      login_attempt_status: {
        Args: { p_email: string; p_ip: string }
        Returns: Json
      }
      record_login_attempt: {
        Args: {
          p_email: string
          p_ip: string
          p_user_agent: string | null
          p_device_hash: string | null
          p_success: boolean
        }
        Returns: Json
      }
      log_stock_movement: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      log_activity: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
