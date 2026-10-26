import type { Metadata } from 'next'
import AdminLayoutClient from '@/components/AdminLayoutClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Fonestack',
  alternates: { canonical: '/admin' },
  openGraph: {
    type: 'website',
    title: 'Fonestack Admin Dashboard',
    description: 'Private administration page for Fonestack.',
    url: 'https://www.fonestack.com.ng/admin',
  },
  twitter: {
    card: 'summary',
    title: 'Fonestack Admin Dashboard',
    description: 'Private administration page for Fonestack.',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
