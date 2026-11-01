import { parse as parseCsv } from 'csv-parse/sync'
import ExcelJS from 'exceljs'
import mammoth from 'mammoth'
import { load } from 'cheerio'

import {
  INVENTORY_IMPORT_FIELDS,
  type InventoryImportField,
  type InventoryImportMapping,
  type InventoryImportSource,
} from '@/lib/inventoryImportTypes'

export const MAX_IMPORT_ROWS = 500
export const MAX_IMPORT_FILE_BYTES = 3 * 1024 * 1024
export const MAX_IMPORT_COLUMNS = 40

function cellText(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text.trim()
  }
  if (typeof value === 'object' && 'result' in value) return cellText(value.result)
  return String(value).trim()
}

function uniqueHeaders(sourceHeaders: string[]) {
  const seen = new Map<string, number>()
  return sourceHeaders.map((header, index) => {
    const clean = header.trim() || `Column ${index + 1}`
    const key = clean.toLocaleLowerCase()
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    return count === 1 ? clean : `${clean} (${count})`
  })
}

function makeSource(matrix: string[][]): InventoryImportSource {
  const nonEmptyRows = matrix.filter((row) => row.some((value) => value.trim() !== ''))
  if (nonEmptyRows.length < 2) {
    throw new Error('The import must contain a header row and at least one product row.')
  }
  if (nonEmptyRows.length - 1 > MAX_IMPORT_ROWS) {
    throw new Error(`Imports are limited to ${MAX_IMPORT_ROWS} product rows at a time.`)
  }

  const width = Math.max(...nonEmptyRows.map((row) => row.length))
  if (width > MAX_IMPORT_COLUMNS) {
    throw new Error(`The source contains more than ${MAX_IMPORT_COLUMNS} columns. Remove unused columns and try again.`)
  }

  const headers = uniqueHeaders(nonEmptyRows[0].map((value) => value.slice(0, 120)))
  const rows = nonEmptyRows.slice(1).map((row) =>
    Array.from({ length: headers.length }, (_, index) => (row[index] ?? '').slice(0, 4000)),
  )
  return { headers, rows }
}

export function parseInventoryCsv(content: string): InventoryImportSource {
  let matrix: string[][]
  try {
    matrix = parseCsv(content, {
      bom: true,
      skip_empty_lines: true,
      relax_column_count: true,
      to: MAX_IMPORT_ROWS + 2,
      record_delimiter: ['\r\n', '\n', '\r'],
    }) as string[][]
  } catch {
    throw new Error('The CSV could not be parsed. Check its quoting and row formatting.')
  }
  return makeSource(matrix.map((row) => row.map(cellText)))
}

export async function parseInventoryXlsx(content: Buffer): Promise<InventoryImportSource> {
  try {
    const workbook = new ExcelJS.Workbook()
    const workbookBuffer = new ArrayBuffer(content.length)
    new Uint8Array(workbookBuffer).set(content)
    await workbook.xlsx.load(workbookBuffer)
    const worksheet = workbook.worksheets[0]
    if (!worksheet) throw new Error('The Excel workbook does not contain a worksheet.')
    if (worksheet.rowCount > MAX_IMPORT_ROWS + 1 || worksheet.columnCount > MAX_IMPORT_COLUMNS) {
      throw new Error(`Excel imports are limited to ${MAX_IMPORT_ROWS} product rows and ${MAX_IMPORT_COLUMNS} columns.`)
    }

    const matrix: string[][] = []
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values: string[] = []
      row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        values[columnNumber - 1] = cellText(cell.text)
      })
      if (matrix.length > MAX_IMPORT_ROWS + 1) {
        throw new Error(`Imports are limited to ${MAX_IMPORT_ROWS} product rows at a time.`)
      }
      matrix.push(values)
    })
    return makeSource(matrix)
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith('Imports are limited') ||
      error.message.startsWith('Excel imports are limited')
    )) throw error
    if (error instanceof Error && error.message.startsWith('The import must')) throw error
    throw new Error('The Excel workbook could not be read. Upload a valid .xlsx file.')
  }
}

export async function parseInventoryDocx(content: Buffer): Promise<InventoryImportSource> {
  let html: string
  try {
    const result = await mammoth.convertToHtml(
      { buffer: content },
      { externalFileAccess: false, ignoreEmptyParagraphs: true },
    )
    html = result.value
  } catch {
    throw new Error('The Word document could not be read. Upload a valid .docx file.')
  }

  const $ = load(html)
  const tables = $('table').toArray()
  if (tables.length === 0) {
    throw new Error('No product table was found. Add a table with a header row and product rows.')
  }

  const matrix: string[][] = []
  let canonicalHeaders: string[] | null = null
  for (const table of tables) {
    const tableRows = $(table).find('tr').toArray()
    if (tableRows.length < 2) continue
    const tableMatrix = tableRows.map((row) =>
      $(row)
        .find('th, td')
        .toArray()
        .map((cell) => $(cell).text().trim()),
    )
    const headers = tableMatrix[0]
    if (!canonicalHeaders) {
      canonicalHeaders = headers
      matrix.push(headers)
    } else {
      const headerIndexes = new Map(headers.map((header, index) => [header.trim().toLocaleLowerCase(), index]))
      if (headers.length !== canonicalHeaders.length || canonicalHeaders.some((header) => !headerIndexes.has(header.trim().toLocaleLowerCase()))) {
        throw new Error('All product tables in a Word document must use the same column headers.')
      }
      for (let rowIndex = 1; rowIndex < tableMatrix.length; rowIndex += 1) {
        matrix.push(canonicalHeaders.map((header) => {
          const sourceIndex = headerIndexes.get(header.trim().toLocaleLowerCase())
          return sourceIndex === undefined ? '' : tableMatrix[rowIndex][sourceIndex] ?? ''
        }))
      }
    }
    if (canonicalHeaders === headers) {
      for (let rowIndex = 1; rowIndex < tableMatrix.length; rowIndex += 1) {
        matrix.push(tableMatrix[rowIndex])
      }
    }
    if (matrix.length > MAX_IMPORT_ROWS + 1) {
      throw new Error(`Imports are limited to ${MAX_IMPORT_ROWS} product rows at a time.`)
    }
  }
  return makeSource(matrix)
}

export function suggestInventoryImportMapping(headers: string[]): InventoryImportMapping {
  const aliases: Record<InventoryImportField, string[]> = {
    brand: ['brand', 'make', 'manufacturer'],
    name: ['name', 'product', 'product name', 'model', 'item', 'item name'],
    price: ['price', 'unit price', 'selling price', 'amount', 'cost'],
    spec: ['spec', 'specs', 'specification', 'specifications', 'description', 'details'],
    status: ['status', 'condition status'],
    stock_quantity: ['stock', 'stock quantity', 'quantity', 'qty', 'inventory'],
    low_stock_threshold: ['low stock threshold', 'reorder level', 'minimum stock'],
    condition_grade: ['condition grade', 'grade', 'condition'],
    warranty_months: ['warranty', 'warranty months'],
    image_url: ['image', 'image url', 'photo url', 'image link'],
    imei: ['imei', 'serial', 'serial number'],
  }
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const normalizedHeaders = headers.map(normalize)
  const mapping = {} as InventoryImportMapping

  for (const field of INVENTORY_IMPORT_FIELDS) {
    const aliasesForField = aliases[field.key].map(normalize)
    const index = normalizedHeaders.findIndex((header) => aliasesForField.includes(header))
    mapping[field.key] = index >= 0 ? headers[index] : ''
  }
  return mapping
}
