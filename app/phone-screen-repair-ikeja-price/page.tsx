import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Phone Screen Repair in Ikeja'
const description =
  'What to do when a phone screen breaks in Ikeja: protect your data, request a diagnosis and compare repair and part terms before authorizing work.'
const canonicalUrl = `${SITE_URL}/phone-screen-repair-ikeja-price`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/phone-screen-repair-ikeja-price',
})

const faqs: FAQ[] = [
  {
    question: 'How is a phone screen repair quote determined?',
    answer:
      'The device model, damage and replacement part affect the quote. Ask for a diagnosis and a written estimate for your exact phone before authorizing the repair.',
  },
  {
    question: 'What should I ask before approving a screen replacement?',
    answer:
      'Ask what part will be used, what the repair includes, how your data will be handled, how long the work is expected to take, and whether any written warranty applies.',
  },
  {
    question: 'Should I back up my phone before repair?',
    answer:
      'Back up important information if you can. Do not share account passwords, banking credentials, PINs or verification codes as part of a repair request.',
  },
]

const sections: Section[] = [
  {
    heading: 'Check the damage before seeking a quote',
    content: (
      <p>
        Note whether the glass is cracked, the display is discoloured, touch is unreliable or the phone no longer
        turns on. Avoid pressing on broken glass. If the device is unusually hot, swollen or visibly damaged beyond
        the screen, tell the repairer before charging or handling it further.
      </p>
    ),
  },
  {
    heading: 'Protect your information',
    content: (
      <div>
        <ul className="list-disc space-y-2 pl-6 text-gray-200">
          <li>Back up important files before handing the phone over when possible.</li>
          <li>Ask whether the technician needs the device unlocked and why.</li>
          <li>Do not provide your account password, banking PIN or one-time verification code.</li>
          <li>Agree how the phone will be returned and what will be tested after repair.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Get a clear estimate before authorizing work',
    content: (
      <p>
        Share the exact phone model and describe the damage. Ask whether the quote covers diagnosis, the replacement
        part and labour, and whether the repairer offers any written warranty. Prices and parts availability vary, so
        request a current quote for your own device instead of relying on an old price list.
      </p>
    ),
  },
]

export default function PhoneScreenRepairPage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="A cracked or unresponsive display can make everyday phone use difficult. These steps help you describe the problem and ask the right questions before arranging screen repair in Ikeja."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/iphone-battery-replacement-ikeja', label: 'iPhone battery repair guidance' },
          { href: '/contact', label: 'Contact Fonestack about a repair enquiry' },
          { href: '/#repair', label: 'Send a repair enquiry' },
        ]}
      />
    </>
  )
}
