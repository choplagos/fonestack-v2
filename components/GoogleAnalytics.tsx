'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
    googleAnalyticsInitialized?: boolean
  }
}

const MEASUREMENT_ID = 'G-Z2SB1J9DFC'
const SCRIPT_ID = 'google-analytics-gtag'

function isExcludedRoute(pathname: string) {
  return ['/admin', '/invoice'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const lastPageView = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (isExcludedRoute(pathname)) {
      lastPageView.current = null
      return
    }

    window.dataLayer = window.dataLayer || []
    window.gtag ??= (...args: unknown[]) => window.dataLayer.push(args)

    if (!window.googleAnalyticsInitialized) {
      window.gtag('js', new Date())
      window.gtag('config', MEASUREMENT_ID, { send_page_view: false })
      window.googleAnalyticsInitialized = true
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
      document.head.appendChild(script)
    }

    if (lastPageView.current !== pathname) {
      window.gtag('event', 'page_view', { page_path: pathname })
      lastPageView.current = pathname
    }
  }, [pathname])

  return null
}
