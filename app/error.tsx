'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-900 text-white p-4" role="main" aria-label="Error page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center liquid-glass p-12 rounded-3xl max-w-md"
      >
        <div className="text-6xl font-display font-black text-premiumYellow mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8">
          We apologize for the inconvenience. Please try again or contact us.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-premiumYellow text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            aria-label="Try again"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 liquid-glass px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            aria-label="Go to homepage"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}