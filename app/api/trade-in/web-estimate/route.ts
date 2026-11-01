import { scrapeJiji } from '@/lib/scrapers/jiji';
import { scrapeFacebookMarketplace } from '@/lib/scrapers/facebook';
import { aggregateListings } from '@/lib/tradein/aggregator';
import type { AggregationResult } from '@/lib/tradein/aggregator'
import type { Listing } from '@/lib/scrapers/jiji'

export const runtime = 'edge';

const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours
const cache = new Map<string, { ts: number; value: any }>();

function cacheKey(q: string) {
  return `tradein:web:${q.toLowerCase().trim()}`;
}

export async function OPTIONS() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;
    if (!query || typeof query !== 'string') return new Response(JSON.stringify({ error: 'query required' }), { status: 400 });

    const key = cacheKey(query);
    const now = Date.now();

    // Try in-memory cache first
    const cached = cache.get(key);
    if (cached && now - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify({ fromCache: true, source: 'memory', ...cached.value }), { headers: { 'Content-Type': 'application/json' } });
    }

    const [jijiRes, fbRes] = await Promise.allSettled([
      scrapeJiji(query, 50),
      scrapeFacebookMarketplace(query, 50),
    ]);

    const listingsBySource: Record<string, any[]> = {
      jiji: jijiRes.status === 'fulfilled' ? jijiRes.value : [],
      facebook: fbRes.status === 'fulfilled' ? fbRes.value : [],
    };

    const agg = aggregateListings(listingsBySource);

    const result = { query, listingsBySource, aggregation: agg };

    // Store in-memory
    cache.set(key, { ts: now, value: result });

    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
}
