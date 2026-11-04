import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { Database, Json } from '@/lib/database.types'

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })

  let body: { email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (typeof body.email !== 'string' || body.email.trim().length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const supabase = createClient<Database>(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await supabase.rpc('login_attempt_status', {
    p_email: body.email.trim().toLowerCase(),
    p_ip: getClientIp(request),
  })
  if (error) {
    console.error('Login attempt precheck failed:', error.message)
    return NextResponse.json({ error: 'Could not verify sign-in attempt status.' }, { status: 503 })
  }

  const result = data as Json
  const payload = result && typeof result === 'object' && !Array.isArray(result) ? result : {}
  const locked = payload.locked === true
  const retrySeconds = typeof payload.retry_after_seconds === 'number' && Number.isFinite(payload.retry_after_seconds)
    ? Math.max(0, Math.ceil(payload.retry_after_seconds))
    : 0
  const response = { locked, retry_after_seconds: retrySeconds }
  return NextResponse.json(response, { status: locked ? 429 : 200 })
}
