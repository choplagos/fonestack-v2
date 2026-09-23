# 🚨 URGENT: DNS Configuration Required for fonestack.com.ng → Vercel

## The Problem
Your domain `fonestack.com.ng` is currently pointing to `216.198.79.1` (not Vercel).
Google Console gets "Invalid sitemap address" because the domain doesn't resolve to your Vercel deployment.

## The Solution: Point DNS to Vercel

### Step 1: Find Your Domain Registrar
Where did you buy `fonestack.com.ng`? Common registrars:
- Namecheap
- GoDaddy
- HostGator
- Ionos
- Google Domains
- Other (.ng registrar)

Check your email for the domain purchase confirmation.

### Step 2: Access DNS Settings
1. Log into your registrar account
2. Find: **DNS Settings**, **Name Servers**, or **Domain Management**
3. Look for a section to edit DNS records or name servers

### Step 3: Add Vercel DNS Records

**Option A: Use Vercel's CNAME (Easiest)**
1. Go to: https://vercel.com/dashboard
2. Click on **fonestack-v2** project
3. Go to **Settings** → **Domains**
4. You should see **fonestack.com.ng** listed
5. Vercel will show you the **CNAME value** to add

2. In your registrar's DNS settings, add:
   - **Type**: CNAME
   - **Host/Name**: `www` (if adding www)
   - **Value/Target**: Copy from Vercel dashboard
   - **TTL**: 3600 (or default)

3. For root domain (`fonestack.com.ng` without www):
   - **Type**: A
   - **Value**: `76.76.19.163` (Vercel's IP - verify in Vercel dashboard)
   - **TTL**: 3600

**Option B: Change Nameservers (Alternative)**
Vercel provides nameservers (if you prefer this method):
1. In your registrar, find "Nameserver" settings
2. Replace with Vercel's nameservers (Vercel will provide these)
3. Save changes

### Step 4: Wait for DNS Propagation
- **Immediate**: 5-10 minutes (often)
- **Maximum**: 24-48 hours (rarely needed)

### Step 5: Verify DNS is Working
Run this in terminal:
```
nslookup fonestack.com.ng
```

Should show Vercel's IP (not 216.198.79.1)

### Step 6: Resubmit to Google Console
Once DNS is fixed:
1. Go to: https://search.google.com/search-console
2. Submit sitemap: `fonestack.com.ng/sitemap.xml`
3. Should now show "Submitted" ✅

---

## Temporary Workaround (While DNS is being fixed)

**Use your Vercel deployment URL instead**:

1. Go to: https://vercel.com/dashboard
2. Find **fonestack-v2** project
3. You'll see a URL like: `fonestack-v2-[random].vercel.app` or just `fonestack-v2.vercel.app`
4. Submit to Google Console: `fonestack-v2.vercel.app/sitemap.xml`

This will work immediately and you can update it later once DNS is fixed.

---

## What Each Registrar Looks Like

### Namecheap
1. Log in → Domain List
2. Click domain → Manage
3. DNS section → Add/Edit records
4. Add CNAME and A records as above

### GoDaddy
1. Log in → My Products
2. Click domain → Manage DNS
3. Add DNS Records
4. Add CNAME and A records

### Google Domains
1. Log in → My Domains
2. Click domain → DNS
3. Custom Records
4. Add CNAME and A records

### Other Registrars
- Look for "DNS", "Name Servers", or "Advanced DNS"
- Add records as described above

---

## Sitemap File Status
✅ Static sitemap created: `/public/sitemap.xml`
✅ Committed and pushed to GitHub
✅ Will be accessible once DNS is fixed or via Vercel URL

---

## Action Items RIGHT NOW

**Choose One**:

### Option 1 (Fastest - 5 minutes)
1. Go to Vercel dashboard
2. Find your project's Vercel URL
3. Submit that URL's sitemap to Google Console: `[your-vercel-url]/sitemap.xml`
4. Done! ✅

### Option 2 (Permanent - 15-30 minutes)
1. Log into your domain registrar
2. Add Vercel DNS records (CNAME + A record)
3. Wait 5-10 minutes for DNS propagation
4. Submit `fonestack.com.ng/sitemap.xml` to Google Console
5. Done! ✅

---

## Need Help?

**If you don't know your registrar**: Check email for domain purchase confirmation or try:
- https://www.whois.com (search for fonestack.com.ng)
- Look for "Registrar" field in results

**If you're stuck on DNS setup**: Tell me your registrar and I can provide exact steps.

---

## Files Ready
- ✅ `public/sitemap.xml` - Static sitemap file
- ✅ `app/sitemap.ts` - Dynamic sitemap route
- ✅ `public/robots.txt` - Crawler config
- ✅ `lib/constants.ts` - Domain updated
- ✅ All committed to GitHub

**Everything is ready. You just need to point your DNS to Vercel and you're done!**
