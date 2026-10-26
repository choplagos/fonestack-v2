import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

type SeoMetadataInput = {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}

export function createSeoMetadata({
  title,
  description,
  path,
  type = 'website',
}: SeoMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString()
  const image = {
    url: `${SITE_URL}/og-image.png`,
    width: 1200,
    height: 630,
    alt: 'Fonestack phones and services in Computer Village, Ikeja, Lagos',
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: 'en_NG',
      url,
      title,
      description,
      siteName: 'Fonestack',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@fonestack',
      site: '@fonestack',
      images: [image],
    },
  }
}
