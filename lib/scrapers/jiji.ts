export interface Listing {
  price: number;
  title?: string;
  url?: string;
  location?: string;
}

import { load } from 'cheerio';

export async function scrapeJiji(query: string, limit = 25): Promise<Listing[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://jiji.ng/search?query=${encoded}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'fonestack-tradein-bot/1.0' } });
    if (!res.ok) return [];
    const text = await res.text();
    const $ = load(text);
    const listings: Listing[] = [];

    // Try common selectors for prices
    const priceSelectors = ['.price', '.ads-price', '[data-testid] .price', '.product-price', '.item-price', '.card-price'];
    const priceRegex = /₦\s?[\d,]+|NGN\s?[\d,]+/g;

    // First pass: structured selectors
    for (const sel of priceSelectors) {
      $(sel).each((i, el) => {
        if (listings.length >= limit) return;
        const text = $(el).text();
        const m = text.match(priceRegex);
        if (m && m[0]) {
          const digits = m[0].replace(/[₦NGN\s,]/gi, '').trim();
          const n = Number(digits);
          if (!isNaN(n) && n > 1000) listings.push({ price: n });
        }
      });
      if (listings.length >= Math.min(5, limit)) break;
    }

    // Fallback: scan any text nodes for price patterns
    if (listings.length < Math.min(10, limit)) {
      const bodyText = $('body').text();
      const matches = bodyText.match(priceRegex) || [];
      for (const m of matches) {
        if (listings.length >= limit) break;
        const digits = m.replace(/[₦NGN\s,]/gi, '').trim();
        const n = Number(digits);
        if (!isNaN(n) && n > 1000) listings.push({ price: n });
      }
    }

    return dedupeListings(listings);
  } catch (e) {
    return [];
  }
}

function dedupeListings(listings: Listing[]) {
  const seen = new Set<number>();
  const out: Listing[] = [];
  for (const l of listings) {
    const key = Math.round(l.price / 1000) * 1000;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(l);
    }
  }
  return out;
}
