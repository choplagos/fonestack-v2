import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/database.types'

const MODEL = 'gemini-2.5-flash'
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

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
    return NextResponse.json({ error: 'This account is not authorized to generate product specifications.' }, { status: 403 })
  }

  let body: { brand?: unknown; name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  if (
    typeof body.brand !== 'string' ||
    typeof body.name !== 'string' ||
    !body.brand.trim() ||
    !body.name.trim() ||
    body.brand.trim().length > 100 ||
    body.name.trim().length > 160
  ) {
    return NextResponse.json(
      { error: 'Enter a brand (up to 100 characters) and product name (up to 160 characters).' },
      { status: 400 },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI specifications are not configured. Set GEMINI_API_KEY in the server environment.' },
      { status: 503 },
    )
  }

  let geminiResponse: Response
  try {
    geminiResponse = await fetch(GEMINI_API, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: [
              `Draft concise product specifications for this product: ${body.brand.trim()} ${body.name.trim()}.`,
              'Return only a plain-text specification suitable for an online phone and electronics catalog.',
              'Use short labeled lines for relevant facts such as display, storage, memory, camera, battery, connectivity, and condition when applicable.',
              'Do not include price, marketing claims, markdown fences, or an introduction.',
              'Do not guess technical details. If the exact model is ambiguous or a detail is not confidently known, omit that detail.',
            ].join('\n'),
          }],
        }],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.2,
        },
      }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Gemini product specification request failed:', message)
    return NextResponse.json({ error: 'Could not connect to the AI service. Please try again.' }, { status: 502 })
  }

  if (!geminiResponse.ok) {
    const providerMessage = (await geminiResponse.text()).slice(0, 500)
    console.error('Gemini product specification generation failed:', geminiResponse.status, providerMessage)
    return NextResponse.json(
      { error: `The AI service could not generate specifications (${geminiResponse.status}). Please try again.` },
      { status: 502 },
    )
  }

  let result: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  try {
    result = await geminiResponse.json()
  } catch {
    return NextResponse.json({ error: 'The AI service returned an unreadable response. Please try again.' }, { status: 502 })
  }

  const specification = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!specification) {
    return NextResponse.json({ error: 'The AI service returned no specifications. Try a more specific product name.' }, { status: 502 })
  }

  return NextResponse.json({ specification: specification.slice(0, 4000) })
}
