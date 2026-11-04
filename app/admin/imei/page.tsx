'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircle, Package, Search, ShieldCheck } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import PhoneActions from '@/components/admin/PhoneActions'

type ProductMatch = {
  id: number
  name: string
  brand: string
  status: string
  stock_quantity: number
  condition_grade: string | null
  imei: string
}

type InvoiceMatch = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  status: string
  created_at: string
  product_snapshot?: unknown
  imei?: string | null
}

export default function ImeiLookupPage() {
  const [imei, setImei] = useState('')
  const [product, setProduct] = useState<ProductMatch | null>(null)
  const [invoice, setInvoice] = useState<InvoiceMatch | null>(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function searchImei(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = imei.trim()
    if (!query) return

    setLoading(true)
    setErrorMessage('')
    setSearched(false)
    const [productResult, invoiceResult] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, brand, status, stock_quantity, condition_grade, imei')
        .eq('imei', query)
        .maybeSingle(),
      supabase
        .from('invoices')
        .select('id, invoice_number, customer_name, customer_phone, status, created_at, imei, product_snapshot')
        .eq('imei', query)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    let multiInvoice: InvoiceMatch | null = null
    let snapshotError: string | null = null
    if (!invoiceResult.error && !invoiceResult.data) {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from('invoices')
          .select('id,invoice_number,customer_name,customer_phone,status,created_at,imei,product_snapshot')
          .order('created_at', { ascending: false })
          .range(offset, offset + 999)
        if (error) {
          snapshotError = error.message
          break
        }
        const page = (data ?? []) as InvoiceMatch[]
        multiInvoice = page.find((row) => {
          if (!row.product_snapshot || typeof row.product_snapshot !== 'object') return false
          const snapshot = row.product_snapshot as { items?: unknown }
          return Array.isArray(snapshot.items) && snapshot.items.some((item) =>
            item && typeof item === 'object'
            && 'imei' in item
            && String((item as { imei?: unknown }).imei ?? '').trim().toLowerCase() === query.toLowerCase())
        }) ?? null
        if (multiInvoice || page.length < 1000) break
      }
    }

    if (productResult.error || invoiceResult.error || snapshotError) {
      setErrorMessage(
        [productResult.error?.message, invoiceResult.error?.message, snapshotError].filter(Boolean).join(' · '),
      )
      setProduct(null)
      setInvoice(null)
    } else {
      setProduct((productResult.data as ProductMatch | null) ?? null)
      setInvoice((invoiceResult.data as InvoiceMatch | null) ?? multiInvoice)
    }

    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
          Supabase · products and invoices
        </p>
        <h2 className="text-2xl font-black text-white">IMEI lookup</h2>
        <p className="mt-1 text-sm text-slate-400">Search inventory and sales records by exact device IMEI or serial.</p>
      </div>

      <form onSubmit={searchImei} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row">
        <label htmlFor="imei-search" className="sr-only">IMEI or serial number</label>
        <input
          id="imei-search"
          value={imei}
          onChange={(event) => setImei(event.target.value)}
          required
          placeholder="Enter IMEI or serial number"
          className="min-h-11 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-premiumYellow/70"
        />
        <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-premiumYellow px-5 text-sm font-bold text-black disabled:opacity-60">
          <Search className="h-4 w-4" aria-hidden="true" />
          {loading ? 'Searching…' : 'Look up'}
        </button>
      </form>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {searched && !errorMessage && (
        <section className="space-y-4">
          {product && (
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-premiumYellow" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Inventory record</p>
                  <h3 className="mt-1 font-bold text-white">{product.brand} {product.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">IMEI: {product.imei}</p>
                  <p className="mt-1 text-sm capitalize text-slate-400">
                    Status: {product.status} · Stock: {product.stock_quantity} · Grade: {product.condition_grade ?? '—'}
                  </p>
                </div>
              </div>
            </article>
          )}
          {invoice && (
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-premiumYellow" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Sales record</p>
                  <h3 className="mt-1 font-bold text-white">{invoice.invoice_number}</h3>
                  <p className="mt-2 text-sm text-slate-300">{invoice.customer_name} · <PhoneActions phone={invoice.customer_phone} values={{ customer_name: invoice.customer_name, invoice_number: invoice.invoice_number }} /></p>
                  {Boolean(invoice.product_snapshot && typeof invoice.product_snapshot === 'object' && Array.isArray((invoice.product_snapshot as { items?: unknown }).items)) && <p className="mt-1 text-sm text-slate-400">Matched an item IMEI in this multi-item invoice.</p>}
                  <p className="mt-1 text-sm capitalize text-slate-400">
                    Status: {invoice.status} · {new Date(invoice.created_at).toLocaleDateString('en-NG')}
                  </p>
                </div>
              </div>
            </article>
          )}
          {!product && !invoice && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              No matching inventory or invoice records were found for that identifier.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
