import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminLayoutClient from '@/components/AdminLayoutClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Fonestack',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">Loading admin…</div>}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  )
}
