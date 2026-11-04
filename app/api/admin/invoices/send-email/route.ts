import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { SITE_URL } from '@/lib/constants'
import type { Database } from '@/lib/database.types'
import {
  invoiceEmailProductName,
  invoiceEmailItems,
  invoiceEmailProductSpec,
  renderInvoiceEmail,
} from '@/lib/invoiceEmail'

type InvoiceForEmail = {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  product_snapshot: Database['public']['Tables']['invoices']['Row']['product_snapshot']
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number | null
  deposit_amount: number
  amount_due: number | null
  status: string
  created_at: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase is not configured on the server.' }, { status: 500 })
  }

  const authorization = request.headers.get('authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!accessToken) {
    return NextResponse.json({ error: 'A signed-in admin session is required.' }, { status: 401 })
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
  const adminEmail = userData.user?.email?.trim().toLowerCase()
  if (userError || !adminEmail) {
    return NextResponse.json({ error: 'Your admin session is invalid or expired. Sign in again.' }, { status: 401 })
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', adminEmail)
    .maybeSingle()
  if (adminError) {
    return NextResponse.json({ error: `Could not verify admin access: ${adminError.message}` }, { status: 500 })
  }
  if (!admin) {
    return NextResponse.json({ error: 'This account is not authorized to send invoices.' }, { status: 403 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!resendApiKey || !fromEmail) {
    return NextResponse.json(
      { error: 'Invoice email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.' },
      { status: 503 },
    )
  }

  let body: { invoiceId?: unknown; recipient?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (
    typeof body.invoiceId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.invoiceId)
  ) {
    return NextResponse.json({ error: 'A valid invoice ID is required.' }, { status: 400 })
  }
  if (typeof body.recipient !== 'string' || !EMAIL_PATTERN.test(body.recipient.trim())) {
    return NextResponse.json({ error: 'Enter a valid recipient email address.' }, { status: 400 })
  }

  const { data: invoiceData, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, customer_phone, customer_email, product_snapshot, quantity, unit_price, discount_amount, total_amount, deposit_amount, amount_due, status, created_at')
    .eq('id', body.invoiceId)
    .maybeSingle()
  if (invoiceError) {
    return NextResponse.json({ error: `Could not load invoice: ${invoiceError.message}` }, { status: 500 })
  }
  if (!invoiceData) {
    return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
  }
  const invoice = invoiceData as InvoiceForEmail

  const settingKeys = [
    'business_name',
    'business_address',
    'business_phone',
    'invoice_footer',
    'invoice_terms',
  ]
  const { data: settingRows, error: settingsError } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', settingKeys)
  if (settingsError) {
    return NextResponse.json({ error: `Could not load business email settings: ${settingsError.message}` }, { status: 500 })
  }
  const settings = Object.fromEntries((settingRows ?? []).map(({ key, value }) => [key, value ?? '']))
  const invoiceUrl = new URL(
    `/invoice/${encodeURIComponent(invoice.id)}`,
    process.env.NEXT_PUBLIC_SITE_URL || SITE_URL,
  ).toString()
  const html = renderInvoiceEmail({
    invoiceNumber: invoice.invoice_number,
    customerName: invoice.customer_name,
    customerEmail: body.recipient.trim(),
    customerPhone: invoice.customer_phone,
    productName: invoiceEmailProductName(invoice.product_snapshot),
    productSpec: invoiceEmailProductSpec(invoice.product_snapshot),
    items: invoiceEmailItems(invoice.product_snapshot),
    quantity: invoice.quantity,
    unitPrice: Number(invoice.unit_price),
    discountAmount: Number(invoice.discount_amount),
    totalAmount: Number(invoice.total_amount ?? 0),
    depositAmount: Number(invoice.deposit_amount),
    amountDue: Number(invoice.amount_due ?? 0),
    status: invoice.status,
    createdAt: invoice.created_at,
    invoiceUrl,
    businessName: settings.business_name || 'Fonestack',
    businessAddress: settings.business_address || null,
    businessPhone: settings.business_phone || null,
    invoiceFooter: settings.invoice_footer || null,
    termsAndConditions: settings.invoice_terms || null,
  })

  let resendResponse: Response
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [body.recipient.trim()],
        subject: `Your ${settings.business_name || 'Fonestack'} invoice ${invoice.invoice_number}`,
        html,
      }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Resend invoice delivery request failed:', message)
    return NextResponse.json({ error: `Could not connect to Resend: ${message}` }, { status: 502 })
  }

  if (!resendResponse.ok) {
    const providerMessage = (await resendResponse.text()).slice(0, 500)
    console.error('Resend invoice delivery failed:', resendResponse.status, providerMessage)
    return NextResponse.json(
      { error: `Resend could not send this invoice (${resendResponse.status}). ${providerMessage}` },
      { status: 502 },
    )
  }

  const result = await resendResponse.json() as { id?: string }
  return NextResponse.json({ message: 'Invoice email sent.', emailId: result.id ?? null })
}
