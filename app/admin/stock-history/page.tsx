'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'

import { exportCsv, type ExportColumn } from '@/lib/export'
import { supabase } from '@/lib/supabase'

type Movement = {
  id: number
  product_id: number | null
  old_qty: number | null
  new_qty: number | null
  delta: number | null
  reason: string | null
  actor_email: string | null
  created_at: string
}
type Product = { id: number; brand: string; name: string }
type ExportRow = { date: string; product: string; change: number | string; old: number | string; next: number | string; reason: string; actor: string }

const PAGE_SIZE = 25
const REASONS = ['purchase', 'sale', 'manual_or_sale']
const COLUMNS: ExportColumn<ExportRow>[] = [
  { header: 'Date', key: 'date' },
  { header: 'Product', key: 'product' },
  { header: 'Change', key: 'change' },
  { header: 'Old quantity', key: 'old' },
  { header: 'New quantity', key: 'next' },
  { header: 'Reason', key: 'reason' },
  { header: 'Who', key: 'actor' },
]
const REASON_LABELS: Record<string, string> = { purchase: 'Purchase received', sale: 'Invoice sale', manual_or_sale: 'Manual adjustment' }

export default function StockHistoryPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    async function checkAccess() {
      const { data: user, error: userError } = await supabase.auth.getUser()
      if (userError || !user.user?.email) {
        if (active) { setErrorMessage(`Could not verify access: ${userError?.message ?? 'Admin session is missing.'}`); setLoading(false) }
        return
      }
      const { data, error } = await supabase.from('admin_users').select('id').eq('email', user.user.email.toLowerCase()).maybeSingle()
      if (!active) return
      if (error || !data) {
        setErrorMessage(`Could not verify access: ${error?.message ?? 'Admin account was not found.'}`)
        setLoading(false)
        return
      }
      setIsAdmin(true)
    }
    void checkAccess()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    let active = true
    async function load() {
      setLoading(true)
      setErrorMessage('')
      let query = supabase.from('stock_movements').select('id,product_id,old_qty,new_qty,delta,reason,actor_email,created_at', { count: 'exact' })
      if (reason) query = query.eq('reason', reason)
      if (fromDate) query = query.gte('created_at', `${fromDate}T00:00:00`)
      if (toDate) query = query.lte('created_at', `${toDate}T23:59:59`)
      if (search.trim()) {
        const { data: matches, error: productError } = await supabase.from('products').select('id').or(`name.ilike.%${search.trim()}%,brand.ilike.%${search.trim()}%`)
        if (productError) {
          if (active) { setErrorMessage(`Could not search products: ${productError.message}`); setLoading(false) }
          return
        }
        const ids = (matches ?? []).map((product) => product.id)
        if (ids.length === 0) {
          if (active) { setMovements([]); setCount(0); setLoading(false) }
          return
        }
        query = query.in('product_id', ids)
      }
      const { data, error, count: resultCount } = await query.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      if (!active) return
      if (error) setErrorMessage(`Could not load stock history: ${error.message}`)
      else {
        const rows = (data ?? []) as Movement[]
        setMovements(rows)
        setCount(resultCount ?? 0)
        const productIds = Array.from(new Set(rows.flatMap((row) => row.product_id == null ? [] : [row.product_id])))
        if (productIds.length) {
          const { data: productsData, error: productsError } = await supabase.from('products').select('id,brand,name').in('id', productIds)
          if (productsError) setErrorMessage(`Could not load movement product names: ${productsError.message}`)
          else setProducts((current) => [...current.filter((item) => !productIds.includes(item.id)), ...((productsData ?? []) as Product[])])
        } else setProducts([])
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [isAdmin, reason, fromDate, toDate, page, search])

  const productNames = useMemo(() => new Map(products.map((product) => [product.id, `${product.brand} ${product.name}`])), [products])
  async function exportCurrent() {
    setExporting(true)
    setErrorMessage('')
    try {
      let productIds: number[] | null = null
      if (search.trim()) {
        const safeSearch = search.trim().replace(/[(),]/g, ' ')
        const { data, error } = await supabase.from('products').select('id').or(`name.ilike.%${safeSearch}%,brand.ilike.%${safeSearch}%`)
        if (error) throw new Error(`Could not search products: ${error.message}`)
        productIds = (data ?? []).map((product) => product.id)
      }
      const allRows: Movement[] = []
      if (productIds === null || productIds.length > 0) {
        for (let offset = 0; ; offset += 1000) {
          let query = supabase.from('stock_movements').select('id,product_id,old_qty,new_qty,delta,reason,actor_email,created_at')
          if (reason) query = query.eq('reason', reason)
          if (fromDate) query = query.gte('created_at', `${fromDate}T00:00:00`)
          if (toDate) query = query.lte('created_at', `${toDate}T23:59:59`)
          if (productIds) query = query.in('product_id', productIds)
          const { data, error } = await query.order('created_at', { ascending: false }).range(offset, offset + 999)
          if (error) throw new Error(`Could not export stock history: ${error.message}`)
          const batch = (data ?? []) as Movement[]
          allRows.push(...batch)
          if (batch.length < 1000) break
        }
      }
      const ids = Array.from(new Set(allRows.flatMap((row) => row.product_id == null ? [] : [row.product_id])))
      const names = new Map(productNames)
      if (ids.length) {
        const { data, error } = await supabase.from('products').select('id,brand,name').in('id', ids)
        if (error) throw new Error(`Could not load product names: ${error.message}`)
        for (const product of (data ?? []) as Product[]) names.set(product.id, `${product.brand} ${product.name}`)
      }
      const rows = allRows.map((movement) => ({
        date: new Date(movement.created_at).toLocaleString(),
        product: movement.product_id == null ? 'Deleted product' : names.get(movement.product_id) ?? `Product #${movement.product_id}`,
        change: movement.delta == null ? '' : movement.delta > 0 ? `+${movement.delta}` : movement.delta,
        old: movement.old_qty ?? '',
        next: movement.new_qty ?? '',
        reason: REASON_LABELS[movement.reason ?? ''] ?? movement.reason ?? 'Unknown',
        actor: movement.actor_email ?? '—',
      }))
      exportCsv('fonestack-stock-history.csv', COLUMNS, rows)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not export stock history.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Inventory</p><h2 className="text-2xl font-black text-white">Stock history</h2><p className="mt-1 text-sm text-slate-400">Track stock movements from purchases, sales and manual changes.</p></div><button type="button" onClick={() => void exportCurrent()} disabled={exporting} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 disabled:opacity-40"><Download className="h-4 w-4" aria-hidden="true" />{exporting ? 'Exporting…' : 'Export CSV'}</button></div>
      {errorMessage && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{errorMessage}</p>}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative"><span className="sr-only">Search product</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Search product" className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white" /></label>
          <label className="sr-only" htmlFor="stock-history-reason">Reason</label><select id="stock-history-reason" value={reason} onChange={(event) => { setReason(event.target.value); setPage(0) }} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"><option value="">All reasons</option>{REASONS.map((item) => <option key={item} value={item}>{REASON_LABELS[item]}</option>)}</select>
          <label className="space-y-1 text-xs text-slate-400">From<input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(0) }} className="block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
          <label className="space-y-1 text-xs text-slate-400">To<input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(0) }} className="block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
        </div>
        {loading ? <p role="status" className="py-8 text-center text-sm text-slate-400">Loading stock movements…</p> : movements.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No stock movements match these filters.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Old → new</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Who</th></tr></thead><tbody className="divide-y divide-white/5 text-slate-200">{movements.map((item) => <tr key={item.id}><td className="px-4 py-3">{new Date(item.created_at).toLocaleString()}</td><td className="px-4 py-3">{item.product_id == null ? 'Deleted product' : productNames.get(item.product_id) ?? `Product #${item.product_id}`}</td><td className={`px-4 py-3 font-semibold ${(item.delta ?? 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>{item.delta == null ? '—' : `${item.delta > 0 ? '+' : ''}${item.delta}`}</td><td className="px-4 py-3">{item.old_qty ?? '—'} → {item.new_qty ?? '—'}</td><td className="px-4 py-3">{REASON_LABELS[item.reason ?? ''] ?? item.reason ?? 'Unknown'}</td><td className="px-4 py-3">{item.actor_email ?? '—'}</td></tr>)}</tbody></table></div>}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400"><span>{count} movement(s)</span><div className="flex gap-2"><button type="button" disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-40">Previous</button><span className="px-2 py-2">Page {page + 1} of {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span><button type="button" disabled={(page + 1) * PAGE_SIZE >= count || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-40">Next</button></div></div>
      </section>
    </div>
  )
}
