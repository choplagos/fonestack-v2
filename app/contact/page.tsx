import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Mail, MessageCircle, Phone } from 'lucide-react'
import { GOOGLE_BUSINESS_PROFILE_URL, SITE_URL, WHATSAPP_LINK, WHATSAPP_NUMBER } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

export const metadata: Metadata = createSeoMetadata({
  title: 'Contact Fonestack in Ikeja',
  description: 'Contact Fonestack in Computer Village, Ikeja, Lagos about phone availability, repairs, trade-ins or an order.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
          <ol className="flex gap-2">
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Contact</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-lime-400 md:text-4xl">Contact Fonestack</h1>
        <p className="mt-4 max-w-2xl leading-7 text-gray-300">
          Talk to our team about phone availability, repairs, trade-ins, or a current order. Our shop is in Computer
          Village, Ikeja, Lagos.
        </p>

        <address className="mt-8 grid gap-4 not-italic sm:grid-cols-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-xl border border-white/10 p-5 text-gray-200 transition-colors hover:border-lime-400/50"
          >
            <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-lime-400" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-white">WhatsApp</span>
              <span className="mt-1 block">+{WHATSAPP_NUMBER}</span>
            </span>
          </a>

          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="flex items-start gap-4 rounded-xl border border-white/10 p-5 text-gray-200 transition-colors hover:border-lime-400/50"
          >
            <Phone className="mt-1 h-5 w-5 shrink-0 text-lime-400" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-white">Call</span>
              <span className="mt-1 block">+{WHATSAPP_NUMBER}</span>
            </span>
          </a>

          <a
            href="mailto:info@fonestack.com"
            className="flex items-start gap-4 rounded-xl border border-white/10 p-5 text-gray-200 transition-colors hover:border-lime-400/50"
          >
            <Mail className="mt-1 h-5 w-5 shrink-0 text-lime-400" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-white">Email</span>
              <span className="mt-1 block">info@fonestack.com</span>
            </span>
          </a>

          <a
            href={GOOGLE_BUSINESS_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-xl border border-white/10 p-5 text-gray-200 transition-colors hover:border-lime-400/50"
          >
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-lime-400" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-white">Visit or get directions</span>
              <span className="mt-1 block">Computer Village, Ikeja, Lagos</span>
            </span>
          </a>
        </address>

        <p className="mt-8 text-sm leading-6 text-gray-400">
          For privacy questions or requests about information you submitted, email{' '}
          <a className="text-lime-400 underline" href="mailto:info@fonestack.com">info@fonestack.com</a>.
          See our <a className="text-lime-400 underline" href={`${SITE_URL}/privacy-policy`}>Privacy Policy</a>.
        </p>
      </div>
    </main>
  )
}
