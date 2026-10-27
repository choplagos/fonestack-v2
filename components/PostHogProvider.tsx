'use client'

import { useEffect, type ReactNode } from 'react'
import posthog from 'posthog-js'
import { track } from '@/lib/analytics'

export default function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: '/ingest',
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.posthog.com',
        capture_pageview: 'history_change',
        person_profiles: 'identified_only',
        autocapture: false,
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '[data-ph-sensitive]',
          blockSelector: '[data-ph-no-capture]',
        },
      })
    }

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return

      const link = event.target.closest('a')
      if (!link) return

      if (link.href.includes('wa.me')) {
        const product = link.closest<HTMLElement>('[data-analytics-model]')
        const model = link.dataset.analyticsModel ?? product?.dataset.analyticsModel
        const brand = link.dataset.analyticsBrand ?? product?.dataset.analyticsBrand

        track('whatsapp_click', {
          page: window.location.pathname,
          ...(model ? { model } : {}),
          ...(brand ? { brand } : {}),
        })
      }

      if (/\bbook a repair\b/i.test(link.textContent ?? '')) {
        track('repair_click')
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return children
}
