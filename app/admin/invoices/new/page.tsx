'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'

import { supabase } from '@/lib/supabase'

type ProductOption = {
  id: number
  name: string
  brand: string
  price: number
  stock_quantity: number
  status: string
  image_url: string | null
  spec: string | null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productId, setProductId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [initialPayment, setInitialPayment] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'pos' | 'other'>('cash')
  const [imei, setImei] = useState('')
  const [notes, setNotes] = useState('')
  const [invoiceTerms, setInvoiceTerms] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadFormData() {
      const [productsResult, settingsResult] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, brand, price, stock_quantity, status, image_url, spec')
          .gt('stock_quantity', 0)
          .neq('status', 'demo')
          .order('brand', { ascending: true }),
        supabase.from('settings').select('value').eq('key', 'invoice_terms').maybeSingle(),
      ])

      if (!active) return
      if (productsResult.error) {
        setErrorMessage(`Could not load products from Supabase: ${productsResult.error.message}`)
      } else {
        const availableProducts = (productsResult.data ?? []) as ProductOption[]
        setProducts(availableProducts)
        if (availableProducts[0]) {
          setProductId(String(availableProducts[0].id))
          setUnitPrice(Number(availableProducts[0].price))
        }
      }
      if (settingsResult.error) {
        setErrorMessage((current) =>
          current
            ? `${current} Invoice terms could not be loaded: ${settingsResult.error.message}`
            : `Invoice terms could not be loaded: ${settingsResult.error.message}`,
        )
      } else {
        setInvoiceTerms(settingsResult.data?.value ?? '')
      }
      setLoadingProducts(false)
    }

    void loadFormData()
    return () => {
      active = false
    }
  }, [])

  const selectedProduct = products.find((product) => String(product.id) === productId)
  const subtotal = useMemo(() => Math.max(0, quantity * unitPrice), [quantity, unitPrice])
  const total = Math.max(0, subtotal - discount)
  const dueAfterPayment = Math.max(0, total - initialPayment)

  function chooseProduct(value: string) {
    setProductId(value)
    const selected = products.find((product) => String(product.id) === value)
    if (selected) setUnitPrice(Number(selected.price))
  }

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!selectedProduct) {
      setErrorMessage('Select an in-stock product before creating the invoice.')
      return
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Customer name and phone number are required.')
      return
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > selectedProduct.stock_quantity) {
      setErrorMessage(`Quantity must be between 1 and the available stock (${selectedProduct.stock_quantity}).`)
      return
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(discount) || discount < 0 || discount > subtotal) {
      setErrorMessage('Enter a valid price and a discount no greater than the subtotal.')
      return
    }
    if (total <= 0 || initialPayment < 0 || initialPayment > total) {
      setErrorMessage('The invoice total must be positive and the initial payment cannot exceed it.')
      return
    }

    const status = initialPayment === total ? 'paid' : initialPayment > 0 ? 'deposit' : 'pending'
    setSaving(true)

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        product_id: selectedProduct.id,
        product_snapshot: {
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          image_url: selectedProduct.image_url,
          spec: selectedProduct.spec,
        },
        quantity,
        unit_price: unitPrice,
        discount_amount: discount,
        deposit_amount: initialPayment,
        status,
        payment_method: paymentMethod,
        imei: imei.trim() || null,
        notes: notes.trim() || null,
        terms_snapshot: invoiceTerms || null,
      })
      .select('id')
      .single()

    if (error) {
      setErrorMessage(`Could not create invoice: ${error.message}`)
      setSaving(false)
      return
    }

    router.replace(`/admin/invoices/${data.id}`)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-1 md:p-4">
      <div>
        <Link href="/admin/invoices" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to invoices
        </Link>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
          Live product and invoice records
        </p>
        <h2 className="text-2xl font-black text-white">Create invoice</h2>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loadingProducts ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading products from Supabase…
        </div>
      ) : (
        <form onSubmit={createInvoice} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-7">
          {products.length === 0 && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              No in-stock products are available. Add stock in Inventory before creating an invoice.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">
              Product
              <select
                required
                disabled={products.length === 0}
                value={productId}
                onChange={(event) => chooseProduct(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brand} {product.name} · {formatNaira(product.price)} · {product.stock_quantity} in stock
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Customer name
              <input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Phone
              <input required type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Email (optional)
              <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              IMEI / serial (optional)
              <input value={imei} onChange={(event) => setImei(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Quantity
              <input type="number" min={1} max={selectedProduct?.stock_quantity ?? 1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Unit price (₦)
              <input type="number" min={0} value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Discount (₦)
              <input type="number" min={0} max={subtotal} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Initial payment (₦)
              <input type="number" min={0} max={total} value={initialPayment} onChange={(event) => setInitialPayment(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Payment method
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white">
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="pos">POS</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">
              Notes
              <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
            </label>
          </div>

          <dl className="grid gap-3 rounded-xl bg-black/20 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Subtotal</dt><dd className="mt-1 font-semibold text-white">{formatNaira(subtotal)}</dd></div>
            <div><dt className="text-slate-500">Total</dt><dd className="mt-1 font-semibold text-white">{formatNaira(total)}</dd></div>
            <div><dt className="text-slate-500">Balance due</dt><dd className="mt-1 font-semibold text-premiumYellow">{formatNaira(dueAfterPayment)}</dd></div>
          </dl>

          <div className="flex justify-end">
            <button type="submit" disabled={saving || products.length === 0} className="rounded-xl bg-premiumYellow px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
              {saving ? 'Creating…' : 'Create invoice'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
