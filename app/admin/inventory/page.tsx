'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle, FileSpreadsheet, Globe2, Loader2, Pencil, Plus, Search, Sparkles, Trash2, Upload, X } from 'lucide-react'

import {
  INVENTORY_IMPORT_FIELDS,
  type InventoryImportAnalysisRow,
  type InventoryImportMapping,
  type InventoryImportOutcome,
  type InventoryImportSource,
} from '@/lib/inventoryImportTypes'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  name: string
  brand: string
  price: number
  spec: string | null
  status: 'new' | 'used' | 'hot'
  in_stock: boolean
  image_url: string | null
  stock_quantity: number
  low_stock_threshold: number
  condition_grade: 'S' | 'A' | 'B' | 'C' | null
  warranty_months: number | null
  imei: string | null
  created_at: string
}

type ProductForm = Omit<Product, 'id' | 'created_at' | 'in_stock'> & { id?: number }
type ImportResultSummary = { added: number; updated: number; skipped: number; failed: number }

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  brand: '',
  price: 0,
  spec: '',
  status: 'new',
  image_url: '',
  stock_quantity: 0,
  low_stock_threshold: 3,
  condition_grade: 'A',
  warranty_months: 0,
  imei: '',
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

const EMPTY_IMPORT_MAPPING = Object.fromEntries(
  INVENTORY_IMPORT_FIELDS.map(({ key }) => [key, '']),
) as InventoryImportMapping

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'new' | 'used' | 'hot'>('all')
  const [form, setForm] = useState<ProductForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingSpec, setGeneratingSpec] = useState(false)
  const [specMessage, setSpecMessage] = useState('')
  const [specError, setSpecError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importSourceName, setImportSourceName] = useState('')
  const [importSource, setImportSource] = useState<InventoryImportSource | null>(null)
  const [importMapping, setImportMapping] = useState<InventoryImportMapping>(EMPTY_IMPORT_MAPPING)
  const [importAnalysis, setImportAnalysis] = useState<InventoryImportAnalysisRow[] | null>(null)
  const [importOutcomes, setImportOutcomes] = useState<InventoryImportOutcome[] | null>(null)
  const [importSummary, setImportSummary] = useState<ImportResultSummary | null>(null)
  const [importBusy, setImportBusy] = useState(false)
  const [importError, setImportError] = useState('')
  const [importMessage, setImportMessage] = useState('')

  async function loadProducts() {
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, price, spec, status, in_stock, image_url, stock_quantity, low_stock_threshold, condition_grade, warranty_months, imei, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setProducts([])
    } else {
      setProducts((data ?? []) as Product[])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        !needle || `${product.brand} ${product.name} ${product.imei ?? ''}`.toLowerCase().includes(needle)
      const matchesFilter =
        filter === 'all' ||
        (filter === 'low-stock'
          ? product.stock_quantity <= product.low_stock_threshold
          : product.status === filter)
      return matchesSearch && matchesFilter
    })
  }, [products, search, filter])

  function startEdit(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      spec: product.spec ?? '',
      status: product.status,
      image_url: product.image_url ?? '',
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      condition_grade: product.condition_grade ?? 'A',
      warranty_months: product.warranty_months ?? 0,
      imei: product.imei ?? '',
    })
    setSpecMessage('')
    setSpecError('')
    setErrorMessage('')
  }

  async function generateProductSpec() {
    if (!form) return
    if (!form.brand.trim() || !form.name.trim()) {
      setSpecError('Enter the brand and product name before generating specifications.')
      setSpecMessage('')
      return
    }
    if (form.spec?.trim() && !window.confirm('Replace the current specifications with an AI-generated draft?')) {
      return
    }

    setGeneratingSpec(true)
    setSpecError('')
    setSpecMessage('')
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!sessionData.session?.access_token) {
        throw new Error('Your admin session has expired. Sign in again.')
      }

      const response = await fetch('/api/admin/inventory/generate-spec', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brand: form.brand.trim(), name: form.name.trim() }),
      })
      const result = await response.json() as { specification?: string; error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not generate product specifications.')
      if (!result.specification?.trim()) {
        throw new Error('The AI service returned no specifications. Try a more specific product name.')
      }

      setForm((current) => current ? { ...current, spec: result.specification!.trim() } : current)
      setSpecMessage('AI draft added. Review it and save the product when ready.')
    } catch (error) {
      setSpecError(error instanceof Error ? error.message : 'Could not generate product specifications.')
    } finally {
      setGeneratingSpec(false)
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Math.round(Number(form.price)),
      spec: form.spec?.trim() || null,
      status: form.status,
      in_stock: Number(form.stock_quantity) > 0,
      image_url: form.image_url?.trim() || null,
      stock_quantity: Math.max(0, Math.floor(Number(form.stock_quantity))),
      low_stock_threshold: Math.max(0, Math.floor(Number(form.low_stock_threshold))),
      condition_grade: form.condition_grade,
      warranty_months: Math.max(0, Math.floor(Number(form.warranty_months ?? 0))),
      imei: form.imei?.trim() || null,
    }

    if (!payload.name || !payload.brand || !Number.isFinite(payload.price) || payload.price < 0) {
      setErrorMessage('Enter a product name, brand, and valid non-negative price.')
      return
    }

    setSaving(true)
    setErrorMessage('')
    const result = form.id
      ? await supabase.from('products').update(payload).eq('id', form.id)
      : await supabase.from('products').insert(payload)

    if (result.error) {
      setErrorMessage(`Could not save product: ${result.error.message}`)
    } else {
      setForm(null)
      await loadProducts()
    }
    setSaving(false)
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.brand} ${product.name}?`)) return

    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) {
      setErrorMessage(`Could not delete product: ${error.message}`)
      return
    }
    setProducts((current) => current.filter((item) => item.id !== product.id))
  }

  async function getImportAccessToken() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again.')
    return data.session.access_token
  }

  async function parseImportSource(file?: File) {
    setImportBusy(true)
    setImportError('')
    setImportMessage('')
    setImportSource(null)
    setImportAnalysis(null)
    setImportOutcomes(null)
    setImportSummary(null)
    try {
      if (file && file.size > 3 * 1024 * 1024) {
        throw new Error('Choose a file no larger than 3 MB.')
      }
      const body = new FormData()
      if (file) body.set('file', file)
      else body.set('sheetUrl', importUrl.trim())

      const token = await getImportAccessToken()
      const response = await fetch('/api/admin/inventory/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      const result = await response.json() as {
        source?: InventoryImportSource
        mapping?: InventoryImportMapping
        error?: string
      }
      if (!response.ok) throw new Error(result.error || 'Could not parse the import source.')
      if (!result.source?.headers?.length || !result.source.rows?.length) {
        throw new Error('The import source did not contain a header and product rows.')
      }

      setImportSource(result.source)
      setImportMapping(result.mapping ?? EMPTY_IMPORT_MAPPING)
      setImportSourceName(file?.name ?? 'Google Sheets')
      setImportMessage(`Loaded ${result.source.rows.length} product rows. Map the columns and review the preview.`)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Could not parse the import source.')
    } finally {
      setImportBusy(false)
    }
  }

  async function analyzeImport() {
    if (!importSource) return
    setImportBusy(true)
    setImportError('')
    setImportMessage('')
    setImportOutcomes(null)
    try {
      const token = await getImportAccessToken()
      const response = await fetch('/api/admin/inventory/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          headers: importSource.headers,
          rows: importSource.rows,
          mapping: importMapping,
        }),
      })
      const result = await response.json() as { rows?: InventoryImportAnalysisRow[]; error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not analyze the import rows.')
      if (!result.rows) throw new Error('The import analysis returned no row results.')
      setImportAnalysis(result.rows)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Could not analyze the import rows.')
    } finally {
      setImportBusy(false)
    }
  }

  async function commitImport() {
    if (!importSource || !importAnalysis) return
    const addCount = importAnalysis.filter((row) => row.action === 'add').length
    const updateCount = importAnalysis.filter((row) => row.action === 'update').length
    const skipCount = importAnalysis.filter((row) => row.action === 'skip').length
    if (addCount + updateCount === 0) return
    const confirmed = window.confirm(
      `Import ${addCount} new product(s) and update ${updateCount} existing product(s)? ${skipCount} row(s) with errors or ambiguous matches will be skipped. Review the field mapping before confirming.`,
    )
    if (!confirmed) return

    setImportBusy(true)
    setImportError('')
    setImportMessage('')
    try {
      const token = await getImportAccessToken()
      const response = await fetch('/api/admin/inventory/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'commit',
          headers: importSource.headers,
          rows: importSource.rows,
          mapping: importMapping,
          expected: importAnalysis.map((row) => ({ action: row.action, productId: row.productId })),
        }),
      })
      const result = await response.json() as {
        summary?: ImportResultSummary
        rows?: InventoryImportOutcome[]
        error?: string
      }
      if (!response.ok && response.status !== 207) {
        throw new Error(result.error || 'The import could not be completed.')
      }
      if (!result.summary || !result.rows) {
        throw new Error('The import did not return per-row results.')
      }

      setImportSummary(result.summary)
      setImportOutcomes(result.rows)
      setImportMessage(
        `Import finished: ${result.summary.added} added, ${result.summary.updated} updated, ${result.summary.skipped} skipped, ${result.summary.failed} failed.`,
      )
      setImportAnalysis(null)
      await loadProducts()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'The import could not be completed.')
    } finally {
      setImportBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-premiumYellow">
            Supabase · products
          </p>
          <h2 className="text-2xl font-black text-white">Inventory</h2>
          <p className="mt-1 text-sm text-slate-400">Manage the live catalog, prices, IMEI, and stock levels.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setImportOpen((current) => !current)
              setImportError('')
              setImportMessage('')
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Import products
          </button>
          <button
            type="button"
            onClick={() => {
              setForm({ ...EMPTY_PRODUCT })
              setSpecMessage('')
              setSpecError('')
              setErrorMessage('')
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {importOpen && (
        <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-white">Bulk import products</h3>
              <p className="mt-1 text-sm text-slate-400">
                Upload CSV, Excel, or Word tables, or import a public Google Sheet. Review and map rows before changes are saved.
              </p>
            </div>
            <button type="button" onClick={() => setImportOpen(false)} aria-label="Close import panel" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Upload a file (.csv, .xlsx, .docx)
              <span className="flex min-h-12 items-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-2 text-sm font-normal text-slate-300">
                <Upload className="h-4 w-4 shrink-0 text-premiumYellow" aria-hidden="true" />
                <input
                  type="file"
                  accept=".csv,.xlsx,.docx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={importBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void parseImportSource(file)
                    event.currentTarget.value = ''
                  }}
                  className="min-w-0 flex-1 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-premiumYellow file:px-3 file:py-2 file:text-xs file:font-bold file:text-black"
                />
              </span>
            </label>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <label htmlFor="inventory-sheet-url">Public Google Sheets URL</label>
              <div className="flex gap-2">
                <input
                  id="inventory-sheet-url"
                  type="url"
                  value={importUrl}
                  onChange={(event) => setImportUrl(event.target.value)}
                  disabled={importBusy}
                  placeholder="https://docs.google.com/spreadsheets/d/…"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-normal text-white outline-none focus:border-premiumYellow/70"
                />
                <button
                  type="button"
                  disabled={importBusy || !importUrl.trim()}
                  onClick={() => void parseImportSource()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-premiumYellow px-3 text-xs font-bold text-black disabled:opacity-50"
                >
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                  Load
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Google Sheets must be public or export-accessible. DOCX imports read tables with matching header columns and ignore paragraphs. Files and sheets are limited to 3 MB and 500 product rows.
          </p>

          {importBusy && (
            <p role="status" className="flex items-center gap-2 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processing import…
            </p>
          )}
          {importError && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{importError}</p>}
          {importMessage && <p role="status" className="rounded-lg bg-green-500/10 p-3 text-sm text-green-200">{importMessage}</p>}

          {importSource && (
            <div className="space-y-4 border-t border-white/10 pt-5">
              <div>
                <h4 className="text-sm font-bold text-white">Map columns · {importSourceName}</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Brand, product name, and price are required. Unmapped fields stay unchanged for updates; new items default to zero stock.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INVENTORY_IMPORT_FIELDS.map((field) => (
                  <label key={field.key} className="space-y-1.5 text-xs font-semibold text-slate-300">
                    {field.label}{field.required ? ' *' : ''}
                    <select
                      value={importMapping[field.key]}
                      onChange={(event) => {
                        setImportMapping((current) => ({ ...current, [field.key]: event.target.value }))
                        setImportAnalysis(null)
                        setImportOutcomes(null)
                      }}
                      disabled={importBusy}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-normal text-white"
                    >
                      <option value="">Not mapped</option>
                      {importSource.headers.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void analyzeImport()}
                  disabled={importBusy || !importMapping.brand || !importMapping.name || !importMapping.price}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  Analyze rows
                </button>
              </div>
            </div>
          )}

          {importAnalysis && (
            <div className="space-y-3 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Import preview</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {importAnalysis.filter((row) => row.action === 'add').length} new · {importAnalysis.filter((row) => row.action === 'update').length} updates · {importAnalysis.filter((row) => row.action === 'skip').length} need review
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void commitImport()}
                  disabled={importBusy || !importAnalysis.some((row) => row.action === 'add' || row.action === 'update')}
                  className="min-h-11 rounded-xl bg-premiumYellow px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
                >
                  Import valid rows
                </button>
              </div>
              <div className="max-h-[28rem] overflow-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[800px] text-left text-xs">
                  <thead className="sticky top-0 bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-3 py-3">Row</th>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Action</th>
                      <th className="px-3 py-3">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {importAnalysis.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-3 py-3">{row.rowNumber}</td>
                        <td className="px-3 py-3">
                          <div>{String(row.fields.brand ?? '')} {String(row.fields.name ?? '')}</div>
                          {row.matchedProduct && <div className="mt-1 text-slate-500">Matches: {row.matchedProduct}</div>}
                        </td>
                        <td className="px-3 py-3">{row.fields.price === undefined ? '—' : formatNaira(Number(row.fields.price))}</td>
                        <td className="px-3 py-3">{row.fields.stock_quantity === undefined ? '0 (default)' : String(row.fields.stock_quantity)}</td>
                        <td className={`px-3 py-3 font-semibold capitalize ${row.action === 'skip' ? 'text-amber-300' : row.action === 'update' ? 'text-sky-300' : 'text-green-300'}`}>
                          {row.action}
                        </td>
                        <td className="max-w-sm px-3 py-3 text-red-200">{row.errors.join(' ') || 'Ready'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importOutcomes && importSummary && (
            <div className="space-y-3 border-t border-white/10 pt-5">
              <h4 className="text-sm font-bold text-white">Import results</h4>
              <div className="max-h-64 space-y-1 overflow-auto text-xs">
                {importOutcomes.map((outcome) => (
                  <p key={`${outcome.rowNumber}-${outcome.outcome}`} className={outcome.outcome === 'failed' ? 'text-red-300' : outcome.outcome === 'skipped' ? 'text-amber-300' : 'text-slate-300'}>
                    Row {outcome.rowNumber}: {outcome.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {form && (
        <form onSubmit={saveProduct} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{form.id ? 'Edit product' : 'Add product'}</h3>
            <button type="button" onClick={() => setForm(null)} className="text-sm text-slate-400 hover:text-white">
              Close
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ['Brand', 'brand', 'text'],
              ['Product name', 'name', 'text'],
              ['Price (₦)', 'price', 'number'],
              ['Stock quantity', 'stock_quantity', 'number'],
              ['Low-stock threshold', 'low_stock_threshold', 'number'],
              ['Warranty (months)', 'warranty_months', 'number'],
              ['Image URL', 'image_url', 'url'],
              ['IMEI / serial', 'imei', 'text'],
            ] as const).map(([label, key, type]) => (
              <label key={key} className="space-y-2 text-xs font-semibold text-slate-300">
                {label}
                <input
                  type={type}
                  min={type === 'number' ? 0 : undefined}
                  value={form[key] ?? ''}
                  onChange={(event) => {
                    setForm((current) =>
                      current
                        ? { ...current, [key]: type === 'number' ? Number(event.target.value) : event.target.value }
                        : current,
                    )
                    if (key === 'brand' || key === 'name') {
                      setSpecMessage('')
                      setSpecError('')
                    }
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-premiumYellow/70"
                  required={key === 'brand' || key === 'name' || key === 'price'}
                />
              </label>
            ))}
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm((current) => current ? { ...current, status: event.target.value as ProductForm['status'] } : current)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="hot">Hot deal</option>
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Condition grade
              <select
                value={form.condition_grade ?? 'A'}
                onChange={(event) => setForm((current) => current ? { ...current, condition_grade: event.target.value as ProductForm['condition_grade'] } : current)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              >
                {['S', 'A', 'B', 'C'].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </label>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="product-specifications" className="text-xs font-semibold text-slate-300">
                  Specifications
                </label>
                <button
                  type="button"
                  onClick={() => void generateProductSpec()}
                  disabled={generatingSpec || saving || !form.brand.trim() || !form.name.trim()}
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-premiumYellow/40 bg-premiumYellow/10 px-3 py-2 text-xs font-bold text-premiumYellow hover:bg-premiumYellow/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {generatingSpec ? 'Generating draft…' : 'Generate specs with AI'}
                </button>
              </div>
              <textarea
                id="product-specifications"
                rows={4}
                value={form.spec ?? ''}
                onChange={(event) => {
                  setForm((current) => current ? { ...current, spec: event.target.value } : current)
                  setSpecMessage('')
                  setSpecError('')
                }}
                aria-describedby={specError ? 'product-spec-error' : specMessage ? 'product-spec-status' : undefined}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-premiumYellow/70"
              />
              <p className="text-xs text-slate-500">AI drafts can be inaccurate. Review and edit specifications before saving.</p>
              {specError && <p id="product-spec-error" role="alert" className="text-xs text-red-300">{specError}</p>}
              {specMessage && <p id="product-spec-status" role="status" className="text-xs text-green-300">{specMessage}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setForm(null)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={saving || generatingSpec} className="rounded-xl bg-premiumYellow px-5 py-2 text-sm font-bold text-black disabled:opacity-60">
              {saving ? 'Saving…' : generatingSpec ? 'Generating specs…' : 'Save product'}
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search brand, model, or IMEI"
              className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-premiumYellow/70"
            />
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
          >
            <option value="all">All stock</option>
            <option value="low-stock">Low stock</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="hot">Hot deals</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading inventory from Supabase…</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No matching products found.</td></tr>
              ) : filteredProducts.map((product) => {
                const lowStock = product.stock_quantity <= product.low_stock_threshold
                return (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{product.brand} {product.name}</div>
                      <div className="mt-1 max-w-xs truncate text-xs text-slate-500">{product.spec}</div>
                    </td>
                    <td className="px-5 py-4">{formatNaira(product.price)}</td>
                    <td className="px-5 py-4">{product.condition_grade ?? '—'}</td>
                    <td className={`px-5 py-4 font-semibold ${lowStock ? 'text-amber-300' : ''}`}>
                      {product.stock_quantity} {lowStock ? '· Low' : ''}
                    </td>
                    <td className="px-5 py-4 capitalize">{product.status}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-premiumYellow">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => void deleteProduct(product)} aria-label={`Delete ${product.name}`} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-red-400">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
