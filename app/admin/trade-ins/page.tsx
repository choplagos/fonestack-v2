'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, BarChart3, Download, Eye, Save, X } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { adminOperationError } from '@/lib/adminRole'
import { useSearchParams } from 'next/navigation'
import PhoneActions from '@/components/admin/PhoneActions'
import { exportCsv, type ExportColumn } from '@/lib/export'

type TradeIn = {
  id: number
  customer_name: string
  customer_phone: string
  brand: string
  model: string
  storage_gb: number | null
  condition_grade: string
  condition_description: string | null
  has_box: boolean
  has_charger: boolean
  estimate_low: number | null
  estimate_high: number | null
  estimate_confidence: string | null
  estimate_reasoning: string | null
  status: 'pending' | 'approved' | 'rejected' | 'converted'
  admin_notes: string | null
  final_offer: number | null
  created_at: string
}

type TradeInDraft = {
  status: TradeIn['status']
  admin_notes: string
  final_offer: string
}

type TradeInPerformance = {
  id: number
  brand: string
  model: string
  estimate_low: number | null
  estimate_high: number | null
  estimate_mid: number | null
  final_offer: number | null
  offer_vs_estimate_pct: number | null
  listed_price: number | null
  sold_price: number | null
  sold_at: string | null
  days_to_sell: number | null
  profit: number | null
}

