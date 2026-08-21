# IndexNow Configuration for Fonestack

## Your Setup Details

**Domain**: fonestack.vercel.app  
**IndexNow API Key**: f1300c4472f44e86b1455c5ab97e52a1  
**Key File Location**: https://fonestack.vercel.app/f1300c4472f44e86b1455c5ab97e52a1.txt

---

## ✅ Setup Checklist

### Step 1: Add Environment Variables ✓
Create `.env.local` in your project root:

```env
INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1
NEXT_PUBLIC_SITE_URL=https://fonestack.vercel.app
```

### Step 2: Verify Key File is Accessible
After deploying, your API key file should be accessible at:
```
https://fonestack.vercel.app/f1300c4472f44e86b1455c5ab97e52a1.txt
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
      "https://fonestack.vercel.app/blog",
      "https://fonestack.vercel.app/trade-in-old-phone-lagos"
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
  
  const postUrl = `https://fonestack.vercel.app/blog/${slug}`;
  await submitUrlToIndexNow(postUrl);
  console.log('✓ Indexed:', postUrl);
}
```

### Example 2: Submit Product Page
```typescript
const productUrl = 'https://fonestack.vercel.app/buy-android-phone-ikeja-cheap';
await submitUrlToIndexNow(productUrl);
```

### Example 3: Batch Submit Multiple Pages
```typescript
import { submitUrlsToIndexNow } from '@/lib/indexnow';

const urls = [
  'https://fonestack.vercel.app/',
  'https://fonestack.vercel.app/blog',
  'https://fonestack.vercel.app/trade-in-old-phone-lagos',
  'https://fonestack.vercel.app/buy-android-phone-ikeja-cheap',
  'https://fonestack.vercel.app/phone-screen-repair-ikeja-price',
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
        'https://fonestack.vercel.app/my-new-page'
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
  -d '{"urls": ["https://fonestack.vercel.app/test"]}'
# Should return success response
```

### 2. Production Deployment
1. Add to Vercel Environment Variables:
   - `INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1`
   - `NEXT_PUBLIC_SITE_URL=https://fonestack.vercel.app`

2. Deploy your project

3. Verify key file is accessible:
   ```bash
   curl https://fonestack.vercel.app/f1300c4472f44e86b1455c5ab97e52a1.txt
   ```

4. Test URL submission:
   ```bash
   curl -X POST https://fonestack.vercel.app/api/indexnow/submit \
     -H "Content-Type: application/json" \
     -d '{"urls": ["https://fonestack.vercel.app/"]}'
   ```

### 3. Verify in Bing Webmaster Tools
1. Go to: https://www.bing.com/webmastertools
2. Add your domain: fonestack.vercel.app
3. Verify ownership (choose any method)
4. Check "Crawl & Index" section to see submitted URLs

---

## 📋 Your Fonestack Pages for Indexing

Suggested URLs to submit initially:

```typescript
const fonestackUrls = [
  'https://fonestack.vercel.app/',                           // Homepage
  'https://fonestack.vercel.app/blog',                       // Blog
  'https://fonestack.vercel.app/admin',                      // Admin
  'https://fonestack.vercel.app/budget-smartphone-students-nigeria',
  'https://fonestack.vercel.app/buy-android-phone-ikeja-cheap',
  'https://fonestack.vercel.app/fairly-used-iphone-price-computer-village',
  'https://fonestack.vercel.app/iphone-battery-replacement-ikeja',
  'https://fonestack.vercel.app/phone-screen-repair-ikeja-price',
  'https://fonestack.vercel.app/sell-my-phone-computer-village',
  'https://fonestack.vercel.app/trade-in-old-phone-lagos',
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
Value: https://fonestack.vercel.app
Environments: Production, Preview, Development
```

---

## 🔐 Security Notes

✅ **Never commit to git**: Keep `f1300c4472f44e86b1455c5ab97e52a1` only in:
- `.env.local` (development)
- Vercel environment variables (production)

✅ **Key file is public**: By design, the key file at `https://fonestack.vercel.app/f1300c4472f44e86b1455c5ab97e52a1.txt` is meant to be publicly accessible (IndexNow protocol requirement)

✅ **Regenerate if compromised**: If this key is exposed publicly, visit https://www.indexnow.org/ and regenerate a new one

---

## 📊 API Endpoints (Your Domain)

```
Key File:
  GET https://fonestack.vercel.app/f1300c4472f44e86b1455c5ab97e52a1.txt

Submit URLs:
  POST https://fonestack.vercel.app/api/indexnow/submit
  Body: { "urls": [...] }

Documentation:
  GET https://fonestack.vercel.app/api/indexnow/submit
```

---

## 🆘 Troubleshooting

### Key file returns 404
- [ ] Ensure `INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1` is set
- [ ] Make sure app is deployed/running
- [ ] Check URL format: `https://fonestack.vercel.app/[KEY].txt`

### Submit endpoint returns 403
- [ ] Verify key file is accessible first
- [ ] Check API key matches: `f1300c4472f44e86b1455c5ab97e52a1`
- [ ] Ensure URLs match domain: `https://fonestack.vercel.app/*`

### Submit endpoint returns 422
- [ ] URLs must be HTTPS only
- [ ] URLs must belong to `fonestack.vercel.app`
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

**Your IndexNow integration is ready for fonestack.vercel.app! 🚀**
