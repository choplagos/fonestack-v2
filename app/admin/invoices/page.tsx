'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Download, Mail, MessageCircle, Plus, Search } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { exportCsv, exportXlsx, type ExportColumn } from '@/lib/export'
import { loadWhatsAppConfiguration, makeWhatsAppUrl, renderTemplate } from '@/lib/whatsapp'
import PhoneActions from '@/components/admin/PhoneActions'
import { useAdminRole } from '@/components/AdminLayoutClient'

type Invoice = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_snapshot: { multi?: boolean; brand?: string; name?: string; items?: Array<{ name?: string; brand?: string; spec?: string; imei?: string; quantity?: number; unit_price?: number }> } | null
  quantity: number
  unit_price: number
  unit_cost: number | null
  discount_amount: number
  total_amount: number | null
  deposit_amount: number
  amount_due: number | null
  status: string
  payment_method: string | null
  created_at: string
}

type InvoiceExportRow = {
  invoice_number: string
  date: string
  customer: string
  phone: string
  email: string
  item: string
  quantity: number
  unit_price: number
  discount: number
  total: number
  paid: number
  balance_due: number
  status: string
  payment_method: string
}

const INVOICE_EXPORT_COLUMNS: ExportColumn<InvoiceExportRow>[] = [
  { header: 'Invoice number', key: 'invoice_number' },
  { header: 'Date', key: 'date' },
  { header: 'Customer', key: 'customer' },
  { header: 'Phone', key: 'phone' },
  { header: 'Email', key: 'email' },
  { header: 'Item', key: 'item' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit price', key: 'unit_price' },
  { header: 'Discount', key: 'discount' },
  { header: 'Total', key: 'total' },
  { header: 'Paid', key: 'paid' },
  { header: 'Balance due', key: 'balance_due' },
  { header: 'Status', key: 'status' },
  { header: 'Payment method', key: 'payment_method' },
]

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function InvoicesPage() {
  const router = useRouter()
  const { role } = useAdminRole()
  const showProfit = role === 'owner' || role === 'staff'
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [filter, setFilter] = useState<'all' | 'balance-due'>('all')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let active = true
    async function loadInvoices() {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, customer_name, customer_phone, customer_email, product_snapshot, quantity, unit_price, unit_cost, discount_amount, total_amount, deposit_amount, amount_due, status, payment_method, created_at')
        .order('created_at', { ascending: false })

      if (!active) return
      if (error) {
        setErrorMessage(error.message)
      } else {
        setInvoices((data ?? []) as Invoice[])
      }
      setLoading(false)
    }

    void loadInvoices()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const requestedStatus = searchParams.get('status')
    setStatus(['pending', 'deposit', 'paid', 'cancelled'].includes(requestedStatus ?? '') ? requestedStatus! : 'all')
    setFilter(searchParams.get('filter') === 'balance-due' ? 'balance-due' : 'all')
  }, [searchParams])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const visibleInvoices = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesSearch =
        !needle ||
        `${invoice.invoice_number} ${invoice.customer_name} ${invoice.customer_phone}`
          .toLowerCase()
          .includes(needle)
      const matchesBalance = filter !== 'balance-due'
        || (Number(invoice.amount_due ?? 0) > 0 && invoice.status !== 'cancelled')
      return matchesSearch && matchesBalance && (status === 'all' || invoice.status === status)
    })
  }, [invoices, search, status, filter])

  const exportRows = visibleInvoices.map((invoice) => ({
    invoice_number: invoice.invoice_number,
    date: new Date(invoice.created_at).toLocaleDateString('en-NG'),
    customer: invoice.customer_name,
    phone: invoice.customer_phone,
    email: invoice.customer_email ?? '',
    item: invoice.product_snapshot?.multi && invoice.product_snapshot.name
      ? invoice.product_snapshot.name
      : `${invoice.product_snapshot?.brand ?? ''} ${invoice.product_snapshot?.name ?? ''}`.trim(),
    quantity: invoice.quantity,
    unit_price: Number(invoice.unit_price),
    discount: Number(invoice.discount_amount),
    total: Number(invoice.total_amount ?? 0),
    paid: Number(invoice.deposit_amount),
    balance_due: Number(invoice.amount_due ?? 0),
    status: invoice.status,
    payment_method: invoice.payment_method ?? '',
  }))

  async function sendInvoiceEmail(invoice: Invoice) {
    if (!invoice.customer_email) {
      router.push(`/admin/invoices/${invoice.id}`)
      return
    }
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const token = data.session?.access_token
      if (!token) throw new Error('Your admin session has expired. Sign in again.')
      const response = await fetch('/api/admin/invoices/send-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, recipient: invoice.customer_email }),
      })
      const result = await response.json() as { message?: string; error?: string }
      if (!response.ok) throw new Error(result.error || 'Invoice email could not be sent.')
      setToast({ type: 'success', text: `Invoice email sent to ${invoice.customer_email}.` })
    } catch (error) {
      setToast({ type: 'error', text: error instanceof Error ? error.message : 'Invoice email could not be sent.' })
    }
  }

  async function shareInvoice(invoice: Invoice) {
    const popup = window.open('about:blank', '_blank')
    if (!popup) {
      setToast({ type: 'error', text: 'Allow pop-ups to open WhatsApp.' })
      return
    }
    try {
      const configuration = await loadWhatsAppConfiguration()
      const templateKey = Number(invoice.amount_due ?? 0) > 0 ? 'payment_reminder' : 'invoice_share'
      const template = configuration.templates.find((item) => item.key === templateKey)
      if (!template) throw new Error(`The active ${templateKey.replace('_', ' ')} template is unavailable.`)
      const itemName = invoice.product_snapshot?.items?.map((item) => `${item.brand ?? ''} ${item.name ?? ''}`.trim()).join(', ')
        || `${invoice.product_snapshot?.brand ?? ''} ${invoice.product_snapshot?.name ?? ''}`.trim()
      const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fonestack.com.ng'}/invoice/${invoice.id}`
      const message = renderTemplate(template.body, {
        customer_name: invoice.customer_name,
        business_name: configuration.businessName,
        invoice_number: invoice.invoice_number,
        total: formatNaira(Number(invoice.total_amount ?? 0)),
        amount_due: formatNaira(Number(invoice.amount_due ?? 0)),
        product_name: itemName,
        link,
      })
      const url = makeWhatsAppUrl(invoice.customer_phone, message)
      if (!url) throw new Error('Customer phone is unavailable for WhatsApp.')
      popup.location.href = url
      setToast({ type: 'success', text: `Opening WhatsApp for ${invoice.customer_name}.` })
    } catch (error) {
      popup.close()
      setToast({ type: 'error', text: error instanceof Error ? error.message : 'WhatsApp message could not be opened.' })
    }
  }

  async function exportExcel() {
    try {
      await exportXlsx('fonestack-invoices.xlsx', INVOICE_EXPORT_COLUMNS, exportRows)
    } catch (error) {
      setErrorMessage(`Could not export invoices to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
            Supabase · invoices
          </p>
          <h2 className="text-2xl font-black text-white">Sales & invoices</h2>
          <p className="mt-1 text-sm text-slate-400">Real customer invoices and payment status.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New invoice
        </Link>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Could not load invoices: {errorMessage}</span>
        </div>
      )}
      {toast && (
        <p role={toast.type === 'error' ? 'alert' : 'status'} className={`fixed right-4 top-4 z-50 max-w-sm rounded-xl border p-3 text-sm shadow-xl ${toast.type === 'success' ? 'border-green-500/30 bg-slate-900 text-green-200' : 'border-red-500/30 bg-slate-900 text-red-200'}`}>
          {toast.text}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4">
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => exportCsv('fonestack-invoices.csv', INVOICE_EXPORT_COLUMNS, exportRows)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </button>
            <button type="button" onClick={() => void exportExcel()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
              <Download className="h-4 w-4" aria-hidden="true" /> Export Excel
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, customer, or phone"
              className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-premiumYellow/70"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="deposit">Deposit</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            aria-label="Filter invoices by balance"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
          >
            <option value="all">All balances</option>
            <option value="balance-due">Balance due</option>
          </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Due</th>
                {showProfit && <th className="px-5 py-3">Profit</th>}
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr><td colSpan={showProfit ? 8 : 7} className="px-5 py-8 text-center text-slate-400">Loading invoices from Supabase…</td></tr>
              ) : visibleInvoices.length === 0 ? (
                <tr><td colSpan={showProfit ? 8 : 7} className="px-5 py-8 text-center text-slate-400">No invoices match this filter.</td></tr>
              ) : visibleInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/invoices/${invoice.id}`} className="font-mono font-semibold text-premiumYellow hover:underline">
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{invoice.customer_name}</div>
                    <div className="mt-1 text-xs text-slate-400">{invoice.product_snapshot?.multi && invoice.product_snapshot.name ? invoice.product_snapshot.name : `${invoice.product_snapshot?.brand ?? ''} ${invoice.product_snapshot?.name ?? ''}`.trim()}</div>
                    <div className="mt-1"><PhoneActions phone={invoice.customer_phone} values={{ customer_name: invoice.customer_name, invoice_number: invoice.invoice_number, total: formatNaira(Number(invoice.total_amount ?? 0)), amount_due: formatNaira(Number(invoice.amount_due ?? 0)), product_name: invoice.product_snapshot?.name }} defaultTemplateKey={Number(invoice.amount_due ?? 0) > 0 ? 'payment_reminder' : 'invoice_share'} /></div>
                  </td>
                  <td className="px-5 py-4">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</td>
                  <td className="px-5 py-4">{formatNaira(Number(invoice.total_amount ?? 0))}</td>
                  <td className="px-5 py-4">{formatNaira(Number(invoice.amount_due ?? 0))}</td>
                  {showProfit && <td className="px-5 py-4">{invoice.unit_cost == null ? '—' : <div><p>{formatNaira(Number(invoice.unit_cost))} cost</p><p className={`mt-1 text-xs font-semibold ${Number(invoice.total_amount ?? 0) - Number(invoice.unit_cost) >= 0 ? 'text-green-300' : 'text-red-300'}`}>{formatNaira(Number(invoice.total_amount ?? 0) - Number(invoice.unit_cost))} profit</p></div>}</td>}
                  <td className="px-5 py-4 capitalize">{invoice.status}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => void sendInvoiceEmail(invoice)} aria-label={`Email invoice ${invoice.invoice_number}`} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-xs text-slate-300 hover:bg-white/10">
                        <Mail className="h-4 w-4" aria-hidden="true" /><span>Email</span>
                      </button>
                      <button type="button" onClick={() => void shareInvoice(invoice)} aria-label={`Share invoice ${invoice.invoice_number} on WhatsApp`} className="inline-flex items-center gap-1 rounded-lg border border-green-500/20 px-2 py-2 text-xs text-green-200 hover:bg-green-500/10">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" /><span>WhatsApp</span>
                      </button>
                      <Link href={`/admin/invoices/new?duplicate=${encodeURIComponent(invoice.id)}`} aria-label={`Duplicate invoice ${invoice.invoice_number}`} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-xs text-slate-300 hover:bg-white/10">Duplicate</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
