'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'

import { supabase } from '@/lib/supabase'

type DeviceRequest = {
  id: number
  customer_name: string
  phone: string
  requested_device: string
  budget: number | null
  status: string
  created_at: string
  reference_id: string | null
  source: string | null
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function DeviceRequestsPage() {
  const [requests, setRequests] = useState<DeviceRequest[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadRequests() {
      const { data, error } = await supabase
        .from('device_requests')
        .select('id, customer_name, phone, requested_device, budget, status, created_at, reference_id, source')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!active) return
      if (error) {
        setErrorMessage(error.message)
      } else {
        setRequests((data ?? []) as DeviceRequest[])
      }
      setLoading(false)
    }

    void loadRequests()
    return () => {
      active = false
    }
  }, [])

  const visibleRequests = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return requests.filter((request) =>
      !needle ||
      `${request.customer_name} ${request.phone} ${request.requested_device} ${request.source ?? ''}`
        .toLowerCase()
        .includes(needle),
    )
  }, [requests, search])

  async function updateStatus(request: DeviceRequest, status: string) {
    const { error } = await supabase.from('device_requests').update({ status }).eq('id', request.id)
    if (error) {
      setErrorMessage(`Could not update request status: ${error.message}`)
      return
    }
    setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status } : item))
  }

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
          Supabase · device_requests
        </p>
        <h2 className="text-2xl font-black text-white">Device requests</h2>
        <p className="mt-1 text-sm text-slate-400">Customer enquiries and requests saved from the storefront.</p>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, phone, device, or source"
              className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-premiumYellow/70"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Requested device</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Received</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading requests from Supabase…</td></tr>
              ) : visibleRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No matching requests.</td></tr>
              ) : visibleRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{request.customer_name}</div>
                    <a href={`tel:${request.phone}`} className="text-xs text-premiumYellow hover:underline">{request.phone}</a>
                  </td>
                  <td className="px-5 py-4">{request.requested_device}</td>
                  <td className="px-5 py-4">{request.budget ? formatNaira(request.budget) : 'Not specified'}</td>
                  <td className="px-5 py-4">{request.source || 'Storefront'}</td>
                  <td className="px-5 py-4">{new Date(request.created_at).toLocaleDateString('en-NG')}</td>
                  <td className="px-5 py-4">
                    <select
                      aria-label={`Update status for request from ${request.customer_name}`}
                      value={request.status}
                      onChange={(event) => void updateStatus(request, event.target.value)}
                      className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-xs capitalize text-white"
                    >
                      {['new', 'pending', 'contacted', 'completed', 'closed'].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
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
