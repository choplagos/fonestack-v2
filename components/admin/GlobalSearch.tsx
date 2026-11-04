'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FileText,
  MessageSquare,
  Package,
  Search,
  Smartphone,
  Users,
  X,
} from 'lucide-react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

import { supabase } from '@/lib/supabase'

type SearchResult = {
  kind: string
  id: string
  title: string
  subtitle: string | null
  url: string
}

const GROUPS = [
  { kind: 'invoice', label: 'Invoices', icon: FileText },
  { kind: 'product', label: 'Products', icon: Package },
  { kind: 'customer', label: 'Customers', icon: Users },
  { kind: 'trade_in', label: 'Trade-ins', icon: Smartphone },
  { kind: 'request', label: 'Requests', icon: MessageSquare },
] as const

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
    setError('')
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || Boolean(target?.isContentEditable)
      if ((event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))
        || (event.key === '/' && !isTyping)) {
        event.preventDefault()
        setOpen(true)
      }
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [close])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const normalized = query.trim()
    if (!open || normalized.length < 2) {
      setResults([])
      setError('')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    const timer = window.setTimeout(async () => {
      const { data, error: searchError } = await supabase.rpc('admin_search', { q: normalized })
      if (!active) return
      if (searchError) {
        setResults([])
        setError(`Search could not be completed: ${searchError.message}`)
      } else {
        setResults((data ?? []) as SearchResult[])
        setSelected(0)
        setError('')
      }
      setLoading(false)
    }, 250)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [open, query])

  const groupedResults = useMemo(
    () => GROUPS.map((group) => ({
      ...group,
      results: results.filter((result) => result.kind === group.kind),
    })).filter((group) => group.results.length > 0),
    [results],
  )

  function moveSelection(direction: number) {
    setSelected((current) => Math.max(0, Math.min(results.length - 1, current + direction)))
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveSelection(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveSelection(-1)
    } else if (event.key === 'Enter' && results[selected]) {
      window.location.assign(results[selected].url)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  let flatIndex = -1

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin search"
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-slate-300 hover:bg-white/10"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline">⌘K</kbd>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Search admin records"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="h-5 w-5 shrink-0 text-premiumYellow" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search invoices, products, customers…"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <p className="p-5 text-center text-sm text-slate-500">Enter at least 2 characters to search.</p>
              ) : loading ? (
                <p role="status" className="p-5 text-center text-sm text-slate-400">Searching…</p>
              ) : error ? (
                <p role="alert" className="p-5 text-center text-sm text-red-300">{error}</p>
              ) : results.length === 0 ? (
                <p className="p-5 text-center text-sm text-slate-400">No matching records found.</p>
              ) : groupedResults.map((group) => (
                <div key={group.kind} className="mb-2 last:mb-0">
                  <h3 className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {group.label}
                  </h3>
                  {group.results.map((result) => {
                    flatIndex += 1
                    const index = flatIndex
                    return (
                      <Link
                        key={`${result.kind}-${result.id}`}
                        href={result.url}
                        onClick={close}
                        onMouseEnter={() => setSelected(index)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                          selected === index ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <group.icon className="h-4 w-4 shrink-0 text-premiumYellow" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-white">{result.title}</span>
                          {result.subtitle && <span className="mt-0.5 block truncate text-xs text-slate-400">{result.subtitle}</span>}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
            <footer className="flex gap-4 border-t border-white/10 px-4 py-2 text-[10px] text-slate-500">
              <span>↑↓ navigate</span><span>↵ open</span><span>Esc close</span>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
