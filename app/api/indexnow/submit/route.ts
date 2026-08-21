import { submitUrlsToIndexNow, isValidIndexNowUrl } from '@/lib/indexnow';
import { NextRequest, NextResponse } from 'next/server';

interface SubmitUrlsRequest {
  urls: string[];
  keyLocation?: string;
}

/**
 * Submit URLs to IndexNow for immediate indexing
 * 
 * POST /api/indexnow/submit
 * Body: { urls: string[], keyLocation?: string }
 * 
 * Example:
 * {
 *   "urls": [
 *     "https://example.com/page1",
 *     "https://example.com/page2"
 *   ],
 *   "keyLocation": "https://example.com/f1300c4472f44e86b1455c5ab97e52a1.txt"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SubmitUrlsRequest;
    const { urls, keyLocation } = body;

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (urls.length > 10000) {
      return NextResponse.json(
        { error: 'Maximum 10,000 URLs per request allowed' },
        { status: 400 }
      );
    }

    // Validate each URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    for (const url of urls) {
      if (!isValidIndexNowUrl(url, siteUrl)) {
        return NextResponse.json(
          { error: `Invalid URL: ${url}. Only HTTPS URLs from your domain are accepted.` },
          { status: 400 }
        );
      }
    }

    // Submit URLs to IndexNow
    const result = await submitUrlsToIndexNow(urls, { keyLocation });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          urlCount: urls.length,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          statusCode: result.statusCode,
        },
        { status: result.statusCode }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing/documentation
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      documentation: 'POST /api/indexnow/submit',
      description: 'Submit URLs to IndexNow for immediate search engine indexing',
      example: {
        urls: [
          'https://yoursite.com/page1',
          'https://yoursite.com/page2',
        ],
        keyLocation:
          'https://yoursite.com/f1300c4472f44e86b1455c5ab97e52a1.txt (optional)',
      },
      requirements: {
        INDEXNOW_API_KEY: 'Must be set in environment variables',
        NEXT_PUBLIC_SITE_URL: 'Must be set in environment variables',
      },
    },
    { status: 200 }
  );
}
