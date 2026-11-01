'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Mail, MessageCircle, Printer } from 'lucide-react'

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
  const [emailRecipient, setEmailRecipient] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [shareError, setShareError] = useState('')
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
        const invoiceData = data as InvoiceDetails
        setInvoice(invoiceData)
        setEmailRecipient(invoiceData.customer_email ?? '')
      }
      setLoading(false)
    }

    if (params.id) void loadInvoice()
    return () => {
      active = false
    }
  }, [params.id])

  async function sendInvoiceEmail() {
    if (!invoice || !emailRecipient.trim()) {
      setShareError('Enter the customer email address before sending.')
      setShareMessage('')
      return
    }

    setSendingEmail(true)
    setShareError('')
    setShareMessage('')
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!sessionData.session?.access_token) {
        throw new Error('Your admin session has expired. Sign in again.')
      }

      const response = await fetch('/api/admin/invoices/send-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id, recipient: emailRecipient.trim() }),
      })
      const result = await response.json() as { message?: string; error?: string }
      if (!response.ok) throw new Error(result.error || 'Invoice email could not be sent.')
      setShareMessage(`Invoice email sent to ${emailRecipient.trim()}.`)
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Invoice email could not be sent.')
    } finally {
      setSendingEmail(false)
    }
  }

  function getWhatsAppUrl() {
    if (!invoice) return null
    const digits = invoice.customer_phone.replace(/\D/g, '')
    const internationalNumber = digits.startsWith('0')
      ? `234${digits.slice(1)}`
      : digits
    if (internationalNumber.length < 10) return null

    const message = `Hi ${invoice.customer_name}, please find invoice ${invoice.invoice_number} attached. Thank you for choosing Fonestack!`
    return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`
  }

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
  const whatsappUrl = getWhatsAppUrl()

  return (
    <div className="space-y-5 p-1 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to invoices
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invoice/${invoice.id}`} target="_blank" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white">
            Customer invoice
          </Link>
          <Link
            href={`/invoice/${invoice.id}?print=1`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Save PDF
          </Link>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-200 hover:bg-green-500/20"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp message
            </a>
          ) : (
            <span className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-500">
              Customer phone unavailable for WhatsApp
            </span>
          )}
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save PDF
          </button>
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-white">Email invoice</h2>
          <p className="mt-1 text-xs text-slate-400">Sends the invoice details and your current Terms &amp; Conditions by email.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 space-y-1 text-xs font-semibold text-slate-300">
            Recipient email
            <input
              type="email"
              required
              value={emailRecipient}
              onChange={(event) => setEmailRecipient(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-premiumYellow/70"
            />
          </label>
          <button
            type="button"
            onClick={() => void sendInvoiceEmail()}
            disabled={sendingEmail || !emailRecipient.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {sendingEmail ? 'Sending…' : 'Send email'}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          To attach a PDF in WhatsApp, save the PDF first, open the WhatsApp message, then attach and send the downloaded file.
        </p>
        {shareError && <p role="alert" className="text-sm text-red-300">{shareError}</p>}
        {shareMessage && <p role="status" className="text-sm text-green-300">{shareMessage}</p>}
      </section>

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
