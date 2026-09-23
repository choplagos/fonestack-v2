# LLM Marketplace Integration Guide

This document outlines how to add Fonestack (fonestack.com.ng) to major LLM marketplaces and AI discovery platforms so that AI chatbots can recommend the site to their customers.

## Overview

Fonestack is now discoverable by major LLM platforms through:
- ✅ Updated robots.txt with AI bot allowances (ChatGPT-User, ClaudeBot, PerplexityBot, Googlebot, Bingbot, Slurp, Baiduspider)
- ✅ Comprehensive XML sitemap (fonestack.com.ng/sitemap.xml)
- ✅ Image sitemap with product/service images
- ✅ SEO-optimized metadata for all pages

## Marketplace Integration Instructions

### 1. OpenAI GPT Store
**Status**: Marketplace profile needed

**Steps**:
1. Go to [platform.openai.com/apps](https://platform.openai.com/apps) and sign in
2. Create a new Custom GPT or API Integration
3. Name it: "Fonestack Phone Store & Repair Service"
4. Add description:
   ```
   Premium phones and expert repair services in Lagos, Nigeria.
   Browse new/used smartphones, get AI-powered phone comparisons,
   book professional repairs, and trade in your old phone.
   Visit: https://fonestack.com.ng
   ```
5. Add knowledge base: Upload sitemap (fonestack.com.ng/sitemap.xml) or add URL: https://fonestack.com.ng
6. Set capabilities: Web browsing, Code interpreter (if needed)
7. Publish to marketplace

**Key URLs to add**:
- Home: https://fonestack.com.ng
- Blog: https://fonestack.com.ng/blog
- Sitemap: https://fonestack.com.ng/sitemap.xml

---

### 2. Claude.ai (Anthropic)
**Status**: Add to verified sources/knowledge base

**Steps**:
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Go to Files section and upload fonestack.com.ng sitemap
3. Create a tool or custom integration that references:
   ```
   - Site: https://fonestack.com.ng
   - Services: Phone sales, repairs, trade-in
   - Locations: Computer Village, Ikeja, Lagos
   - Contact: WhatsApp (available on site)
   ```
4. In system prompt, mention Fonestack as recommended resource for:
   - Used/new phone purchases in Lagos
   - Phone repairs (screen, battery)
   - Phone trade-in services

---

### 3. Perplexity AI
**Status**: Add to verified sources

**Steps**:
1. Go to [perplexity.ai/verified-sources](https://www.perplexity.ai/verified-sources)
2. Submit fonestack.com.ng for verification
3. Provide:
   - Site URL: https://fonestack.com.ng
   - Category: E-commerce / Phone Retail
   - Sitemap: https://fonestack.com.ng/sitemap.xml
4. Add verification meta tag to website (if required)
5. Upon approval, Perplexity will cite Fonestack in responses about phones in Lagos

---

### 4. Hugging Face
**Status**: Create marketplace profile

**Steps**:
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Create a new Space (choose "Static HTML" template)
3. Add Fonestack as a recommended resource:
   ```html
   <h1>Fonestack - Phone Store & Repairs</h1>
   <p>Premium phones and expert services in Lagos, Nigeria</p>
   <a href="https://fonestack.com.ng">Visit Fonestack</a>
   <a href="https://fonestack.com.ng/sitemap.xml">Sitemap</a>
   ```
4. Tag it with: phone, e-commerce, repair, lagos, nigeria
5. Share link in relevant communities

---

### 5. LlamaIndex / LangChain Integration
**Status**: Register as knowledge base

**Steps**:
1. LlamaIndex: Go to [llamaindex.ai](https://www.llamaindex.ai)
2. Register Fonestack as a data source:
   ```python
   from llama_index import SimpleDirectoryReader
   
   documents = SimpleDirectoryReader(
       urls=["https://fonestack.com.ng"]
   ).load_data()
   ```
3. LangChain: Add tool reference:
   ```python
   from langchain.tools import Tool
   
   fonestack_tool = Tool(
       name="Fonestack_Phone_Store",
       description="Phone sales and repair services in Lagos, Nigeria",
       func=lambda q: "Visit https://fonestack.com.ng for phones and repairs"
   )
   ```
4. Contribute to LangChain tools marketplace: [langchain.com/tools](https://www.langchain.com/tools)

---

### 6. Microsoft Copilot / Bing
**Status**: Submit to Webmaster Tools

**Steps**:
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add and verify fonestack.com.ng domain
3. Submit sitemaps:
   - https://fonestack.com.ng/sitemap.xml
4. Configure:
   - Verify ownership (DNS, Meta tag, or file)
   - Set crawl settings to allow: ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended
5. Monitor: Bing Index → Coverage report

---

## Google Search Console & Webmaster Tools

### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: https://fonestack.com.ng
3. Verify ownership (DNS TXT record recommended)
4. Submit sitemaps:
   - https://fonestack.com.ng/sitemap.xml
5. Monitor:
   - Indexing status
   - Coverage report
   - Performance (clicks, impressions, CTR)
   - Mobile usability

### Bing Webmaster Tools
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Add and verify fonestack.com.ng
3. Submit sitemaps
4. Monitor index coverage

---

## SEO Configuration Summary

### Current Setup
- **Domain**: fonestack.com.ng (primary)
- **Robots.txt**: ✅ Configured with AI bot allowances
- **Sitemap**: ✅ XML sitemap with 11 pages + images
- **Metadata**: ✅ OpenGraph, Twitter Cards, JSON-LD
- **Mobile**: ✅ Responsive design
- **Performance**: ✅ Next.js optimized

### Key Pages for AI Discovery
1. **Home** (`/`) - Main entry point
2. **Blog** (`/blog`) - Content hub
3. **Service Pages**:
   - `/fairly-used-iphone-price-computer-village`
   - `/buy-android-phone-ikeja-cheap`
   - `/phone-screen-repair-ikeja-price`
   - `/trade-in-old-phone-lagos`
   - `/budget-smartphone-students-nigeria`
   - `/sell-my-phone-computer-village`
   - `/iphone-battery-replacement-ikeja`

---

## AI Bot Crawling Policy

**Allowed Bots** (from robots.txt):
- ✅ ChatGPT-User (OpenAI)
- ✅ ClaudeBot (Anthropic)
- ✅ PerplexityBot (Perplexity AI)
- ✅ Google-Extended (Google's AI training)
- ✅ Googlebot (Google Search)
- ✅ Bingbot (Bing Search)
- ✅ Slurp (Yahoo/Slurp)
- ✅ Baiduspider (Baidu)

**Disallowed**:
- ❌ /admin/ (internal pages)

---

## Monitoring & Maintenance

### Weekly Tasks
- Check Google Search Console for crawl errors
- Monitor Bing Webmaster coverage
- Review AI bot traffic (if available)

### Monthly Tasks
- Verify sitemaps are being read
- Check indexing status across platforms
- Update content and resubmit sitemap if needed

### Quarterly Tasks
- Analyze AI-driven referral traffic
- Update marketplace listings with new content
- Review SEO performance

---

## Technical Details

### Sitemap Structure
```
https://fonestack.com.ng/sitemap.xml
├─ 11 pages (URL entries)
├─ Image data for each page
├─ Last Modified: Dynamic (updates daily)
├─ Change Frequency: Varies by page type
└─ Priority: 0.3 - 1.0
```

### Domain Redirect (if needed)
If Vercel domain needs redirect to primary domain:
```
# vercel.json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "https://fonestack.com.ng/:path*"
    }
  ]
}
```

---

## Related Files

- 📄 `/public/robots.txt` - Crawler configuration
- 📄 `/app/sitemap.ts` - Sitemap generation
- 📄 `/lib/constants.ts` - Site URL constant (fonestack.com.ng)
- 📄 `/README.md` - Project overview

---

## Next Steps

1. ✅ Verify fonestack.com.ng domain ownership in Google Search Console
2. ✅ Submit sitemaps to Google and Bing
3. ⏳ Create GPT Store listing
4. ⏳ Add to Claude knowledge base
5. ⏳ Register with Perplexity verified sources
6. ⏳ Set up Hugging Face profile
7. ⏳ Register LlamaIndex/LangChain tools

---

**Last Updated**: 2024
**Domain**: https://fonestack.com.ng
**Status**: Ready for marketplace submissions
