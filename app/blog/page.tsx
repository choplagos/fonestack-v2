import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/constants'
import { BLOG_POSTS } from '@/lib/blogPosts'
import { createSeoMetadata } from '@/lib/seoMetadata'

export const metadata: Metadata = createSeoMetadata({
  title: 'Phone Guides for Lagos | Fonestack',
  description:
    'Practical phone buying, repair and trade-in guides from Fonestack in Ikeja, Lagos. Compare checks, learn what to confirm and contact the shop.',
  path: '/blog',
})

const shopPages = [
  { href: '/budget-smartphone-students-nigeria', label: 'Budget phones for students in Nigeria' },
  { href: '/buy-android-phone-ikeja-cheap', label: 'Buying an Android phone in Ikeja' },
  { href: '/fairly-used-iphone-price-computer-village', label: 'Buying a fairly used iPhone' },
  { href: '/phone-screen-repair-ikeja-price', label: 'Phone screen repair in Ikeja' },
  { href: '/iphone-battery-replacement-ikeja', label: 'iPhone battery repair in Ikeja' },
  { href: '/trade-in-old-phone-lagos', label: 'Trading in an old phone in Lagos' },
  { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
]

export default function BlogPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Phone guides', item: `${SITE_URL}/blog` },
    ],
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
          <ol className="flex gap-2">
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Phone guides</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-lime-400 md:text-4xl">Phone buying, repair and trade-in guides</h1>
        <p className="mt-3 max-w-3xl leading-7 text-gray-300">
          Practical checklists for people choosing or caring for a phone in Lagos. Confirm current prices, stock and
          service terms directly with a shop because these details can change.
        </p>

        <section className="mt-10" aria-labelledby="articles-heading">
          <h2 id="articles-heading" className="text-2xl font-semibold text-white">Articles</h2>
          {BLOG_POSTS.length ? (
            <ul className="mt-4 space-y-4">
              {BLOG_POSTS.map((post) => (
                <li key={post.slug} className="rounded-xl border border-lime-400/10 p-5">
                  <Link href={`/blog/${post.slug}`} className="text-lg font-semibold text-lime-400 underline">
                    {post.title}
                  </Link>
                  <p className="mt-2 text-gray-300">{post.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-gray-300">New guides will be added here.</p>
          )}
        </section>

        <section className="mt-12" aria-labelledby="shop-pages-heading">
          <h2 id="shop-pages-heading" className="text-2xl font-semibold text-white">Shop and service pages</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {shopPages.map((page) => (
              <li key={page.href} className="rounded-xl border border-white/10 p-4">
                <Link href={page.href} className="text-lime-400 underline">{page.label}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-5">
            <Link href="/" className="text-lime-400 underline">Browse phones and contact Fonestack</Link>
          </p>
        </section>
      </div>
    </main>
  )
}
