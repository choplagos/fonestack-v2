'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

import { useAdminRole } from '@/components/AdminLayoutClient'
import { exportCsv, type ExportColumn } from '@/lib/export'
import { supabase } from '@/lib/supabase'

type Activity = { id: number; created_at: string; actor_email: string | null; action: string; table_name: string; record_id: string | null; summary: string | null; changes: unknown }
type ActivityExport = { date: string; actor: string; action: string; table: string; record_id: string; summary: string; changes: string }
const PAGE_SIZE = 30
const COLUMNS: ExportColumn<ActivityExport>[] = [
  { header: 'Date', key: 'date' }, { header: 'Actor', key: 'actor' }, { header: 'Action', key: 'action' },
  { header: 'Table', key: 'table' }, { header: 'Record ID', key: 'record_id' },
  { header: 'Summary', key: 'summary' }, { header: 'Changes', key: 'changes' },
]

function display(value: unknown) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function summaryLine(item: Activity) {
  return item.summary?.trim() || `${item.action} ${item.table_name}${item.record_id ? ` · record ${item.record_id}` : ''}`
}

export default function ActivityPage() {
  const { role } = useAdminRole()
  const [rows, setRows] = useState<Activity[]>([])
  const [actor, setActor] = useState('')
  const [table, setTable] = useState('')
  const [action, setAction] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function makeQuery(withCount = false) {
    let query = supabase.from('activity_log').select('id,created_at,actor_email,action,table_name,record_id,summary,changes', withCount ? { count: 'exact' } : undefined)
    if (actor.trim()) query = query.ilike('actor_email', `%${actor.trim()}%`)
    if (table) query = query.eq('table_name', table)
    if (action) query = query.eq('action', action.toLowerCase())
    if (fromDate) query = query.gte('created_at', `${fromDate}T00:00:00`)
    if (toDate) query = query.lte('created_at', `${toDate}T23:59:59`)
    return query
  }

  useEffect(() => {
    if (role !== 'owner') return
    let active = true
    async function load() {
      setLoading(true)
      setErrorMessage('')
      const { data, error, count: resultCount } = await makeQuery(true)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      if (!active) return
      if (error) setErrorMessage(/permission|policy|row-level security/i.test(error.message) ? 'You do not have permission to view activity.' : `Could not load activity: ${error.message}`)
      else { setRows((data ?? []) as Activity[]); setCount(resultCount ?? 0) }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [role, actor, table, action, fromDate, toDate, page])

  async function exportAll() {
    setExporting(true)
    setErrorMessage('')
    try {
      const allRows: Activity[] = []
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await makeQuery()
          .order('created_at', { ascending: false })
          .range(offset, offset + 999)
        if (error) throw new Error(error.message)
        const batch = (data ?? []) as Activity[]
        allRows.push(...batch)
        if (batch.length < 1000) break
      }
      const exportRows = allRows.map((item) => ({
        date: new Date(item.created_at).toLocaleString('en-NG'),
        actor: item.actor_email ?? '',
        action: item.action,
        table: item.table_name,
        record_id: item.record_id ?? '',
        summary: summaryLine(item),
        changes: item.changes == null ? '' : JSON.stringify(item.changes),
      }))
      exportCsv('fonestack-activity-log.csv', COLUMNS, exportRows)
    } catch (error) {
      setErrorMessage(`Could not export activity: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally { setExporting(false) }
  }

  if (role !== 'owner') return null
  return <div className="space-y-6 p-1 pb-20 md:p-4">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Audit trail</p><h1 className="text-2xl font-black text-white">Activity</h1><p className="mt-1 text-sm text-slate-400">Owner-only changes recorded across admin data.</p></div><button type="button" onClick={() => void exportAll()} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"><Download className="h-4 w-4" aria-hidden="true" />{exporting ? 'Exporting…' : 'Export CSV'}</button></header>
    {errorMessage && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{errorMessage}</p>}
    <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="space-y-1 text-xs text-slate-400">Actor<input value={actor} onChange={(event) => { setActor(event.target.value); setPage(0) }} placeholder="Email contains…" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
      <label className="space-y-1 text-xs text-slate-400">Table<input value={table} onChange={(event) => { setTable(event.target.value); setPage(0) }} placeholder="e.g. products" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
      <label className="space-y-1 text-xs text-slate-400">Action<select value={action} onChange={(event) => { setAction(event.target.value); setPage(0) }} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"><option value="">All actions</option>{['insert', 'update', 'delete'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="space-y-1 text-xs text-slate-400">From<input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(0) }} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
      <label className="space-y-1 text-xs text-slate-400">To<input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(0) }} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
    </section>
    <section className="space-y-2">
      {loading ? <p role="status" className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">Loading activity…</p> : rows.length === 0 ? <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">No activity matches these filters.</p> : rows.map((item) => {
        const changes = item.changes && typeof item.changes === 'object' && !Array.isArray(item.changes) ? item.changes as Record<string, unknown> : {}
        return <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold text-white">{summaryLine(item)}</p><p className="mt-1 text-xs text-slate-400">{item.actor_email || 'Unknown actor'} · {item.action} · {item.table_name}</p></div><time className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString('en-NG')}</time></div>
          {Object.keys(changes).length > 0 && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-premiumYellow">View before and after changes</summary><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="text-slate-500"><tr><th className="py-2">Field</th><th className="py-2">Before</th><th className="py-2">After</th></tr></thead><tbody className="divide-y divide-white/5">{Object.entries(changes).map(([key, value]) => { const pair = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; return <tr key={key}><td className="py-2 font-semibold text-slate-200">{key}</td><td className="max-w-sm break-all py-2 text-slate-400">{display(pair.old)}</td><td className="max-w-sm break-all py-2 text-slate-300">{display(pair.new)}</td></tr> })}</tbody></table></div></details>}
        </article>
      })}
    </section>
    <footer className="flex items-center justify-between text-xs text-slate-400"><span>{count} event(s)</span><div className="flex items-center gap-2"><button type="button" disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page + 1} of {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span><button type="button" disabled={(page + 1) * PAGE_SIZE >= count || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-40">Next</button></div></footer>
  </div>
}
