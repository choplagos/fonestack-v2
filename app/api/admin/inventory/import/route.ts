import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/database.types'
import {
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
  parseInventoryCsv,
  parseInventoryDocx,
  parseInventoryXlsx,
  suggestInventoryImportMapping,
} from '@/lib/inventoryImport'
import {
  INVENTORY_IMPORT_FIELDS,
  type InventoryImportField,
  type InventoryImportMapping,
  type InventoryProductFields,
  type InventoryImportSource,
  type InventoryImportAnalysisRow,
  type InventoryImportOutcome,
} from '@/lib/inventoryImportTypes'

export const runtime = 'nodejs'
export const maxDuration = 60

const GOOGLE_SHEET_ID_PATTERN = /^[a-zA-Z0-9_-]{20,}$/
const CSV_MIME_TYPES = new Set(['text/csv', 'text/plain', 'application/vnd.ms-excel', ''])
const FIELD_KEYS = INVENTORY_IMPORT_FIELDS.map(({ key }) => key)
const MAX_JSON_REQUEST_BYTES = 4 * 1024 * 1024
const MAX_MULTIPART_REQUEST_BYTES = MAX_IMPORT_FILE_BYTES + 128 * 1024

type CatalogMatch = { id: number; brand: string; name: string }
type ImportAction = 'add' | 'update' | 'skip'
type AdminClient = SupabaseClient<Database>
function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function readBoundedBody(request: Request, maxBytes: number) {
  const reader = request.body?.getReader()
  if (!reader) return new ArrayBuffer(0)

  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new Error('The import request is too large.')
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body.buffer
}

async function getAdminClient(request: Request): Promise<
  { supabase: AdminClient; error?: never } | { supabase?: never; error: NextResponse }
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: responseError('Supabase is not configured on the server.', 500) }
  }

  const authorization = request.headers.get('authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!accessToken) {
    return { error: responseError('A signed-in admin session is required.', 401) }
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
  const email = userData.user?.email?.trim().toLowerCase()
  if (userError || !email) {
    return { error: responseError('Your admin session is invalid or expired. Sign in again.', 401) }
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (adminError) {
    return { error: responseError(`Could not verify admin access: ${adminError.message}`, 500) }
  }
  if (!admin) {
    return { error: responseError('This account is not authorized to import inventory.', 403) }
  }

  return { supabase }
}

function sourceHeaders(headers: string[], rows: string[][]): InventoryImportSource {
  if (
    !Array.isArray(headers) ||
    headers.length === 0 ||
    headers.length > 40 ||
    headers.some((header) => typeof header !== 'string' || header.trim().length === 0 || header.length > 120) ||
    new Set(headers).size !== headers.length
  ) {
    throw new Error('The preview is invalid. Parse the source again.')
  }
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_IMPORT_ROWS) {
    throw new Error(`Imports must contain between 1 and ${MAX_IMPORT_ROWS} product rows.`)
  }
  if (rows.some((row) => !Array.isArray(row) || row.length !== headers.length || row.some((value) => typeof value !== 'string' || value.length > 4000))) {
    throw new Error('The parsed rows are invalid. Parse the source again.')
  }
  return { headers, rows }
}

function validateMapping(value: unknown, headers: string[]): InventoryImportMapping {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Choose a column for brand, product name, and price.')
  }
  const mapping = value as Record<string, unknown>
  const result = {} as InventoryImportMapping
  const usedHeaders = new Set<string>()

  for (const field of FIELD_KEYS) {
    const header = mapping[field]
    if (header === undefined || header === null || header === '') {
      result[field] = ''
      continue
    }
    if (typeof header !== 'string' || !headers.includes(header)) {
      throw new Error(`The selected column for ${field} is not available in this source.`)
    }
    if (usedHeaders.has(header)) {
      throw new Error('Each source column can be mapped to only one product field.')
    }
    usedHeaders.add(header)
    result[field] = header
  }

  for (const requiredField of ['brand', 'name', 'price'] as const) {
    if (!result[requiredField]) {
      throw new Error(`Map a source column to ${requiredField === 'name' ? 'product name' : requiredField}.`)
    }
  }
  return result
}

