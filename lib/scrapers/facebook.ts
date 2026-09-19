export interface Listing {
  price: number;
  title?: string;
  url?: string;
  location?: string;
}

import { load } from 'cheerio';

export async function scrapeFacebookMarketplace(query: string, limit = 25): Promise<Listing[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://m.facebook.com/marketplace/search/?query=${encoded}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'fonestack-tradein-bot/1.0' } });
    if (!res.ok) return [];
    const text = await res.text();
    const $ = load(text);
    const listings: Listing[] = [];
    const priceRegex = /₦\s?[\d,]+|NGN\s?[\d,]+/g;

    // Try to find price-like nodes
    $('*[class]').each((i, el) => {
      if (listings.length >= limit) return;
      const txt = $(el).text();
      const m = txt.match(priceRegex);
      if (m && m[0]) {
        const digits = m[0].replace(/[₦NGN\s,]/gi, '').trim();
        const n = Number(digits);
        if (!isNaN(n) && n > 1000) listings.push({ price: n });
      }
    });

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
