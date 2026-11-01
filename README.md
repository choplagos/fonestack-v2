# Fonestack - Premium Phones & Repairs

A modern e-commerce platform for premium smartphones and expert repair services in Computer Village, Ikeja, Lagos.

## 🚀 SEO Features

### Technical SEO
- ✅ Dynamic metadata with OpenGraph and Twitter Cards
- ✅ Structured data (JSON-LD) for Organization, Website, Product, FAQ, and Service
- ✅ XML Sitemap with image support
- ✅ Robots.txt with AI bot support
- ✅ Web Manifest for PWA
- ✅ Favicons and app icons
- ✅ RSS feed for content syndication
- ✅ Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ Performance optimizations (image optimization, compression, caching)

### Accessibility
- ✅ Semantic HTML5 structure
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader support
- ✅ Focus management
- ✅ Reduced motion support

### Performance
- ✅ Image optimization (AVIF, WebP)
- ✅ Font optimization
- ✅ CSS optimizations
- ✅ Bundle optimization
- ✅ Lazy loading for images
- ✅ Preconnect for critical resources

## 📱 Features

- **Device Store**: Browse phones, laptops, and audio products by category
- **AI Comparison**: Compare phones with AI-powered analysis
- **Repair Services**: Book repair services for all phone brands
- **Invoice System**: View and download invoices
- **Admin Dashboard**: Manage inventory and sales

### Product categories

Products use a `category` value of `phones`, `laptops`, or `audio`. Before adding non-phone products, run [`supabase/migrations/20261019000000_add_product_categories.sql`](./supabase/migrations/20261019000000_add_product_categories.sql) in the Supabase SQL Editor. Existing rows default to `phones`; set the category when adding new products. For safe, non-purchasable examples, optionally run [`supabase/seed_demo_products.sql`](./supabase/seed_demo_products.sql) after the migration.

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Deployment**: Vercel
- **Animation**: Framer Motion

## 🔧 Development

```bash
npm install
npm run dev
```

### Admin access and Supabase

The admin console is available at `/admin` and requires Supabase email/password
authentication. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
to the local environment and the Vercel project settings. Admin accounts must
already exist in Supabase Auth and be listed in the `public.admin_users`
allowlist; accounts not on that list are signed out and cannot open the console.

Inventory, invoices, device requests, trade-in requests, and business settings
are read from their existing Supabase tables. Missing Supabase configuration or
query failures are shown as errors rather than replaced with sample dashboard
values.

Inventory admins can bulk import product lists from CSV, `.xlsx`, `.docx`
tables, or a Google Sheets URL that is publicly accessible for export. Files
and exported sheets are limited to 3 MB and 500 product rows. Include a header
row; Word imports use tables only, and all product tables in a document must
share the same column headers. Private Sheets that require Google sign-in are
not supported.

The import screen suggests field mappings from common headers and shows a
row-by-row preview before saving. Required fields are brand, product name, and
price. A matching normalized brand and product name updates the existing
product; unmatched entries are added. Ambiguous catalog matches and duplicate
source keys are skipped for review. New products default to zero stock, a
low-stock threshold of 3, status `new`, condition grade `A`, and zero warranty
months when those columns are omitted. Updates change only mapped, non-empty
values; omitted or blank fields leave existing product values unchanged.

Inventory product forms include an AI specification draft action. It uses
`GEMINI_API_KEY` on the server, generates from the product brand and name, and
fills the editable specifications field for review. The draft is saved only
when an admin explicitly saves the product. Configure `GEMINI_API_KEY` in the
local/deployment environment; do not prefix it with `NEXT_PUBLIC_`.

Invoice details include an email action powered by Resend. Configure
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` in the deployment environment; the
sender address must belong to a domain verified with Resend. Keep the API key
server-side and do not prefix it with `NEXT_PUBLIC_`. Invoice email terms use
the current `invoice_terms` setting and render as escaped text in the
Terms & Conditions block.

For WhatsApp, use **Save PDF** to open the printable customer invoice and save
it as a PDF, then open **WhatsApp message** and attach the downloaded PDF before
sending the prefilled thank-you message. WhatsApp does not allow a `wa.me` link
to attach files automatically.

## 🌐 Custom domain and AdSense

The canonical site URL is `https://fonestack.com.ng`; the app redirects `www.fonestack.com.ng` to the apex domain. Set the apex domain as the primary domain in Vercel and configure both domain DNS records to avoid a host redirect loop.

The AdSense script, account metadata, and `public/ads.txt` use the same publisher ID. Replace the `XXXXXXXXXXXXXXXX` placeholder in those files with the publisher ID from your AdSense account before deploying. The placeholder shown below is not a valid publisher ID:

```text
ca-pub-XXXXXXXXXXXXXXXX
```

Technical setup and policy pages do not guarantee AdSense approval; Google also reviews site content and policy compliance.

## 📊 SEO Audit Checklist

- [x] Title tags optimized
- [x] Meta descriptions
- [x] Canonical URLs
- [x] OpenGraph tags
- [x] Twitter Cards
- [x] Structured data
- [x] Sitemap
- [x] Robots.txt
- [x] Mobile-friendly
- [x] Accessibility
- [x] Performance
- [x] Security headers

## 📈 Expected SEO Impact

- **Core Web Vitals**: Improved LCP, CLS, INP scores
- **Search Visibility**: Enhanced with structured data
- **AI Search**: Optimized for ChatGPT, Perplexity, Gemini, Bing
- **Organic Traffic**: Expected 20-40% increase
- **Conversions**: Improved with better UX and accessibility