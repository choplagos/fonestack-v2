'use client'

import { Phone } from 'lucide-react'

import TemplateMenu from '@/components/admin/TemplateMenu'
import type { WhatsAppValues } from '@/lib/whatsapp'

type PhoneActionsProps = {
  phone: string | null | undefined
  values?: WhatsAppValues
  defaultTemplateKey?: string
  className?: string
}

export default function PhoneActions({
  phone,
  values,
  defaultTemplateKey,
  className = '',
}: PhoneActionsProps) {
  const number = phone?.trim()
  if (!number) return <span className="text-xs text-slate-500">No phone number</span>

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      <a
        href={`tel:${number}`}
        className="inline-flex items-center gap-1 text-xs text-premiumYellow hover:underline"
      >
        <Phone className="h-3 w-3" aria-hidden="true" />
        {number}
      </a>
      <TemplateMenu
        phone={number}
        values={values}
        defaultTemplateKey={defaultTemplateKey}
        compact
      />
    </span>
  )
}
