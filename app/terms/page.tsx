import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using the Fonestack website, product listings, repair enquiries, and trade-in estimates.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    type: 'website',
    title: 'Terms of Service | Fonestack',
    description: 'Terms for using the Fonestack website, product listings, repair enquiries, and trade-in estimates.',
    url: `${SITE_URL}/terms`,
    siteName: 'Fonestack',
    images: [{ url: '/og-image.png', alt: 'Fonestack' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Fonestack',
    description: 'Terms for using the Fonestack website, product listings, repair enquiries, and trade-in estimates.',
    creator: '@fonestack',
    site: '@fonestack',
    images: ['/og-image.png'],
  },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <article className="mx-auto max-w-3xl space-y-8 text-gray-300">
        <header>
          <h1 className="text-3xl font-bold text-lime-400 md:text-4xl">Terms of Service</h1>
          <p className="mt-3">Last updated: October 22, 2026</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-white">Using this website</h2>
          <p className="mt-3 leading-7">
            By using this website, you agree to use it lawfully and not interfere with its operation, security, or
            other users. Website content is provided for general information and may change without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Products and prices</h2>
          <p className="mt-3 leading-7">
            Product descriptions, images, prices, and availability are provided as a guide and can change as stock is
            updated. An online listing is not a final order confirmation. We will confirm the device, condition,
            included accessories, price, and applicable warranty before completing a sale. For fairly used devices,
            condition and battery performance can vary and should be checked before purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Repairs and trade-in estimates</h2>
          <p className="mt-3 leading-7">
            Repair requests submitted through the website open a WhatsApp conversation; they are not a confirmed
            booking or final price. Diagnosis, parts availability, repair cost, and any warranty will be confirmed
            before work begins. Trade-in estimates are indicative only, based on the information provided and
            available catalogue data. A final offer depends on in-person inspection and confirmation by Fonestack.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Financing and third-party services</h2>
          <p className="mt-3 leading-7">
            Any financing information is subject to the finance provider’s eligibility checks, approval, and final
            terms. Fonestack does not guarantee an application will be approved. Third-party services and links are
            governed by their providers’ own terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Website content and availability</h2>
          <p className="mt-3 leading-7">
            Text, branding, and other materials on this website belong to Fonestack or their respective owners.
            You may not reproduce or commercially exploit them without permission. We work to keep the website
            available and accurate but do not guarantee uninterrupted access or that every listing is error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Liability and changes</h2>
          <p className="mt-3 leading-7">
            To the extent permitted by applicable law, Fonestack is not responsible for indirect loss arising from
            reliance on general website information or temporary website unavailability. Nothing in these terms
            limits rights that cannot lawfully be excluded. We may update these terms by publishing a revised version
            here. Continued use after a change means you accept the updated terms.
          </p>
        </section>

        <p className="leading-7">
          Questions about these terms? Contact us through the <a className="text-lime-400 underline" href="/contact">contact page</a>.
        </p>
      </article>
    </main>
  )
}
