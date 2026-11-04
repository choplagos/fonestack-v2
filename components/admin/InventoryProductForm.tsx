'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle, Camera, ImagePlus, Loader2, Sparkles, Trash2, Upload } from 'lucide-react'

import { supabase } from '@/lib/supabase'

export type InventoryProductFormData = {
  id?: number
  name: string
  brand: string
  price: number
  cost_price: number | null
  description: string
  seo_title: string
  seo_description: string
  spec: string
  status: 'new' | 'used' | 'hot' | 'demo'
  in_stock: boolean
  image_url: string
  stock_quantity: number
  low_stock_threshold: number
  condition_grade: 'S' | 'A' | 'B' | 'C' | null
  warranty_months: number | null
  imei: string
  storage_gb?: number | null
  ram_gb?: number | null
  color?: string | null
  processor?: string | null
  screen_size?: number | null
  battery_mah?: number | null
  camera_mp?: number | null
}

type StockMovement = {
  id: number
  old_qty: number | null
  new_qty: number | null
  delta: number | null
  reason: string | null
  actor_email: string | null
  created_at: string
}

type MarketPriceResult = {
  minimum: number | null
  median: number | null
  maximum: number | null
  listingCount: number
  sourceCounts: Record<string, number>
  samples: Array<{ source: string; price: number; title?: string; url?: string; location?: string }>
}

type InventoryProductFormProps = {
  form: InventoryProductFormData
  onChange: (form: InventoryProductFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  saving: boolean
}

const REASONS: Record<string, string> = {
  purchase: 'Purchase received',
  sale: 'Invoice sale',
  manual_or_sale: 'Manual adjustment',
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

function imageFileFromCanvas(canvas: HTMLCanvasElement): Promise<{ blob: Blob; extension: 'webp' | 'jpg'; type: string }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((webp) => {
      if (webp?.type === 'image/webp') {
        resolve({ blob: webp, extension: 'webp', type: 'image/webp' })
        return
      }
      canvas.toBlob((jpeg) => {
        if (!jpeg) reject(new Error('The image could not be resized in this browser.'))
        else resolve({ blob: jpeg, extension: 'jpg', type: 'image/jpeg' })
      }, 'image/jpeg', 0.82)
    }, 'image/webp', 0.82)
  })
}

