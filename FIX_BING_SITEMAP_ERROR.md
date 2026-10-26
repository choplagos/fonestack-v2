# Sitemap submission reference

Fonestack uses `https://www.fonestack.com.ng` as its canonical host. Older instructions in this file referenced the Vercel deployment host and a static sitemap; those instructions are no longer current.

## Current sitemap

- Submit: `https://www.fonestack.com.ng/sitemap.xml`
- Generator: [app/sitemap.ts](./app/sitemap.ts)
- Crawler directive: [public/robots.txt](./public/robots.txt)

The sitemap includes public storefront, service and published blog routes. It excludes admin and invoice URLs, query-string variants and product cards that do not have individual product-detail routes.

## After deploying host redirects

1. Confirm the www host serves the sitemap and the apex and exact legacy `fonestack.vercel.app` host permanently redirect to matching www paths.
2. Submit the canonical sitemap URL in Bing Webmaster Tools.
3. Remove obsolete sitemap entries for the Vercel host or old query-string sitemap.
4. Request recrawls for the homepage and priority buying, repair and trade-in pages.
