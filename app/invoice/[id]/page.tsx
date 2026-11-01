'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle, Printer } from 'lucide-react'

import { supabase } from '@/lib/supabase'

type PublicInvoice = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_snapshot: { brand?: string; name?: string; spec?: string } | null
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number
  status: string
  payment_method: string | null
  notes: string | null
  created_at: string
  paid_at: string | null
  imei: string | null
  settings: Record<string, string> | null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [printWhenReady, setPrintWhenReady] = useState(false)

  useEffect(() => {
    setPrintWhenReady(new URLSearchParams(window.location.search).get('print') === '1')
  }, [])

  useEffect(() => {
    let active = true
    async function loadInvoice() {
      const { data, error } = await supabase.rpc('get_public_invoice', {
        p_invoice_id: id,
      })

      if (!active) return
      if (error) {
        setErrorMessage(error.message)
      } else {
        const row = Array.isArray(data) ? data[0] : data
        setInvoice((row as PublicInvoice | undefined) ?? null)
      }
      setLoading(false)
    }

    if (id) void loadInvoice()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!invoice || !printWhenReady) return

    const printTimer = window.setTimeout(() => window.print(), 500)
    return () => window.clearTimeout(printTimer)
  }, [invoice, printWhenReady])

  if (loading) {
    return <main className="mx-auto max-w-3xl px-5 py-16 text-center text-slate-400">Loading invoice…</main>
  }

  if (errorMessage || !invoice) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage || 'This invoice could not be found.'}</span>
        </div>
        <Link href="/" className="mt-5 inline-block text-sm text-premiumYellow hover:underline">Return to Fonestack</Link>
      </main>
    )
  }

  const settings = invoice.settings ?? {}
  const productName = `${invoice.product_snapshot?.brand ?? ''} ${invoice.product_snapshot?.name ?? ''}`.trim()

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end print:hidden">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print / Save PDF
        </button>
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl md:p-10 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            {settings.logo_url && (
              <img src={settings.logo_url} alt="" className="mb-3 max-h-14 max-w-40 object-contain" />
            )}
            <p className="text-sm font-bold tracking-[0.2em] text-amber-600">{settings.business_name || 'FONESTACK'}</p>
            {settings.invoice_tagline && <p className="mt-1 text-xs text-slate-500">{settings.invoice_tagline}</p>}
            {settings.business_address && <p className="mt-2 text-xs text-slate-500">{settings.business_address}</p>}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black">Invoice</h1>
            <p className="mt-2 font-mono text-sm">{invoice.invoice_number}</p>
            <p className="mt-1 text-xs capitalize text-slate-500">{invoice.status}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</p>
          </div>
        </header>

        <section className="grid gap-5 py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer</h2>
            <p className="mt-2 font-semibold">{invoice.customer_name}</p>
            <p className="text-sm text-slate-600">{invoice.customer_phone}</p>
            {invoice.customer_email && <p className="text-sm text-slate-600">{invoice.customer_email}</p>}
          </div>
          <div className="text-sm text-slate-600">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment details</h2>
            <p className="mt-2 capitalize">Method: {invoice.payment_method ?? '—'}</p>
            {invoice.paid_at && <p>Paid on: {new Date(invoice.paid_at).toLocaleDateString('en-NG')}</p>}
            {invoice.imei && <p className="mt-1">IMEI / serial: {invoice.imei}</p>}
          </div>
        </section>

        <table className="w-full border-y border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-500">
              <th className="py-3">Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Unit price</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-4">
                <p className="font-semibold">{productName || 'Product details unavailable'}</p>
                {invoice.product_snapshot?.spec && <p className="mt-1 text-xs text-slate-500">{invoice.product_snapshot.spec}</p>}
              </td>
              <td className="py-4 text-right">{invoice.quantity}</td>
              <td className="py-4 text-right">{formatNaira(invoice.unit_price)}</td>
              <td className="py-4 text-right">{formatNaira(invoice.unit_price * invoice.quantity)}</td>
            </tr>
          </tbody>
        </table>

        <dl className="ml-auto mt-6 grid max-w-sm gap-2 text-sm">
          <div className="flex justify-between"><dt>Discount</dt><dd>{formatNaira(invoice.discount_amount)}</dd></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold"><dt>Total</dt><dd>{formatNaira(invoice.total_amount)}</dd></div>
        </dl>

        {invoice.notes && <p className="mt-8 whitespace-pre-wrap border-t border-slate-200 pt-5 text-sm text-slate-600">{invoice.notes}</p>}
        {settings.invoice_terms && <p className="mt-6 whitespace-pre-wrap text-xs text-slate-500">{settings.invoice_terms}</p>}
        {settings.invoice_footer && <p className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">{settings.invoice_footer}</p>}
      </article>
    </main>
  )
}
