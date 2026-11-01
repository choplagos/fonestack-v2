'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'

import { supabase } from '@/lib/supabase'

const SETTING_FIELDS = [
  ['business_name', 'Business name'],
  ['invoice_tagline', 'Invoice tagline'],
  ['business_address', 'Business address'],
  ['business_phone', 'Business phone'],
  ['business_email', 'Business email'],
  ['business_whatsapp', 'WhatsApp number'],
  ['logo_url', 'Logo URL'],
  ['invoice_footer', 'Invoice footer'],
  ['invoice_terms', 'Invoice terms'],
] as const

type SettingsForm = Record<(typeof SETTING_FIELDS)[number][0], string>
type SettingRow = { key: string; value: string }

const EMPTY_SETTINGS = Object.fromEntries(SETTING_FIELDS.map(([key]) => [key, ''])) as SettingsForm

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    async function loadSettings() {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', SETTING_FIELDS.map(([key]) => key))

      if (!active) return
      if (error) {
        setErrorMessage(`Could not load business settings from Supabase: ${error.message}`)
      } else {
        const values = { ...EMPTY_SETTINGS }
        for (const row of (data ?? []) as SettingRow[]) {
          if (row.key in values) values[row.key as keyof SettingsForm] = row.value
        }
        setSettings(values)
      }
      setLoading(false)
    }

    void loadSettings()
    return () => {
      active = false
    }
  }, [])

  function updateField(key: keyof SettingsForm, value: string) {
    setSettings((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  async function saveSettings() {
    setSaving(true)
    setErrorMessage('')
    setSaved(false)

    const results = await Promise.all(
      SETTING_FIELDS.map(([key]) =>
        supabase.from('settings').upsert({ key, value: settings[key] }, { onConflict: 'key' }),
      ),
    )
    const failed = results.find((result) => result.error)?.error

    if (failed) {
      setErrorMessage(`Could not save business settings: ${failed.message}`)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-1 md:p-4">
      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
          Supabase · settings
        </p>
        <h2 className="text-2xl font-black text-white">Business settings</h2>
        <p className="mt-1 text-sm text-slate-400">These values are used by customer invoices and public invoice views.</p>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
      {saved && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">Settings saved to Supabase.</p>}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-7">
        {loading ? (
          <p className="text-sm text-slate-400">Loading settings from Supabase…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {SETTING_FIELDS.map(([key, label]) => (
                <label key={key} className={`space-y-2 text-xs font-semibold text-slate-300 ${key === 'invoice_terms' || key === 'invoice_footer' ? 'sm:col-span-2' : ''}`}>
                  {label}
                  {key === 'invoice_terms' || key === 'invoice_footer' ? (
                    <textarea
                      rows={key === 'invoice_terms' ? 5 : 2}
                      value={settings[key]}
                      onChange={(event) => updateField(key, event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-premiumYellow/70"
                    />
                  ) : (
                    <input
                      type={key === 'business_email' ? 'email' : key === 'logo_url' ? 'url' : 'text'}
                      value={settings[key]}
                      onChange={(event) => updateField(key, event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-premiumYellow/70"
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
