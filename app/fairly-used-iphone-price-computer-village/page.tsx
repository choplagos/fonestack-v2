import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Buy a Fairly Used iPhone in Ikeja'
const description =
  'A practical checklist for comparing fairly used iPhones in Computer Village, Ikeja, including device checks and questions to ask before paying.'
const canonicalUrl = `${SITE_URL}/fairly-used-iphone-price-computer-village`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/fairly-used-iphone-price-computer-village',
})

const faqs: FAQ[] = [
  {
    question: 'What should I check before buying a fairly used iPhone?',
    answer:
      'Confirm the model and storage in Settings, check that the previous owner has removed their Apple Account, and test the screen, cameras, buttons, speakers, microphone and charging. Ask about repairs and have the condition and sale terms recorded.',
  },
  {
    question: 'Can I rely on the box to verify a used iPhone?',
    answer:
      'No. A matching box can be useful context, but boxes and accessories can be swapped. Check the device itself and compare any identifiers with paperwork provided by the seller.',
  },
  {
    question: 'Where can I check current iPhone availability?',
    answer:
      'Contact the shop to ask about the specific model, storage and condition you want. Availability and pricing change, so confirm details directly before travelling or paying.',
  },
]

const sections: Section[] = [
  {
    heading: 'Confirm the phone’s identity and account status',
    content: (
      <p>
        Check the model and storage in Settings rather than relying only on the box or seller description. Ask the
        seller to remove their Apple Account in front of you, restart the phone and confirm it can be set up without
        the previous owner’s password. Compare the device identifiers with any available paperwork; do not share an
        IMEI publicly.
      </p>
    ),
  },
  {
    heading: 'Test the features you will use',
    content: (
      <div>
        <p>Inspect the phone in good light and test it before payment:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
          <li>Look for screen cracks, dead areas, discoloration and touch problems.</li>
          <li>Try each camera, the microphone, speaker, buttons, charging and mobile connection.</li>
          <li>Check battery behaviour and ask whether the battery or other parts have been replaced.</li>
          <li>Ask about prior repairs and any alerts shown in Settings.</li>
          <li>Record the agreed condition, included accessories and terms on a receipt or written message.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Compare like with like',
    content: (
      <p>
        Two phones with the same model name may differ in storage, physical condition, battery state or repair history.
        Compare those details alongside the current quote and written terms. Do not assume a low price means a fault,
        but investigate anything that does not match the seller’s description.
      </p>
    ),
  },
]

export default function FairlyUsedIPhonePage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="A careful inspection helps you understand the condition of a fairly used iPhone before you commit. Use these checks in Computer Village or anywhere else you are comparing devices."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/blog/how-to-check-a-used-phone-before-buying-nigeria', label: 'Full used-phone inspection guide' },
          { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
          { href: '/trade-in-old-phone-lagos', label: 'Trading in an old phone in Lagos' },
        ]}
      />
    </>
  )
}
