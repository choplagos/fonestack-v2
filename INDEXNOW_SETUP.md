# IndexNow API Integration Guide

This project includes a complete IndexNow API integration for submitting URLs to search engines (Bing, Yandex) for immediate indexing.

## Overview

IndexNow is a protocol that allows you to notify search engines about URL additions, deletions, and updates on your site. This enables faster indexing and better visibility in search results.

**Official Documentation:** https://www.indexnow.org/

## Setup Instructions

### 1. Get Your API Key

Visit https://www.indexnow.org/ and generate your unique API key. Example: `f1300c4472f44e86b1455c5ab97e52a1`

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Your unique IndexNow API key
INDEXNOW_API_KEY=f1300c4472f44e86b1455c5ab97e52a1

# Your site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Host the Key File

The IndexNow protocol requires hosting your API key as a text file. You have two options:

#### Option A: Root Level (Recommended)

The key file is automatically available at: `https://yourdomain.com/[INDEXNOW_API_KEY].txt`

This route is served by `/app/api/indexnow/route.ts`

#### Option B: Custom Location

If you prefer a custom location, specify the `keyLocation` parameter when submitting URLs.

## Usage

### Backend/Server-Side Usage

#### Submitting a Single URL

```typescript
import { submitUrlToIndexNow } from '@/lib/indexnow';

try {
  const result = await submitUrlToIndexNow('https://yourdomain.com/new-page');
  
  if (result.success) {
    console.log('URL submitted:', result.message);
  } else {
    console.error('Error:', result.message);
  }
} catch (error) {
  console.error('Failed to submit URL:', error);
}
```

#### Submitting Multiple URLs

```typescript
import { submitUrlsToIndexNow } from '@/lib/indexnow';

try {
  const urls = [
    'https://yourdomain.com/page1',
    'https://yourdomain.com/page2',
    'https://yourdomain.com/page3',
  ];
  
  const result = await submitUrlsToIndexNow(urls);
  
  if (result.success) {
    console.log(`Submitted ${urls.length} URLs successfully`);
  } else {
    console.error('Error:', result.message);
  }
} catch (error) {
  console.error('Failed to submit URLs:', error);
}
```

#### With Custom Key Location

```typescript
import { submitUrlsToIndexNow } from '@/lib/indexnow';

const result = await submitUrlsToIndexNow(
  ['https://yourdomain.com/page1'],
  { keyLocation: 'https://yourdomain.com/custom/key.txt' }
);
```

### Frontend/Client-Side Usage

Use the `useIndexNow` React hook:

```typescript
'use client'; // Make sure this is a client component

import { useIndexNow } from '@/lib/hooks/useIndexNow';
import { useState } from 'react';

export function MyComponent() {
  const { submitUrls, loading, error, success } = useIndexNow({
    onSuccess: (message) => console.log('Success:', message),
    onError: (error) => console.error('Error:', error),
  });

  const handleSubmit = async () => {
    await submitUrls([
      'https://yourdomain.com/page1',
      'https://yourdomain.com/page2',
    ]);
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit URLs to IndexNow'}
      </button>
      {success && <p className="text-green-600">URLs submitted successfully!</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}
```

### API Endpoint Usage

#### Submit URLs via HTTP Request

```bash
POST /api/indexnow/submit
Content-Type: application/json

{
  "urls": [
    "https://yourdomain.com/page1",
    "https://yourdomain.com/page2"
  ],
  "keyLocation": "https://yourdomain.com/f1300c4472f44e86b1455c5ab97e52a1.txt"
}
```

#### Get Documentation

```bash
GET /api/indexnow/submit
```

Returns API documentation and example usage.

### Common Integration Points

#### 1. After Publishing New Content

```typescript
// In your content publishing route/function
import { submitUrlToIndexNow } from '@/lib/indexnow';

async function publishPost(post) {
  // ... publish logic ...
  
  try {
    await submitUrlToIndexNow(`https://yourdomain.com/posts/${post.slug}`);
  } catch (error) {
    console.error('Failed to notify IndexNow:', error);
    // Don't fail the request if IndexNow submission fails
  }
}
```

#### 2. Bulk Submission (Sitemap)

```typescript
// Submit multiple URLs at once
import { submitUrlsToIndexNow } from '@/lib/indexnow';

