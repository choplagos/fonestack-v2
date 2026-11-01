'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Printer } from 'lucide-react'

import { supabase } from '@/lib/supabase'

type InvoiceDetails = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_snapshot: { brand?: string; name?: string; spec?: string; image_url?: string } | null
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number
  deposit_amount: number
  amount_due: number
  status: string
  payment_method: string | null
  imei: string | null
  notes: string | null
  terms_snapshot: string | null
  created_at: string
  paid_at: string | null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function AdminInvoiceDetailsPage() {
  const params = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadInvoice() {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!active) return
      if (error) {
        setErrorMessage(error.message)
      } else {
        setInvoice(data as InvoiceDetails)
      }
      setLoading(false)
    }

    if (params.id) void loadInvoice()
    return () => {
      active = false
    }
  }, [params.id])

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading invoice from Supabase…</div>
  }

  if (errorMessage || !invoice) {
    return (
      <div className="space-y-4 p-4">
        <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to invoices
        </Link>
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage || 'Invoice not found.'}</span>
        </div>
      </div>
    )
  }

  const productName = `${invoice.product_snapshot?.brand ?? ''} ${invoice.product_snapshot?.name ?? ''}`.trim()

  return (
    <div className="space-y-5 p-1 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to invoices
        </Link>
        <div className="flex gap-2">
          <Link href={`/invoice/${invoice.id}`} target="_blank" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white">
            Customer invoice
          </Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save PDF
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl md:p-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-amber-600">FONESTACK</p>
            <h1 className="mt-2 text-2xl font-black">Sales invoice</h1>
            <p className="mt-2 text-sm text-slate-500">{invoice.invoice_number}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</p>
            <p className="mt-2 capitalize text-slate-500">Status: {invoice.status}</p>
            {invoice.paid_at && <p className="mt-1 text-slate-500">Paid: {new Date(invoice.paid_at).toLocaleDateString('en-NG')}</p>}
          </div>
        </header>

        <section className="grid gap-5 py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bill to</h2>
            <p className="mt-2 font-semibold">{invoice.customer_name}</p>
            <p className="text-sm text-slate-600">{invoice.customer_phone}</p>
            {invoice.customer_email && <p className="text-sm text-slate-600">{invoice.customer_email}</p>}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment</h2>
            <p className="mt-2 capitalize">{invoice.payment_method ?? '—'}</p>
            {invoice.imei && <p className="mt-1 text-sm text-slate-600">IMEI / serial: {invoice.imei}</p>}
          </div>
        </section>

        <table className="w-full border-y border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-500">
              <th className="py-3">Item</th>
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
          <div className="flex justify-between"><dt>Deposit / paid</dt><dd>{formatNaira(invoice.deposit_amount)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Balance due</dt><dd>{formatNaira(invoice.amount_due)}</dd></div>
        </dl>

        {invoice.notes && <p className="mt-8 whitespace-pre-wrap border-t border-slate-200 pt-5 text-sm text-slate-600">{invoice.notes}</p>}
        {invoice.terms_snapshot && <p className="mt-6 whitespace-pre-wrap text-xs text-slate-500">{invoice.terms_snapshot}</p>}
      </article>
    </div>
  )
}
