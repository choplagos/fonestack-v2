# IndexNow Configuration for Fonestack

## Your Setup Details

**Domain**: fonestack.com.ng
**IndexNow API Key**: f1300c4472f44e86b1455c5ab97e52a1  
**Key File Location**: https://fonestack.com.ng/f1300c4472f44e86b1455c5ab97e52a1.txt

---

## ✅ Setup Checklist

### Step 1: Add Environment Variables ✓
Create `.env.local` in your project root:

```env
INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1
NEXT_PUBLIC_SITE_URL=https://fonestack.com.ng
```

### Step 2: Verify Key File is Accessible
After deploying, your API key file should be accessible at:
```
https://fonestack.com.ng/f1300c4472f44e86b1455c5ab97e52a1.txt
```

**To test locally:**
```bash
npm run dev
curl http://localhost:3000/f1300c4472f44e86b1455c5ab97e52a1.txt
# Should return: f1300c4472f44e86b1455c5ab97e52a1
```

### Step 3: Test URL Submission

**Local test:**
```bash
curl -X POST http://localhost:3000/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://fonestack.com.ng/blog",
      "https://fonestack.com.ng/trade-in-old-phone-lagos"
    ]
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "URLs submitted successfully to IndexNow",
  "urlCount": 2
}
```

---

## 🚀 Usage Examples (Your Domain)

### Example 1: Submit New Blog Post
```typescript
import { submitUrlToIndexNow } from '@/lib/indexnow';

async function publishBlogPost(slug: string) {
  // Create post...
  
  const postUrl = `https://fonestack.com.ng/blog/${slug}`;
  await submitUrlToIndexNow(postUrl);
  console.log('✓ Indexed:', postUrl);
}
```

### Example 2: Submit Product Page
```typescript
const productUrl = 'https://fonestack.com.ng/buy-android-phone-ikeja-cheap';
await submitUrlToIndexNow(productUrl);
```

### Example 3: Batch Submit Multiple Pages
```typescript
import { submitUrlsToIndexNow } from '@/lib/indexnow';

const urls = [
  'https://fonestack.com.ng/',
  'https://fonestack.com.ng/blog',
  'https://fonestack.com.ng/trade-in-old-phone-lagos',
  'https://fonestack.com.ng/buy-android-phone-ikeja-cheap',
  'https://fonestack.com.ng/phone-screen-repair-ikeja-price',
];

await submitUrlsToIndexNow(urls);
```

### Example 4: Client-Side Form
```typescript
'use client';

import { useIndexNow } from '@/lib/hooks/useIndexNow';

export function SubmitUrlForm() {
  const { submitUrls, loading, success, error } = useIndexNow();

  return (
    <div>
      <button onClick={() => submitUrls([
        'https://fonestack.com.ng/my-new-page'
      ])}>
        Submit to IndexNow
      </button>
      {success && <p style={{ color: 'green' }}>✓ Submitted!</p>}
      {error && <p style={{ color: 'red' }}>✗ {error}</p>}
    </div>
  );
}
```

---

## 🔍 Verification Steps

### 1. Local Testing
```bash
# Terminal 1
npm run dev

# Terminal 2
curl https://localhost:3000/f1300c4472f44e86b1455c5ab97e52a1.txt
# Should output: f1300c4472f44e86b1455c5ab97e52a1

curl -X POST http://localhost:3000/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://fonestack.com.ng/test"]}'
# Should return success response
```

### 2. Production Deployment
1. Add to Vercel Environment Variables:
   - `INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1`
   - `NEXT_PUBLIC_SITE_URL=https://fonestack.com.ng`

2. Deploy your project

3. Verify key file is accessible:
   ```bash
   curl https://fonestack.com.ng/f1300c4472f44e86b1455c5ab97e52a1.txt
   ```

4. Test URL submission:
   ```bash
   curl -X POST https://fonestack.com.ng/api/indexnow/submit \
     -H "Content-Type: application/json" \
     -d '{"urls": ["https://fonestack.com.ng/"]}'
   ```

### 3. Verify in Bing Webmaster Tools
1. Go to: https://www.bing.com/webmastertools
2. Add your domain: fonestack.com.ng
3. Verify ownership (choose any method)
4. Check "Crawl & Index" section to see submitted URLs

---

## 📋 Your Fonestack Pages for Indexing

Suggested URLs to submit initially:

```typescript
const fonestackUrls = [
  'https://fonestack.com.ng/',                           // Homepage
  'https://fonestack.com.ng/blog',                       // Blog
  'https://fonestack.com.ng/admin',                      // Admin
  'https://fonestack.com.ng/budget-smartphone-students-nigeria',
  'https://fonestack.com.ng/buy-android-phone-ikeja-cheap',
  'https://fonestack.com.ng/fairly-used-iphone-price-computer-village',
  'https://fonestack.com.ng/iphone-battery-replacement-ikeja',
  'https://fonestack.com.ng/phone-screen-repair-ikeja-price',
  'https://fonestack.com.ng/sell-my-phone-computer-village',
  'https://fonestack.com.ng/trade-in-old-phone-lagos',
];

// Submit all
import { submitUrlsToIndexNow } from '@/lib/indexnow';
await submitUrlsToIndexNow(fonestackUrls);
```

---

## ⚙️ Environment Setup for Vercel

Add these to your Vercel project settings:

**Settings → Environment Variables**

```
Name: INDEXNOW_API_KEY
Value: f1300c4472f44e86b1455c5ab97e52a1
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_SITE_URL
Value: https://fonestack.com.ng
Environments: Production, Preview, Development
```

---

## 🔐 Security Notes

✅ **Never commit to git**: Keep `f1300c4472f44e86b1455c5ab97e52a1` only in:
- `.env.local` (development)
- Vercel environment variables (production)

✅ **Key file is public**: By design, the key file at `https://fonestack.com.ng/f1300c4472f44e86b1455c5ab97e52a1.txt` is meant to be publicly accessible (IndexNow protocol requirement)

✅ **Regenerate if compromised**: If this key is exposed publicly, visit https://www.indexnow.org/ and regenerate a new one

---

## 📊 API Endpoints (Your Domain)

```
Key File:
  GET https://fonestack.com.ng/f1300c4472f44e86b1455c5ab97e52a1.txt

Submit URLs:
  POST https://fonestack.com.ng/api/indexnow/submit
  Body: { "urls": [...] }

Documentation:
  GET https://fonestack.com.ng/api/indexnow/submit
```

---

## 🆘 Troubleshooting

### Key file returns 404
- [ ] Ensure `INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1` is set
- [ ] Make sure app is deployed/running
- [ ] Check URL format: `https://fonestack.com.ng/[KEY].txt`

### Submit endpoint returns 403
- [ ] Verify key file is accessible first
- [ ] Check API key matches: `f1300c4472f44e86b1455c5ab97e52a1`
- [ ] Ensure URLs match domain: `https://fonestack.com.ng/*`

### Submit endpoint returns 422
- [ ] URLs must be HTTPS only
- [ ] URLs must belong to `fonestack.com.ng`
- [ ] Check URL format is valid

### Getting rate limited (429)
- [ ] Wait before retrying
- [ ] Batch submissions (up to 10,000 per request)
- [ ] Space out submissions throughout the day

---

## ✨ Next Steps

1. **Local Test**: Run `npm run dev` and test the endpoints
2. **Deploy**: Push to Vercel with env vars set
3. **Verify**: Check key file is accessible at production URL
4. **Submit**: Start submitting your Fonestack URLs
5. **Monitor**: Check Bing Webmaster Tools for indexing status

---

**Your IndexNow integration is ready for fonestack.com.ng! 🚀**
