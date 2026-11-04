'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Pencil, Plus, Save, Trash2 } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { useAdminRole } from '@/components/AdminLayoutClient'
import { adminOperationError } from '@/lib/adminRole'

type Supplier = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
}

type SupplierDraft = Omit<Supplier, 'id'> & { id?: number }

const EMPTY: SupplierDraft = { name: '', phone: '', email: '', address: '', notes: '' }

export default function SuppliersPage() {
  const { role, isOwner } = useAdminRole()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [draft, setDraft] = useState<SupplierDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadSuppliers() {
    const { data, error } = await supabase.from('suppliers').select('*').order('name')
    if (error) setErrorMessage(`Could not load suppliers: ${error.message}`)
    else setSuppliers((data ?? []) as Supplier[])
    setLoading(false)
  }

  useEffect(() => {
    if (role === 'technician') {
      setErrorMessage('Suppliers are available to owners and staff only.')
      setBlocked(true)
      setLoading(false)
    } else {
      void loadSuppliers()
    }
  }, [role])

  async function saveSupplier() {
    if (!draft?.name.trim()) {
      setErrorMessage('Supplier name is required.')
      return
    }
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')
    const payload = {
      name: draft.name.trim(),
      phone: draft.phone?.trim() || null,
      email: draft.email?.trim() || null,
      address: draft.address?.trim() || null,
      notes: draft.notes?.trim() || null,
    }
    const result = draft.id
      ? await supabase.from('suppliers').update(payload).eq('id', draft.id)
      : await supabase.from('suppliers').insert(payload)
    if (result.error) setErrorMessage(`Could not save supplier: ${adminOperationError(result.error, 'save suppliers')}`)
    else {
      setDraft(null)
      setSuccessMessage('Supplier saved.')
      await loadSuppliers()
    }
    setSaving(false)
  }

  async function deleteSupplier(supplier: Supplier) {
    if (!isOwner || !window.confirm(`Delete supplier "${supplier.name}"? Purchases will keep their records with no supplier linked.`)) return
    const { error } = await supabase.from('suppliers').delete().eq('id', supplier.id)
    if (error) setErrorMessage(`Could not delete supplier: ${adminOperationError(error, 'delete suppliers')}`)
    else setSuppliers((current) => current.filter((item) => item.id !== supplier.id))
  }

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Purchasing</p><h2 className="text-2xl font-black text-white">Suppliers</h2><p className="mt-1 text-sm text-slate-400">Manage suppliers for stock purchases.</p></div>
        {!blocked && <button type="button" onClick={() => setDraft({ ...EMPTY })} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black"><Plus className="h-4 w-4" aria-hidden="true" />Add supplier</button>}
      </div>
      {errorMessage && <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{errorMessage}</div>}
      {successMessage && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{successMessage}</p>}
      {draft && !blocked && (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['Name', 'name'],
              ['Phone', 'phone'],
              ['Email', 'email'],
              ['Address', 'address'],
            ] as const).map(([label, key]) => (
              <label key={key} className="space-y-2 text-xs font-semibold text-slate-300">{label}<input type={key === 'email' ? 'email' : 'text'} value={draft[key] ?? ''} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
            ))}
            <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">Notes<textarea rows={3} value={draft.notes ?? ''} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300">Cancel</button>
            <button type="button" disabled={saving} onClick={() => void saveSupplier()} className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black disabled:opacity-50"><Save className="h-4 w-4" aria-hidden="true" />{saving ? 'Saving…' : 'Save supplier'}</button>
          </div>
        </section>
      )}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {loading ? <p role="status" className="p-6 text-sm text-slate-400">Loading suppliers…</p> : blocked ? null : suppliers.length === 0 ? <p className="p-6 text-sm text-slate-400">No suppliers saved yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Address</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/5 text-slate-200">{suppliers.map((supplier) => (
              <tr key={supplier.id}><td className="px-5 py-4"><p className="font-semibold text-white">{supplier.name}</p>{supplier.notes && <p className="mt-1 text-xs text-slate-500">{supplier.notes}</p>}</td><td className="px-5 py-4">{supplier.phone || '—'}{supplier.email && <p className="mt-1 text-xs text-slate-400">{supplier.email}</p>}</td><td className="px-5 py-4">{supplier.address || '—'}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setDraft({ ...supplier })} aria-label={`Edit ${supplier.name}`} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-premiumYellow"><Pencil className="h-4 w-4" aria-hidden="true" /></button>{isOwner && <button type="button" onClick={() => void deleteSupplier(supplier)} aria-label={`Delete ${supplier.name}`} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-red-300"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}</div></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </div>
  )
}
