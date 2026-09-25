import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { submitUrlsToIndexNow } from "@/lib/indexnow";

const pageData = [
  {
    slug: '',
    images: [
      { url: '/og-image.png', title: 'Fonestack - Premium Phones & Repairs', caption: 'Professional phone sales and repair services in Lagos' },
      { url: '/logo.png', title: 'Fonestack Logo', caption: 'Fonestack brand logo' },
    ],
    priority: 1.0,
    changeFrequency: 'daily' as const,
  },
  {
    slug: 'blog',
    images: [
      { url: '/og-image.png', title: 'Fonestack Blog', caption: 'Latest updates on phones and repair services' },
    ],
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'fairly-used-iphone-price-computer-village',
    images: [
      { url: '/og-image.png', title: 'Fairly Used iPhone Price - Computer Village', caption: 'Affordable used iPhones in Computer Village, Ikeja' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'buy-android-phone-ikeja-cheap',
    images: [
      { url: '/og-image.png', title: 'Buy Android Phone Cheap in Ikeja', caption: 'Best prices on Android phones in Ikeja, Lagos' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'phone-screen-repair-ikeja-price',
    images: [
      { url: '/og-image.png', title: 'Phone Screen Repair - Ikeja Price', caption: 'Professional phone screen repair services in Ikeja' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'trade-in-old-phone-lagos',
    images: [
      { url: '/og-image.png', title: 'Trade In Old Phone - Lagos', caption: 'Get instant value for your old phone in Lagos' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'budget-smartphone-students-nigeria',
    images: [
      { url: '/og-image.png', title: 'Budget Smartphone for Students - Nigeria', caption: 'Affordable smartphones designed for students in Nigeria' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'sell-my-phone-computer-village',
    images: [
      { url: '/og-image.png', title: 'Sell My Phone - Computer Village', caption: 'Quick and fair evaluation of your phone in Computer Village' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'bnpl',
    images: [
      { url: '/og-image.png', title: 'Buy Now, Pay Later Phones in Lagos', caption: 'Phone financing requirements through CreditDirect and Fonestack' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'easy-buy-phone-financing-lagos',
    images: [
      { url: '/og-image.png', title: 'Easy Buy Phone Financing in Lagos', caption: 'Fonestack Easy Buy BNPL requirements and down payment guide' },
    ],
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    slug: 'iphone-battery-replacement-ikeja',
    images: [
      { url: '/og-image.png', title: 'iPhone Battery Replacement - Ikeja', caption: 'Professional iPhone battery replacement in Ikeja' },
    ],
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    slug: 'admin',
    images: [],
    priority: 0.3,
    changeFrequency: 'monthly' as const,
  },
  {
    slug: 'invoice',
    images: [],
    priority: 0.3,
    changeFrequency: 'monthly' as const,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  
  const sitemapEntries: MetadataRoute.Sitemap = pageData.map((page) => {
    const url = `${SITE_URL}${page.slug ? `/${page.slug}` : '/'}`;
    
    const entry: any = {
      url,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    };

    if (page.images.length > 0) {
      entry.images = page.images.map(img => ({
        url: `${SITE_URL}${img.url}`,
        title: img.title,
        caption: img.caption,
      }));
    }

    return entry;
  });

  // Submit all URLs to IndexNow for immediate indexing
  if (sitemapEntries.length > 0) {
    try {
      const urls = sitemapEntries.map((entry) => entry.url);
      await submitUrlsToIndexNow(urls).catch((error) => {
        console.warn('IndexNow submission failed (non-blocking):', error instanceof Error ? error.message : error);
      });
    } catch (error) {
      console.warn('Failed to submit URLs to IndexNow:', error instanceof Error ? error.message : error);
    }
  }

  return sitemapEntries;
}
