import type { Metadata } from 'next'
import Link from 'next/link'
import { createSeoMetadata } from '@/lib/seoMetadata'
import { SITE_URL } from '@/lib/constants'

const title = 'How to Run a Free Phone Diagnostic Test | Fonestack'
const description =
  'Learn how to check your phone screen, touch, speakers, microphone, cameras, motion sensors and vibration with Fonestack’s free browser-based diagnostic.'
const canonical = `${SITE_URL}/plan`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/plan',
  type: 'article',
})

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${canonical}#article`,
  headline: title,
  description,
  url: canonical,
  datePublished: '2026-10-26',
  dateModified: '2026-10-26',
  mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  author: { '@type': 'Organization', name: 'Fonestack', url: SITE_URL },
  publisher: { '@type': 'Organization', name: 'Fonestack', url: SITE_URL },
}

export default function PhoneDiagnosticGuidePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog">Phone guides</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Phone diagnostic guide</li>
          </ol>
        </nav>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
        />
        <header className="mt-8 border-b border-white/10 pb-8">
          <h1 className="text-3xl font-bold leading-tight text-lime-400 md:text-4xl">{title}</h1>
          <p className="mt-4 text-lg leading-8 text-gray-300">{description}</p>
          <time className="mt-4 block text-sm text-gray-500" dateTime="2026-10-26">Published October 26, 2026</time>
        </header>

        <div className="space-y-8 py-8 text-base leading-8 text-gray-300">
          <section aria-labelledby="before-test">
            <h2 id="before-test" className="text-2xl font-semibold text-white">Before you start</h2>
            <p className="mt-3">
              Open the diagnostic on the phone you want to check. Use a quiet, well-lit place, turn the volume up to
              a comfortable level, and keep the phone nearby while you work through the checks. The test runs in your
              browser and asks you to report what you observe; it is a quick self-check, not a certified hardware report.
            </p>
            <Link href="/diagnose" className="mt-5 inline-flex rounded-xl bg-lime-400 px-6 py-4 font-bold text-black">
              Start the free phone diagnostic
            </Link>
          </section>

          <section aria-labelledby="what-is-tested">
            <h2 id="what-is-tested" className="text-2xl font-semibold text-white">What the diagnostic checks</h2>
            <ul className="mt-3 list-disc space-y-3 pl-6">
              <li><strong className="text-white">Screen and touch:</strong> cycle through solid colors to spot visible pixels or discoloration, then tap or swipe every touchscreen square.</li>
              <li><strong className="text-white">Speaker:</strong> play tones through the left, right and both audio channels and listen for clear sound.</li>
              <li><strong className="text-white">Microphone:</strong> allow browser access and speak to see whether the live input meter responds.</li>
              <li><strong className="text-white">Cameras:</strong> grant permission and preview the front and back camera where available.</li>
              <li><strong className="text-white">Motion and vibration:</strong> allow motion sensor access when prompted, move the phone, and try a short vibration.</li>
            </ul>
          </section>

          <section aria-labelledby="permissions">
            <h2 id="permissions" className="text-2xl font-semibold text-white">Permissions and device support</h2>
            <p className="mt-3">
              Your browser may ask for microphone, camera, or motion permission. Grant only the permissions you are
              comfortable with; you can skip a check. Camera and microphone access usually requires a secure HTTPS
              connection, and some browsers or devices do not support every sensor or vibration feature.
            </p>
            <p className="mt-3">
              The diagnostic shows when a feature is unsupported. It does not repair hardware, read hidden device
              diagnostics, or confirm that every component is healthy.
            </p>
          </section>

          <section aria-labelledby="understand-results">
            <h2 id="understand-results" className="text-2xl font-semibold text-white">How to use your results</h2>
            <p className="mt-3">
              Mark each check as working, a problem, or skipped based on what you observed. A passing result means
              that the feature appeared to work during this quick check; it is not a guarantee against intermittent
              or future faults. If you find an issue, note what happened and arrange a hands-on inspection before
              relying on the phone for important tasks.
            </p>
            <p className="mt-3">
              For a broader pre-purchase checklist, see{' '}
              <Link href="/blog/how-to-check-a-used-phone-before-buying-nigeria" className="text-lime-400 underline">
                how to check a used phone before buying in Nigeria
              </Link>.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-white/10 pt-6">
          <Link href="/diagnose" className="rounded-xl bg-lime-400 px-6 py-4 font-bold text-black">Run the phone check</Link>
          <Link href="/contact" className="rounded-xl border border-white/15 px-6 py-4 font-bold text-white">Book a repair</Link>
          <Link href="/blog" className="self-center text-lime-400 underline">Browse all phone guides</Link>
        </div>
      </article>
    </main>
  )
}
