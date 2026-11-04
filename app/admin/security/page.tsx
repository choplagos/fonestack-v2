'use client'

import { useEffect, useState } from 'react'

import { useAdminRole } from '@/components/AdminLayoutClient'
import { supabase } from '@/lib/supabase'

type LoginEvent = { id: number; created_at: string; email: string | null; ip: string | null; user_agent: string | null; success: boolean; is_new_device: boolean }
const PAGE_SIZE = 50

function describeAgent(value: string | null) {
  const agent = value ?? ''
  const browser = /Edg\//i.test(agent) ? 'Edge' : /Firefox\//i.test(agent) ? 'Firefox' : /Chrome\//i.test(agent) ? 'Chrome' : /Safari\//i.test(agent) ? 'Safari' : 'Unknown'
  const os = /Windows/i.test(agent) ? 'Windows' : /Android/i.test(agent) ? 'Android' : /iPhone|iPad|iPod/i.test(agent) ? 'iOS' : /Mac OS X|Macintosh/i.test(agent) ? 'macOS' : /Linux/i.test(agent) ? 'Linux' : 'Unknown OS'
  return `${browser} · ${os}`
}

export default function SecurityPage() {
  const { role } = useAdminRole()
  const [rows, setRows] = useState<LoginEvent[]>([])
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (role !== 'owner') return
    let active = true
    async function load() {
      setLoading(true)
      const { data, error, count: resultCount } = await supabase.from('login_events')
        .select('id,created_at,email,ip,user_agent,success,is_new_device', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      if (!active) return
      if (error) setErrorMessage(/permission|policy|row-level security/i.test(error.message) ? 'You do not have permission to view login events.' : `Could not load login events: ${error.message}`)
      else { setRows((data ?? []) as LoginEvent[]); setCount(resultCount ?? 0); setErrorMessage('') }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [page, role])

  if (role !== 'owner') return null
  return <div className="space-y-6 p-1 pb-20 md:p-4">
    <header><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Access control</p><h1 className="text-2xl font-black text-white">Security</h1><p className="mt-1 text-sm text-slate-400">Recent sign-in activity and new-device alerts.</p></header>
    {errorMessage && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{errorMessage}</p>}
    <section className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      {loading ? <p role="status" className="p-6 text-sm text-slate-400">Loading login events…</p> : rows.length === 0 ? <p className="p-6 text-sm text-slate-400">No login events recorded yet.</p> : <table className="w-full min-w-[780px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Browser / OS</th><th className="px-4 py-3">Result</th></tr></thead><tbody className="divide-y divide-white/5">{rows.map((event) => <tr key={event.id} className={event.success ? '' : 'bg-red-500/[0.08]'}><td className="whitespace-nowrap px-4 py-4 text-slate-300">{new Date(event.created_at).toLocaleString('en-NG')}</td><td className="px-4 py-4 text-white">{event.email || '—'}</td><td className="px-4 py-4 font-mono text-xs text-slate-300">{event.ip || '—'}</td><td className="px-4 py-4 text-slate-300">{describeAgent(event.user_agent)}</td><td className={`px-4 py-4 font-semibold ${event.success ? 'text-green-300' : 'text-red-300'}`}>{event.success ? 'Success' : 'Failed'}{event.is_new_device && <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-1 text-[10px] text-amber-200">New device</span>}</td></tr>)}</tbody></table>}
    </section>
    <footer className="flex items-center justify-between text-xs text-slate-400"><span>{count} login event(s)</span><div className="flex items-center gap-2"><button type="button" disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page + 1} of {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span><button type="button" disabled={(page + 1) * PAGE_SIZE >= count || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-40">Next</button></div></footer>
  </div>
}
