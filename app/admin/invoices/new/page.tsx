'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle, ArrowLeft, Loader2, Plus, Search, Trash2 } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { adminOperationError } from '@/lib/adminRole'

type ProductOption = {
  id: number
  name: string
  brand: string
  price: number
  cost_price: number | null
  stock_quantity: number | null
  status: string
  image_url: string | null
  spec: string | null
}
type InvoiceItemInput = {
  source: 'catalog' | 'custom'
  product_id: number | null
  brand: string
  name: string
  spec: string
  quantity: number
  unit_price: number
  imei: string
  query: string
}
type SnapshotItem = { name?: string; brand?: string; spec?: string; imei?: string; quantity?: number; unit_price?: number }
type DuplicateInvoice = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_id: number | null
  product_snapshot: { multi?: boolean; name?: string; brand?: string; spec?: string; items?: SnapshotItem[] } | null
  quantity: number
  unit_price: number
  discount_amount: number
  imei: string | null
  notes: string | null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

function emptyItem(source: 'catalog' | 'custom' = 'catalog'): InvoiceItemInput {
  return { source, product_id: null, brand: '', name: '', spec: '', quantity: 1, unit_price: 0, imei: '', query: '' }
}

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductOption[]>([])
  const [items, setItems] = useState<InvoiceItemInput[]>([emptyItem()])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [discount, setDiscount] = useState(0)
  const [initialPayment, setInitialPayment] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'pos' | 'other'>('cash')
  const [notes, setNotes] = useState('')
  const [invoiceTerms, setInvoiceTerms] = useState('')
  const [duplicateNumber, setDuplicateNumber] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadFormData() {
      const [productsResult, settingsResult] = await Promise.all([
        supabase.from('products')
          .select('id,name,brand,price,cost_price,stock_quantity,status,image_url,spec')
          .order('brand', { ascending: true }),
        supabase.from('settings').select('value').eq('key', 'invoice_terms').maybeSingle(),
      ])
      if (!active) return
      if (productsResult.error) setErrorMessage(`Could not load products from Supabase: ${productsResult.error.message}`)
      else setProducts((productsResult.data ?? []) as ProductOption[])
      if (settingsResult.error) {
        setErrorMessage((current) => current
          ? `${current} Invoice terms could not be loaded: ${settingsResult.error.message}`
          : `Invoice terms could not be loaded: ${settingsResult.error.message}`)
      } else setInvoiceTerms(settingsResult.data?.value ?? '')
      setLoadingProducts(false)
    }
    void loadFormData()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    async function prefillFromQuery() {
      const sourceInvoiceId = searchParams.get('duplicate')
      if (sourceInvoiceId) {
        const { data, error } = await supabase.from('invoices')
          .select('id,invoice_number,customer_name,customer_phone,customer_email,product_id,product_snapshot,quantity,unit_price,discount_amount,imei,notes')
          .eq('id', sourceInvoiceId).maybeSingle()
        if (!active) return
        if (error) {
          setErrorMessage(`Could not load invoice to duplicate: ${error.message}`)
          return
        }
        if (!data) {
          setErrorMessage('The invoice to duplicate could not be found.')
          return
        }
        const source = data as DuplicateInvoice
        setCustomerName(source.customer_name)
        setCustomerPhone(source.customer_phone)
        setCustomerEmail(source.customer_email ?? '')
        setDiscount(Number(source.discount_amount) || 0)
        setNotes(source.notes ?? '')
        setDuplicateNumber(source.invoice_number)
        const snapshotItems = source.product_snapshot?.multi && Array.isArray(source.product_snapshot.items)
          ? source.product_snapshot.items
          : [{
              name: source.product_snapshot?.name,
              brand: source.product_snapshot?.brand,
              spec: source.product_snapshot?.spec,
              imei: source.imei ?? undefined,
              quantity: source.quantity,
              unit_price: source.unit_price,
            }]
        const duplicatedItems = snapshotItems.map((item, index) => {
          const matchingProduct = products.find((product) =>
            source.product_id && snapshotItems.length === 1
              ? product.id === source.product_id
              : product.name.toLowerCase() === (item.name ?? '').toLowerCase()
                && product.brand.toLowerCase() === (item.brand ?? '').toLowerCase())
          return {
            source: matchingProduct ? 'catalog' as const : 'custom' as const,
            product_id: matchingProduct?.id ?? null,
            brand: item.brand ?? matchingProduct?.brand ?? '',
            name: item.name ?? matchingProduct?.name ?? '',
            spec: item.spec ?? matchingProduct?.spec ?? '',
            quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
            unit_price: Number(item.unit_price) > 0 ? Number(item.unit_price) : matchingProduct?.price ?? 0,
            imei: item.imei ?? '',
            query: matchingProduct ? `${matchingProduct.brand} ${matchingProduct.name}` : '',
          }
        })
        setItems(duplicatedItems.length ? duplicatedItems : [emptyItem('custom')])
        setInitialPayment(0)
        return
      }
      setCustomerName(searchParams.get('customer_name') ?? '')
      setCustomerPhone(searchParams.get('customer_phone') ?? '')
      setCustomerEmail(searchParams.get('customer_email') ?? '')
    }
    void prefillFromQuery()
    return () => { active = false }
  }, [products, searchParams])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0), [items])
  const total = Math.max(0, subtotal - discount)
  const dueAfterPayment = Math.max(0, total - initialPayment)

  function updateItem(index: number, patch: Partial<InvoiceItemInput>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  function chooseProduct(index: number, product: ProductOption) {
    updateItem(index, {
      source: 'catalog',
      product_id: product.id,
      brand: product.brand,
      name: product.name,
      spec: product.spec ?? '',
      unit_price: Number(product.price),
      query: `${product.brand} ${product.name}`,
    })
  }

  function chooseCustom(index: number) {
    updateItem(index, { ...emptyItem('custom'), query: '' })
  }

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Customer name and phone number are required.')
      return
    }
    if (!items.length || items.some((item) => !item.name.trim())) {
      setErrorMessage('Choose a product or enter a name for each invoice item.')
      return
    }
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      setErrorMessage('Each item quantity must be a whole number greater than zero.')
      return
    }
    if (items.some((item) => !Number.isFinite(item.unit_price) || item.unit_price <= 0)) {
      setErrorMessage('Each item must have a positive unit price.')
      return
    }
    if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) {
      setErrorMessage('Enter a valid discount no greater than the subtotal.')
      return
    }
    if (total <= 0 || !Number.isFinite(initialPayment) || initialPayment < 0 || initialPayment > total) {
      setErrorMessage('The invoice total must be positive and the initial payment cannot exceed it.')
      return
    }

    setSaving(true)
    if (items.length === 1) {
      const item = items[0]
      const product = item.product_id ? products.find((candidate) => candidate.id === item.product_id) : undefined
      const status = initialPayment === total ? 'paid' : initialPayment > 0 ? 'deposit' : 'pending'
      const productSnapshot = item.source === 'custom'
        ? { name: item.name.trim(), brand: item.brand.trim(), image_url: null, spec: item.spec.trim() || null }
        : {
            name: product?.name ?? item.name,
            brand: product?.brand ?? item.brand,
            image_url: product?.image_url ?? null,
            spec: product?.spec ?? (item.spec.trim() || null),
          }
      const { data, error } = await supabase.from('invoices').insert({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        product_id: item.source === 'custom' ? null : item.product_id,
        product_snapshot: productSnapshot,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_cost: product?.cost_price == null ? null : Number(product.cost_price),
        discount_amount: discount,
        deposit_amount: initialPayment,
        status,
        payment_method: paymentMethod,
        imei: item.imei.trim() || null,
        notes: notes.trim() || null,
        terms_snapshot: invoiceTerms || null,
      }).select('id').single()
      if (error) {
        setErrorMessage(`Could not create invoice: ${adminOperationError(error, 'create invoices')}`)
        setSaving(false)
        return
      }
      router.replace(`/admin/invoices/${data.id}`)
      router.refresh()
      return
    }

    const { data, error } = await supabase.rpc('create_multi_item_invoice', {
      p_customer_name: customerName.trim(),
      p_customer_phone: customerPhone.trim(),
      p_customer_email: customerEmail.trim() || null,
      p_items: items.map((item) => ({
        product_id: item.product_id,
        name: item.name.trim(),
        brand: item.brand.trim() || null,
        spec: item.spec.trim() || null,
        imei: item.imei.trim() || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      p_discount: discount,
      p_deposit: initialPayment,
      p_payment_method: paymentMethod,
      p_notes: notes.trim() || null,
      p_terms: invoiceTerms || null,
    })
    if (error) {
      setErrorMessage(`Could not create multi-item invoice: ${adminOperationError(error, 'create invoices')}`)
      setSaving(false)
      return
    }
    router.replace(`/admin/invoices/${data.id}`)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-1 md:p-4">
      <div>
        <Link href="/admin/invoices" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to invoices
        </Link>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Live product and invoice records</p>
        <h2 className="text-2xl font-black text-white">Create invoice</h2>
      </div>
      {duplicateNumber && <p role="status" className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100">Duplicated from {duplicateNumber}. Deposit has been reset to ₦0.</p>}
      {errorMessage && <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{errorMessage}</span></div>}
      {loadingProducts ? <div role="status" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Loading products from Supabase…</div> : (
        <form onSubmit={createInvoice} className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-7">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-white">Invoice items</h3><button type="button" onClick={() => setItems((current) => [...current, emptyItem()])} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" aria-hidden="true" />Add item</button></div>
            {items.map((item, index) => {
              const matches = item.query.trim().length >= 1
                ? products.filter((product) => `${product.brand} ${product.name}`.toLowerCase().includes(item.query.trim().toLowerCase())).slice(0, 8)
                : []
              const selectedProduct = products.find((product) => product.id === item.product_id)
              return <article key={index} className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Item {index + 1}</p>{items.length > 1 && <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove item ${index + 1}`} className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}</div>
                <div className="flex flex-wrap gap-2"><button type="button" onClick={() => updateItem(index, { source: 'catalog', product_id: null, name: '', brand: '', spec: '', query: '' })} className={`rounded-lg px-3 py-2 text-xs font-bold ${item.source === 'catalog' ? 'bg-premiumYellow text-black' : 'border border-white/10 text-slate-300'}`}>Product</button><button type="button" onClick={() => chooseCustom(index)} className={`rounded-lg px-3 py-2 text-xs font-bold ${item.source === 'custom' ? 'bg-premiumYellow text-black' : 'border border-white/10 text-slate-300'}`}>Custom item</button></div>
                {item.source === 'catalog' ? <div className="space-y-2">
                  <label className="relative block"><span className="sr-only">Search products for item {index + 1}</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" /><input value={item.query} onChange={(event) => updateItem(index, { query: event.target.value, product_id: null, name: '', brand: '', spec: '' })} placeholder="Search all products, including out of stock" className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm text-white" /></label>
                  {matches.length > 0 && <div className="max-h-48 overflow-auto rounded-xl border border-white/10 bg-slate-900">{matches.map((product) => <button key={product.id} type="button" onClick={() => chooseProduct(index, product)} className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-white/5"><span className="text-white">{product.brand} {product.name}<span className="ml-2 text-xs text-slate-400">{formatNaira(Number(product.price))}</span></span>{Number(product.stock_quantity ?? 0) <= 0 && <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-bold text-amber-200">Out of stock</span>}</button>)}</div>}
                  {!selectedProduct && item.query && matches.length === 0 && <p className="text-xs text-slate-500">No matching products. Choose Custom item to invoice a one-off product.</p>}
                  {selectedProduct && <p className="text-xs text-slate-400">{selectedProduct.brand} {selectedProduct.name} · Stock: {selectedProduct.stock_quantity ?? 0}{Number(selectedProduct.stock_quantity ?? 0) <= 0 && <span className="ml-2 font-semibold text-amber-200">Out of stock</span>}</p>}
                </div> : <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-slate-300">Name<input required maxLength={160} value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-300">Brand (optional)<input maxLength={100} value={item.brand} onChange={(event) => updateItem(index, { brand: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">Spec (optional)<textarea rows={2} maxLength={2000} value={item.spec} onChange={(event) => updateItem(index, { spec: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
                </div>}
                <div className="grid gap-3 sm:grid-cols-4">
                  <label className="space-y-2 text-xs font-semibold text-slate-300">Quantity<input type="number" min={1} step={1} required value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-300">Unit price (₦)<input type="number" min={0} step="any" required value={item.unit_price} onChange={(event) => updateItem(index, { unit_price: Number(event.target.value) })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">IMEI / serial (optional)<input value={item.imei} onChange={(event) => updateItem(index, { imei: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
                </div>
                <p className="text-right text-sm text-slate-300">Line total: <strong className="text-white">{formatNaira(item.quantity * item.unit_price)}</strong></p>
              </article>
            })}
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-xs font-semibold text-slate-300">Customer name<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">Phone<input required type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">Email (optional)<input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">Discount (₦)<input type="number" min={0} max={subtotal} step="any" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">Initial payment (₦)<input type="number" min={0} max={total} step="any" value={initialPayment} onChange={(event) => setInitialPayment(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="pos">POS</option><option value="other">Other</option></select></label>
            <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-3">Notes<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
          </section>
          <dl className="grid gap-3 rounded-xl bg-black/20 p-4 text-sm sm:grid-cols-4"><div><dt className="text-slate-500">Subtotal</dt><dd className="mt-1 font-semibold text-white">{formatNaira(subtotal)}</dd></div><div><dt className="text-slate-500">Discount</dt><dd className="mt-1 font-semibold text-white">{formatNaira(discount)}</dd></div><div><dt className="text-slate-500">Total</dt><dd className="mt-1 font-semibold text-white">{formatNaira(total)}</dd></div><div><dt className="text-slate-500">Balance due</dt><dd className="mt-1 font-semibold text-premiumYellow">{formatNaira(dueAfterPayment)}</dd></div></dl>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded-xl bg-premiumYellow px-5 py-3 text-sm font-bold text-black disabled:opacity-60">{saving ? 'Creating…' : 'Create invoice'}</button></div>
        </form>
      )}
    </div>
  )
}
