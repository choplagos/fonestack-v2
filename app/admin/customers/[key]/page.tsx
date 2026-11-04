'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, Briefcase, CalendarDays, FileText, MessageSquare } from 'lucide-react'

import PhoneActions from '@/components/admin/PhoneActions'
import { supabase } from '@/lib/supabase'

type Customer = {
  key: string
  name: string | null
  phone: string | null
  email: string | null
  invoice_count: number
  total_billed: number
  total_paid: number
  balance_due: number
  trade_in_count: number
  request_count: number
  first_seen: string | null
  last_activity: string | null
}

type InvoiceActivity = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_snapshot: unknown
  total_amount: number | null
  amount_due: number | null
  status: string
  created_at: string
}

type TradeInActivity = {
  id: number
  customer_name: string
  customer_phone: string
  brand: string
  model: string
  status: string
  estimate_low: number | null
  estimate_high: number | null
  final_offer: number | null
  created_at: string | null
}

type DeviceRequestActivity = {
  id: number
  customer_name: string | null
  phone: string | null
  requested_device: string | null
  budget: number | null
  status: string | null
  source: string | null
  created_at: string | null
}

type TimelineEvent = {
  key: string
  date: string | null
  title: string
  detail: string
  status: string
  href?: string
  kind: 'invoice' | 'trade-in' | 'request'
}

type PageResult<T> = { data: T[] | null; error: { message: string } | null }

function canonicalPhone(value: string | null | undefined) {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return digits.length === 10 ? `234${digits}` : digits
}

function phoneSearchPattern(value: string) {
  const canonical = canonicalPhone(value)
  const nationalDigits = canonical.startsWith('234') ? canonical.slice(3) : canonical
  const significantDigits = nationalDigits.slice(-10)
  return `%${significantDigits.split('').join('%')}%`
}

async function fetchAllPages<T>(loadPage: (from: number, to: number) => Promise<PageResult<T>>) {
  const rows: T[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await loadPage(offset, offset + 999)
    if (error) throw new Error(error.message)
    const page = data ?? []
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}

function formatNaira(value: number) {
  return `₦${Number(value || 0).toLocaleString('en-NG')}`
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : '—'
}

function getSnapshotName(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== 'object') return ''
  const record = snapshot as Record<string, unknown>
  if (Array.isArray(record.items)) {
    return record.items
      .map((item) => {
        if (!item || typeof item !== 'object') return ''
        const row = item as Record<string, unknown>
        return [row.brand, row.name].filter((value) => typeof value === 'string').join(' ')
      })
      .filter(Boolean)
      .join(', ')
  }
  return [record.brand, record.name].filter((value) => typeof value === 'string').join(' ')
}

