import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Sell Your Phone in Computer Village'
const description =
  'Prepare a phone for sale in Computer Village, Ikeja. Learn what information to share, how to protect your data and what to confirm before payment.'
const canonicalUrl = `${SITE_URL}/sell-my-phone-computer-village`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/sell-my-phone-computer-village',
})

const faqs: FAQ[] = [
  {
    question: 'What details should I share when asking to sell a phone?',
    answer:
      'Share the exact model and storage, describe the condition honestly, and mention known faults or replaced parts. A buyer may need to inspect the device before making a final offer.',
  },
  {
    question: 'Should I erase my phone before selling it?',
    answer:
      'Back up important data, sign out of your accounts and remove account locks before transferring the phone. Reset it only after confirming that your backup is complete.',
  },
  {
    question: 'How can I protect myself during payment?',
    answer:
      'Agree on the amount and condition in writing. Confirm that payment has arrived in your own account or that cash has been received before handing over the device.',
  },
]

const sections: Section[] = [
  {
    heading: 'Describe the phone clearly',
    content: (
      <p>
        Note the model, storage and visible condition. Mention any battery, screen, camera, charging or network
        issue, and whether parts have been replaced if you know. Accurate information helps a buyer explain how they
        will assess the device and reduces surprises during inspection.
      </p>
    ),
  },
  {
    heading: 'Prepare the device and your data',
    content: (
      <div>
        <ul className="list-disc space-y-2 pl-6 text-gray-200">
          <li>Back up photos, contacts and files you want to keep.</li>
          <li>Sign out of Apple, Google and other accounts and remove device locks.</li>
          <li>Remove your SIM and memory card, if present.</li>
          <li>Reset the phone after checking that your backup is complete.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Agree on the final terms before handover',
    content: (
      <p>
        A buyer may change an initial estimate after inspecting the phone. Confirm the final amount, payment method,
        device condition and any included accessories in writing. Verify payment before handing over the phone, and
        keep a record of the transaction.
      </p>
    ),
  },
]

export default function SellMyPhonePage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="If you are selling a phone in Computer Village, arrive prepared to describe the device and protect your personal data. Confirm the final offer and payment terms before handover."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/trade-in-old-phone-lagos', label: 'Trading in an old phone in Lagos' },
          { href: '/fairly-used-iphone-price-computer-village', label: 'Used iPhone inspection checklist' },
          { href: '/contact', label: 'Contact Fonestack about selling a phone' },
        ]}
      />
    </>
  )
}
