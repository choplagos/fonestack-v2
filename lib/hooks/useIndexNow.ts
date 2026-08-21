import { useState } from 'react';

interface UseIndexNowOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface SubmitUrlsResult {
  success: boolean;
  message: string;
  urlCount?: number;
  statusCode?: number;
}

/**
 * React hook for submitting URLs to IndexNow
 * 
 * Usage:
 * const { submitUrls, loading, error, success } = useIndexNow();
 * 
 * // Submit URLs
 * submitUrls(['https://example.com/page1', 'https://example.com/page2']);
 */
export function useIndexNow(options?: UseIndexNowOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitUrls = async (urls: string[], keyLocation?: string): Promise<SubmitUrlsResult> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/indexnow/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          keyLocation,
        }),
      });

      const data = (await response.json()) as SubmitUrlsResult;

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to submit URLs to IndexNow';
        setError(errorMessage);
        options?.onError?.(errorMessage);

        return {
          success: false,
          message: errorMessage,
          statusCode: response.status,
        };
      }

      setSuccess(true);
      options?.onSuccess?.(data.message);

      return {
        success: true,
        message: data.message,
        urlCount: data.urlCount,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      options?.onError?.(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    submitUrls,
    loading,
    error,
    success,
    reset,
  };
}
