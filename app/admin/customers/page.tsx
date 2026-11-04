'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Download, FileSpreadsheet, Search, Users } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { exportCsv, exportXlsx, type ExportColumn } from '@/lib/export'
import PhoneActions from '@/components/admin/PhoneActions'

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

type SortKey = 'last_activity' | 'name' | 'invoice_count' | 'total_billed' | 'balance_due'

type CustomerExportRow = {
  name: string
  phone: string
  email: string
  invoices: number
  total_billed: number
  total_paid: number
  balance_due: number
  trade_ins: number
  device_requests: number
  first_seen: string
  last_activity: string
}

function canonicalPhone(value: string | null | undefined) {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return digits.length === 10 ? `234${digits}` : digits
}

function mergeCustomers(rows: Customer[]) {
  const merged = new Map<string, Customer>()
  for (const row of rows) {
    const key = canonicalPhone(row.phone || row.key) || row.key
    const previous = merged.get(key)
    if (!previous) {
      merged.set(key, { ...row, key })
      continue
    }
    const newest = (row.last_activity ?? '') > (previous.last_activity ?? '') ? row : previous
    merged.set(key, {
      ...newest,
      key,
      invoice_count: Number(previous.invoice_count ?? 0) + Number(row.invoice_count ?? 0),
      total_billed: Number(previous.total_billed ?? 0) + Number(row.total_billed ?? 0),
      total_paid: Number(previous.total_paid ?? 0) + Number(row.total_paid ?? 0),
      balance_due: Number(previous.balance_due ?? 0) + Number(row.balance_due ?? 0),
      trade_in_count: Number(previous.trade_in_count ?? 0) + Number(row.trade_in_count ?? 0),
      request_count: Number(previous.request_count ?? 0) + Number(row.request_count ?? 0),
      first_seen: [previous.first_seen, row.first_seen].filter(Boolean).sort()[0] ?? null,
      last_activity: [previous.last_activity, row.last_activity].filter(Boolean).sort().at(-1) ?? null,
    })
  }
  return Array.from(merged.values())
}

const EXPORT_COLUMNS: ExportColumn<CustomerExportRow>[] = [
  { header: 'Customer', key: 'name' },
  { header: 'Phone', key: 'phone' },
  { header: 'Email', key: 'email' },
  { header: 'Invoices', key: 'invoices' },
  { header: 'Total billed', key: 'total_billed' },
  { header: 'Total paid', key: 'total_paid' },
  { header: 'Balance due', key: 'balance_due' },
  { header: 'Trade-ins', key: 'trade_ins' },
  { header: 'Device requests', key: 'device_requests' },
  { header: 'First seen', key: 'first_seen' },
  { header: 'Last activity', key: 'last_activity' },
]

