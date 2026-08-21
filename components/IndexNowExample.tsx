/**
 * Example IndexNow Component
 * 
 * Demonstrates how to integrate IndexNow URL submission into your application
 */

'use client';

import { useIndexNow } from '@/lib/hooks/useIndexNow';
import { useState } from 'react';

interface IndexNowExampleProps {
  urls?: string[];
}

export function IndexNowExample({ urls = [] }: IndexNowExampleProps) {
  const { submitUrls, loading, error, success } = useIndexNow({
    onSuccess: (message) => {
      console.log('✓ IndexNow:', message);
    },
    onError: (error) => {
      console.error('✗ IndexNow Error:', error);
    },
  });

  const [customUrls, setCustomUrls] = useState<string>(urls.join('\n'));
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async () => {
    const urlList = customUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      setMessage('Please enter at least one URL');
      return;
    }

    const result = await submitUrls(urlList);

    if (result.success) {
      setMessage(`✓ Successfully submitted ${result.urlCount} URL(s) to IndexNow`);
      setCustomUrls('');
    } else {
      setMessage(`✗ Error: ${result.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">IndexNow URL Submission</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URLs to Submit (one per line)
        </label>
        <textarea
          value={customUrls}
          onChange={(e) => setCustomUrls(e.target.value)}
          placeholder="https://yourdomain.com/page1&#10;https://yourdomain.com/page2"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit to IndexNow'}
      </button>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            success
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
          Error: {error}
        </div>
      )}

      {success && !message && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-md">
          URLs submitted successfully!
        </div>
      )}
    </div>
  );
}

/**
 * Server-side example: Submit URLs after creating content
 * 
 * Example usage in a Server Action:
 * 
 * 'use server';
 * 
 * import { submitUrlToIndexNow } from '@/lib/indexnow';
 * 
 * export async function createAndIndexPost(postData) {
 *   // Create the post
 *   const post = await db.posts.create(postData);
 *   
 *   // Notify IndexNow about the new URL
 *   try {
 *     const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`;
 *     await submitUrlToIndexNow(postUrl);
 *   } catch (error) {
 *     console.error('Failed to submit to IndexNow:', error);
 *     // Don't fail the post creation if IndexNow fails
 *   }
 *   
 *   return post;
 * }
 */
