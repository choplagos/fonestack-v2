'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Package, Plus, TrendingUp } from 'lucide-react'

import { supabase } from '@/lib/supabase'

type ProductStats = {
  id: number
  stock_quantity: number | null
  low_stock_threshold: number | null
  status: string
}

type InvoiceSummary = {
  id: string
  invoice_number: string
  customer_name: string
  product_snapshot: { name?: string; brand?: string } | null
  total_amount: number | null
  deposit_amount: number
  status: string
  created_at: string
}

type DashboardData = {
  revenue30Days: number
  inventoryCount: number
  lowStockCount: number
  pendingInvoices: number
  paidInvoices30Days: number
  deviceRequests: number
  tradeInRequests: number
  recentInvoices: InvoiceSummary[]
}

const EMPTY_DASHBOARD: DashboardData = {
  revenue30Days: 0,
  inventoryCount: 0,
  lowStockCount: 0,
  pendingInvoices: 0,
  paidInvoices30Days: 0,
  deviceRequests: 0,
  tradeInRequests: 0,
  recentInvoices: [],
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString('en-NG')}`
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      try {
        const [
          productsResult,
          invoicesResult,
          recentResult,
          requestsResult,
          tradeInsResult,
        ] = await Promise.all([
          supabase
            .from('products')
            .select('id, stock_quantity, low_stock_threshold, status')
            .neq('status', 'demo'),
          supabase
            .from('invoices')
            .select('total_amount, deposit_amount, status')
            .gte('created_at', since),
          supabase
            .from('invoices')
            .select('id, invoice_number, customer_name, product_snapshot, total_amount, deposit_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(8),
          supabase.from('device_requests').select('id', { count: 'exact', head: true }),
          supabase
            .from('trade_in_requests')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
        ])

        const failed = [
          productsResult.error,
          invoicesResult.error,
          recentResult.error,
          requestsResult.error,
          tradeInsResult.error,
        ].find(Boolean)
        if (failed) throw failed

        const products = (productsResult.data ?? []) as ProductStats[]
        const invoices = (invoicesResult.data ?? []) as Array<
          Pick<InvoiceSummary, 'total_amount' | 'deposit_amount' | 'status'>
        >
        const recentInvoices = (recentResult.data ?? []) as InvoiceSummary[]
        const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid')
        const revenue30Days = invoices.reduce((sum, invoice) => {
          if (invoice.status === 'paid') return sum + Number(invoice.total_amount ?? 0)
          if (invoice.status === 'deposit') return sum + Number(invoice.deposit_amount ?? 0)
          return sum
        }, 0)

        if (active) {
          setDashboard({
            revenue30Days,
            inventoryCount: products.length,
            lowStockCount: products.filter(
              (product) => (product.stock_quantity ?? 0) <= (product.low_stock_threshold ?? 3),
            ).length,
            pendingInvoices: invoices.filter((invoice) =>
              ['pending', 'deposit'].includes(invoice.status),
            ).length,
            paidInvoices30Days: paidInvoices.length,
            deviceRequests: requestsResult.count ?? 0,
            tradeInRequests: tradeInsResult.count ?? 0,
            recentInvoices,
          })
          setErrorMessage('')
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard data.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [])

  const stats = [
    { label: 'Revenue · 30 days', value: formatNaira(dashboard.revenue30Days), icon: TrendingUp },
    { label: 'Inventory items', value: String(dashboard.inventoryCount), icon: Package },
    { label: 'Pending invoices', value: String(dashboard.pendingInvoices), icon: Clock },
    { label: 'Paid invoices · 30 days', value: String(dashboard.paidInvoices30Days), icon: CheckCircle },
  ]

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
            Live Supabase data
          </p>
          <h2 className="text-2xl font-black text-white">Business overview</h2>
          <p className="mt-1 text-sm text-slate-400">Current inventory, invoices, and customer requests.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create invoice
        </Link>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Dashboard data could not be loaded from Supabase: {errorMessage}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <section key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-sm text-slate-400">
              {stat.label}
              <stat.icon className="h-5 w-5 text-premiumYellow" aria-hidden="true" />
            </div>
            <div className="mt-4 text-3xl font-black text-white">
              {loading ? <span className="text-lg text-slate-500">Loading…</span> : stat.value}
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/leads" className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-premiumYellow/40">
          <span className="text-sm text-slate-400">Device requests</span>
          <span className="mt-2 block text-2xl font-bold text-white">{loading ? '…' : dashboard.deviceRequests}</span>
        </Link>
        <Link href="/admin/trade-ins" className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-premiumYellow/40">
          <span className="text-sm text-slate-400">Pending trade-ins</span>
          <span className="mt-2 block text-2xl font-bold text-white">{loading ? '…' : dashboard.tradeInRequests}</span>
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-bold text-white">Recent invoices</h3>
          <Link href="/admin/invoices" className="text-xs font-semibold text-premiumYellow hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {!loading && dashboard.recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No invoices found in Supabase.
                  </td>
                </tr>
              )}
              {dashboard.recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/invoices/${invoice.id}`} className="font-mono text-premiumYellow hover:underline">
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{invoice.customer_name}</td>
                  <td className="px-5 py-4">
                    {invoice.product_snapshot?.name
                      ? `${invoice.product_snapshot.brand ?? ''} ${invoice.product_snapshot.name}`.trim()
                      : 'Product details unavailable'}
                  </td>
                  <td className="px-5 py-4">{formatNaira(Number(invoice.total_amount ?? 0))}</td>
                  <td className="px-5 py-4 capitalize">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!loading && dashboard.lowStockCount > 0 && (
        <Link
          href="/admin/inventory?filter=low-stock"
          className="block rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"
        >
          {dashboard.lowStockCount} inventory items are at or below their low-stock threshold. Review inventory.
        </Link>
      )}
    </div>
  )
}
