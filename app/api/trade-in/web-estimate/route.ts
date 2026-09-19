import { scrapeJiji } from '@/lib/scrapers/jiji';
import { scrapeFacebookMarketplace } from '@/lib/scrapers/facebook';
import { aggregateListings } from '@/lib/tradein/aggregator';
import { supabase } from '@/lib/supabase';

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

    // Try Supabase-backed cache (if available). If Supabase fails, fall back to web scraping.
    try {
      const { data: rows, error } = await supabase
        .from('tradein_cache')
        .select('key, result, created_at')
        .eq('key', key)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && rows && rows.length > 0) {
        const row = rows[0];
        const age = new Date().getTime() - new Date(row.created_at).getTime();
        if (age < CACHE_TTL) {
          const parsed = row.result;
          // Update in-memory cache
          cache.set(key, { ts: now, value: parsed });
          return new Response(JSON.stringify({ fromCache: true, source: 'supabase', ...parsed }), { headers: { 'Content-Type': 'application/json' } });
        }
      }
    } catch (e) {
      // Supabase may not be configured or table missing; ignore and proceed to scraping
      console.warn('Supabase cache check failed', e);
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

    // Try to persist to Supabase
    try {
      await supabase.from('tradein_cache').insert([{ key, query, result }]);
    } catch (e) {
      console.warn('Supabase cache write failed', e);
    }

    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
}
