/**
 * IndexNow API Integration
 * 
 * Submit URLs to search engines (Bing, Yandex) for immediate indexing
 * Documentation: https://www.indexnow.org/
 */

const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/IndexNow';

interface IndexNowRequest {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

interface IndexNowResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(
  url: string,
  options?: { keyLocation?: string }
): Promise<IndexNowResponse> {
  const apiKey = process.env.INDEXNOW_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey) {
    throw new Error('INDEXNOW_API_KEY environment variable is not set');
  }

  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not set');
  }

  const urlObject = new URL(url);
  const hostUrl = new URL(siteUrl);
  const host = urlObject.hostname;

  if (host !== hostUrl.hostname) {
    throw new Error(`URL domain (${host}) does not match site domain (${hostUrl.hostname})`);
  }

  const keyLocation = options?.keyLocation || `${siteUrl}/${apiKey}.txt`;

  return submitUrlsToIndexNow([url], { keyLocation });
}

/**
 * Submit multiple URLs to IndexNow
 */
export async function submitUrlsToIndexNow(
  urls: string[],
  options?: { keyLocation?: string }
): Promise<IndexNowResponse> {
  const apiKey = process.env.INDEXNOW_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey) {
    throw new Error('INDEXNOW_API_KEY environment variable is not set');
  }

  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not set');
  }

  const hostUrl = new URL(siteUrl);
  const host = hostUrl.hostname;
  const keyLocation = options?.keyLocation || `${siteUrl}/${apiKey}.txt`;

  // Validate all URLs belong to the same host
  for (const url of urls) {
    const urlObject = new URL(url);
    if (urlObject.hostname !== host) {
      throw new Error(
        `URL domain (${urlObject.hostname}) does not match site domain (${host})`
      );
    }
  }

  const payload: IndexNowRequest = {
    host,
    key: apiKey,
    keyLocation,
    urlList: urls,
  };

  try {
    const response = await fetch(INDEXNOW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const statusCode = response.status;

    if (response.ok) {
      return {
        success: true,
        statusCode,
        message: 'URLs submitted successfully to IndexNow',
      };
    }

    let errorMessage = 'Failed to submit URLs to IndexNow';

    switch (statusCode) {
      case 400:
        errorMessage = 'Bad request: Invalid format';
        break;
      case 403:
        errorMessage = 'Forbidden: API key not valid or key file not found';
        break;
      case 422:
        errorMessage = 'Unprocessable Entity: URLs do not belong to the host or schema mismatch';
        break;
      case 429:
        errorMessage = 'Too Many Requests: Rate limited (potential spam)';
        break;
      default:
        errorMessage = `HTTP ${statusCode}: ${response.statusText}`;
    }

    return {
      success: false,
      statusCode,
      message: errorMessage,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to submit URLs to IndexNow: ${errorMessage}`);
  }
}

/**
 * Get the IndexNow key file content
 * This should be hosted at your domain root or at a custom location
 */
export function getIndexNowKeyFileContent(): string {
  const apiKey = process.env.INDEXNOW_API_KEY;

  if (!apiKey) {
    throw new Error('INDEXNOW_API_KEY environment variable is not set');
  }

  return apiKey;
}

/**
 * Validate if a URL is eligible for IndexNow submission
 */
export function isValidIndexNowUrl(url: string, expectedHost?: string): boolean {
  try {
    const urlObject = new URL(url);

    // Only accept HTTPS URLs
    if (urlObject.protocol !== 'https:') {
      return false;
    }

    // Check if host matches (if expectedHost is provided)
    if (expectedHost) {
      const expectedHostUrl = new URL(expectedHost);
      if (urlObject.hostname !== expectedHostUrl.hostname) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
