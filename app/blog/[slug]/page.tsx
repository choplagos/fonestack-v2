import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS } from '@/lib/blogPosts'
import { SITE_URL } from '@/lib/constants'

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

  const canonical = `${SITE_URL}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: '/og-image.png', alt: 'Fonestack phone buying guide' }],
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(({ slug }) => slug === params.slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm text-lime-400 underline">
          Back to all guides
        </Link>
        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-sm text-gray-400">Phone buying guide</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-lime-400 md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">{post.description}</p>
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
      </article>
    </main>
  )
}
