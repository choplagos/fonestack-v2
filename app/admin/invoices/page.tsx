'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Plus, Search } from 'lucide-react'

import { supabase } from '@/lib/supabase'

type Invoice = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  total_amount: number | null
  deposit_amount: number
  amount_due: number | null
  status: string
  payment_method: string | null
  created_at: string
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadInvoices() {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, customer_name, customer_phone, total_amount, deposit_amount, amount_due, status, payment_method, created_at')
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

  const visibleInvoices = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesSearch =
        !needle ||
        `${invoice.invoice_number} ${invoice.customer_name} ${invoice.customer_phone}`
          .toLowerCase()
          .includes(needle)
      return matchesSearch && (status === 'all' || invoice.status === status)
    })
  }, [invoices, search, status])

  return (
    <div className="space-y-6 p-1 md:p-4">
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

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row">
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
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading invoices from Supabase…</td></tr>
              ) : visibleInvoices.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No invoices match this filter.</td></tr>
              ) : visibleInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/invoices/${invoice.id}`} className="font-mono font-semibold text-premiumYellow hover:underline">
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{invoice.customer_name}</div>
                    <div className="mt-1 text-xs text-slate-500">{invoice.customer_phone}</div>
                  </td>
                  <td className="px-5 py-4">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</td>
                  <td className="px-5 py-4">{formatNaira(Number(invoice.total_amount ?? 0))}</td>
                  <td className="px-5 py-4">{formatNaira(Number(invoice.amount_due ?? 0))}</td>
                  <td className="px-5 py-4 capitalize">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
