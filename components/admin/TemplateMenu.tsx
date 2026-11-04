'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'

import {
  loadWhatsAppConfiguration,
  makeWhatsAppUrl,
  renderTemplate,
  type WhatsAppTemplate,
  type WhatsAppValues,
} from '@/lib/whatsapp'

type TemplateMenuProps = {
  phone: string
  values?: WhatsAppValues
  defaultTemplateKey?: string
  compact?: boolean
}

export default function TemplateMenu({
  phone,
  values = {},
  defaultTemplateKey,
  compact = false,
}: TemplateMenuProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [businessName, setBusinessName] = useState('Fonestack')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    loadWhatsAppConfiguration()
      .then((configuration) => {
        if (!active) return
        setTemplates(configuration.templates)
        setBusinessName(configuration.businessName)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'WhatsApp templates could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  const mergedValues = { ...values, business_name: businessName }
  const firstUrl = defaultTemplateKey
    ? (() => {
        const selected = templates.find((template) => template.key === defaultTemplateKey)
        return selected ? makeWhatsAppUrl(phone, renderTemplate(selected.body, mergedValues)) : null
      })()
    : makeWhatsAppUrl(phone)

  return (
    <div className="relative inline-flex items-center">
      {firstUrl && (
        <a
          href={firstUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open WhatsApp message"
          title="WhatsApp"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-300 hover:bg-green-500/10"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <button
        type="button"
        aria-label="Choose a WhatsApp message template"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white ${compact ? 'h-8' : ''}`}
      >
        Message <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
          {error ? (
            <p role="alert" className="p-2 text-xs text-red-300">{error}</p>
          ) : templates.length === 0 ? (
            <p className="p-2 text-xs text-slate-400">No active templates are available.</p>
          ) : templates.map((template) => {
            const href = makeWhatsAppUrl(phone, renderTemplate(template.body, mergedValues))
            return href ? (
              <a
                key={template.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10"
              >
                {template.title}
              </a>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
