import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/database.types'
import { scrapeFacebookMarketplace } from '@/lib/scrapers/facebook'
import { scrapeJiji } from '@/lib/scrapers/jiji'
import type { Listing } from '@/lib/scrapers/jiji'
import { aggregateListings } from '@/lib/tradein/aggregator'

export const runtime = 'nodejs'

const CACHE_TTL = 10 * 60 * 1000
const TIMEOUT_MS = 15_000
const cache = new Map<string, { createdAt: number; value: MarketPriceResult }>()

type MarketSample = Listing & { source: string }
type MarketPriceResult = {
  query: string
  minimum: number | null
  median: number | null
  maximum: number | null
  listingCount: number
  sourceCounts: Record<string, number>
  samples: MarketSample[]
}

function timeout<T>(promise: Promise<T>, source: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${source} lookup timed out`)), TIMEOUT_MS)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

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
  if (!admin || admin.role === 'technician') return NextResponse.json({ error: 'This account cannot request market price suggestions.' }, { status: 403 })

  let body: { query?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (typeof body.query !== 'string' || body.query.trim().length < 2 || body.query.length > 200) {
    return NextResponse.json({ error: 'Enter a product query between 2 and 200 characters.' }, { status: 400 })
  }
  const query = body.query.trim()
  const key = query.toLowerCase()
  const now = Date.now()
  const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('consume_admin_rate_limit', { p_scope: 'market-price' })
  if (rateLimitError) {
    console.error('Could not check market price rate limit:', rateLimitError.message)
    return NextResponse.json({ error: 'Could not verify the market price lookup limit.' }, { status: 503 })
  }
  const rateLimit = rateLimitData && typeof rateLimitData === 'object' && !Array.isArray(rateLimitData)
    ? rateLimitData as Record<string, unknown>
    : {}
  if (rateLimit.allowed !== true) {
    return NextResponse.json({ error: 'Market price lookup limit reached. Try again later.' }, { status: 429 })
  }

  const cached = cache.get(key)
  if (cached && now - cached.createdAt < CACHE_TTL) return NextResponse.json(cached.value)

  const [jijiResult, facebookResult] = await Promise.allSettled([
    timeout(scrapeJiji(query, 25), 'Jiji'),
    timeout(scrapeFacebookMarketplace(query, 25), 'Facebook Marketplace'),
  ])
  const jiji = jijiResult.status === 'fulfilled' ? jijiResult.value : []
  const facebook = facebookResult.status === 'fulfilled' ? facebookResult.value : []
  const all = [...jiji, ...facebook]
  const prices = all.map((listing) => listing.price).filter((price) => Number.isFinite(price)).sort((a, b) => a - b)
  const aggregation = aggregateListings({ jiji, facebook })
  const median = aggregation.median
  const value: MarketPriceResult = {
    query,
    minimum: prices.length ? prices[0] : null,
    median,
    maximum: prices.length ? prices[prices.length - 1] : null,
    listingCount: prices.length,
    sourceCounts: { jiji: jiji.length, facebook: facebook.length },
    samples: [
      ...jiji.slice(0, 3).map((listing) => ({ ...listing, source: 'Jiji' })),
      ...facebook.slice(0, 3).map((listing) => ({ ...listing, source: 'Facebook Marketplace' })),
    ],
  }
  cache.set(key, { createdAt: now, value })
  return NextResponse.json(value)
}
