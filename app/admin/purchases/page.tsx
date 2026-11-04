'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Plus, ReceiptText } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { useAdminRole } from '@/components/AdminLayoutClient'
import { adminOperationError } from '@/lib/adminRole'

type Supplier = { id: number; name: string }
type Product = { id: number; brand: string; name: string; cost_price: number | null }
type Purchase = { id: number; supplier_id: number | null; purchase_date: string; reference: string | null; total_cost: number; received_at: string | null }
type DraftItem = { product_id: string; description: string; quantity: number; unit_cost: number; imeis: string }
type PurchaseItemDraft = { purchase_id: number; product_id: number | null; description: string | null; quantity: number; unit_cost: number; imei: string | null }

const freshItem = (): DraftItem => ({ product_id: '', description: '', quantity: 1, unit_cost: 0, imeis: '' })
const formatNaira = (value: number) => `₦${Number(value).toLocaleString('en-NG')}`

export default function PurchasesPage() {
  const { role } = useAdminRole()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftItem[]>([freshItem()])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadPurchases() {
    const [{ data, error }, supplierResult, productResult] = await Promise.all([
      supabase.from('purchases').select('id,supplier_id,purchase_date,reference,total_cost,received_at').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('id,name').order('name'),
      supabase.from('products').select('id,brand,name,cost_price').order('brand'),
    ])
    if (error) setErrorMessage(`Could not load purchases: ${error.message}`)
    else setPurchases((data ?? []) as Purchase[])
    if (supplierResult.error) setErrorMessage(`Could not load suppliers: ${supplierResult.error.message}`)
    else setSuppliers((supplierResult.data ?? []) as Supplier[])
    if (productResult.error) setErrorMessage(`Could not load products: ${productResult.error.message}`)
    else setProducts((productResult.data ?? []) as Product[])
    setLoading(false)
  }

  useEffect(() => {
    if (role === 'technician') {
      setBlocked(true)
      setLoading(false)
      setErrorMessage('Purchases are available to owners and staff only.')
    } else {
      void loadPurchases()
    }
  }, [role])

  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0), [items])
  const supplierNames = useMemo(() => new Map(suppliers.map((supplier) => [supplier.id, supplier.name])), [suppliers])

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  async function savePurchase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const imeis = item.imeis.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)
      if (!item.product_id && !item.description.trim()) { setErrorMessage(`Line ${index + 1}: choose a product or enter a description.`); return }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.unit_cost < 0 || !Number.isFinite(item.unit_cost)) { setErrorMessage(`Line ${index + 1}: quantity and unit cost are invalid.`); return }
      if (imeis.length > item.quantity) { setErrorMessage(`Line ${index + 1}: there are more IMEIs than units.`); return }
    }
    setSaving(true)
    const { data: purchase, error: purchaseError } = await supabase.from('purchases').insert({
      supplier_id: supplierId ? Number(supplierId) : null,
      purchase_date: purchaseDate,
      reference: reference.trim() || null,
      notes: notes.trim() || null,
      total_cost: total,
    }).select('id').single()
    if (purchaseError || !purchase) {
      setErrorMessage(`Could not create purchase: ${purchaseError ? adminOperationError(purchaseError, 'create purchases') : 'No purchase row was returned.'}`)
      setSaving(false)
      return
    }
    const purchaseItems: PurchaseItemDraft[] = items.flatMap((item) => {
      const imeis = item.imeis.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)
      const rows: PurchaseItemDraft[] = imeis.map((imei) => ({
        purchase_id: purchase.id,
        product_id: item.product_id ? Number(item.product_id) : null,
        description: item.description.trim() || null,
        quantity: 1,
        unit_cost: item.unit_cost,
        imei,
      }))
      const remainder = item.quantity - imeis.length
      if (remainder > 0) rows.push({
        purchase_id: purchase.id,
        product_id: item.product_id ? Number(item.product_id) : null,
        description: item.description.trim() || null,
        quantity: remainder,
        unit_cost: item.unit_cost,
        imei: null as string | null,
      })
      return rows
    })
    const { error: itemsError } = await supabase.from('purchase_items').insert(purchaseItems)
    if (itemsError) {
      const { error: rollbackError } = await supabase.from('purchases').delete().eq('id', purchase.id)
      setErrorMessage(`Could not save purchase items: ${adminOperationError(itemsError, 'save purchase items')}${rollbackError ? ` Purchase cleanup also failed: ${adminOperationError(rollbackError, 'clean up the incomplete purchase')}` : ''}`)
      setSaving(false)
      return
    }
    setShowForm(false)
    setSupplierId('')
    setPurchaseDate(new Date().toISOString().slice(0, 10))
    setReference('')
    setNotes('')
    setItems([freshItem()])
    setSuccessMessage('Purchase saved. Receive it when the stock has arrived.')
    await loadPurchases()
    setSaving(false)
  }

  async function receivePurchase(purchase: Purchase) {
    if (!window.confirm(`Receive purchase ${purchase.reference || `#${purchase.id}`} and add its quantities to inventory?`)) return
    setErrorMessage('')
    const { error } = await supabase.rpc('receive_purchase', { p_purchase_id: purchase.id })
    if (error) setErrorMessage(`Could not receive purchase: ${adminOperationError(error, 'receive stock')}`)
    else {
      setSuccessMessage(`Purchase ${purchase.reference || `#${purchase.id}`} received and stock updated.`)
      await loadPurchases()
    }
  }

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Inventory</p><h2 className="text-2xl font-black text-white">Purchases</h2><p className="mt-1 text-sm text-slate-400">Track stock orders and receive quantities into inventory.</p></div>{!blocked && <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black"><Plus className="h-4 w-4" aria-hidden="true" />New purchase</button>}</div>
      {errorMessage && <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{errorMessage}</div>}
      {successMessage && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{successMessage}</p>}
      {showForm && !blocked && <form onSubmit={savePurchase} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-xs font-semibold text-slate-300">Supplier<select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"><option value="">No supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
          <label className="space-y-2 text-xs font-semibold text-slate-300">Purchase date<input type="date" required value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
          <label className="space-y-2 text-xs font-semibold text-slate-300">Reference<input value={reference} onChange={(event) => setReference(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
          <label className="space-y-2 text-xs font-semibold text-slate-300">Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
        </div>
        <div className="space-y-3"><h3 className="font-bold text-white">Line items</h3>{items.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-white/10 p-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="space-y-2 text-xs text-slate-300 lg:col-span-2">Existing product (optional)<select value={item.product_id} onChange={(event) => { const selected = products.find((product) => product.id === Number(event.target.value)); updateItem(index, { product_id: event.target.value, description: selected ? `${selected.brand} ${selected.name}` : item.description, unit_cost: selected?.cost_price ?? item.unit_cost }) }} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"><option value="">Description only</option>{products.map((product) => <option value={product.id} key={product.id}>{product.brand} {product.name}</option>)}</select></label>
          <label className="space-y-2 text-xs text-slate-300 lg:col-span-2">Description<input required={!item.product_id} value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
          <label className="space-y-2 text-xs text-slate-300">Quantity<input type="number" min={1} step={1} required value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
          <label className="space-y-2 text-xs text-slate-300">Unit cost<input type="number" min={0} step="0.01" required value={item.unit_cost} onChange={(event) => updateItem(index, { unit_cost: Number(event.target.value) })} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
          <label className="space-y-2 text-xs text-slate-300 sm:col-span-2 lg:col-span-6">IMEIs (one per line)<textarea rows={2} value={item.imeis} onChange={(event) => updateItem(index, { imeis: event.target.value })} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
          {items.length > 1 && <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="justify-self-start text-xs text-red-300">Remove line</button>}
        </div>)}
          <button type="button" onClick={() => setItems((current) => [...current, freshItem()])} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300">Add line</button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-300">Purchase total: <strong className="text-white">{formatNaira(total)}</strong></p><div className="flex gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black disabled:opacity-50">{saving ? 'Saving…' : 'Save purchase'}</button></div></div>
      </form>}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">{loading ? <p role="status" className="p-6 text-sm text-slate-400">Loading purchases…</p> : blocked ? null : purchases.length === 0 ? <p className="p-6 text-sm text-slate-400">No purchases saved yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">Date / reference</th><th className="px-5 py-3">Total cost</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5 text-slate-200">{purchases.map((purchase) => <tr key={purchase.id}><td className="px-5 py-4">{purchase.supplier_id ? supplierNames.get(purchase.supplier_id) ?? 'Supplier removed' : '—'}</td><td className="px-5 py-4">{purchase.purchase_date}<p className="mt-1 text-xs text-slate-500">{purchase.reference || `#${purchase.id}`}</p></td><td className="px-5 py-4">{formatNaira(purchase.total_cost)}</td><td className="px-5 py-4">{purchase.received_at ? 'Received' : 'Pending'}</td><td className="px-5 py-4 text-right">{!purchase.received_at && <button type="button" onClick={() => void receivePurchase(purchase)} className="inline-flex items-center gap-2 rounded-lg border border-premiumYellow/30 px-3 py-2 text-xs font-bold text-premiumYellow"><ReceiptText className="h-4 w-4" aria-hidden="true" />Receive stock</button>}</td></tr>)}</tbody></table></div>}</section>
    </div>
  )
}
