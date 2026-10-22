import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

export default function Page() {
  return <HomePage />
}
