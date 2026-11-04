import { supabase } from '@/lib/supabase'

export type WhatsAppValues = Record<string, string | number | null | undefined>

export type WhatsAppTemplate = {
  id: number
  key: string
  title: string
  body: string
  sort_order: number
  is_active: boolean
}

type WhatsAppConfiguration = {
  templates: WhatsAppTemplate[]
  businessName: string
}

let configurationPromise: Promise<WhatsAppConfiguration> | null = null

export function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('0') ? `234${digits.slice(1)}` : digits
}

export function renderTemplate(body: string, values: WhatsAppValues) {
  return body.replace(/\{([^{}]+)\}/g, (placeholder, key: string) => {
    const value = values[key]
    return value === null || value === undefined ? placeholder : String(value)
  })
}

export function invalidateWhatsAppConfiguration() {
  configurationPromise = null
}

export function loadWhatsAppConfiguration(): Promise<WhatsAppConfiguration> {
  if (!configurationPromise) {
    configurationPromise = Promise.all([
      supabase
        .from('whatsapp_templates')
        .select('id, key, title, body, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase.from('settings').select('value').eq('key', 'business_name').maybeSingle(),
    ]).then(([templateResult, settingResult]) => {
      if (templateResult.error) throw new Error(`Could not load WhatsApp templates: ${templateResult.error.message}`)
      if (settingResult.error) throw new Error(`Could not load business name: ${settingResult.error.message}`)
      return {
        templates: (templateResult.data ?? []) as WhatsAppTemplate[],
        businessName: settingResult.data?.value || 'Fonestack',
      }
    }).catch((error: unknown) => {
      configurationPromise = null
      throw error
    })
  }
  return configurationPromise
}

export function makeWhatsAppUrl(phone: string, message?: string) {
  const number = normalizeWhatsAppNumber(phone)
  if (number.length < 10) return null
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${query}`
}
