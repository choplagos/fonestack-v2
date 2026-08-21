# IndexNow API Integration - Quick Reference

## Setup (5 minutes)

### 1. Get API Key
Visit: https://www.indexnow.org/ → Generate API key

### 2. Add Environment Variable
Create `.env.local` in project root:
```env
INDEXNOW_API_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Host Key File (Choose One)

**Option A - Automatic (Recommended)**
Your key file is automatically served at:
```
https://yourdomain.com/[INDEXNOW_API_KEY].txt
```
✓ No additional setup needed!

**Option B - Manual**
Host the key file yourself and pass `keyLocation` in requests.

---

## Implementation Examples

### Example 1: Submit URL After Publishing Content

**Server Action (app/actions/publishPost.ts)**
```typescript
'use server';

import { submitUrlToIndexNow } from '@/lib/indexnow';

export async function publishPost(post: Post) {
  // Create post in database
  const published = await db.posts.create(post);
  
  // Notify IndexNow
  try {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${published.slug}`;
    await submitUrlToIndexNow(url);
    console.log('✓ Submitted to IndexNow:', url);
  } catch (error) {
    console.error('IndexNow submission failed (non-blocking):', error);
  }
  
  return published;
}
```

### Example 2: Client-Side Form

**Component (components/SubmitUrlForm.tsx)**
```typescript
'use client';

import { useIndexNow } from '@/lib/hooks/useIndexNow';

export function SubmitUrlForm() {
  const { submitUrls, loading, error, success } = useIndexNow();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const urls = form.url.value.split('\n').filter(Boolean);
    
    await submitUrls(urls);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="url" placeholder="Enter URLs (one per line)" />
      <button disabled={loading}>Submit</button>
      {success && <p style={{ color: 'green' }}>Submitted!</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </form>
  );
}
```

### Example 3: Batch Submission

**API Route Handler (app/api/batch-index/route.ts)**
```typescript
import { submitUrlsToIndexNow } from '@/lib/indexnow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    // Split into chunks (max 10,000 per request)
    const chunks = [];
    for (let i = 0; i < urls.length; i += 10000) {
      chunks.push(urls.slice(i, i + 10000));
    }

    const results = await Promise.all(
      chunks.map(chunk => submitUrlsToIndexNow(chunk))
    );

    return NextResponse.json({
      success: true,
      totalUrls: urls.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Example 4: Auto-Index on Sitemap Generation

**Sitemap Endpoint (app/sitemap.ts)**
```typescript
import type { MetadataRoute } from 'next';
import { submitUrlsToIndexNow } from '@/lib/indexnow';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.posts.findAll();
  
  const urls: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Submit new/updated URLs to IndexNow
  if (urls.length > 0) {
    const urlStrings = urls.map(u => u.url);
    await submitUrlsToIndexNow(urlStrings).catch(err => {
      console.error('IndexNow submission failed:', err);
    });
  }

  return urls;
}
```

---

## API Endpoints

### Key File Endpoint
```
GET /[INDEXNOW_API_KEY].txt
→ Returns: Your API key
```

### Submit URLs Endpoint
```
POST /api/indexnow/submit
Content-Type: application/json

{
  "urls": [
    "https://yourdomain.com/page1",
    "https://yourdomain.com/page2"
  ],
  "keyLocation": "https://yourdomain.com/[KEY].txt"  // optional
}

Response:
{
  "success": true,
  "message": "URLs submitted successfully to IndexNow",
  "urlCount": 2
}
```

### Documentation Endpoint
```
GET /api/indexnow/submit
→ Returns: API documentation and examples
```

---

## Testing

### Test Locally
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test key file
curl http://localhost:3000/[INDEXNOW_API_KEY].txt

# Test submit endpoint
curl -X POST http://localhost:3000/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://localhost:3000/test"]}'
```

### Test in Production
1. Ensure `INDEXNOW_API_KEY` is set in environment
2. Verify key file is accessible: `https://yourdomain.com/[KEY].txt`
3. Submit a URL via `/api/indexnow/submit`
4. Verify in Bing Webmaster Tools: https://www.bing.com/webmastertools

---

## Error Codes

| Code | Issue | Solution |
|------|-------|----------|
| 400 | Bad request | Check JSON format, ensure `urls` array is not empty |
| 403 | Key not valid | Verify API key, check key file is accessible |
| 422 | URLs don't match domain | Ensure URLs are HTTPS and match your domain |
| 429 | Rate limited | Wait before retrying, reduce submission frequency |

---

## Files Created

```
lib/
├── indexnow.ts              # Core service
└── hooks/
    └── useIndexNow.ts       # React hook

app/api/indexnow/
├── route.ts                 # Key file endpoint
└── submit/
    └── route.ts             # Submit URLs endpoint

components/
└── IndexNowExample.tsx      # Example component

INDEXNOW_SETUP.md            # Full documentation
```

---

## Environment Setup

### Local Development
```env
INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (Vercel)
Add in Project Settings → Environment Variables:
```
INDEXNOW_API_KEY = your_key
NEXT_PUBLIC_SITE_URL = https://yourdomain.com
```

---

## Common Patterns

**Auto-submit on content updates:**
```typescript
export async function updatePost(id: string, data: PostUpdate) {
  const post = await db.posts.update(id, data);
  
  // Auto-submit updated URL
  await submitUrlToIndexNow(
    `https://yourdomain.com/posts/${post.slug}`
  ).catch(err => console.error('IndexNow:', err));
  
  return post;
}
```

**Verify URLs before submitting:**
```typescript
import { isValidIndexNowUrl } from '@/lib/indexnow';

const urls = ['https://yourdomain.com/page1', 'https://other.com/page'];
const valid = urls.filter(url => 
  isValidIndexNowUrl(url, process.env.NEXT_PUBLIC_SITE_URL)
);

await submitUrlsToIndexNow(valid);
```

---

## Support

- **IndexNow Docs**: https://www.indexnow.org/
- **Bing Webmaster**: https://www.bing.com/webmastertools
- **Rate Limits**: Check IndexNow documentation for latest limits
- **Local Testing**: See `INDEXNOW_SETUP.md`

---

## Next Steps

1. ✅ Set `INDEXNOW_API_KEY` in `.env.local`
2. ✅ Set `NEXT_PUBLIC_SITE_URL` to your domain
3. ✅ Test key file: `curl https://yourdomain.com/[KEY].txt`
4. ✅ Integrate into your workflow (post creation, updates, etc.)
5. ✅ Monitor in Bing Webmaster Tools
