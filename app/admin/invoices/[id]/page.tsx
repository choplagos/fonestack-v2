'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Mail, MessageCircle, Printer } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import PhoneActions from '@/components/admin/PhoneActions'
import { loadWhatsAppConfiguration, makeWhatsAppUrl, renderTemplate } from '@/lib/whatsapp'

type InvoiceDetails = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_snapshot: { multi?: boolean; brand?: string; name?: string; spec?: string; image_url?: string; items?: InvoiceSnapshotItem[] } | null
  quantity: number
  unit_price: number
  unit_cost: number | null
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
type InvoiceSnapshotItem = { name?: string; brand?: string; spec?: string; imei?: string; quantity?: number; unit_price?: number }

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

  async function shareInvoiceOnWhatsApp() {
    if (!invoice) return
    const popup = window.open('about:blank', '_blank')
    if (!popup) {
      setShareError('Allow pop-ups to open WhatsApp.')
      setShareMessage('')
      return
    }
    try {
      const configuration = await loadWhatsAppConfiguration()
      const templateKey = Number(invoice.amount_due) > 0 ? 'payment_reminder' : 'invoice_share'
      const template = configuration.templates.find((item) => item.key === templateKey)
      if (!template) throw new Error(`The active ${templateKey.replace('_', ' ')} template is unavailable.`)
      const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fonestack.com.ng'}/invoice/${invoice.id}`
      const message = renderTemplate(template.body, {
        customer_name: invoice.customer_name,
        business_name: configuration.businessName,
        invoice_number: invoice.invoice_number,
        total: formatNaira(invoice.total_amount),
        amount_due: formatNaira(invoice.amount_due),
        product_name: productName,
        link,
      })
      const url = makeWhatsAppUrl(invoice.customer_phone, message)
      if (!url) throw new Error('Customer phone is unavailable for WhatsApp.')
      popup.location.href = url
      setShareMessage('Opening WhatsApp with the saved invoice message.')
      setShareError('')
    } catch (error) {
      popup.close()
      setShareError(error instanceof Error ? error.message : 'WhatsApp message could not be opened.')
      setShareMessage('')
    }
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

  const isMulti = invoice.product_snapshot?.multi === true && Array.isArray(invoice.product_snapshot.items)
  const productName = isMulti
    ? invoice.product_snapshot?.name ?? 'Multiple items'
    : `${invoice.product_snapshot?.brand ?? ''} ${invoice.product_snapshot?.name ?? ''}`.trim()
  const profit = invoice.unit_cost == null ? null : Number(invoice.total_amount) - Number(invoice.unit_cost)

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
          <Link href={`/admin/invoices/new?duplicate=${encodeURIComponent(invoice.id)}`} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white">
            Duplicate
          </Link>
          <Link
            href={`/invoice/${invoice.id}?print=1`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Save PDF
          </Link>
          <Link href={`/admin/invoices/${invoice.id}/receipt`} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print receipt
          </Link>
          <button
            type="button"
            onClick={() => {
              if (!emailRecipient.trim()) {
                setShareError('Enter the customer email address before sending.')
                document.getElementById('recipient-email')?.focus()
              } else {
                void sendInvoiceEmail()
              }
            }}
            disabled={sendingEmail}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50"
          >
            <Mail className="h-4 w-4" aria-hidden="true" /> Email
          </button>
          <button type="button" onClick={() => void shareInvoiceOnWhatsApp()} className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-200 hover:bg-green-500/20">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
          </button>
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
              id="recipient-email"
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

      <article className="mx-auto max-w-[600px] overflow-hidden rounded-xl border border-slate-200 bg-white text-[#191C17] shadow-xl print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b border-[#E9EBE6] px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[25px] font-extrabold leading-none tracking-[-1px] text-[#171914]">
              FONESTACK<span className="text-[#B7E34B]">.</span>
            </p>
            <span className="text-[11px] font-bold tracking-[1.5px] text-[#73786D]">INVOICE</span>
          </div>
        </header>

        <section className="px-5 pb-6 pt-8 sm:px-10">
          <p className="mb-2.5 text-[13px] text-[#74796F]">Hello {invoice.customer_name},</p>
          <h1 className="text-[30px] font-extrabold leading-tight tracking-[-1px] text-[#171914] sm:text-[34px]">
            Your invoice<br />is ready.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#62675E]">
            Thank you for choosing Fonestack. Here&apos;s a summary of your purchase and payment details.
          </p>
        </section>

        <section className="px-5 pb-7 sm:px-10">
          <div className="rounded-lg bg-[#F6F7F3] p-5 sm:px-[22px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-bold tracking-[1px] text-[#81867C]">INVOICE NUMBER</p>
                <p className="text-sm font-bold text-[#191C17]">{invoice.invoice_number}</p>
              </div>
              <span className="rounded-full bg-[#E8F3D1] px-3 py-1.5 text-[11px] font-bold capitalize text-[#456817]">
                {invoice.status}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1.5 text-[11px] text-[#81867C]">ISSUE DATE</p>
                <p className="text-[13px] text-[#191C17]">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</p>
              </div>
              <div className="text-right">
                <p className="mb-1.5 text-[11px] text-[#81867C]">BALANCE DUE</p>
                <p className="text-[13px] font-bold text-[#191C17]">{formatNaira(invoice.amount_due)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-7 sm:px-10">
          <p className="mb-3.5 text-[11px] font-bold tracking-[1.2px] text-[#81867C]">BILLED TO</p>
          <p className="mb-1 text-[15px] font-bold text-[#191C17]">{invoice.customer_name}</p>
          <p className="text-[13px] leading-7 text-[#62675E]">
            {invoice.customer_email && <>{invoice.customer_email}<br /></>}
            <span className="print:hidden"><PhoneActions phone={invoice.customer_phone} values={{ customer_name: invoice.customer_name, invoice_number: invoice.invoice_number, total: formatNaira(invoice.total_amount), amount_due: formatNaira(invoice.amount_due), product_name: productName, link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fonestack.com.ng'}/invoice/${invoice.id}` }} defaultTemplateKey={invoice.amount_due > 0 ? 'payment_reminder' : 'invoice_share'} /></span>
            <span className="hidden print:inline">{invoice.customer_phone}</span>
          </p>
        </section>

        <section className="overflow-x-auto px-5 pb-2.5 sm:px-10 print:overflow-visible">
          <table className="w-full min-w-[400px] border-collapse text-left print:min-w-0">
            <thead>
              <tr>
                <th colSpan={4} className="pb-3 text-[11px] font-bold tracking-[1px] text-[#81867C]">ORDER SUMMARY</th>
              </tr>
              <tr className="bg-[#F6F7F3] text-[11px] font-bold text-[#656A60]">
                <th className="px-2.5 py-3">Item</th>
                <th className="px-1.5 py-3 text-center">Qty</th>
                <th className="px-1.5 py-3 text-right">Price</th>
                <th className="px-2.5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {isMulti ? invoice.product_snapshot!.items!.map((item, index) => {
                const quantity = Number(item.quantity ?? 1)
                const price = Number(item.unit_price ?? 0)
                return <tr key={`${item.name}-${index}`} className="border-b border-[#E9EBE6] text-[13px]">
                  <td className="break-words px-2.5 py-4 text-[#191C17]">{[item.brand, item.name].filter(Boolean).join(' ') || 'Item'}{item.spec && <p className="mt-1 text-xs text-[#62675E]">{item.spec}</p>}{item.imei && <p className="mt-1 text-xs text-[#62675E]">IMEI: {item.imei}</p>}</td>
                  <td className="px-1.5 py-4 text-center text-[#62675E]">{quantity}</td>
                  <td className="px-1.5 py-4 text-right text-[#62675E]">{formatNaira(price)}</td>
                  <td className="px-2.5 py-4 text-right font-bold text-[#191C17]">{formatNaira(price * quantity)}</td>
                </tr>
              }) : <tr className="border-b border-[#E9EBE6] text-[13px]">
                <td className="break-words px-2.5 py-4 text-[#191C17]">{productName || 'Product details unavailable'}{invoice.product_snapshot?.spec && <p className="mt-1 text-xs text-[#62675E]">{invoice.product_snapshot.spec}</p>}{invoice.imei && <p className="mt-1 text-xs text-[#62675E]">IMEI: {invoice.imei}</p>}</td>
                <td className="px-1.5 py-4 text-center text-[#62675E]">{invoice.quantity}</td>
                <td className="px-1.5 py-4 text-right text-[#62675E]">{formatNaira(invoice.unit_price)}</td>
                <td className="px-2.5 py-4 text-right font-bold text-[#191C17]">{formatNaira(invoice.unit_price * invoice.quantity)}</td>
              </tr>}
            </tbody>
          </table>
        </section>

        <section className="px-5 pb-8 pt-5 sm:px-10">
          <dl className="ml-auto max-w-sm text-[13px]">
            <div className="flex justify-between gap-4 py-2 text-[#62675E]">
              <dt>Subtotal</dt><dd className="text-[#191C17]">{formatNaira(isMulti ? invoice.product_snapshot!.items!.reduce((sum, item) => sum + Number(item.quantity ?? 1) * Number(item.unit_price ?? 0), 0) : invoice.unit_price * invoice.quantity)}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 text-[#62675E]">
              <dt>Discount</dt><dd className="text-[#191C17]">−{formatNaira(invoice.discount_amount)}</dd>
            </div>
            <div className="mt-1 border-t border-[#DDE0D8] pt-3">
              <div className="flex items-center justify-between gap-4 py-2">
                <dt className="font-bold text-[#191C17]">TOTAL</dt>
                <dd className="text-xl font-bold tracking-tight text-[#A3C936]">{formatNaira(invoice.total_amount)}</dd>
              </div>
            </div>
            <div className="flex justify-between gap-4 py-2 text-[#62675E]">
              <dt>Paid / deposit</dt><dd className="text-[#191C17]">{formatNaira(invoice.deposit_amount)}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 font-bold text-[#191C17]">
              <dt>Balance due</dt><dd>{formatNaira(invoice.amount_due)}</dd>
            </div>
          </dl>
        </section>

        {profit !== null && <section className="px-5 pb-8 sm:px-10 print:hidden"><div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4"><h2 className="text-xs font-bold uppercase tracking-wider text-green-200">Profit</h2><p className="mt-2 text-sm text-slate-300">Cost: {formatNaira(Number(invoice.unit_cost))} <span className="mx-2">·</span> Profit: <strong className={profit >= 0 ? 'text-green-300' : 'text-red-300'}>{formatNaira(profit)}</strong></p></div></section>}

        <div className="px-5 pb-8 sm:px-10 print:hidden">
          <Link
            href={`/invoice/${invoice.id}`}
            target="_blank"
            className="block rounded-md bg-[#171914] px-6 py-4 text-center text-sm font-bold text-white hover:bg-[#30332B]"
          >
            View / Print Invoice <span aria-hidden="true">→</span>
          </Link>
        </div>

        {invoice.notes && (
          <section className="px-5 pb-7 sm:px-10">
            <p className="whitespace-pre-wrap border-t border-[#E9EBE6] pt-5 text-sm leading-6 text-[#62675E]">{invoice.notes}</p>
          </section>
        )}

        {invoice.terms_snapshot && (
          <section className="px-5 pb-7 sm:px-10">
            <div className="rounded-md border-l-[3px] border-[#B7E34B] bg-[#F6F7F3] px-5 py-[18px]">
              <p className="mb-2.5 text-[11px] font-bold tracking-[1.2px] text-[#191C17]">TERMS &amp; CONDITIONS</p>
              <p className="whitespace-pre-wrap text-xs leading-[1.8] text-[#62675E]">{invoice.terms_snapshot}</p>
            </div>
          </section>
        )}

        <footer className="bg-[#171914] px-6 py-8 text-center">
          <p className="mb-2 text-base font-bold tracking-tight text-white">FONESTACK<span className="text-[#B7E34B]">.</span></p>
          <p className="mb-4 text-[11px] leading-5 text-[#A5AAA0]">Gadgets. Technology. Everyday innovation.</p>
          <p className="mb-3 text-xs text-[#D6D9D2]">Need help with your invoice?</p>
          <p className="mb-4 text-xs text-[#B7E34B]">
            <a href="mailto:support@fonestack.com.ng" className="text-[#B7E34B]">support@fonestack.com.ng</a>
          </p>
          <p className="text-[11px] leading-5 text-[#858A80]">
            <a href="https://fonestack.com.ng" className="text-[#D6D9D2]">fonestack.com.ng</a>
            <br />Computer Village, Ikeja, Lagos, Nigeria
          </p>
          <p className="mt-5 text-[10px] leading-5 text-[#70756C]">
            © {new Date(invoice.created_at).getFullYear()} Fonestack. All rights reserved.
          </p>
        </footer>
      </article>
    </div>
  )
}
