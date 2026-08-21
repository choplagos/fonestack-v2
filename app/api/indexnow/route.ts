import { getIndexNowKeyFileContent } from '@/lib/indexnow';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Serves the IndexNow API key file
 * 
 * Access at: https://yourdomain.com/[INDEXNOW_API_KEY].txt
 * The API key must be dynamically retrieved from environment variables
 */
export async function GET(): Promise<NextResponse> {
  try {
    const keyContent = getIndexNowKeyFileContent();
    
    return new NextResponse(keyContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
