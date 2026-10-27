import posthog from 'posthog-js'

export type AnalyticsEvent =
  | 'whatsapp_click'
  | 'repair_click'
  | 'tradein_started'
  | 'tradein_submitted'
  | 'product_viewed'
  | 'diagnostic_started'
  | 'diagnostic_completed'

export type AnalyticsProperties = {
  page?: string
  model?: string
  brand?: string
  price?: number
  passed?: number
  problems?: number
  skipped?: number
}

function isSafeDeviceLabel(value: string) {
  return !value.includes('@') && value.replace(/\D/g, '').length < 10
}

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  if (typeof window === 'undefined' || !posthog.__loaded) return

  const safeProperties: AnalyticsProperties = {}
  if (typeof properties.page === 'string') safeProperties.page = properties.page
  if (typeof properties.model === 'string' && isSafeDeviceLabel(properties.model)) {
    safeProperties.model = properties.model
  }
  if (typeof properties.brand === 'string' && isSafeDeviceLabel(properties.brand)) {
    safeProperties.brand = properties.brand
  }
  if (typeof properties.price === 'number' && Number.isFinite(properties.price)) {
    safeProperties.price = properties.price
  }
  if (typeof properties.passed === 'number' && Number.isFinite(properties.passed)) {
    safeProperties.passed = properties.passed
  }
  if (typeof properties.problems === 'number' && Number.isFinite(properties.problems)) {
    safeProperties.problems = properties.problems
  }
  if (typeof properties.skipped === 'number' && Number.isFinite(properties.skipped)) {
    safeProperties.skipped = properties.skipped
  }

  posthog.capture(event, safeProperties)
}

export function currentPage() {
  return typeof window === 'undefined' ? undefined : window.location.pathname
}
