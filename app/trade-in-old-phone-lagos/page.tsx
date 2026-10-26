import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Trade In an Old Phone in Lagos'
const description =
  'Understand how a phone trade-in assessment works in Lagos, what can affect an offer and what to check before handing over your device.'
const canonicalUrl = `${SITE_URL}/trade-in-old-phone-lagos`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/trade-in-old-phone-lagos',
})

const faqs: FAQ[] = [
  {
    question: 'How is a phone trade-in offer decided?',
    answer:
      'The exact model, storage, condition, account status and current assessment criteria can affect an offer. Ask for the valuation and any conditions in writing before agreeing.',
  },
  {
    question: 'Should I erase my phone before a trade-in?',
    answer:
      'Back up anything you want to keep, sign out of your accounts and remove the device from account services before handing it over. Confirm the device can be transferred safely.',
  },
  {
    question: 'Is a trade-in the same as selling a phone?',
    answer:
      'A trade-in is usually assessed as part of another purchase, while a direct sale is a separate transaction. Confirm how the offer will be paid or applied before you accept it.',
  },
]

const sections: Section[] = [
  {
    heading: 'Prepare your phone for assessment',
    content: (
      <div>
        <ul className="list-disc space-y-2 pl-6 text-gray-200">
          <li>Write down the model and storage shown in the settings.</li>
          <li>Describe any screen, battery, camera, charging or account issue honestly.</li>
          <li>Include accessories only if they are part of the offer you want assessed.</li>
          <li>Back up your data before signing out and resetting the phone.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Understand the offer before you agree',
    content: (
      <p>
        Ask how the device will be inspected, what condition assumptions are being used, and whether the offer is
        cash or credit toward a purchase. Confirm any fees, conditions and timing directly with the buyer. A remote
        estimate may change after someone inspects the actual phone.
      </p>
    ),
  },
  {
    heading: 'Protect your data and keep a record',
    content: (
      <p>
        Back up important files, remove your personal accounts, and factory reset only after you have verified your
        backup. Keep a written record of the phone details, agreed condition, offer and payment or trade-in terms.
        Never share banking passwords, card PINs or one-time codes to complete an assessment.
      </p>
    ),
  },
]

export default function TradeInOldPhonePage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="A useful trade-in starts with a clear description of the device and written terms for the offer. Here is a practical checklist for Lagos phone owners."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
          { href: '/fairly-used-iphone-price-computer-village', label: 'Comparing fairly used iPhones' },
          { href: '/contact', label: 'Contact Fonestack about a trade-in enquiry' },
        ]}
      />
    </>
  )
}