async function submitSitemapUrls(urls: string[]) {
  try {
    // IndexNow allows up to 10,000 URLs per request
    const chunks = [];
    for (let i = 0; i < urls.length; i += 10000) {
      chunks.push(urls.slice(i, i + 10000));
    }

    for (const chunk of chunks) {
      await submitUrlsToIndexNow(chunk);
    }
  } catch (error) {
    console.error('Bulk submission failed:', error);
  }
}
```

#### 3. URL Validation

```typescript
import { isValidIndexNowUrl } from '@/lib/indexnow';

const isValid = isValidIndexNowUrl(
  'https://yourdomain.com/page1',
  'https://yourdomain.com'
);
```

## API Responses

### Success (200 OK)

```json
{
  "success": true,
  "message": "URLs submitted successfully to IndexNow",
  "urlCount": 3
}
```

### Error Responses

| Status | Code | Message | Reason |
|--------|------|---------|--------|
| 400 | Bad Request | Invalid format | Request body is malformed |
| 403 | Forbidden | Key not valid | API key not found or invalid |
| 422 | Unprocessable Entity | URLs don't belong to host | URLs don't match the configured domain |
| 429 | Too Many Requests | Rate limited | Too many requests (spam protection) |
| 500 | Internal Server Error | Unknown error | Server-side error |

## Best Practices

1. **Error Handling**: Always wrap submissions in try-catch blocks. Failures should not block your main operations.

2. **Rate Limiting**: Space out submissions to avoid hitting rate limits. IndexNow has built-in spam protection.

3. **Batch Submissions**: Use batch submissions for better performance. Maximum 10,000 URLs per request.

4. **HTTPS Only**: Only HTTPS URLs are accepted. Make sure your domain uses HTTPS.

5. **Valid Domain**: URLs must belong to the configured `NEXT_PUBLIC_SITE_URL`.

6. **Key File Verification**: Ensure the key file is accessible at the specified location before submitting URLs.

## Testing

### Local Testing

1. Add your test API key to `.env.local`:
```env
INDEXNOW_API_KEY=test_key_12345
NEXT_PUBLIC_SITE_URL=https://localhost:3000
```

2. Test the key file endpoint:
```bash
curl http://localhost:3000/test_key_12345.txt
```

Should return: `test_key_12345`

3. Test the submit endpoint:
```bash
curl -X POST http://localhost:3000/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://localhost:3000/test"]
  }'
```

### Production Testing

1. Set environment variables in production
2. Verify the key file is accessible: `https://yourdomain.com/[INDEXNOW_API_KEY].txt`
3. Submit a test URL
4. Verify via Bing Webmaster Tools: https://www.bing.com/webmastertools

## Troubleshooting

### "API key not valid" (403)

- Verify `INDEXNOW_API_KEY` is set correctly
- Check that the key file is accessible at the key location
- Ensure the file contains exactly your API key (no extra whitespace)

### "URLs don't belong to the host" (422)

- Verify URLs match your `NEXT_PUBLIC_SITE_URL` domain
- Check that all URLs use HTTPS
- Ensure no typos in domain names

### "Too Many Requests" (429)

- Wait before retrying
- Reduce submission frequency
- Batch URLs together instead of submitting individually

### "Bad request" (400)

- Validate JSON format of request
- Ensure `urls` array is not empty
- Check URL formatting

## File Structure

```
lib/
├── indexnow.ts           # Main IndexNow service
└── hooks/
    └── useIndexNow.ts    # React hook for client-side usage

app/
└── api/
    └── indexnow/
        ├── route.ts          # Key file endpoint
        └── submit/
            └── route.ts      # Submit URLs endpoint
```

## Security Considerations

1. **API Key**: Keep your `INDEXNOW_API_KEY` secret (use `.env.local`)
2. **Key File**: The key file is intentionally public per IndexNow protocol
3. **Rate Limiting**: IndexNow has built-in spam detection
4. **HTTPS Only**: Always use HTTPS URLs

## Additional Resources

- [IndexNow Official Documentation](https://www.indexnow.org/)
- [Bing Webmaster Tools](https://www.bing.com/webmastertools)
- [Protocol Specification](https://www.indexnow.org/documentation)

## Support

For issues related to:
- **IndexNow Protocol**: See https://www.indexnow.org/
- **Integration Issues**: Check this guide and error logs
- **Bing Integration**: Visit Bing Webmaster Tools
