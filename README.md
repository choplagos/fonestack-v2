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