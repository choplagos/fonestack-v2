import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/database.types'

const MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return NextResponse.json({ error: 'A signed-in admin session is required.' }, { status: 401 })

  const supabase = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  const email = userData.user?.email?.trim().toLowerCase()
  if (userError || !email) return NextResponse.json({ error: 'Your admin session is invalid or expired.' }, { status: 401 })
  const { data: admin, error: adminError } = await supabase.from('admin_users').select('role').eq('email', email).maybeSingle()
  if (adminError) return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
  if (!admin || admin.role === 'technician') return NextResponse.json({ error: 'This account cannot draft customer replies.' }, { status: 403 })

  let body: { message?: unknown; productId?: unknown; language?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 4000) {
    return NextResponse.json({ error: 'Enter a customer message no longer than 4,000 characters.' }, { status: 400 })
  }
  if (body.language !== 'english' && body.language !== 'pidgin') {
    return NextResponse.json({ error: 'Choose English or Nigerian Pidgin.' }, { status: 400 })
  }
  if (body.productId !== undefined && body.productId !== null && (!Number.isInteger(body.productId) || Number(body.productId) <= 0)) {
    return NextResponse.json({ error: 'Selected product is invalid.' }, { status: 400 })
  }

  const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('consume_admin_rate_limit', { p_scope: 'reply-draft' })
  if (rateLimitError) {
    console.error('Could not check reply draft rate limit:', rateLimitError.message)
    return NextResponse.json({ error: 'Could not verify the reply draft limit.' }, { status: 503 })
  }
  const rateLimit = rateLimitData && typeof rateLimitData === 'object' && !Array.isArray(rateLimitData)
    ? rateLimitData as Record<string, unknown>
    : {}
  if (rateLimit.allowed !== true) {
    return NextResponse.json({ error: 'Reply draft limit reached. Try again later.' }, { status: 429 })
  }

  const settingKeys = ['business_name', 'business_address', 'business_phone']
  const { data: settings, error: settingsError } = await supabase.from('settings').select('key,value').in('key', settingKeys)
  if (settingsError) return NextResponse.json({ error: `Could not load business details: ${settingsError.message}` }, { status: 500 })
  const business = Object.fromEntries((settings ?? []).map((setting) => [setting.key, setting.value ?? '']))

  let product: Record<string, unknown> | null = null
  if (body.productId !== undefined && body.productId !== null) {
    const { data, error } = await supabase.from('products')
      .select('brand,name,price,status,condition_grade,storage_gb,stock_quantity,warranty_months,in_stock')
      .eq('id', Number(body.productId))
      .maybeSingle()
    if (error) return NextResponse.json({ error: `Could not load selected product: ${error.message}` }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Selected product could not be found.' }, { status: 404 })
    product = data as Record<string, unknown>
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Reply drafting is not configured. Set GEMINI_API_KEY.' }, { status: 503 })
  let response: Response
  try {
    response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: [
          'Draft exactly two short, polite replies to the customer message.',
          body.language === 'pidgin' ? 'Use light, clear Nigerian Pidgin.' : 'Use clear English.',
          'Match the customer’s language style when practical.',
          'Use only the business and product facts in the provided JSON.',
          'Never invent prices, discounts, stock availability, or warranty terms. If unsure, say you will confirm.',
          'Return valid JSON only, in the form {"drafts":["...","..."]}.',
          JSON.stringify({
            business: {
              name: business.business_name || 'Fonestack',
              address: business.business_address || null,
              phone: business.business_phone || null,
            },
            selected_product: product,
            customer_message: body.message.trim(),
          }),
        ].join('\n') }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: { drafts: { type: 'ARRAY', items: { type: 'STRING' } } },
            required: ['drafts'],
          },
          maxOutputTokens: 400,
          temperature: 0.4,
        },
      }),
    })
  } catch (error) {
    console.error('Reply draft Gemini request failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Could not connect to the AI service. Please try again.' }, { status: 502 })
  }
  if (!response.ok) {
    console.error('Reply draft Gemini request failed:', response.status)
    return NextResponse.json({ error: `The AI service could not draft replies (${response.status}).` }, { status: 502 })
  }

  let output: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  try {
    output = await response.json()
  } catch {
    return NextResponse.json({ error: 'The AI service returned an unreadable response.' }, { status: 502 })
  }
  const text = output.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
  if (!text) return NextResponse.json({ error: 'The AI service returned no drafts.' }, { status: 502 })
  try {
    const parsed = JSON.parse(text) as { drafts?: unknown }
    if (!Array.isArray(parsed.drafts) || parsed.drafts.length !== 2 || parsed.drafts.some((item) => typeof item !== 'string' || !item.trim())) {
      return NextResponse.json({ error: 'The AI service did not return two valid draft replies.' }, { status: 502 })
    }
    return NextResponse.json({ drafts: parsed.drafts.map((item) => (item as string).trim()) })
  } catch {
    return NextResponse.json({ error: 'The AI service returned invalid JSON.' }, { status: 502 })
  }
}
