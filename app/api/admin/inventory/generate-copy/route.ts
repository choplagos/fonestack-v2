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
  const accessToken = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!accessToken) return NextResponse.json({ error: 'A signed-in admin session is required.' }, { status: 401 })

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
  const email = userData.user?.email?.trim().toLowerCase()
  if (userError || !email) return NextResponse.json({ error: 'Your admin session is invalid or expired.' }, { status: 401 })
  const { data: admin, error: adminError } = await supabase.from('admin_users').select('role').eq('email', email).maybeSingle()
  if (adminError) return NextResponse.json({ error: `Could not verify admin access: ${adminError.message}` }, { status: 500 })
  if (!admin || admin.role === 'technician') return NextResponse.json({ error: 'This account cannot generate product copy.' }, { status: 403 })

  let input: Record<string, unknown>
  try {
    input = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (
    typeof input.brand !== 'string' || !input.brand.trim() || input.brand.length > 100
    || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 160
  ) {
    return NextResponse.json({ error: 'Enter a brand and product name within the allowed lengths.' }, { status: 400 })
  }
  const allowedFields = ['storage', 'ram', 'processor', 'screen', 'battery', 'camera', 'color', 'condition_grade', 'warranty', 'price']
  const productDetails = Object.fromEntries(allowedFields
    .filter((key) => typeof input[key] === 'string' || typeof input[key] === 'number')
    .map((key) => [key, input[key]]))

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI copy generation is not configured. Set GEMINI_API_KEY.' }, { status: 503 })

  let geminiResponse: Response
  try {
    geminiResponse = await fetch(GEMINI_API, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: [
              'Write honest Nigerian English product copy for a Nigerian consumer-electronics store.',
              'Use only facts included in this JSON. Do not invent specifications, condition details, accessories, availability or claims.',
              'Return valid JSON only, with string fields seo_title, seo_description, description.',
              'seo_title must be no more than 60 characters.',
              'seo_description must be no more than 155 characters.',
              'description must be 120 to 160 words. Do not exaggerate or make unsupported claims.',
              JSON.stringify({ brand: input.brand.trim(), name: input.name.trim(), ...productDetails }),
            ].join('\n'),
          }],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              seo_title: { type: 'STRING' },
              seo_description: { type: 'STRING' },
              description: { type: 'STRING' },
            },
            required: ['seo_title', 'seo_description', 'description'],
          },
          maxOutputTokens: 700,
          temperature: 0.3,
        },
      }),
    })
  } catch (error) {
    console.error('Gemini product copy request failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Could not connect to the AI service. Please try again.' }, { status: 502 })
  }
  if (!geminiResponse.ok) {
    const message = (await geminiResponse.text()).slice(0, 500)
    console.error('Gemini product copy generation failed:', geminiResponse.status, message)
    return NextResponse.json({ error: `The AI service could not generate product copy (${geminiResponse.status}).` }, { status: 502 })
  }

  let payload: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  try {
    payload = await geminiResponse.json()
  } catch {
    return NextResponse.json({ error: 'The AI service returned an unreadable response.' }, { status: 502 })
  }
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
  if (!text) return NextResponse.json({ error: 'The AI service returned no product copy.' }, { status: 502 })

  let copy: { seo_title?: unknown; seo_description?: unknown; description?: unknown }
  try {
    copy = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'The AI service returned invalid JSON. Please try again.' }, { status: 502 })
  }
  if (typeof copy.seo_title !== 'string' || typeof copy.seo_description !== 'string' || typeof copy.description !== 'string') {
    return NextResponse.json({ error: 'The AI service omitted one or more copy fields.' }, { status: 502 })
  }
  const seoTitle = copy.seo_title.trim()
  const seoDescription = copy.seo_description.trim()
  const description = copy.description.trim()
  const wordCount = description.split(/\s+/).filter(Boolean).length
  if (seoTitle.length > 60 || seoDescription.length > 155 || wordCount < 120 || wordCount > 160) {
    return NextResponse.json({ error: 'Generated copy did not meet the requested length limits. Try again.' }, { status: 502 })
  }
  return NextResponse.json({ seo_title: seoTitle, seo_description: seoDescription, description })
}
