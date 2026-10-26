import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blogPosts";

const CONTENT_UPDATED_AT = new Date('2026-10-25T00:00:00.000Z')
const pages = [
  { path: '/', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/budget-smartphone-students-nigeria', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/buy-android-phone-ikeja-cheap', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/fairly-used-iphone-price-computer-village', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/phone-screen-repair-ikeja-price', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/trade-in-old-phone-lagos', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/sell-my-phone-computer-village', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/iphone-battery-replacement-ikeja', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/bnpl', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/easy-buy-phone-financing-lagos', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
      url: new URL(page.path, SITE_URL).toString(),
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))

  const articleEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: new URL(`/blog/${post.slug}`, SITE_URL).toString(),
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...pageEntries, ...articleEntries]
}
