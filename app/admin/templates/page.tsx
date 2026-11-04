'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowDown, ArrowUp, Eye, Plus, Save, Trash2 } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { useAdminRole } from '@/components/AdminLayoutClient'
import { adminOperationError } from '@/lib/adminRole'
import { invalidateWhatsAppConfiguration, renderTemplate } from '@/lib/whatsapp'
import type { WhatsAppTemplate } from '@/lib/whatsapp'

const PLACEHOLDERS = [
  '{customer_name}', '{business_name}', '{invoice_number}', '{total}',
  '{amount_due}', '{product_name}', '{offer}', '{link}',
]

const EMPTY_TEMPLATE: Omit<WhatsAppTemplate, 'id'> = {
  key: '',
  title: '',
  body: '',
  sort_order: 0,
  is_active: true,
}

export default function WhatsAppTemplatesPage() {
  const { role, isOwner } = useAdminRole()
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [draft, setDraft] = useState<WhatsAppTemplate | null>(null)
  const [businessName, setBusinessName] = useState('Fonestack')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    let active = true
    async function loadTemplates() {
      if (role === 'technician') {
        setErrorMessage('WhatsApp template management is available to owners and staff only.')
        setLoading(false)
        return
      }
      const [templatesResult, settingsResult] = await Promise.all([
        supabase.from('whatsapp_templates').select('*').order('sort_order', { ascending: true }),
        supabase.from('settings').select('value').eq('key', 'business_name').maybeSingle(),
      ])
      const failed = templatesResult.error ?? settingsResult.error
      if (!active) return
      if (failed) setErrorMessage(`Could not load templates: ${failed.message}`)
      else {
        setTemplates((templatesResult.data ?? []) as WhatsAppTemplate[])
        setBusinessName(settingsResult.data?.value || 'Fonestack')
      }
      setLoading(false)
    }
    void loadTemplates()
    return () => { active = false }
  }, [role])

  const preview = useMemo(() => draft
    ? renderTemplate(draft.body, {
        customer_name: 'Ada',
        business_name: businessName,
        invoice_number: 'INV-0001',
        total: '₦250,000',
        amount_due: '₦50,000',
        product_name: 'iPhone 13',
        offer: '₦120,000',
        link: 'https://fonestack.com.ng/invoice/example',
      })
    : '', [draft, businessName])

  function startNew() {
    setDraft({ ...EMPTY_TEMPLATE, id: -1, sort_order: templates.length + 1 })
    setErrorMessage('')
    setStatusMessage('')
  }

  async function saveTemplate() {
    if (!draft) return
    const key = draft.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_')
    if (!key || !draft.title.trim() || !draft.body.trim()) {
      setErrorMessage('Enter a template key, title, and message body.')
      return
    }
    setSaving(true)
    setErrorMessage('')
    setStatusMessage('')
    const values = {
      key,
      title: draft.title.trim(),
      body: draft.body,
      sort_order: draft.sort_order,
      is_active: draft.is_active,
      updated_at: new Date().toISOString(),
    }
    const result = draft.id < 0
      ? await supabase.from('whatsapp_templates').insert(values).select('*').single()
      : await supabase.from('whatsapp_templates').update(values).eq('id', draft.id).select('*').single()
    if (result.error) {
      setErrorMessage(`Could not save template: ${adminOperationError(result.error, 'save WhatsApp templates')}`)
    } else {
      const saved = result.data as WhatsAppTemplate
      setTemplates((current) => [...current.filter((item) => item.id !== saved.id), saved]
        .sort((a, b) => a.sort_order - b.sort_order))
      setDraft(saved)
      setStatusMessage('Template saved.')
      invalidateWhatsAppConfiguration()
    }
    setSaving(false)
  }

  async function toggleActive(template: WhatsAppTemplate) {
    const { error } = await supabase
      .from('whatsapp_templates')
      .update({ is_active: !template.is_active, updated_at: new Date().toISOString() })
      .eq('id', template.id)
    if (error) setErrorMessage(`Could not update template: ${adminOperationError(error, 'update WhatsApp templates')}`)
    else {
      setTemplates((current) => current.map((item) =>
        item.id === template.id ? { ...item, is_active: !item.is_active } : item))
      invalidateWhatsAppConfiguration()
    }
  }

  async function moveTemplate(template: WhatsAppTemplate, direction: -1 | 1) {
    const ordered = [...templates].sort((a, b) => a.sort_order - b.sort_order)
    const index = ordered.findIndex((item) => item.id === template.id)
    const other = ordered[index + direction]
    if (!other) return
    setErrorMessage('')
    const now = new Date().toISOString()
    const [first, second] = await Promise.all([
      supabase.from('whatsapp_templates').update({ sort_order: other.sort_order, updated_at: now }).eq('id', template.id),
      supabase.from('whatsapp_templates').update({ sort_order: template.sort_order, updated_at: now }).eq('id', other.id),
    ])
    const failed = first.error ?? second.error
    if (failed) {
      setErrorMessage(`Could not reorder templates: ${adminOperationError(failed, 'reorder WhatsApp templates')}`)
      return
    }
    setTemplates((current) => current.map((item) => item.id === template.id
      ? { ...item, sort_order: other.sort_order }
      : item.id === other.id ? { ...item, sort_order: template.sort_order } : item)
      .sort((a, b) => a.sort_order - b.sort_order))
    invalidateWhatsAppConfiguration()
  }

  async function deleteTemplate(template: WhatsAppTemplate) {
    if (!isOwner || !window.confirm(`Delete "${template.title}"?`)) return
    const { error } = await supabase.from('whatsapp_templates').delete().eq('id', template.id)
    if (error) setErrorMessage(`Could not delete template: ${adminOperationError(error, 'delete WhatsApp templates')}`)
    else {
      setTemplates((current) => current.filter((item) => item.id !== template.id))
      if (draft?.id === template.id) setDraft(null)
      invalidateWhatsAppConfiguration()
    }
  }

  return (
    <div className="space-y-6 p-1 pb-20 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Admin · WhatsApp</p>
          <h2 className="text-2xl font-black text-white">WhatsApp templates</h2>
          <p className="mt-1 text-sm text-slate-400">Write reusable customer messages with placeholders and preview them before saving.</p>
        </div>
        <button type="button" onClick={startNew} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add template
        </button>
      </div>
      {errorMessage && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{errorMessage}</span>
        </div>
      )}
      {statusMessage && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{statusMessage}</p>}

      {loading ? <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">Loading templates…</p> : errorMessage && templates.length === 0 ? null : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="space-y-2">
            {templates.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">No templates yet. Add one to get started.</p>
            ) : templates.map((template, index) => (
              <article key={template.id} className={`rounded-xl border p-4 ${draft?.id === template.id ? 'border-premiumYellow/50 bg-premiumYellow/5' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => setDraft(template)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-bold text-white">{template.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{template.key} · {template.is_active ? 'Active' : 'Inactive'}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" aria-label={`Move ${template.title} up`} disabled={index === 0} onClick={() => void moveTemplate(template, -1)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={`Move ${template.title} down`} disabled={index === templates.length - 1} onClick={() => void moveTemplate(template, 1)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => void toggleActive(template)} className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-white/10">
                      {template.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    {isOwner && (
                      <button type="button" aria-label={`Delete ${template.title}`} onClick={() => void deleteTemplate(template)} className="rounded-lg p-2 text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>

          {draft && (
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-xs font-semibold text-slate-300">
                  Template key
                  <input value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} placeholder="payment_reminder" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" />
                </label>
                <label className="space-y-2 text-xs font-semibold text-slate-300">
                  Title
                  <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" />
                </label>
              </div>
              <label className="block space-y-2 text-xs font-semibold text-slate-300">
                Message
                <textarea rows={5} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
              </label>
              <div>
                <p className="text-xs font-semibold text-slate-300">Available placeholders</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PLACEHOLDERS.map((placeholder) => <code key={placeholder} className="rounded-md bg-black/30 px-2 py-1 text-[11px] text-premiumYellow">{placeholder}</code>)}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Eye className="h-4 w-4" aria-hidden="true" /> Live preview</p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-white">{preview || 'Your message preview will appear here.'}</p>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => void saveTemplate()} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black disabled:opacity-60">
                  <Save className="h-4 w-4" aria-hidden="true" /> {saving ? 'Saving…' : 'Save template'}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