const PERFORMANCE_COLUMNS: ExportColumn<TradeInPerformance>[] = [
  { header: 'Trade-in ID', key: 'id' },
  { header: 'Brand', key: 'brand' },
  { header: 'Model', key: 'model' },
  { header: 'Estimate low', key: 'estimate_low' },
  { header: 'Estimate high', key: 'estimate_high' },
  { header: 'Estimate midpoint', key: 'estimate_mid' },
  { header: 'Final offer', key: 'final_offer' },
  { header: 'Offer deviation (%)', key: 'offer_vs_estimate_pct' },
  { header: 'Listed price', key: 'listed_price' },
  { header: 'Sold price', key: 'sold_price' },
  { header: 'Sold at', key: 'sold_at' },
  { header: 'Days to sell', key: 'days_to_sell' },
  { header: 'Profit', key: 'profit' },
]

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function TradeInsPage() {
  const searchParams = useSearchParams()
  const focusedId = searchParams.get('focus')
  const [statusFilter, setStatusFilter] = useState('all')
  const [requests, setRequests] = useState<TradeIn[]>([])
  const [drafts, setDrafts] = useState<Record<number, TradeInDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'requests' | 'performance'>('requests')
  const [performance, setPerformance] = useState<TradeInPerformance[]>([])
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [performanceLoaded, setPerformanceLoaded] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<TradeIn | null>(null)
  const [similarTradeIns, setSimilarTradeIns] = useState<TradeInPerformance[]>([])
  const [similarLoading, setSimilarLoading] = useState(false)

  useEffect(() => {
    const requestedStatus = searchParams.get('status')
    setStatusFilter(requestedStatus && ['pending', 'approved', 'rejected', 'converted'].includes(requestedStatus)
      ? requestedStatus
      : 'all')
  }, [searchParams])

  useEffect(() => {
    let active = true
    async function loadTradeIns() {
      const { data, error } = await supabase
        .from('trade_in_requests')
        .select('id, customer_name, customer_phone, brand, model, storage_gb, condition_grade, condition_description, has_box, has_charger, estimate_low, estimate_high, estimate_confidence, estimate_reasoning, status, admin_notes, final_offer, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!active) return
      if (error) {
        setErrorMessage(error.message)
      } else {
        const rows = (data ?? []) as TradeIn[]
        setRequests(rows)
        setDrafts(Object.fromEntries(rows.map((request) => [
          request.id,
          {
            status: request.status,
            admin_notes: request.admin_notes ?? '',
            final_offer: request.final_offer === null ? '' : String(request.final_offer),
          },
        ])))
      }
      setLoading(false)
    }

    void loadTradeIns()
    return () => {
      active = false
    }
  }, [])

  const visibleRequests = requests.filter((request) => statusFilter === 'all' || request.status === statusFilter)

  useEffect(() => {
    if (!focusedId || loading) return
    const target = document.getElementById(`trade-in-${focusedId}`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('ring-2', 'ring-premiumYellow')
    const timer = window.setTimeout(() => target.classList.remove('ring-2', 'ring-premiumYellow'), 3500)
    return () => window.clearTimeout(timer)
  }, [focusedId, loading, requests])

  useEffect(() => {
    if (activeTab !== 'performance' || performanceLoaded) return
    let active = true
    async function loadPerformance() {
      setPerformanceLoading(true)
      const { data, error } = await supabase
        .from('tradein_performance')
        .select('id, brand, model, estimate_low, estimate_high, estimate_mid, final_offer, offer_vs_estimate_pct, listed_price, sold_price, sold_at, days_to_sell, profit')
        .order('id', { ascending: false })
        .limit(1000)

      if (!active) return
      if (error) {
        setErrorMessage(`Could not load trade-in performance: ${error.message}`)
      } else {
        setPerformance((data ?? []) as TradeInPerformance[])
        setPerformanceLoaded(true)
      }
      setPerformanceLoading(false)
    }

    void loadPerformance()
    return () => {
      active = false
    }
  }, [activeTab, performanceLoaded])

  useEffect(() => {
    if (!selectedRequest) return
    const request = selectedRequest
    let active = true
    async function loadSimilarTradeIns() {
      setSimilarLoading(true)
      setSimilarTradeIns([])
      const { data: recentRequests, error: requestsError } = await supabase
        .from('trade_in_requests')
        .select('id, created_at')
        .eq('brand', request.brand)
        .eq('model', request.model)
        .neq('id', request.id)
        .not('converted_product_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5)

      if (requestsError) {
        if (active) setErrorMessage(`Could not load similar past trade-ins: ${requestsError.message}`)
        if (active) setSimilarLoading(false)
        return
      }

      const recentIds = (recentRequests ?? []).map((item) => item.id)
      const { data, error } = recentIds.length
        ? await supabase
        .from('tradein_performance')
        .select('id, brand, model, estimate_low, estimate_high, estimate_mid, final_offer, offer_vs_estimate_pct, listed_price, sold_price, sold_at, days_to_sell, profit')
        .in('id', recentIds)
        : { data: [], error: null }

      if (!active) return
      if (error) {
        setErrorMessage(`Could not load similar past trade-ins: ${error.message}`)
      } else {
        const byId = new Map(((data ?? []) as TradeInPerformance[]).map((item) => [item.id, item]))
        setSimilarTradeIns(recentIds.flatMap((id) => {
          const item = byId.get(id)
          return item ? [item] : []
        }))
      }
      setSimilarLoading(false)
    }

    void loadSimilarTradeIns()
    return () => {
      active = false
    }
  }, [selectedRequest])

  function updateDraft(id: number, patch: Partial<TradeInDraft>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
  }

  async function saveReview(request: TradeIn) {
    const draft = drafts[request.id]
    if (!draft) return

    const offer = draft.final_offer.trim() ? Number(draft.final_offer) : null
    if (offer !== null && (!Number.isFinite(offer) || offer < 0)) {
      setErrorMessage('Final offer must be a non-negative number.')
      return
    }

    setSavingId(request.id)
    setErrorMessage('')
    setSavedMessage('')
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user?.email) {
      setErrorMessage(userError?.message ?? 'Could not identify the signed-in admin.')
      setSavingId(null)
      return
    }

    const { error } = await supabase
      .from('trade_in_requests')
      .update({
        status: draft.status,
        admin_notes: draft.admin_notes.trim() || null,
        final_offer: offer,
        reviewed_by: userData.user.email,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    if (error) {
      setErrorMessage(`Could not save trade-in review: ${adminOperationError(error, 'update trade-ins')}`)
    } else {
      setRequests((current) => current.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: draft.status,
              admin_notes: draft.admin_notes.trim() || null,
              final_offer: offer,
            }
          : item,
      ))
      setSavedMessage(`Review saved for ${request.customer_name}.`)
    }
    setSavingId(null)
  }

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
          Supabase · trade_in_requests
        </p>
        <h2 className="text-2xl font-black text-white">Trade-in requests</h2>
        <p className="mt-1 text-sm text-slate-400">Review customer devices and record decisions and final offers.</p>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
      {savedMessage && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{savedMessage}</p>}

      <div className="flex gap-2 border-b border-white/10">
        {([
          { key: 'requests', label: 'Requests' },
          { key: 'performance', label: 'Performance' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === tab.key ? 'border-premiumYellow text-premiumYellow' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'requests' ? <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading trade-ins from Supabase…</div>
        ) : visibleRequests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">No trade-in requests found.</div>
        ) : visibleRequests.map((request) => {
          const draft = drafts[request.id]
          if (!draft) return null
          return (
            <article id={`trade-in-${request.id}`} key={request.id} className={`space-y-4 rounded-2xl border bg-white/5 p-5 transition-shadow ${String(request.id) === focusedId ? 'border-premiumYellow/60' : 'border-white/10'}`}>
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <h3 className="font-bold text-white">{request.brand} {request.model}{request.storage_gb ? ` · ${request.storage_gb}GB` : ''}</h3>
                  <p className="mt-1 text-sm text-slate-300">{request.customer_name} · <PhoneActions phone={request.customer_phone} values={{ customer_name: request.customer_name, offer: request.final_offer === null ? '' : formatNaira(request.final_offer), product_name: `${request.brand} ${request.model}` }} defaultTemplateKey="tradein_offer" /></p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(request.created_at).toLocaleString('en-NG')}</p>
                </div>
                <div className="text-sm md:text-right">
                  <p className="text-slate-400">Estimate · {request.estimate_confidence ?? 'review required'}</p>
                  <p className="mt-1 font-semibold text-white">
                    {request.estimate_low !== null && request.estimate_high !== null
                      ? `${formatNaira(request.estimate_low)} – ${formatNaira(request.estimate_high)}`
                      : 'No estimate available'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Details & similar trade-ins
                  </button>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                <p>Condition: <span className="capitalize text-white">{request.condition_grade}</span></p>
                <p>Accessories: <span className="text-white">{[request.has_box && 'box', request.has_charger && 'charger'].filter(Boolean).join(', ') || 'none listed'}</span></p>
                {request.condition_description && <p className="sm:col-span-2">{request.condition_description}</p>}
                {request.estimate_reasoning && <p className="sm:col-span-2 text-xs">{request.estimate_reasoning}</p>}
              </div>

              <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                <label className="space-y-2 text-xs font-semibold text-slate-300">
                  Decision
                  <select
                    value={draft.status}
                    onChange={(event) => updateDraft(request.id, { status: event.target.value as TradeIn['status'] })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
                  >
                    {(['pending', 'approved', 'rejected', 'converted'] as const).map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-xs font-semibold text-slate-300">
                  Final offer (₦)
                  <input
                    type="number"
                    min={0}
                    value={draft.final_offer}
                    onChange={(event) => updateDraft(request.id, { final_offer: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
                  />
                </label>
                <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">
                  Admin notes
                  <textarea
                    rows={2}
                    value={draft.admin_notes}
                    onChange={(event) => updateDraft(request.id, { admin_notes: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
                  />
                </label>
                <div className="sm:col-span-2 sm:text-right">
                  <button
                    type="button"
                    onClick={() => void saveReview(request)}
                    disabled={savingId === request.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2.5 text-sm font-bold text-black disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {savingId === request.id ? 'Saving…' : 'Save review'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div> : <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Estimate vs. reality</h3>
            <p className="mt-1 text-sm text-slate-400">Final offers are compared with the estimated midpoint. Sales data is available for converted trade-ins.</p>
          </div>
          <button
            type="button"
            onClick={() => exportCsv('fonestack-trade-in-performance.csv', PERFORMANCE_COLUMNS, performance)}
            disabled={!performance.length || performanceLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>

        {performanceLoading ? (
          <div role="status" className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading trade-in performance…</div>
        ) : performance.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">No converted trade-ins are available for performance reporting.</div>
        ) : <>
          {(() => {
            const deviations = performance
              .map((row) => row.offer_vs_estimate_pct)
              .filter((value): value is number => value !== null && Number.isFinite(value))
            const averageDeviation = deviations.length
              ? deviations.reduce((sum, value) => sum + Math.abs(value), 0) / deviations.length
              : null
            const soldRows = performance.filter((row) => row.sold_price !== null)
            const totalProfit = performance.reduce((sum, row) => sum + (row.profit ?? 0), 0)
            const metrics = [
              { label: 'Converted trade-ins', value: performance.length.toLocaleString('en-NG') },
              { label: 'Avg. absolute offer deviation', value: averageDeviation === null ? '—' : `${averageDeviation.toFixed(1)}%` },
              { label: 'Devices sold', value: soldRows.length.toLocaleString('en-NG') },
              { label: 'Realized gross profit', value: formatNaira(totalProfit) },
            ]
            return (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-xl font-black text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            )
          })()}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
              <BarChart3 className="h-4 w-4 text-premiumYellow" aria-hidden="true" />
              <p className="text-sm font-bold text-white">Trade-in outcomes</p>
              <span className="ml-auto text-xs text-slate-500">{performance.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Device</th>
                    <th className="px-5 py-3">Estimate</th>
                    <th className="px-5 py-3">Final offer</th>
                    <th className="px-5 py-3">Deviation</th>
                    <th className="px-5 py-3">Sold price</th>
                    <th className="px-5 py-3">Profit</th>
                    <th className="px-5 py-3">Days to sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {performance.map((row) => {
                    const largeDeviation = row.offer_vs_estimate_pct !== null && Math.abs(row.offer_vs_estimate_pct) > 25
                    return (
                      <tr key={row.id} className={largeDeviation ? 'bg-amber-400/5' : ''}>
                        <td className="px-5 py-4 font-semibold text-white">{row.brand} {row.model}</td>
                        <td className="px-5 py-4">{row.estimate_low !== null && row.estimate_high !== null ? `${formatNaira(row.estimate_low)} – ${formatNaira(row.estimate_high)}` : '—'}</td>
                        <td className="px-5 py-4">{row.final_offer === null ? '—' : formatNaira(row.final_offer)}</td>
                        <td className="px-5 py-4">
                          {row.offer_vs_estimate_pct === null ? '—' : (
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${largeDeviation ? 'bg-amber-400/15 text-amber-200' : 'bg-white/5 text-slate-300'}`}>
                              {row.offer_vs_estimate_pct > 0 ? '+' : ''}{row.offer_vs_estimate_pct.toFixed(1)}%
                              {largeDeviation && <span className="ml-1">· &gt;25%</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">{row.sold_price === null ? 'Not sold' : formatNaira(row.sold_price)}</td>
                        <td className="px-5 py-4">{row.profit === null ? '—' : <span className={row.profit < 0 ? 'text-red-300' : 'text-green-300'}>{formatNaira(row.profit)}</span>}</td>
                        <td className="px-5 py-4">{row.days_to_sell === null ? '—' : row.days_to_sell}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>}
      </section>}

      {selectedRequest && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRequest(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-in-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#10120e] p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-premiumYellow">Trade-in details</p>
                <h3 id="trade-in-detail-title" className="mt-2 text-xl font-black text-white">{selectedRequest.brand} {selectedRequest.model}</h3>
                <p className="mt-1 text-sm text-slate-400">{selectedRequest.customer_name} · {new Date(selectedRequest.created_at).toLocaleDateString('en-NG')}</p>
              </div>
              <button type="button" aria-label="Close trade-in details" onClick={() => setSelectedRequest(null)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <dl className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Estimated range</dt><dd className="mt-1 font-semibold text-white">{selectedRequest.estimate_low !== null && selectedRequest.estimate_high !== null ? `${formatNaira(selectedRequest.estimate_low)} – ${formatNaira(selectedRequest.estimate_high)}` : 'No estimate'}</dd></div>
              <div><dt className="text-slate-500">Final offer</dt><dd className="mt-1 font-semibold text-white">{selectedRequest.final_offer === null ? 'Not set' : formatNaira(selectedRequest.final_offer)}</dd></div>
              <div><dt className="text-slate-500">Condition</dt><dd className="mt-1 capitalize text-white">{selectedRequest.condition_grade}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd className="mt-1 capitalize text-white">{selectedRequest.status}</dd></div>
              {selectedRequest.condition_description && <div className="sm:col-span-2"><dt className="text-slate-500">Condition notes</dt><dd className="mt-1 text-white">{selectedRequest.condition_description}</dd></div>}
            </dl>

            <div className="mt-6">
              <h4 className="font-bold text-white">Similar past trade-ins</h4>
              <p className="mt-1 text-xs text-slate-400">Latest converted trade-ins for the same brand and model, excluding this request.</p>
              {similarLoading ? (
                <p role="status" className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Loading similar trade-ins…</p>
              ) : similarTradeIns.length === 0 ? (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No similar converted trade-ins found.</p>
              ) : (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Trade-in</th><th className="px-4 py-3">Final offer</th><th className="px-4 py-3">Sold price</th></tr></thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {similarTradeIns.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3">#{row.id}{row.sold_at && <span className="ml-2 text-xs text-slate-500">{new Date(row.sold_at).toLocaleDateString('en-NG')}</span>}</td>
                            <td className="px-4 py-3">{row.final_offer === null ? '—' : formatNaira(row.final_offer)}</td>
                            <td className="px-4 py-3">{row.sold_price === null ? 'Not sold' : formatNaira(row.sold_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
