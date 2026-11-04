'use client'

import { useState } from 'react'
import { Check, Loader2, Trash2, X } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { adminOperationError } from '@/lib/adminRole'

export type BulkProduct = {
  id: number
  brand: string
  name: string
  price: number
  stock_quantity: number
  low_stock_threshold: number
  warranty_months: number | null
}

type Action = 'status' | 'price' | 'threshold' | 'warranty' | 'stock'

type Props = {
  selected: BulkProduct[]
  isOwner: boolean
  onClose: () => void
  onComplete: () => Promise<void>
}

export default function InventoryBulkActions({ selected, isOwner, onClose, onComplete }: Props) {
  const [action, setAction] = useState<Action>('status')
  const [status, setStatus] = useState('new')
  const [priceMode, setPriceMode] = useState<'increase_percent' | 'decrease_percent' | 'increase_flat' | 'decrease_flat' | 'exact'>('increase_percent')
  const [value, setValue] = useState('')
  const [threshold, setThreshold] = useState('')
  const [warranty, setWarranty] = useState('')
  const [stock, setStock] = useState<'in' | 'out'>('in')
  const [progress, setProgress] = useState('')
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function getPrice(price: number) {
    const amount = Number(value)
    if (!Number.isFinite(amount) || amount < 0) return null
    switch (priceMode) {
      case 'increase_percent': return Math.round(price * (1 + amount / 100))
      case 'decrease_percent': return Math.max(0, Math.round(price * (1 - amount / 100)))
      case 'increase_flat': return Math.round(price + amount)
      case 'decrease_flat': return Math.max(0, Math.round(price - amount))
      case 'exact': return Math.round(amount)
    }
  }

  async function apply() {
    setErrorMessage('')
    setSummary('')
    let update: Database['public']['Tables']['products']['Update'] = {}
    if (action === 'status') update = { status }
    if (action === 'threshold') {
      if (!Number.isInteger(Number(threshold)) || Number(threshold) < 0) {
        setErrorMessage('Enter a non-negative whole-number stock threshold.')
        return
      }
      update = { low_stock_threshold: Number(threshold) }
    }
    if (action === 'warranty') {
      if (!Number.isInteger(Number(warranty)) || Number(warranty) < 0) {
        setErrorMessage('Enter a non-negative whole-number warranty in months.')
        return
      }
      update = { warranty_months: Number(warranty) }
    }
    if (action === 'stock') update = { in_stock: stock === 'in' }
    const changedPrices = selected.map((product) => ({ product, next: getPrice(product.price) }))
    if (action === 'price') {
      if (!value.trim() || changedPrices.some((entry) => entry.next === null)) {
        setErrorMessage('Enter a valid non-negative price adjustment.')
        return
      }
      update = { price: 0 }
    }
    const preview = action === 'price'
      ? changedPrices.slice(0, 5).map(({ product, next }) => `${product.brand} ${product.name}: ₦${product.price.toLocaleString()} → ₦${Number(next).toLocaleString()}`).join('\n')
      : ''
    const confirmed = window.confirm(
      `${selected.length} product(s) will be affected by this ${action} change.${preview ? `\n\nPrice preview (up to 5):\n${preview}` : ''}\n\nContinue?`,
    )
    if (!confirmed) return

    setBusy(true)
    let succeeded = 0
    const errors: string[] = []
    try {
      const chunks = Array.from({ length: Math.ceil(selected.length / 25) }, (_, index) => selected.slice(index * 25, (index + 1) * 25))
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index]
        setProgress(`Updating ${Math.min((index + 1) * 25, selected.length)} of ${selected.length}…`)
        if (action === 'price') {
          for (const product of chunk) {
            const nextPrice = getPrice(product.price)
            const { error } = await supabase.from('products').update({ price: nextPrice! }).in('id', [product.id])
            if (error) errors.push(`${product.name}: ${adminOperationError(error, 'update inventory')}`)
            else succeeded += 1
          }
        } else {
          const { error } = await supabase.from('products').update(update).in('id', chunk.map((product) => product.id))
          if (error) errors.push(adminOperationError(error, 'update inventory'))
          else succeeded += chunk.length
        }
      }
      await onComplete()
      setSummary(`${succeeded} of ${selected.length} product(s) updated.${errors.length ? ` ${errors.length} failed.` : ''}`)
      if (errors.length) setErrorMessage(errors.slice(0, 3).join(' · '))
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  async function deleteSelected() {
    const confirmation = window.prompt(`Permanently delete ${selected.length} selected product(s)? Type DELETE to confirm.`)
    if (confirmation !== 'DELETE') return
    setBusy(true)
    let deleted = 0
    const errors: string[] = []
    try {
      for (let index = 0; index < selected.length; index += 25) {
        const chunk = selected.slice(index, index + 25)
        setProgress(`Deleting ${Math.min(index + 25, selected.length)} of ${selected.length}…`)
        const { error } = await supabase.from('products').delete().in('id', chunk.map((product) => product.id))
        if (error) errors.push(adminOperationError(error, 'delete inventory'))
        else deleted += chunk.length
      }
      await onComplete()
      setSummary(`${deleted} of ${selected.length} product(s) deleted.`)
      if (errors.length) setErrorMessage(errors.join(' · '))
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  return (
    <section className="sticky bottom-2 z-20 space-y-3 rounded-2xl border border-premiumYellow/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-white">{selected.length} product(s) selected</p>
        <button type="button" onClick={onClose} aria-label="Clear selected products" className="rounded-lg p-2 text-slate-400 hover:bg-white/10"><X className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1 text-[11px] text-slate-400">Action
          <select value={action} onChange={(event) => setAction(event.target.value as Action)} className="block rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white">
            <option value="status">Set status</option><option value="price">Adjust price</option><option value="threshold">Low-stock threshold</option><option value="warranty">Warranty months</option><option value="stock">Stock availability</option>
          </select>
        </label>
        {action === 'status' && <label className="space-y-1 text-[11px] text-slate-400">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="block rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white">{['new', 'used', 'hot', 'demo'].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}
        {action === 'price' && <>
          <label className="space-y-1 text-[11px] text-slate-400">Change<select value={priceMode} onChange={(event) => setPriceMode(event.target.value as typeof priceMode)} className="block rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"><option value="increase_percent">Increase by %</option><option value="decrease_percent">Decrease by %</option><option value="increase_flat">Increase by ₦</option><option value="decrease_flat">Decrease by ₦</option><option value="exact">Set exact price</option></select></label>
          <label className="space-y-1 text-[11px] text-slate-400">Value<input type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} className="block w-28 rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white" /></label>
        </>}
        {action === 'threshold' && <label className="space-y-1 text-[11px] text-slate-400">Threshold<input type="number" min="0" value={threshold} onChange={(event) => setThreshold(event.target.value)} className="block w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white" /></label>}
        {action === 'warranty' && <label className="space-y-1 text-[11px] text-slate-400">Months<input type="number" min="0" value={warranty} onChange={(event) => setWarranty(event.target.value)} className="block w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white" /></label>}
        {action === 'stock' && <label className="space-y-1 text-[11px] text-slate-400">Availability<select value={stock} onChange={(event) => setStock(event.target.value as typeof stock)} className="block rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"><option value="in">In stock</option><option value="out">Out of stock</option></select></label>}
        <button type="button" disabled={busy} onClick={() => void apply()} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-premiumYellow px-3 py-2 text-xs font-bold text-black disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}Apply
        </button>
        {isOwner && <button type="button" disabled={busy} onClick={() => void deleteSelected()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-50">
          <Trash2 className="h-4 w-4" aria-hidden="true" />Delete selected
        </button>}
      </div>
      {progress && <p role="status" className="text-xs text-slate-300">{progress}</p>}
      {summary && <p role="status" className="text-xs text-green-300">{summary}</p>}
      {errorMessage && <p role="alert" className="text-xs text-red-300">{errorMessage}</p>}
    </section>
  )
}
