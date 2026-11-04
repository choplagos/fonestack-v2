export type ExportColumn<Row> = {
  header: string
  key: keyof Row
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function exportCsv<Row extends object>(
  filename: string,
  columns: ExportColumn<Row>[],
  rows: Row[],
) {
  const content = [
    columns.map((column) => csvCell(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(',')),
  ].join('\r\n')
  downloadBlob(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }), filename)
}

export async function exportXlsx<Row extends object>(
  filename: string,
  columns: ExportColumn<Row>[],
  rows: Row[],
) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Export')
  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: String(column.key),
    width: Math.max(column.header.length + 2, 16),
  }))
  for (const row of rows) {
    sheet.addRow(Object.fromEntries(columns.map((column) => [String(column.key), row[column.key]])))
  }
  sheet.getRow(1).font = { bold: true }
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  )
}