export default function CustomerDetailsPage() {
  const params = useParams<{ key: string }>()
  const customerKey = decodeURIComponent(params.key)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadCustomer() {
      const directoryRows = await fetchAllPages<Customer>(async (from, to) => {
        const result = await supabase
          .from('customer_directory')
          .select('*')
          .order('key', { ascending: true })
          .range(from, to)
        return { data: (result.data ?? null) as Customer[] | null, error: result.error }
      })
      if (!active) return

      const targetPhone = canonicalPhone(customerKey)
      const matchingRows = directoryRows
        .filter((row) => targetPhone && canonicalPhone(row.phone || row.key) === targetPhone)
      if (matchingRows.length === 0) {
        setErrorMessage('Customer record not found.')
        setLoading(false)
        return
      }

      const orderedRows = [...matchingRows].sort((a, b) => (a.last_activity ?? '').localeCompare(b.last_activity ?? ''))
      const latest = orderedRows[orderedRows.length - 1]
      const mergedCustomer: Customer = {
        ...latest,
        key: canonicalPhone(customerKey),
        invoice_count: matchingRows.reduce((total, row) => total + Number(row.invoice_count ?? 0), 0),
        total_billed: matchingRows.reduce((total, row) => total + Number(row.total_billed ?? 0), 0),
        total_paid: matchingRows.reduce((total, row) => total + Number(row.total_paid ?? 0), 0),
        balance_due: matchingRows.reduce((total, row) => total + Number(row.balance_due ?? 0), 0),
        trade_in_count: matchingRows.reduce((total, row) => total + Number(row.trade_in_count ?? 0), 0),
        request_count: matchingRows.reduce((total, row) => total + Number(row.request_count ?? 0), 0),
        first_seen: matchingRows.map((row) => row.first_seen).filter((value): value is string => Boolean(value)).sort()[0] ?? null,
        last_activity: matchingRows.map((row) => row.last_activity).filter((value): value is string => Boolean(value)).sort().reverse()[0] ?? null,
      }
      setCustomer(mergedCustomer)
      setLoading(false)
      setActivityLoading(true)
      setErrorMessage('')

      const fetchInvoices = fetchAllPages<InvoiceActivity>(async (from, to) => {
        const result = await supabase
          .from('invoices')
          .select('id, invoice_number, customer_name, customer_phone, customer_email, product_snapshot, total_amount, amount_due, status, created_at')
          .ilike('customer_phone', phoneSearchPattern(mergedCustomer.key))
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(from, to)
        return { data: (result.data ?? null) as InvoiceActivity[] | null, error: result.error }
      })
      const fetchTradeIns = fetchAllPages<TradeInActivity>(async (from, to) => {
        const result = await supabase
          .from('trade_in_requests')
          .select('id, customer_name, customer_phone, brand, model, status, estimate_low, estimate_high, final_offer, created_at')
          .ilike('customer_phone', phoneSearchPattern(mergedCustomer.key))
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(from, to)
        return { data: (result.data ?? null) as TradeInActivity[] | null, error: result.error }
      })
      const fetchRequests = fetchAllPages<DeviceRequestActivity>(async (from, to) => {
        const result = await supabase
          .from('device_requests')
          .select('id, customer_name, phone, requested_device, budget, status, source, created_at')
          .ilike('phone', phoneSearchPattern(mergedCustomer.key))
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(from, to)
        return { data: (result.data ?? null) as DeviceRequestActivity[] | null, error: result.error }
      })

      const results = await Promise.allSettled([fetchInvoices, fetchTradeIns, fetchRequests])
      if (!active) return
      const errors = results.flatMap((result, index) => result.status === 'rejected'
        ? [`${['invoices', 'trade-ins', 'device requests'][index]}: ${result.reason instanceof Error ? result.reason.message : 'could not be loaded'}`]
        : [])
      if (errors.length) setErrorMessage(`Some customer activity could not be loaded — ${errors.join('; ')}`)

      const invoices = results[0].status === 'fulfilled'
        ? results[0].value.filter((row) => canonicalPhone(row.customer_phone) === canonicalPhone(mergedCustomer.key))
        : []
      const tradeIns = results[1].status === 'fulfilled'
        ? results[1].value.filter((row) => canonicalPhone(row.customer_phone) === canonicalPhone(mergedCustomer.key))
        : []
      const requests = results[2].status === 'fulfilled'
        ? results[2].value.filter((row) => canonicalPhone(row.phone) === canonicalPhone(mergedCustomer.key))
        : []

      const events: TimelineEvent[] = [
        ...invoices.map((row): TimelineEvent => ({
          key: `invoice-${row.id}`,
          date: row.created_at,
          title: `Invoice ${row.invoice_number}`,
          detail: [getSnapshotName(row.product_snapshot), `Total ${formatNaira(Number(row.total_amount ?? 0))}`, Number(row.amount_due ?? 0) > 0 ? `Due ${formatNaira(Number(row.amount_due))}` : 'Paid'].filter(Boolean).join(' · '),
          status: row.status,
          href: `/admin/invoices/${row.id}`,
          kind: 'invoice',
        })),
        ...tradeIns.map((row): TimelineEvent => ({
          key: `trade-in-${row.id}`,
          date: row.created_at,
          title: `Trade-in · ${row.brand} ${row.model}`,
          detail: [
            row.estimate_low === null || row.estimate_high === null ? '' : `Estimate ${formatNaira(Number(row.estimate_low))}–${formatNaira(Number(row.estimate_high))}`,
            row.final_offer === null ? '' : `Final offer ${formatNaira(Number(row.final_offer))}`,
          ].filter(Boolean).join(' · ') || 'Trade-in request received',
          status: row.status,
          href: `/admin/trade-ins?focus=${row.id}`,
          kind: 'trade-in',
        })),
        ...requests.map((row): TimelineEvent => ({
          key: `request-${row.id}`,
          date: row.created_at,
          title: `Device request · ${row.requested_device || 'Device not specified'}`,
          detail: [row.budget === null ? '' : `Budget ${formatNaira(Number(row.budget))}`, row.source ? `Via ${row.source}` : ''].filter(Boolean).join(' · ') || 'Customer device request',
          status: row.status || 'pending',
          href: `/admin/leads?focus=${row.id}`,
          kind: 'request',
        })),
      ].sort((a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0))
      setTimeline(events)
      setActivityLoading(false)
    }

    void loadCustomer().catch((error: unknown) => {
      if (!active) return
      setErrorMessage(`Could not load customer profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
      setActivityLoading(false)
    })
    return () => { active = false }
  }, [customerKey])

  const stats = useMemo(() => customer ? [
    { label: 'Invoices', value: Number(customer.invoice_count), icon: FileText },
    { label: 'Total billed', value: formatNaira(Number(customer.total_billed)), icon: Briefcase },
    { label: 'Paid', value: formatNaira(Number(customer.total_paid)), icon: FileText },
    { label: 'Balance due', value: formatNaira(Number(customer.balance_due)), icon: FileText },
    { label: 'Trade-ins', value: Number(customer.trade_in_count), icon: Briefcase },
    { label: 'Device requests', value: Number(customer.request_count), icon: MessageSquare },
  ] : [], [customer])

  if (loading) return <p className="p-6 text-sm text-slate-400">Loading customer…</p>

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to customers
      </Link>
      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{errorMessage}</span>
        </div>
      )}
      {!customer ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Customer profile unavailable.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Customer profile</p>
                <h1 className="mt-2 text-2xl font-black text-white">{customer.name || 'Customer'}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                  <PhoneActions phone={customer.phone} values={{ customer_name: customer.name ?? '' }} />
                  {customer.email && <a className="text-slate-300 hover:text-white" href={`mailto:${customer.email}`}>{customer.email}</a>}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  First seen {formatDate(customer.first_seen)}
                  {' · '}Last activity {formatDate(customer.last_activity)}
                </p>
              </div>
              <Link href={`/admin/invoices/new?customer_name=${encodeURIComponent(customer.name ?? '')}&customer_phone=${encodeURIComponent(customer.phone ?? '')}&customer_email=${encodeURIComponent(customer.email ?? '')}`} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-premiumYellow px-4 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110">
                New invoice for this customer
              </Link>
            </div>
          </section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <section key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  {stat.label}<stat.icon className="h-4 w-4 text-premiumYellow" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xl font-bold text-white">{stat.value}</p>
              </section>
            ))}
          </div>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Activity timeline</h2>
                <p className="mt-1 text-sm text-slate-400">Invoices, trade-ins, and device requests for this phone number.</p>
              </div>
              <CalendarDays className="h-5 w-5 text-premiumYellow" aria-hidden="true" />
            </div>
            {activityLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">Loading customer activity…</div>
            ) : timeline.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">No activity records found for this customer.</div>
            ) : (
              <ol className="space-y-3">
                {timeline.map((event) => {
                  const EventIcon = event.kind === 'invoice' ? FileText : event.kind === 'trade-in' ? Briefcase : MessageSquare
                  const content = (
                    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-premiumYellow/10 text-premiumYellow"><EventIcon className="h-4 w-4" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <time className="text-xs text-slate-500">{formatDate(event.date)}</time>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{event.detail}</p>
                        <span className="mt-2 inline-flex rounded-full border border-white/10 px-2 py-0.5 text-xs capitalize text-slate-300">{event.status}</span>
                      </div>
                    </div>
                  )
                  return <li key={event.key}>{event.href ? <Link href={event.href} className="block">{content}</Link> : content}</li>
                })}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  )
}
