import { NextRequest, NextResponse } from 'next/server'

const BOT_PATTERNS = [
  /ChatGPT-User/i,
  /ClaudeBot/i,
  /PerplexityBot/i,
  /Google-Extended/i,
  /Bingbot/i
]

export function middleware(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') || ''
    const path = req.nextUrl.pathname
    if (BOT_PATTERNS.some(p => p.test(ua))) {
      // Log to serverless console — visible in hosting logs. Keep lightweight.
      console.log(JSON.stringify({ event: 'ai-crawler-visit', userAgent: ua, path, timestamp: new Date().toISOString() }))
    }
  } catch (err) {
    // swallow errors to avoid blocking requests
    console.error('middleware error', err)
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/(.*)'
}