function normalizeMatchValue(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function parseNumber(value: string, field: InventoryImportField) {
  const clean = value.trim().replace(/[₦,\s]/g, '')
  if (!clean) return null
  const number = Number(clean)
  if (!Number.isFinite(number)) return null
  if (field !== 'price' && !Number.isInteger(number)) return null
  return number
}

function mappedFields(values: string[], headers: string[], mapping: InventoryImportMapping) {
  const fields: InventoryProductFields = {}
  const errors: string[] = []
  const getValue = (field: InventoryImportField) => {
    const header = mapping[field]
    if (!header) return ''
    return values[headers.indexOf(header)]?.trim() ?? ''
  }

  for (const field of ['brand', 'name'] as const) {
    const value = getValue(field)
    if (!value) {
      errors.push(`${field === 'name' ? 'Product name' : 'Brand'} is required.`)
    } else if (value.length > (field === 'name' ? 160 : 100)) {
      errors.push(`${field === 'name' ? 'Product name' : 'Brand'} is too long.`)
    } else {
      fields[field] = value
    }
  }

  const priceValue = getValue('price')
  const price = parseNumber(priceValue, 'price')
  if (price === null || price < 0) {
    errors.push('Price must be a non-negative number.')
  } else {
    fields.price = price
  }

  const stockValue = getValue('stock_quantity')
  const stock = parseNumber(stockValue, 'stock_quantity')
  if (stockValue && (stock === null || stock < 0)) {
    errors.push('Stock quantity must be a non-negative whole number.')
  } else if (stock !== null) {
    fields.stock_quantity = stock
  }

  const thresholdValue = getValue('low_stock_threshold')
  const threshold = parseNumber(thresholdValue, 'low_stock_threshold')
  if (thresholdValue && (threshold === null || threshold < 0)) {
    errors.push('Low-stock threshold must be a non-negative whole number.')
  } else if (threshold !== null) {
    fields.low_stock_threshold = threshold
  }

  const warrantyValue = getValue('warranty_months')
  const warranty = parseNumber(warrantyValue, 'warranty_months')
  if (warrantyValue && (warranty === null || warranty < 0)) {
    errors.push('Warranty months must be a non-negative whole number.')
  } else if (warranty !== null) {
    fields.warranty_months = warranty
  }

  const statusValue = getValue('status').toLowerCase()
  if (statusValue && !['new', 'used', 'hot'].includes(statusValue)) {
    errors.push('Status must be new, used, or hot.')
  } else if (statusValue) {
    fields.status = statusValue
  }

  const gradeValue = getValue('condition_grade').toUpperCase()
  if (gradeValue && !['S', 'A', 'B', 'C'].includes(gradeValue)) {
    errors.push('Condition grade must be S, A, B, or C.')
  } else if (gradeValue) {
    fields.condition_grade = gradeValue
  }

  for (const field of ['spec', 'imei'] as const) {
    const value = getValue(field)
    if (value) fields[field] = value.slice(0, field === 'spec' ? 4000 : 80)
  }

  const imageUrl = getValue('image_url')
  if (imageUrl) {
    try {
      const url = new URL(imageUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
      fields.image_url = url.toString()
    } catch {
      errors.push('Image URL must be a valid HTTP or HTTPS URL.')
    }
  }

  return { fields, errors }
}

async function loadCatalog(supabase: AdminClient) {
  const catalog: CatalogMatch[] = []
  const pageSize = 1000
  const maxCatalogSize = 10000

  for (let from = 0; from < maxCatalogSize; from += pageSize) {
    const { data, error } = await supabase
      .from('products')
      .select('id, brand, name')
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`Could not load inventory for duplicate checking: ${error.message}`)
    catalog.push(...(data ?? []))
    if ((data?.length ?? 0) < pageSize) return catalog
  }

  const { data: additionalProduct, error } = await supabase
    .from('products')
    .select('id')
    .range(maxCatalogSize, maxCatalogSize)
    .maybeSingle()
  if (error) throw new Error(`Could not check the inventory size: ${error.message}`)
  if (!additionalProduct) return catalog

  throw new Error('Inventory has more than 10,000 products; import matching is unavailable until the catalog can be narrowed.')
}

function analyzeRows(
  source: InventoryImportSource,
  mapping: InventoryImportMapping,
  catalog: CatalogMatch[],
): InventoryImportAnalysisRow[] {
  const catalogByKey = new Map<string, CatalogMatch[]>()
  for (const product of catalog) {
    const key = `${normalizeMatchValue(product.brand)}|${normalizeMatchValue(product.name)}`
    catalogByKey.set(key, [...(catalogByKey.get(key) ?? []), product])
  }

  const rawRows = source.rows.map((values, index) => {
    const mapped = mappedFields(values, source.headers, mapping)
    const brand = String(mapped.fields.brand ?? '')
    const name = String(mapped.fields.name ?? '')
    const key = `${normalizeMatchValue(brand)}|${normalizeMatchValue(name)}`
    return { values, rowNumber: index + 2, key, ...mapped }
  })
  const sourceKeyCounts = new Map<string, number>()
  for (const row of rawRows) {
    if (row.fields.brand && row.fields.name) {
      sourceKeyCounts.set(row.key, (sourceKeyCounts.get(row.key) ?? 0) + 1)
    }
  }

  return rawRows.map((row) => {
    const matches = catalogByKey.get(row.key) ?? []
    let action: ImportAction = 'add'
    let productId: number | null = null
    let matchedProduct: string | null = null
    const errors = [...row.errors]

    if (row.fields.brand && row.fields.name && (sourceKeyCounts.get(row.key) ?? 0) > 1) {
      errors.push('This brand and product name appear more than once in the import file.')
    } else if (matches.length > 1) {
      errors.push('Multiple existing products match this brand and name; resolve the duplicate before importing.')
    } else if (matches.length === 1) {
      action = 'update'
      productId = matches[0].id
      matchedProduct = `${matches[0].brand} ${matches[0].name}`
    }

    if (errors.length > 0) action = 'skip'
    return {
      rowNumber: row.rowNumber,
      values: row.values,
      action,
      fields: row.fields,
      productId,
      matchedProduct,
      errors,
    }
  })
}

function expectedAction(value: unknown): value is { action: ImportAction; productId: number | null } {
  return !!value &&
    typeof value === 'object' &&
    ['add', 'update', 'skip'].includes((value as { action?: string }).action ?? '') &&
    ((value as { productId?: unknown }).productId === null ||
      Number.isInteger((value as { productId?: unknown }).productId))
}

function normalizeSheetUrl(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Enter a valid Google Sheets URL.')
  }
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || url.username || url.password) {
    throw new Error('Only https://docs.google.com spreadsheet URLs are supported.')
  }
  const match = url.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)
  if (!match || !GOOGLE_SHEET_ID_PATTERN.test(match[1])) {
    throw new Error('The URL must point to a Google Sheets spreadsheet.')
  }
  const gid = url.searchParams.get('gid') ?? url.hash.match(/gid=(\d+)/)?.[1] ?? '0'
  if (!/^\d+$/.test(gid)) throw new Error('The Google Sheets tab identifier is invalid.')
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`
}

async function readPublicSheet(value: string) {
  const initialUrl = normalizeSheetUrl(value)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    let currentUrl = initialUrl
    let response: Response | null = null
    for (let redirects = 0; redirects < 4; redirects += 1) {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.1' },
      })
      if (response.status < 300 || response.status >= 400) break
      const location = response.headers.get('location')
      if (!location) throw new Error('The Google Sheets export returned an invalid redirect.')
      const redirectedUrl = new URL(location, currentUrl)
      const permittedHost = redirectedUrl.hostname === 'docs.google.com' ||
        redirectedUrl.hostname.endsWith('.googleusercontent.com')
      if (redirectedUrl.protocol !== 'https:' || !permittedHost) {
        throw new Error('The Google Sheets export redirected to an unsupported host.')
      }
      currentUrl = redirectedUrl.toString()
    }

    if (!response || !response.ok) {
      if (response?.status === 401 || response?.status === 403) {
        throw new Error('This Google Sheet is private. Share or publish it so it can be accessed by link, then try again.')
      }
      throw new Error(`Could not download the Google Sheet (${response?.status ?? 'no response'}). Check that link sharing is enabled.`)
    }
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    if (contentType.includes('text/html')) {
      throw new Error('Google returned a sign-in or error page instead of sheet data. Make the sheet public/export-accessible.')
    }
    const declaredLength = Number(response.headers.get('content-length') ?? 0)
    if (declaredLength > MAX_IMPORT_FILE_BYTES) {
      throw new Error('The Google Sheet export is larger than the 3 MB import limit.')
    }
    const reader = response.body?.getReader()
    if (!reader) throw new Error('The Google Sheets export returned an empty response.')
    const chunks: Uint8Array[] = []
    let totalBytes = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_IMPORT_FILE_BYTES) {
        await reader.cancel()
        throw new Error('The Google Sheet export is larger than the 3 MB import limit.')
      }
      chunks.push(value)
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes).toString('utf8')
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The Google Sheets export timed out. Try again or upload an exported CSV file.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

async function parseUpload(file: File) {
  if (file.size === 0 || file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error('Choose a non-empty file no larger than 3 MB.')
  }
  const filename = file.name.toLowerCase()
  const content = Buffer.from(await file.arrayBuffer())

  if (filename.endsWith('.csv')) {
    if (!CSV_MIME_TYPES.has(file.type)) throw new Error('The selected file is not a supported CSV file.')
    return parseInventoryCsv(content.toString('utf8'))
  }
  if (filename.endsWith('.xlsx')) {
    if (content[0] !== 0x50 || content[1] !== 0x4b) {
      throw new Error('The selected Excel file is invalid. Upload a valid .xlsx workbook.')
    }
    return parseInventoryXlsx(content)
  }
  if (filename.endsWith('.docx')) {
    if (content[0] !== 0x50 || content[1] !== 0x4b) {
      throw new Error('The selected Word file is invalid. Upload a valid .docx document.')
    }
    return parseInventoryDocx(content)
  }
  throw new Error('Supported sources are .csv, .xlsx, .docx, or an accessible Google Sheets URL.')
}

export async function POST(request: Request) {
  const { supabase, error: authError } = await getAdminClient(request)
  if (authError || !supabase) return authError

  const contentType = request.headers.get('content-type') ?? ''
  const isMultipart = contentType.includes('multipart/form-data')
  const isJson = contentType.includes('application/json')
  if (!isMultipart && !isJson) {
    return responseError('Use multipart form data to parse a source, or JSON to analyze/confirm mapped rows.', 415)
  }
  const maxRequestBytes = contentType.includes('multipart/form-data')
    ? MAX_MULTIPART_REQUEST_BYTES
    : MAX_JSON_REQUEST_BYTES
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > maxRequestBytes) {
    return responseError('The import request is too large. Reduce the file or source row count and try again.', 413)
  }

  let requestBody: ArrayBuffer
  try {
    requestBody = await readBoundedBody(request, maxRequestBytes)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read the import request.'
    return responseError(message, message === 'The import request is too large.' ? 413 : 400)
  }

  if (isMultipart) {
    let form: FormData
    try {
      form = await new Response(requestBody, { headers: { 'Content-Type': contentType } }).formData()
    } catch {
      return responseError('Could not read the uploaded import source.', 400)
    }
    const file = form.get('file')
    const sheetUrl = form.get('sheetUrl')
    if (file instanceof File && sheetUrl) {
      return responseError('Upload a file or provide a Google Sheets URL, not both.', 400)
    }
    if (file instanceof File) {
      try {
        const source = await parseUpload(file)
        return NextResponse.json({ source, mapping: suggestInventoryImportMapping(source.headers) })
      } catch (error) {
        return responseError(error instanceof Error ? error.message : 'Could not parse import file.', 400)
      }
    }
    if (typeof sheetUrl === 'string' && sheetUrl.trim()) {
      try {
        const csv = await readPublicSheet(sheetUrl.trim())
        const source = parseInventoryCsv(csv)
        return NextResponse.json({ source, mapping: suggestInventoryImportMapping(source.headers) })
      } catch (error) {
        return responseError(error instanceof Error ? error.message : 'Could not read Google Sheet.', 400)
      }
    }
    return responseError('Upload a CSV, XLSX, or DOCX file, or enter a Google Sheets URL.', 400)
  }

  let body: {
    action?: unknown
    headers?: unknown
    rows?: unknown
    mapping?: unknown
    expected?: unknown
  }
  try {
    const rawBody = new TextDecoder().decode(requestBody)
    body = JSON.parse(rawBody)
  } catch {
    return responseError('Request body must be valid JSON.', 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return responseError('Request body must be a JSON object.', 400)
  }
  if (body.action !== 'analyze' && body.action !== 'commit') {
    return responseError('Choose an import action.', 400)
  }

  let source: InventoryImportSource
  let mapping: InventoryImportMapping
  try {
    source = sourceHeaders(body.headers as string[], body.rows as string[][])
    mapping = validateMapping(body.mapping, source.headers)
  } catch (error) {
    return responseError(error instanceof Error ? error.message : 'The import preview is invalid.', 400)
  }

  let catalog: CatalogMatch[]
  try {
    catalog = await loadCatalog(supabase)
  } catch (error) {
    return responseError(error instanceof Error ? error.message : 'Could not check the existing inventory.', 500)
  }

  const analysis = analyzeRows(source, mapping, catalog)
  if (body.action === 'analyze') {
    return NextResponse.json({ rows: analysis })
  }

  if (!Array.isArray(body.expected) || body.expected.length !== analysis.length || body.expected.some((entry) => !expectedAction(entry))) {
    return responseError('The import preview has expired or is invalid. Analyze the rows again.', 400)
  }

  const expectedRows = body.expected as Array<{ action: ImportAction; productId: number | null }>
  const outcomes: InventoryImportOutcome[] = []
  const queue = analysis.map((row, index) => ({ row, expected: expectedRows[index] }))
  let cursor = 0
  const worker = async () => {
    while (cursor < queue.length) {
      const current = queue[cursor]
      cursor += 1
      const { row, expected } = current
      if (row.action !== expected.action || row.productId !== expected.productId) {
        outcomes.push({ rowNumber: row.rowNumber, outcome: 'skipped', message: 'Inventory changed since preview; analyze the import again.' })
        continue
      }
      if (row.action === 'skip') {
        outcomes.push({ rowNumber: row.rowNumber, outcome: 'skipped', message: row.errors.join(' ') || 'Skipped in preview.' })
        continue
      }

      const fields = { ...row.fields }
      const { brand, name, price } = fields
      if (typeof brand !== 'string' || typeof name !== 'string' || typeof price !== 'number') {
        outcomes.push({
          rowNumber: row.rowNumber,
          outcome: 'failed',
          message: 'Brand, product name, and price are required to save this row.',
        })
        continue
      }
      if (row.action === 'add') {
        fields.stock_quantity = fields.stock_quantity ?? 0
        fields.low_stock_threshold = fields.low_stock_threshold ?? 3
        fields.status = fields.status ?? 'new'
        fields.condition_grade = fields.condition_grade ?? 'A'
        fields.warranty_months = fields.warranty_months ?? 0
        fields.spec = fields.spec ?? null
        fields.image_url = fields.image_url ?? null
        fields.imei = fields.imei ?? null
      }
      if ('stock_quantity' in fields) fields.in_stock = Number(fields.stock_quantity) > 0

      const result = row.action === 'add'
        ? await supabase.from('products').insert({ ...fields, brand, name, price })
        : await supabase.from('products').update(fields).eq('id', row.productId!)

      if (result.error) {
        outcomes.push({
          rowNumber: row.rowNumber,
          outcome: 'failed',
          message: `Supabase could not save this row: ${result.error.message}`,
        })
      } else {
        outcomes.push({
          rowNumber: row.rowNumber,
          outcome: row.action === 'add' ? 'added' : 'updated',
          message: row.action === 'add' ? 'Product added.' : 'Product updated.',
        })
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(5, queue.length) }, () => worker()))
  outcomes.sort((a, b) => a.rowNumber - b.rowNumber)
  const summary = {
    added: outcomes.filter((row) => row.outcome === 'added').length,
    updated: outcomes.filter((row) => row.outcome === 'updated').length,
    skipped: outcomes.filter((row) => row.outcome === 'skipped').length,
    failed: outcomes.filter((row) => row.outcome === 'failed').length,
  }
  const hasFailures = summary.failed > 0 || outcomes.some((row) => row.message.includes('Inventory changed since preview'))
  return NextResponse.json(
    { summary, rows: outcomes },
    { status: hasFailures ? 207 : 200 },
  )
}
