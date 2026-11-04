'use client'

import { useState } from 'react'
import { AlertCircle, Copy, MessageCircle, Search, Sparkles } from 'lucide-react'

import { useAdminRole } from '@/components/AdminLayoutClient'
import { supabase } from '@/lib/supabase'
import { makeWhatsAppUrl } from '@/lib/whatsapp'

type Product = { id: number; brand: string; name: string; price: number; status: string; condition_grade: string | null; storage_gb: number | null; stock_quantity: number | null; warranty_months: number | null }

export default function ReplyAssistantPage() {
  const { role } = useAdminRole()
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState<'english' | 'pidgin'>('english')
  const [phone, setPhone] = useState('')
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [searching, setSearching] = useState(false)
  const [drafts, setDrafts] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  async function searchProducts(value: string) {
    setQuery(value)
    setProduct(null)
    if (value.trim().length < 2) { setProducts([]); return }
    setSearching(true)
    const { data, error } = await supabase.from('products')
      .select('id,brand,name,price,status,condition_grade,storage_gb,stock_quantity,warranty_months')
      .or(`name.ilike.%${value.trim()}%,brand.ilike.%${value.trim()}%`)
      .order('brand')
      .limit(10)
    if (error) setErrorMessage(`Could not search products: ${error.message}`)
    else setProducts((data ?? []) as Product[])
    setSearching(false)
  }

  async function draftReplies() {
    setErrorMessage('')
    setStatusMessage('')
    if (!message.trim()) { setErrorMessage('Paste the customer message first.'); return }
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again.')
      const response = await fetch('/api/admin/reply-draft', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), language, productId: product?.id }),
      })
      const result = await response.json() as { drafts?: string[]; error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not draft replies.')
      if (!result.drafts || result.drafts.length !== 2) throw new Error('The reply service did not return two drafts.')
      setDrafts(result.drafts)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not draft replies.')
    } finally { setBusy(false) }
  }

  async function copyDraft(index: number) {
    try {
      await navigator.clipboard.writeText(drafts[index])
      setStatusMessage(`Draft ${index + 1} copied.`)
    } catch {
      setErrorMessage('Could not copy this draft. Select the text and copy it manually.')
    }
  }

  function openWhatsApp(draft: string) {
    const url = makeWhatsAppUrl(phone, draft)
    if (!url) { setErrorMessage('Enter a valid customer phone number before opening WhatsApp.'); return }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (role === 'technician') return null
  return <div className="mx-auto max-w-4xl space-y-6 p-1 pb-20 md:p-4">
    <header><p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">Drafts only</p><h1 className="text-2xl font-black text-white">Reply assistant</h1><p className="mt-1 text-sm text-slate-400">Create reply options for review. Nothing is sent automatically.</p></header>
    {errorMessage && <p role="alert" className="flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{errorMessage}</p>}
    {statusMessage && <p role="status" className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">{statusMessage}</p>}
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <label className="block space-y-2 text-xs font-semibold text-slate-300">Customer WhatsApp message<textarea rows={7} maxLength={4000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Paste the message here…" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-normal text-white" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-xs font-semibold text-slate-300">Reply language style<select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"><option value="english">Clear English</option><option value="pidgin">Light Nigerian Pidgin</option></select></label>
        <label className="space-y-2 text-xs font-semibold text-slate-300">Customer phone (optional)<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="080…" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
      </div>
      <div className="space-y-2">
        <label className="relative block text-xs font-semibold text-slate-300">Optional product<Search className="absolute left-3 top-9 h-4 w-4 text-slate-500" aria-hidden="true" /><input value={product ? `${product.brand} ${product.name}` : query} onChange={(event) => void searchProducts(event.target.value)} placeholder="Search inventory" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm font-normal text-white" /></label>
        {searching && <p role="status" className="text-xs text-slate-500">Searching inventory…</p>}
        {!product && products.length > 0 && <div className="overflow-hidden rounded-xl border border-white/10">{products.map((item) => <button key={item.id} type="button" onClick={() => { setProduct(item); setQuery(`${item.brand} ${item.name}`); setProducts([]) }} className="flex w-full justify-between gap-3 border-b border-white/5 px-3 py-2 text-left text-sm text-white last:border-0 hover:bg-white/5"><span>{item.brand} {item.name}</span><span className="text-xs text-slate-400">₦{Number(item.price).toLocaleString('en-NG')}</span></button>)}</div>}
        {product && <div className="flex items-center justify-between gap-2 rounded-lg bg-premiumYellow/10 px-3 py-2 text-xs text-premiumYellow"><span>Selected: {product.brand} {product.name}</span><button type="button" onClick={() => { setProduct(null); setQuery('') }} className="underline">Clear</button></div>}
      </div>
      <button type="button" onClick={() => void draftReplies()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-premiumYellow px-4 py-3 text-sm font-bold text-black disabled:opacity-50"><Sparkles className="h-4 w-4" aria-hidden="true" />{busy ? 'Drafting…' : 'Draft replies'}</button>
    </section>
    {drafts.length > 0 && <section className="space-y-4"><h2 className="font-bold text-white">Review and edit your drafts</h2>{drafts.map((draft, index) => <article key={index} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"><label className="block space-y-2 text-xs font-semibold text-slate-300">Draft {index + 1}<textarea rows={4} value={draft} onChange={(event) => setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-normal text-white" /></label><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void copyDraft(index)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200"><Copy className="h-4 w-4" aria-hidden="true" />Copy</button><button type="button" onClick={() => openWhatsApp(draft)} className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-2 text-xs text-green-200"><MessageCircle className="h-4 w-4" aria-hidden="true" />Open in WhatsApp</button></div></article>)}</section>}
  </div>
}