async function resizeImage(file: File) {
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image no larger than 15 MB.')
  if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file.')

  const image = new Image()
  const objectUrl = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('The selected image could not be opened.'))
      image.src = objectUrl
    })
    const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image resizing is not supported in this browser.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return await imageFileFromCanvas(canvas)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export default function InventoryProductForm({
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
}: InventoryProductFormProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')
  const [history, setHistory] = useState<StockMovement[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [copyBusy, setCopyBusy] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [marketBusy, setMarketBusy] = useState(false)
  const [marketError, setMarketError] = useState('')
  const [marketResult, setMarketResult] = useState<MarketPriceResult | null>(null)

  useEffect(() => {
    if (activeTab !== 'history' || !form.id) return
    let active = true
    async function loadHistory() {
      setHistoryLoading(true)
      setHistoryError('')
      const { data, error } = await supabase
        .from('stock_movements')
        .select('id, old_qty, new_qty, delta, reason, actor_email, created_at')
        .eq('product_id', form.id!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (!active) return
      if (error) setHistoryError(error.message)
      else setHistory((data ?? []) as StockMovement[])
      setHistoryLoading(false)
    }
    void loadHistory()
    return () => { active = false }
  }, [activeTab, form.id])

  async function accessToken() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again.')
    return data.session.access_token
  }

  async function uploadImage(file?: File) {
    if (!file) return
    setUploading(true)
    setUploadError('')
    setUploadProgress('Resizing image…')
    try {
      const image = await resizeImage(file)
      const folder = form.id ? String(form.id) : crypto.randomUUID()
      const filePath = `${folder}/${Date.now()}.${image.extension}`
      setUploadProgress('Uploading image…')
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, image.blob, { contentType: image.type, upsert: false })
      if (error) throw new Error(`Image upload failed: ${error.message}`)
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      onChange({ ...form, image_url: data.publicUrl })
      setUploadProgress('Image uploaded. Save the product to keep the change.')
    } catch (error) {
      setUploadProgress('')
      setUploadError(error instanceof Error ? error.message : 'Could not upload the image.')
    } finally {
      setUploading(false)
    }
  }

  async function removeImage() {
    if (!form.image_url) return
    setUploadError('')
    onChange({ ...form, image_url: '' })
    setUploadProgress('Image will be removed when you save the product.')
  }

  async function generateCopy() {
    setCopyBusy(true)
    setCopyError('')
    setCopyMessage('')
    try {
      const token = await accessToken()
      const response = await fetch('/api/admin/inventory/generate-copy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: form.brand,
          name: form.name,
          storage: form.storage_gb,
          ram: form.ram_gb,
          processor: form.processor,
          screen: form.screen_size,
          battery: form.battery_mah,
          camera: form.camera_mp,
          color: form.color,
          condition_grade: form.condition_grade,
          warranty: form.warranty_months,
          price: form.price,
        }),
      })
      const result = await response.json() as { description?: string; seo_title?: string; seo_description?: string; error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not generate product copy.')
      if (!result.description || !result.seo_title || !result.seo_description) throw new Error('AI did not return all copy fields.')
      onChange({ ...form, description: result.description, seo_title: result.seo_title, seo_description: result.seo_description })
      setCopyMessage('Generated copy added. Review and edit before saving.')
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : 'Could not generate product copy.')
    } finally {
      setCopyBusy(false)
    }
  }

  async function suggestMarketPrice() {
    const query = [form.brand, form.name, form.storage_gb ? `${form.storage_gb}GB` : ''].filter(Boolean).join(' ').trim()
    if (!query) {
      setMarketError('Enter the brand and product name first.')
      return
    }
    setMarketBusy(true)
    setMarketError('')
    try {
      const token = await accessToken()
      const response = await fetch('/api/admin/inventory/market-price', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const result = await response.json() as MarketPriceResult & { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not retrieve market prices.')
      setMarketResult(result)
    } catch (error) {
      setMarketError(error instanceof Error ? error.message : 'Could not retrieve market prices.')
    } finally {
      setMarketBusy(false)
    }
  }

  const values = useMemo(() => [
    ['Brand', 'brand', 'text'],
    ['Product name', 'name', 'text'],
    ['Selling price (₦)', 'price', 'number'],
    ['Cost price (₦)', 'cost_price', 'number'],
    ['Stock quantity', 'stock_quantity', 'number'],
    ['Low-stock threshold', 'low_stock_threshold', 'number'],
    ['Warranty (months)', 'warranty_months', 'number'],
    ['Storage (GB)', 'storage_gb', 'number'],
    ['RAM (GB)', 'ram_gb', 'number'],
    ['Color', 'color', 'text'],
    ['Processor', 'processor', 'text'],
    ['Screen size', 'screen_size', 'number'],
    ['Battery (mAh)', 'battery_mah', 'number'],
    ['Camera (MP)', 'camera_mp', 'number'],
    ['IMEI / serial', 'imei', 'text'],
  ] as const, [])

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-white">{form.id ? 'Edit product' : 'Add product'}</h3>
        <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-white">Close</button>
      </div>
      <div className="flex gap-2 border-b border-white/10">
        <button type="button" onClick={() => setActiveTab('details')} className={`border-b-2 px-3 py-2 text-sm ${activeTab === 'details' ? 'border-premiumYellow text-white' : 'border-transparent text-slate-400'}`}>Product details</button>
        <button type="button" onClick={() => setActiveTab('history')} disabled={!form.id} className={`border-b-2 px-3 py-2 text-sm disabled:opacity-40 ${activeTab === 'history' ? 'border-premiumYellow text-white' : 'border-transparent text-slate-400'}`}>Stock history</button>
      </div>

      {activeTab === 'history' ? (
        <div className="space-y-3">
          {historyLoading ? <p role="status" className="text-sm text-slate-400">Loading stock history…</p>
            : historyError ? <p role="alert" className="text-sm text-red-300">Could not load stock history: {historyError}</p>
              : history.length === 0 ? <p className="text-sm text-slate-400">No stock changes recorded for this product.</p>
                : history.map((movement) => (
                  <article key={movement.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                    <div>
                      <p className={`font-semibold ${Number(movement.delta ?? 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {Number(movement.delta ?? 0) > 0 ? '+' : ''}{movement.delta ?? '—'} · {movement.old_qty ?? '—'} → {movement.new_qty ?? '—'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{REASONS[movement.reason ?? ''] ?? movement.reason ?? 'Unknown'} · {movement.actor_email || 'System'}</p>
                    </div>
                    <time className="text-xs text-slate-500">{new Date(movement.created_at).toLocaleString('en-NG')}</time>
                  </article>
                ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(([label, key, type]) => (
              <label key={key} className="space-y-2 text-xs font-semibold text-slate-300">
                {label}
                <input
                  type={type}
                  min={type === 'number' ? 0 : undefined}
                  step={key === 'price' || key === 'cost_price' ? 'any' : undefined}
                  value={form[key] ?? ''}
                  onChange={(event) => onChange({
                    ...form,
                    [key]: type === 'number'
                      ? event.target.value === '' && key === 'cost_price' ? null : Number(event.target.value)
                      : event.target.value,
                  })}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-premiumYellow/70"
                  required={key === 'brand' || key === 'name' || key === 'price'}
                />
              </label>
            ))}
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Status
              <select value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value as InventoryProductFormData['status'] })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white">
                {['new', 'used', 'hot', 'demo'].map((status) => <option key={status} value={status}>{status === 'hot' ? 'Hot deal' : status}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Condition grade
              <select value={form.condition_grade ?? 'A'} onChange={(event) => onChange({ ...form, condition_grade: event.target.value as InventoryProductFormData['condition_grade'] })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white">
                {['S', 'A', 'B', 'C'].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </label>
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">Product photo</h4>
                <p className="mt-1 text-xs text-slate-500">Images are resized to 1600px and compressed before upload.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white">
                  <Upload className="h-4 w-4" aria-hidden="true" /> Choose image
                  <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white">
                  <Camera className="h-4 w-4" aria-hidden="true" /> Take photo
                  <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={uploading} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
                </label>
              </div>
            </div>
            {form.image_url && (
              <div className="flex flex-wrap items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt={`${form.brand} ${form.name}`} className="h-20 w-20 rounded-lg border border-white/10 object-cover" />
                <button type="button" disabled={uploading} onClick={() => document.querySelector<HTMLInputElement>('[data-product-image-picker]')?.click()} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white disabled:opacity-50">Replace</button>
                <button type="button" disabled={uploading} onClick={() => void removeImage()} className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-300 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                </button>
              </div>
            )}
            {uploading && <p role="status" className="flex items-center gap-2 text-xs text-slate-300"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{uploadProgress}</p>}
            {!uploading && uploadProgress && <p role="status" className="text-xs text-slate-400">{uploadProgress}</p>}
            {(uploadError || copyError) && <p role="alert" className="flex items-start gap-2 text-xs text-red-300"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{uploadError || copyError}</p>}
            <input data-product-image-picker type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
          </div>

          <section className="space-y-4 rounded-xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h4 className="text-sm font-bold text-white">Description and SEO</h4><p className="mt-1 text-xs text-slate-500">AI drafts use only the product details provided. Review before publishing.</p></div>
              <button type="button" onClick={() => void generateCopy()} disabled={copyBusy || !form.brand.trim() || !form.name.trim()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-premiumYellow/40 bg-premiumYellow/10 px-3 py-2 text-xs font-bold text-premiumYellow disabled:opacity-50">
                <Sparkles className="h-4 w-4" aria-hidden="true" />{copyBusy ? 'Generating…' : 'Generate copy'}
              </button>
            </div>
            <label className="block space-y-2 text-xs font-semibold text-slate-300">Product description<textarea rows={5} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs font-semibold text-slate-300">SEO title ({form.seo_title.length}/60)<input maxLength={60} value={form.seo_title} onChange={(event) => onChange({ ...form, seo_title: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
              <label className="space-y-2 text-xs font-semibold text-slate-300">SEO description ({form.seo_description.length}/155)<textarea maxLength={155} rows={2} value={form.seo_description} onChange={(event) => onChange({ ...form, seo_description: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
            </div>
            {copyMessage && <p role="status" className="text-xs text-green-300">{copyMessage}</p>}
          </section>

          <section className="space-y-3 rounded-xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-white">Market price suggestion</h4>
              <button type="button" onClick={() => void suggestMarketPrice()} disabled={marketBusy} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                {marketBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {marketBusy ? 'Checking…' : 'Market price'}
              </button>
            </div>
            <p className="text-xs text-slate-500">Compare your price {formatNaira(Number(form.price) || 0)} and cost {form.cost_price == null ? '—' : formatNaira(form.cost_price)} with public listings.</p>
            {marketError && <p role="alert" className="text-xs text-red-300">{marketError}</p>}
            {marketResult && (
              <div className="space-y-2 rounded-lg bg-black/20 p-3 text-xs">
                <p className="font-semibold text-white">
                  {marketResult.listingCount
                    ? `${formatNaira(marketResult.minimum ?? 0)} – ${formatNaira(marketResult.maximum ?? 0)} · median ${formatNaira(marketResult.median ?? 0)}`
                    : 'No public listing prices were found.'}
                </p>
                <p className="text-slate-400">Jiji: {marketResult.sourceCounts.jiji ?? 0} · Facebook Marketplace: {marketResult.sourceCounts.facebook ?? 0} listings. Listings may be incomplete or blocked.</p>
                {marketResult.samples.map((listing, index) => (
                  <p key={`${listing.source}-${index}`} className="text-slate-400">
                    {listing.url ? <a href={listing.url} target="_blank" rel="noreferrer" className="text-premiumYellow hover:underline">{listing.title || listing.source}</a> : listing.title || listing.source}
                    {' · '}{formatNaira(listing.price)}
                  </p>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="product-specifications" className="text-xs font-semibold text-slate-300">Specifications</label>
              <button type="button" onClick={async () => {
                if (!form.brand.trim() || !form.name.trim()) return
                const token = await accessToken()
                const response = await fetch('/api/admin/inventory/generate-spec', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ brand: form.brand.trim(), name: form.name.trim() }),
                })
                const result = await response.json() as { specification?: string; error?: string }
                if (!response.ok) setCopyError(result.error || 'Could not generate specifications.')
                else if (result.specification) onChange({ ...form, spec: result.specification })
              }} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-premiumYellow/40 bg-premiumYellow/10 px-3 py-2 text-xs font-bold text-premiumYellow">
                <Sparkles className="h-4 w-4" aria-hidden="true" />Generate specs with AI
              </button>
            </div>
            <textarea id="product-specifications" rows={4} value={form.spec} onChange={(event) => onChange({ ...form, spec: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" />
            <p className="text-xs text-slate-500">AI drafts can be inaccurate. Review and edit specifications before saving.</p>
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300">Cancel</button>
            <button type="submit" disabled={saving || uploading || copyBusy} className="rounded-xl bg-premiumYellow px-5 py-2 text-sm font-bold text-black disabled:opacity-60">
              {saving ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
