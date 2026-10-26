import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Compare Phone Payment Plans in Lagos'
const description =
  'A checklist for comparing phone instalment plans in Lagos: calculate the full cost, review provider terms and protect your personal information.'
const canonicalUrl = `${SITE_URL}/easy-buy-phone-financing-lagos`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/easy-buy-phone-financing-lagos',
})

const faqs: FAQ[] = [
  {
    question: 'What is the first thing to compare in a phone payment plan?',
    answer:
      'Compare the full amount payable, not only the upfront amount or monthly instalment. Ask for all fees, due dates and late-payment consequences in writing.',
  },
  {
    question: 'Can I rely on an online instalment estimate?',
    answer:
      'Treat an estimate as preliminary. The provider must confirm eligibility, the exact device, final costs and payment terms before you agree.',
  },
  {
    question: 'What personal information should I keep private?',
    answer:
      'Do not share passwords, card PINs or one-time verification codes. Submit any required information only through the finance provider’s verified official process.',
  },
]

const sections: Section[] = [
  {
    heading: 'Write down the full payment schedule',
    content: (
      <div>
        <p>Before comparing plans, request these details for the same phone and condition:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
          <li>The cash price and total amount payable under the plan.</li>
          <li>Any upfront amount, each instalment, its due date and the number of payments.</li>
          <li>All fees, late-payment consequences and cancellation terms.</li>
          <li>Whether the device or accessories differ between offers.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Read the provider’s conditions',
    content: (
      <p>
        Ask who makes the lending or financing decision, what information is required and how an application is
        submitted. Eligibility is determined by the provider, and an enquiry does not guarantee approval. Do not
        make a payment until you understand the provider’s final written terms.
      </p>
    ),
  },
  {
    heading: 'Protect your identity and payment information',
    content: (
      <p>
        Use only a verified application channel. Keep your passwords, card PINs and one-time codes private, and do
        not send sensitive financial details through public comments or an unverified message. If a request feels
        unclear, pause and contact the provider through a channel you independently verified.
      </p>
    ),
  },
  {
    heading: 'Confirm the device and sale terms',
    content: (
      <p>
        Check the exact phone model, storage, condition and included accessories in the agreement. Ask what happens
        if the device is unavailable or the application is declined, and keep copies of the written terms and
        payment receipts.
      </p>
    ),
  },
]

export default function PhonePaymentPlanGuide() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="Instalment offers can be hard to compare when each one emphasizes a different number. Use this checklist to compare the total cost and written conditions before choosing a phone payment plan in Lagos."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/bnpl', label: 'Phone financing questions to confirm' },
          { href: '/budget-smartphone-students-nigeria', label: 'Budget phone guide for students' },
          { href: '/contact', label: 'Contact Fonestack about current options' },
        ]}
      />
    </>
  )
}
