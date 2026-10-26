import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const id = encodeURIComponent(params.id)
  return {
    ...createSeoMetadata({
      title: `Invoice ${params.id.slice(0, 20)} | Fonestack`,
      description: 'Private invoice page for Fonestack customers.',
      path: `/invoice/${id}`,
    }),
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title: `Invoice ${params.id.slice(0, 20)} | Fonestack`,
      description: 'Private invoice page for Fonestack customers.',
      url: `${SITE_URL}/invoice/${id}`,
    },
    twitter: {
      card: 'summary',
      title: `Invoice ${params.id.slice(0, 20)} | Fonestack`,
      description: 'Private invoice page for Fonestack customers.',
    },
  }
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return children
}
