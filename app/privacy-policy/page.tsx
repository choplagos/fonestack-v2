import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Fonestack handles information, cookies, and third-party services when you use our website.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    type: 'website',
    title: 'Privacy Policy | Fonestack',
    description: 'How Fonestack handles information, cookies, and third-party services when you use our website.',
    url: `${SITE_URL}/privacy-policy`,
    siteName: 'Fonestack',
    images: [{ url: '/og-image.png', alt: 'Fonestack' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Fonestack',
    description: 'How Fonestack handles information, cookies, and third-party services when you use our website.',
    creator: '@fonestack',
    site: '@fonestack',
    images: ['/og-image.png'],
  },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <article className="mx-auto max-w-3xl space-y-8 text-gray-300">
        <header>
          <h1 className="text-3xl font-bold text-lime-400 md:text-4xl">Privacy Policy</h1>
          <p className="mt-3">Last updated: October 27, 2026</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-white">Information we handle</h2>
          <p className="mt-3 leading-7">
            We handle information you choose to provide when contacting us or requesting a service. A repair enquiry
            prepared on this site includes your name and device model and is sent to WhatsApp only if you choose to
            submit it. A trade-in estimate request asks for your name, phone number, device details, condition, and
            accessories; that information is sent to Fonestack and stored in our service database so we can prepare
            the estimate and follow up.
          </p>
          <p className="mt-3 leading-7">
            The website also requests product catalogue information from our database so we can display current
            listings. Our hosting and service providers may process technical information such as browser, device,
            request, and security data to operate and protect the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">How we use information</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>To answer enquiries, prepare trade-in estimates, and provide requested products or services.</li>
            <li>To maintain the catalogue, troubleshoot problems, and protect the website from misuse.</li>
            <li>To meet record-keeping obligations and resolve service or transaction issues.</li>
          </ul>
          <p className="mt-3 leading-7">
            We retain enquiry and transaction information for as long as it is needed for these purposes and any
            applicable legal obligations, then delete or securely dispose of it where practicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Cookies, local storage, and advertising</h2>
          <p className="mt-3 leading-7">
            The site uses browser storage to remember display preferences such as your selected theme. We do not
            currently use a first-party analytics cookie. If Google AdSense is enabled for this site, Google and its
            partners may use cookies or similar technologies to provide, measure, and personalize advertising, subject
            to your settings and applicable Google policies. You can manage cookies through your browser and review
            Google’s advertising controls and privacy information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Service providers and external links</h2>
          <p className="mt-3 leading-7">
            We use service providers, including Supabase for database services and WhatsApp when you choose to contact
            us there. Google may process information if advertising is enabled. These providers handle information
            under their own terms and privacy notices. Links to third-party sites are not controlled by Fonestack.
          </p>
          <p className="mt-3 leading-7">
            We use PostHog for website analytics and session recordings. Input values are masked, text marked as
            sensitive is masked, and the repair and trade-in forms are excluded from recordings. Analytics events do
            not include submitted names, phone numbers, email addresses, or IMEIs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Your choices and contact</h2>
          <p className="mt-3 leading-7">
            You can choose not to submit an enquiry and can manage browser storage and advertising preferences using
            the controls offered by your browser or the relevant provider. To ask about, correct, or request deletion
            of personal information you submitted to Fonestack, contact us at{' '}
            <a className="text-lime-400 underline" href="mailto:info@fonestack.com">info@fonestack.com</a>.
            We may need to verify your request and retain information where the law requires it.
          </p>
        </section>

        <p className="leading-7">
          We may update this policy when our practices or legal requirements change. The current version will be
          published on this page. For questions about this policy, use our <a className="text-lime-400 underline" href="/contact">contact page</a>.
        </p>
      </article>
    </main>
  )
}
