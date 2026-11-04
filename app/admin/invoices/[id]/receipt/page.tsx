'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase'

type ReceiptItem = { name?: string; brand?: string; spec?: string; imei?: string; quantity?: number; unit_price?: number }
type ReceiptInvoice = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  product_snapshot: { multi?: boolean; name?: string; brand?: string; spec?: string; items?: ReceiptItem[] } | null
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number
  deposit_amount: number
  amount_due: number
  status: string
  payment_method: string | null
  imei: string | null
  created_at: string
}

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG')}`
}

export default function InvoiceReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [invoice, setInvoice] = useState<ReceiptInvoice | null>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [paperWidth, setPaperWidth] = useState<58 | 80>(80)
  const [cashier, setCashier] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = window.localStorage.getItem('fs_receipt_width')
    if (saved === '58' || saved === '80') setPaperWidth(Number(saved) as 58 | 80)
  }, [])

  useEffect(() => {
    let active = true
    async function loadReceipt() {
      const { data: invoiceData, error: invoiceError } = await supabase.from('invoices')
        .select('id,invoice_number,customer_name,customer_phone,product_snapshot,quantity,unit_price,discount_amount,total_amount,deposit_amount,amount_due,status,payment_method,imei,created_at')
        .eq('id', id)
        .maybeSingle()
      if (!active) return
      if (invoiceError || !invoiceData) {
        setErrorMessage(invoiceError?.message ?? 'Invoice not found.')
        setLoading(false)
        return
      }
      setInvoice(invoiceData as ReceiptInvoice)
      const { data: settingRows, error: settingError } = await supabase.from('settings')
        .select('key,value')
        .in('key', ['business_name', 'invoice_tagline', 'business_address', 'business_phone'])
      if (settingError) setErrorMessage(`Could not load receipt settings: ${settingError.message}`)
      else setSettings(Object.fromEntries((settingRows ?? []).map((row) => [row.key, row.value ?? ''])))

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (!userError && userData.user?.email) {
        const { data: adminRow, error: adminError } = await supabase.from('admin_users')
          .select('name')
          .eq('email', userData.user.email.toLowerCase())
          .maybeSingle()
        if (adminError) setErrorMessage(`Could not load cashier details: ${adminError.message}`)
        else setCashier(adminRow?.name?.trim() || userData.user.email)
      } else setCashier('Admin')
      setLoading(false)
    }
    if (id) void loadReceipt()
    return () => { active = false }
  }, [id])

  useEffect(() => {
    if (!invoice || searchParams.get('print') !== '1') return
    const timer = window.setTimeout(() => window.print(), 400)
    return () => window.clearTimeout(timer)
  }, [invoice, searchParams])

  const items = useMemo(() => {
    if (invoice?.product_snapshot?.multi && Array.isArray(invoice.product_snapshot.items)) return invoice.product_snapshot.items
    if (!invoice) return []
    return [{
      name: invoice.product_snapshot?.name,
      brand: invoice.product_snapshot?.brand,
      spec: invoice.product_snapshot?.spec,
      imei: invoice.imei ?? undefined,
      quantity: invoice.quantity,
      unit_price: invoice.unit_price,
    }]
  }, [invoice])
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity ?? 1) * Number(item.unit_price ?? 0), 0)
  const publicInvoiceUrl = typeof window === 'undefined' ? `/invoice/${id}` : `${window.location.origin}/invoice/${id}`
  const dateTime = invoice ? new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(invoice.created_at)) : ''

  function changePaperWidth(value: 58 | 80) {
    setPaperWidth(value)
    window.localStorage.setItem('fs_receipt_width', String(value))
  }

  if (loading) return <main className="p-6 text-sm text-slate-500">Loading receipt…</main>
  if (!invoice || errorMessage) return <main className="space-y-4 p-6 text-sm text-red-700"><p role="alert">{errorMessage || 'Invoice not found.'}</p><Link href={`/admin/invoices/${id}`} className="underline">Return to invoice</Link></main>

  return (
    <main className="min-h-screen bg-white p-4 text-black">
      <style jsx global>{`
        @page { size: ${paperWidth}mm auto; margin: 0; }
        @media print {
          html, body { width: ${paperWidth}mm; margin: 0 !important; padding: 0 !important; color: #000 !important; background: #fff !important; }
          .receipt-shell { width: ${paperWidth === 80 ? '72mm' : '52mm'} !important; margin: 0 auto !important; padding: 3mm 0 !important; }
        }
      `}</style>
      <div className="print:hidden mx-auto mb-4 flex max-w-xl flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/invoices/${invoice.id}`} className="text-sm text-slate-600 underline">Back to invoice</Link>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Paper<select value={paperWidth} onChange={(event) => changePaperWidth(Number(event.target.value) as 58 | 80)} className="ml-2 rounded border border-slate-300 px-2 py-1"><option value={80}>80 mm</option><option value={58}>58 mm</option></select></label>
          <button type="button" onClick={() => window.print()} className="rounded bg-black px-3 py-2 text-sm font-bold text-white">Print receipt</button>
        </div>
      </div>
      <article className="receipt-shell mx-auto w-[72mm] font-mono text-[11px] leading-[1.4] text-black">
        <header className="mb-3 text-center">
          <h1 className="text-[15px] font-bold">{settings.business_name || 'FONESTACK'}</h1>
          {settings.invoice_tagline && <p>{settings.invoice_tagline}</p>}
          {settings.business_address && <p>{settings.business_address}</p>}
          {settings.business_phone && <p>{settings.business_phone}</p>}
          <p className="my-2 border-t border-dashed border-black pt-2 font-bold">SALES RECEIPT</p>
        </header>
        <section className="space-y-1">
          <p>Invoice: {invoice.invoice_number}</p>
          <p>Date: {dateTime} (Lagos)</p>
          <p>Cashier: {cashier || 'Admin'}</p>
          <p>Customer: {invoice.customer_name}</p>
          <p>Phone: {invoice.customer_phone}</p>
        </section>
        <div className="my-3 border-t border-dashed border-black" />
        <section>
          {items.map((item, index) => {
            const quantity = Number(item.quantity ?? 1)
            const price = Number(item.unit_price ?? 0)
            return <div key={`${item.name}-${index}`} className="mb-2">
              <p className="font-bold">{[item.brand, item.name].filter(Boolean).join(' ') || 'Item'}</p>
              {item.spec && <p>{item.spec}</p>}
              <p>{quantity} x {formatNaira(price)} <span className="float-right">{formatNaira(quantity * price)}</span></p>
              {item.imei && <p>IMEI: {item.imei}</p>}
            </div>
          })}
        </section>
        <div className="my-2 border-t border-dashed border-black" />
        <section className="space-y-1">
          <p>Subtotal <span className="float-right">{formatNaira(subtotal)}</span></p>
          <p>Discount <span className="float-right">-{formatNaira(invoice.discount_amount)}</span></p>
          <p className="font-bold">TOTAL <span className="float-right">{formatNaira(invoice.total_amount)}</span></p>
          <p>Deposit paid <span className="float-right">{formatNaira(invoice.deposit_amount)}</span></p>
          <p>Balance due <span className="float-right">{formatNaira(invoice.amount_due)}</span></p>
          <p>Payment: {invoice.payment_method || '—'}</p>
        </section>
        <div className="my-3 border-t border-dashed border-black" />
        <footer className="break-all text-center">
          <p>Thank you for shopping with us!</p>
          <p className="mt-2">Invoice: {publicInvoiceUrl}</p>
        </footer>
      </article>
    </main>
  )
}
