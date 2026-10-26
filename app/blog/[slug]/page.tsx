import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS } from '@/lib/blogPosts'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

export const dynamicParams = false

export function generateStaticParams() {
  return BLOG_POSTS.map(({ slug }) => ({ slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = BLOG_POSTS.find(({ slug }) => slug === params.slug)
  if (!post) return {}

  return createSeoMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
  })
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(({ slug }) => slug === params.slug)
  if (!post) notFound()

  const canonical = `${SITE_URL}/blog/${post.slug}`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: post.title,
    description: post.description,
    url: canonical,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    image: [`${SITE_URL}/og-image.png`],
    author: { '@type': 'Organization', name: 'Fonestack', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Fonestack',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Phone guides', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog">Phone guides</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>
        <header className="mt-8 border-b border-white/10 pb-8">
          <h1 className="mt-3 text-3xl font-bold leading-tight text-lime-400 md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">{post.description}</p>
          <p className="mt-4 text-sm leading-6 text-gray-400">
            By Fonestack. Fonestack is a phone retail, repair and trade-in shop in Computer Village, Ikeja.{' '}
            <Link href="/contact" className="text-lime-400 underline">Contact the shop</Link>.
          </p>
          <time className="mt-4 block text-sm text-gray-500" dateTime={post.publishedAt}>
            Published {new Date(`${post.publishedAt}T00:00:00Z`).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            })}
          </time>
        </header>

        <div className="space-y-10 py-8">
          {post.sections.map((section, index) => (
            <section key={section.heading} aria-labelledby={`section-${index}-heading`}>
              <h2 id={`section-${index}-heading`} className="text-2xl font-semibold text-white">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-gray-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <nav className="mt-6 border-t border-white/10 pt-8" aria-label="Related shop and service pages">
          <h2 className="text-xl font-semibold text-lime-400">Related pages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {post.relatedPages.map((page) => (
              <li key={page.href}><Link className="text-lime-400 underline" href={page.href}>{page.label}</Link></li>
            ))}
          </ul>
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <>
              <h2 className="mt-6 text-xl font-semibold text-lime-400">Related guides</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                {post.relatedPosts.map((relatedPost) => (
                  <li key={relatedPost.slug}>
                    <Link className="text-lime-400 underline" href={`/blog/${relatedPost.slug}`}>
                      {relatedPost.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link href="/blog" className="mt-5 inline-block text-lime-400 underline">Browse all phone guides</Link>
        </nav>
      </article>
    </main>
  )
}