function formatNaira(value: number) {
  return `₦${Number(value || 0).toLocaleString('en-NG')}`
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-NG') : '—'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('last_activity')
  const [sortAscending, setSortAscending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    async function loadCustomers() {
      const rows: Customer[] = []
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase
          .from('customer_directory')
          .select('*')
          .order('key', { ascending: true })
          .range(offset, offset + 999)
        if (error) {
          if (active) setErrorMessage(`Could not load customers: ${error.message}`)
          break
        }
        const page = (data ?? []) as Customer[]
        rows.push(...page)
        if (page.length < 1000) break
      }
      if (active) {
        setCustomers(mergeCustomers(rows))
        setLoading(false)
      }
    }

    void loadCustomers().catch((error: unknown) => {
      if (!active) return
      setErrorMessage(`Could not load customers: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const visibleCustomers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return customers
      .filter((customer) => !needle || [
        customer.name,
        customer.phone,
        customer.email,
        customer.key,
      ].some((value) => value?.toLowerCase().includes(needle)))
      .sort((left, right) => {
        let comparison = 0
        if (sortKey === 'name') {
          comparison = (left.name ?? '').localeCompare(right.name ?? '')
        } else if (sortKey === 'last_activity') {
          comparison = (left.last_activity ? Date.parse(left.last_activity) : 0)
            - (right.last_activity ? Date.parse(right.last_activity) : 0)
        } else {
          comparison = Number(left[sortKey] ?? 0) - Number(right[sortKey] ?? 0)
        }
        return (sortAscending ? 1 : -1) * comparison
      })
  }, [customers, search, sortAscending, sortKey])

  const exportRows = visibleCustomers.map((customer) => ({
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    invoices: Number(customer.invoice_count ?? 0),
    total_billed: Number(customer.total_billed ?? 0),
    total_paid: Number(customer.total_paid ?? 0),
    balance_due: Number(customer.balance_due ?? 0),
    trade_ins: Number(customer.trade_in_count ?? 0),
    device_requests: Number(customer.request_count ?? 0),
    first_seen: formatDate(customer.first_seen),
    last_activity: formatDate(customer.last_activity),
  }))

  async function exportExcel() {
    setExporting(true)
    setErrorMessage('')
    try {
      await exportXlsx('fonestack-customers.xlsx', EXPORT_COLUMNS, exportRows)
    } catch (error) {
      setErrorMessage(`Could not export customers to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  function exportCsvFile() {
    try {
      exportCsv('fonestack-customers.csv', EXPORT_COLUMNS, exportRows)
    } catch (error) {
      setErrorMessage(`Could not export customers to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Customer directory</p>
          <h1 className="text-2xl font-black text-white">Customers</h1>
          <p className="mt-1 text-sm text-slate-400">Customer profiles collected from invoices, trade-ins, and device requests.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsvFile} disabled={!visibleCustomers.length} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50">
            <Download className="h-4 w-4" aria-hidden="true" /> CSV
          </button>
          <button type="button" onClick={() => void exportExcel()} disabled={!visibleCustomers.length || exporting} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50">
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> {exporting ? 'Exporting…' : 'Excel'}
          </button>
        </div>
      </header>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{errorMessage}</span>
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, or email" className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-premiumYellow/50" />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Sort by
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white">
            <option value="last_activity">Last activity</option>
            <option value="name">Name</option>
            <option value="invoice_count">Invoices</option>
            <option value="total_billed">Total billed</option>
            <option value="balance_due">Balance due</option>
          </select>
        </label>
        <button type="button" onClick={() => setSortAscending((current) => !current)} className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10" aria-label={`Sort ${sortAscending ? 'descending' : 'ascending'}`}>
          {sortAscending ? 'Ascending ↑' : 'Descending ↓'}
        </button>
      </section>

      <p className="text-sm text-slate-400"><Users className="mr-2 inline h-4 w-4" aria-hidden="true" />{loading ? 'Loading customer records…' : `${visibleCustomers.length.toLocaleString()} customer${visibleCustomers.length === 1 ? '' : 's'}`}</p>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading customers…</div>
      ) : visibleCustomers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">{customers.length ? 'No customers match your search.' : 'No customer records found.'}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>{['Customer', 'Phone', 'Invoices', 'Billed', 'Paid', 'Balance due', 'Trade-ins', 'Requests', 'Last activity', ''].map((heading) => <th key={heading || 'profile'} className="px-4 py-3 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleCustomers.map((customer) => (
                <tr key={customer.key} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <Link href={`/admin/customers/${encodeURIComponent(customer.key)}`} className="font-semibold text-white hover:text-premiumYellow">{customer.name || 'Customer'}</Link>
                    {customer.email && <p className="mt-1 text-xs text-slate-500">{customer.email}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4"><PhoneActions phone={customer.phone} values={{ customer_name: customer.name ?? '' }} /></td>
                  <td className="px-4 py-4 text-slate-300">{Number(customer.invoice_count ?? 0)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-300">{formatNaira(Number(customer.total_billed))}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-300">{formatNaira(Number(customer.total_paid))}</td>
                  <td className={`whitespace-nowrap px-4 py-4 ${Number(customer.balance_due) > 0 ? 'text-amber-300' : 'text-slate-300'}`}>{formatNaira(Number(customer.balance_due))}</td>
                  <td className="px-4 py-4 text-slate-300">{Number(customer.trade_in_count ?? 0)}</td>
                  <td className="px-4 py-4 text-slate-300">{Number(customer.request_count ?? 0)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-400">{formatDate(customer.last_activity)}</td>
                  <td className="px-4 py-4"><Link href={`/admin/customers/${encodeURIComponent(customer.key)}`} className="whitespace-nowrap text-xs font-semibold text-premiumYellow hover:underline">View profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
