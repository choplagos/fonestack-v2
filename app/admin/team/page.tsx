'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Plus, Save, Trash2 } from 'lucide-react'

import { useAdminRole } from '@/components/AdminLayoutClient'
import { supabase } from '@/lib/supabase'

type TeamMember = { id: string; email: string; name: string | null; role: string | null; created_at: string }
type MemberDraft = { name: string; role: 'owner' | 'staff' | 'technician' }

const PERMISSION_ERROR = 'You do not have permission to change team members. Sign in with an owner account.'
function messageFor(error: { message: string }) {
  return /permission|policy|row-level security|not authorized/i.test(error.message) ? PERMISSION_ERROR : error.message
}

export default function TeamPage() {
  const { role } = useAdminRole()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [drafts, setDrafts] = useState<Record<string, MemberDraft>>({})
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [newRole, setNewRole] = useState<MemberDraft['role']>('staff')
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  async function loadMembers() {
    const { data, error } = await supabase.from('admin_users')
      .select('id,email,name,role,created_at')
      .order('created_at', { ascending: true })
    if (error) setErrorMessage(`Could not load team members: ${messageFor(error)}`)
    else {
      const rows = (data ?? []) as TeamMember[]
      setMembers(rows)
      setDrafts(Object.fromEntries(rows.map((member) => [member.id, {
        name: member.name ?? '',
        role: member.role === 'staff' || member.role === 'technician' ? member.role : 'owner',
      }])))
    }
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    async function init() {
      const { data, error } = await supabase.auth.getUser()
      if (!active) return
      if (error) setErrorMessage(`Could not identify your admin account: ${error.message}`)
      else setCurrentUserId(data.user?.id ?? '')
      await loadMembers()
    }
    void init()
    return () => { active = false }
  }, [])

  function updateDraft(id: string, patch: Partial<MemberDraft>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
  }

  async function saveMember(member: TeamMember) {
    const draft = drafts[member.id]
    if (!draft) return
    if (member.role !== 'staff' && member.role !== 'technician' && draft.role !== 'owner'
      && members.filter((candidate) => candidate.role !== 'staff' && candidate.role !== 'technician').length <= 1) {
      setErrorMessage('The last owner cannot be changed to another role.')
      return
    }
    setBusy(true)
    setErrorMessage('')
    setStatusMessage('')
    const { error } = await supabase.from('admin_users').update({ name: draft.name.trim() || null, role: draft.role }).eq('id', member.id)
    if (error) setErrorMessage(`Could not update ${member.email}: ${messageFor(error)}`)
    else {
      setStatusMessage(`Updated ${member.email}.`)
      await loadMembers()
    }
    setBusy(false)
  }

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setStatusMessage('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setErrorMessage('Enter the team member’s email address.')
      return
    }
    setBusy(true)
    const { error } = await supabase.rpc('add_admin_user_by_email', {
      p_email: normalizedEmail,
      p_name: name.trim(),
      p_role: newRole,
    })
    if (error) setErrorMessage(`Could not add team member: ${messageFor(error)}`)
    else {
      setEmail('')
      setName('')
      setStatusMessage(`Added ${normalizedEmail}.`)
      await loadMembers()
    }
    setBusy(false)
  }

  async function removeMember(member: TeamMember) {
    if (member.id === currentUserId) {
      setErrorMessage('You cannot remove your own admin account.')
      return
    }
    const isOwner = member.role !== 'staff' && member.role !== 'technician'
    if (isOwner && members.filter((candidate) => candidate.role !== 'staff' && candidate.role !== 'technician').length <= 1) {
      setErrorMessage('The last owner cannot be removed.')
      return
    }
    if (!window.confirm(`Remove ${member.email} from the admin allowlist? Their Supabase Authentication account will not be deleted.`)) return
    setBusy(true)
    setErrorMessage('')
    const { error } = await supabase.from('admin_users').delete().eq('id', member.id)
    if (error) setErrorMessage(`Could not remove team member: ${messageFor(error)}`)
    else {
      setStatusMessage(`Removed ${member.email} from the admin allowlist.`)
      await loadMembers()
    }
    setBusy(false)
  }

  if (role !== 'owner') return null
  return <div className="space-y-6 p-1 pb-20 md:p-4">
    <header><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Access control</p><h1 className="text-2xl font-black text-white">Team</h1><p className="mt-1 text-sm text-slate-400">Manage the admin allowlist and role assignments.</p></header>
    {errorMessage && <p role="alert" className="flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{errorMessage}</p>}
    {statusMessage && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{statusMessage}</p>}
    <form onSubmit={addMember} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="font-bold text-white">Add team member</h2>
      <p className="text-sm text-slate-400">The person must first be created in Supabase Authentication, then added here.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-xs text-slate-400">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
        <label className="space-y-1 text-xs text-slate-400">Name<input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
        <label className="space-y-1 text-xs text-slate-400">Role<select value={newRole} onChange={(event) => setNewRole(event.target.value as MemberDraft['role'])} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"><option value="owner">Owner</option><option value="staff">Staff</option><option value="technician">Technician</option></select></label>
      </div>
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"><Plus className="h-4 w-4" aria-hidden="true" />Add member</button>
    </form>
    <section className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      {loading ? <p role="status" className="p-5 text-sm text-slate-400">Loading team…</p> : <table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Added</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{members.map((member) => <tr key={member.id}><td className="px-4 py-4 font-medium text-white">{member.email}{member.id === currentUserId && <span className="ml-2 text-xs text-slate-500">(you)</span>}</td><td className="px-4 py-4"><input aria-label={`Name for ${member.email}`} value={drafts[member.id]?.name ?? ''} onChange={(event) => updateDraft(member.id, { name: event.target.value })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></td><td className="px-4 py-4"><select aria-label={`Role for ${member.email}`} value={drafts[member.id]?.role ?? 'owner'} onChange={(event) => updateDraft(member.id, { role: event.target.value as MemberDraft['role'] })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"><option value="owner">Owner</option><option value="staff">Staff</option><option value="technician">Technician</option></select></td><td className="px-4 py-4 text-slate-400">{new Date(member.created_at).toLocaleDateString('en-NG')}</td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => void saveMember(member)} aria-label={`Save ${member.email}`} className="rounded-lg border border-white/10 p-2 text-premiumYellow disabled:opacity-40"><Save className="h-4 w-4" aria-hidden="true" /></button><button type="button" disabled={busy || member.id === currentUserId} onClick={() => void removeMember(member)} aria-label={`Remove ${member.email}`} className="rounded-lg border border-white/10 p-2 text-red-300 disabled:opacity-40"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div></td></tr>)}</tbody></table>}
    </section>
  </div>
}
