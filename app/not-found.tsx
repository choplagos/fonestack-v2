import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found | Fonestack',
  description: 'This page could not be found. Browse Fonestack phones or read phone guides for Lagos.',
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    title: 'Page Not Found | Fonestack',
    description: 'Browse Fonestack phones or read phone guides for Lagos.',
    siteName: 'Fonestack',
  },
  twitter: {
    card: 'summary',
    title: 'Page Not Found | Fonestack',
    description: 'Browse Fonestack phones or read phone guides for Lagos.',
  },
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-obsidian-900 text-white p-4">
      <div className="text-center liquid-glass p-12 rounded-3xl max-w-md">
        <div className="text-8xl font-display font-black text-premiumYellow mb-4" aria-hidden="true">
          404
        </div>
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/#products"
            className="inline-flex items-center justify-center bg-premiumYellow text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Browse phones
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center liquid-glass px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </main>
  )
}
