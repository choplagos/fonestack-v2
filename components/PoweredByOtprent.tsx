'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function PoweredByOtprent() {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<number | null>(null)
  const REAPPEAR_MS = 1200 // configurable delay after scroll stops

  useEffect(() => {
    const onScroll = () => {
      // Hide immediately while scrolling
      setVisible(false)
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      // Show after user stops scrolling for REAPPEAR_MS
      timerRef.current = window.setTimeout(() => setVisible(true), REAPPEAR_MS)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div
      className={`fixed z-50 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] print:hidden transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      aria-hidden={!visible}
    >
      <a
        href="https://otprent.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Powered by Otprent"
        className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur rounded-full text-xs font-semibold hover:bg-white/10 shadow-lg"
      >
        Powered by Otprent
      </a>
    </div>
  )
}
