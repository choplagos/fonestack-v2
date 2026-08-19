import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return slugs.map((slug) => {
    const url = `${SITE_URL}${slug ? `/${slug}` : '/'}`;
    return {
      url,
      changeFrequency: slug === '' ? 'daily' : 'weekly',
      priority: slug === '' ? 1.0 : 0.8,
    };
  });
}

