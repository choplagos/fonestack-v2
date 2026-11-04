import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { Database, Json } from '@/lib/database.types'

function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown'
}

function readUserAgent(userAgent: string) {
  const browser = /Edg\//i.test(userAgent) ? 'Edge'
    : /Firefox\//i.test(userAgent) ? 'Firefox'
      : /Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent) ? 'Chrome'
        : /Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent) ? 'Safari'
          : 'Unknown browser'
  const os = /Windows/i.test(userAgent) ? 'Windows'
    : /Android/i.test(userAgent) ? 'Android'
      : /iPhone|iPad|iPod/i.test(userAgent) ? 'iOS'
        : /Mac OS X|Macintosh/i.test(userAgent) ? 'macOS'
          : /Linux/i.test(userAgent) ? 'Linux'
            : 'unknown operating system'
  return `${browser} on ${os}`
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })

  let body: { email?: unknown; success?: unknown; deviceId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (
    typeof body.email !== 'string' || body.email.trim().length > 320
    || typeof body.success !== 'boolean'
    || typeof body.deviceId !== 'string' || body.deviceId.length < 1 || body.deviceId.length > 200
  ) return NextResponse.json({ error: 'Email, success status, and device ID are required.' }, { status: 400 })

  const email = body.email.trim().toLowerCase()
  const ip = getClientIp(request)
  const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 1000)
  const deviceHash = createHash('sha256').update(`${email}${body.deviceId}`).digest('hex')
  let supabase = createClient<Database>(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  let recipientEmail: string | null = null

  if (body.success) {
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) return NextResponse.json({ error: 'A signed-in admin session is required for successful attempts.' }, { status: 401 })
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || userData.user?.email?.toLowerCase() !== email) {
      return NextResponse.json({ error: 'The signed-in user does not match the reported email.' }, { status: 401 })
    }
    supabase = createClient<Database>(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: admin, error: adminError } = await supabase.from('admin_users')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    if (adminError) return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
    if (!admin) return NextResponse.json({ error: 'This account is not on the Fonestack admin allowlist.' }, { status: 403 })
    recipientEmail = admin.email
  }

  const { data, error } = await supabase.rpc('record_login_attempt', {
    p_email: email,
    p_ip: ip,
    p_user_agent: userAgent || null,
    p_device_hash: deviceHash,
    p_success: body.success,
  })
  if (error) {
    console.error('Could not record admin login attempt:', error.message)
    return NextResponse.json({ error: 'Could not record the sign-in attempt.' }, { status: 503 })
  }

  const rpcValue = data as Json
  const rpcResult = rpcValue && typeof rpcValue === 'object' && !Array.isArray(rpcValue)
    ? rpcValue as Record<string, Json | undefined>
    : {}
  const isNewDevice = body.success && rpcResult.is_new_device === true
  if (isNewDevice && recipientEmail) {
    const resendKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL
    if (!resendKey || !fromEmail) {
      console.error('New-device email alert was not sent because Resend is not configured.')
    } else {
      const signedInAt = new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Lagos',
      }).format(new Date())
      const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171914"><h1 style="font-size:20px">New sign-in to the Fonestack admin</h1><p>A new device signed in to your Fonestack admin account.</p><p><strong>Time:</strong> ${escapeHtml(signedInAt)} (Africa/Lagos)<br><strong>Browser and OS:</strong> ${escapeHtml(readUserAgent(userAgent))}<br><strong>IP address:</strong> ${escapeHtml(ip)}</p><p>If this was not you, change your password now.</p></div>`
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: [recipientEmail],
            subject: 'New sign-in to the Fonestack admin',
            html,
          }),
          signal: AbortSignal.timeout(8000),
        })
        if (!response.ok) console.error('New-device email alert could not be sent:', response.status)
      } catch (error) {
        console.error('New-device email alert request failed:', error instanceof Error ? error.message : String(error))
      }
    }
  }
  return NextResponse.json({ is_new_device: isNewDevice })
}
