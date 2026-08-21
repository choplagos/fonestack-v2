import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { submitUrlsToIndexNow } from "@/lib/indexnow";

const slugs = [
  '',
  'blog',
  'fairly-used-iphone-price-computer-village',
  'buy-android-phone-ikeja-cheap',
  'phone-screen-repair-ikeja-price',
  'trade-in-old-phone-lagos',
  'budget-smartphone-students-nigeria',
  'sell-my-phone-computer-village',
  'iphone-battery-replacement-ikeja',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  
  const sitemapEntries: MetadataRoute.Sitemap = slugs.map((slug) => {
    const url = `${SITE_URL}${slug ? `/${slug}` : '/'}`;
    return {
      url,
      lastModified,
      changeFrequency: slug === '' ? 'daily' : 'weekly',
      priority: slug === '' ? 1.0 : 0.8,
    };
  });

  // Submit all URLs to IndexNow for immediate indexing
  if (sitemapEntries.length > 0) {
    try {
      const urls = sitemapEntries.map((entry) => entry.url);
      await submitUrlsToIndexNow(urls).catch((error) => {
        // Log but don't fail sitemap generation
        console.warn('IndexNow submission failed (non-blocking):', error instanceof Error ? error.message : error);
      });
    } catch (error) {
      console.warn('Failed to submit URLs to IndexNow:', error instanceof Error ? error.message : error);
    }
  }

  return sitemapEntries;
}

