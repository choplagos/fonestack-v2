'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'

import { supabase } from '@/lib/supabase'

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

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function TradeInsPage() {
  const [requests, setRequests] = useState<TradeIn[]>([])
  const [drafts, setDrafts] = useState<Record<number, TradeInDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

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
      setErrorMessage(`Could not save trade-in review: ${error.message}`)
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

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading trade-ins from Supabase…</div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">No trade-in requests found.</div>
        ) : requests.map((request) => {
          const draft = drafts[request.id]
          if (!draft) return null
          return (
            <article key={request.id} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <h3 className="font-bold text-white">{request.brand} {request.model}{request.storage_gb ? ` · ${request.storage_gb}GB` : ''}</h3>
                  <p className="mt-1 text-sm text-slate-300">{request.customer_name} · <a href={`tel:${request.customer_phone}`} className="text-premiumYellow hover:underline">{request.customer_phone}</a></p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(request.created_at).toLocaleString('en-NG')}</p>
                </div>
                <div className="text-sm md:text-right">
                  <p className="text-slate-400">Estimate · {request.estimate_confidence ?? 'review required'}</p>
                  <p className="mt-1 font-semibold text-white">
                    {request.estimate_low !== null && request.estimate_high !== null
                      ? `${formatNaira(request.estimate_low)} – ${formatNaira(request.estimate_high)}`
                      : 'No estimate available'}
                  </p>
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
      </div>
    </div>
  )
}
