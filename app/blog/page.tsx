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

const phoneGuides = [
  { href: '/fairly-used-iphone-price-computer-village', label: 'Fairly used iPhone prices in Computer Village' },
  { href: '/buy-android-phone-ikeja-cheap', label: 'Buying an Android phone in Ikeja' },
  { href: '/phone-screen-repair-ikeja-price', label: 'Phone screen repair prices in Ikeja' },
  { href: '/trade-in-old-phone-lagos', label: 'Trading in an old phone in Lagos' },
  { href: '/budget-smartphone-students-nigeria', label: 'Budget smartphones for students in Nigeria' },
  { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
  { href: '/iphone-battery-replacement-ikeja', label: 'iPhone battery replacement in Ikeja' },
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Phone diagnostic">
          <div className="rounded-xl border border-lime-400/30 bg-lime-400/5 p-5">
            <h2 className="text-xl font-semibold text-white">Check your phone for free</h2>
            <p className="mt-2 leading-6 text-gray-300">
              Test the screen, touchscreen, speakers, microphone, cameras and motion sensors from your phone browser.
            </p>
            <Link href="/diagnose" className="mt-4 inline-block rounded-lg bg-lime-400 px-5 py-3 font-bold text-black">
              Start the phone check
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 p-5">
            <h2 className="text-xl font-semibold text-white">How the phone check works</h2>
            <p className="mt-2 leading-6 text-gray-300">
              Read what each test checks and what the results can—and cannot—tell you.
            </p>
            <Link href="/plan" className="mt-4 inline-block text-lime-400 underline">
              Read the diagnostic guide
            </Link>
          </div>
        </section>

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

        <section className="mt-12" aria-labelledby="phone-guides-heading">
          <h2 id="phone-guides-heading" className="text-2xl font-semibold text-white">More phone buying and service guides</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {phoneGuides.map((guide) => (
              <li key={guide.href} className="rounded-xl border border-white/10 p-4">
                <Link href={guide.href} className="text-lime-400 underline">{guide.label}</Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </main>
  )
}
