import type { Metadata } from 'next'
import Script from 'next/script'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'

const ARTICLE_URL = 'https://fonestack.com.ng/easy-buy-phone-financing-lagos'

export const metadata: Metadata = {
  title: 'Easy Buy Phone Financing in Lagos: BNPL Requirements and Down Payment',
  description:
    'Learn how Fonestack Easy Buy phone financing works in Lagos through CreditDirect, including the 40–50% down payment, qualification requirements, and WhatsApp application steps.',
  keywords: [
    'Easy Buy phones Lagos',
    'Easy Buy phone financing Nigeria',
    'buy phone on instalment Lagos',
    'BNPL phone down payment Nigeria',
    'phone financing Computer Village',
    'CreditDirect BNPL requirements',
  ],
  alternates: { canonical: ARTICLE_URL },
  openGraph: {
    title: 'Easy Buy Phone Financing in Lagos: BNPL Requirements and Down Payment',
    description:
      'A practical guide to Fonestack Easy Buy phone financing through CreditDirect, including eligibility requirements and the typical 40–50% upfront payment.',
    url: ARTICLE_URL,
    type: 'article',
  },
}

const faqs: FAQ[] = [
  {
    question: 'What is Easy Buy phone financing?',
    answer:
      'Easy Buy is a buy-now-pay-later option that can help eligible customers get a phone while paying an upfront amount and spreading the remaining balance under approved terms.',
  },
  {
    question: 'How much down payment is needed for Easy Buy?',
    answer:
      'The expected down payment is typically 40–50% of the phone price. CreditDirect confirms the final amount and repayment terms after reviewing the application.',
  },
  {
    question: 'What documents or details are needed to start?',
    answer:
      'Customers should have an active bank account, active ATM card, active email address, BVN, and the phone number registered with the BVN. Do not send sensitive details through the website; continue the enquiry with Fonestack on WhatsApp.',
  },
  {
    question: 'Does meeting the Easy Buy requirements guarantee approval?',
    answer:
      'No. The listed requirements help start the process, but CreditDirect performs the final eligibility review and confirms approval and terms.',
  },
]

const sections: Section[] = [
  {
    heading: 'What is the Fonestack Easy Buy service?',
    content: (
      <p>
        Fonestack Easy Buy is a phone financing option for customers in Lagos who want
        to get a new or fairly used phone without paying the entire price at once.
        Fonestack works with CreditDirect, which reviews applications and confirms the
        final eligibility and repayment terms.
      </p>
    ),
  },
  {
    heading: 'How much is the Easy Buy down payment?',
    content: (
      <div>
        <p>
          Customers should plan for an estimated <strong>40–50% down payment</strong>
          of the phone price. The exact amount may depend on the selected device and
          CreditDirect&apos;s review, so confirm the final figure before making payment.
        </p>
        <p className="mt-3">
          The remaining balance and payment schedule are subject to the approved
          CreditDirect terms. Fonestack does not guarantee approval or a specific
          repayment plan.
        </p>
      </div>
    ),
  },
  {
    heading: 'Easy Buy qualification requirements',
    content: (
      <ul className="list-disc ml-6 mt-2 text-gray-200">
        <li>Active bank account</li>
        <li>Active ATM card linked to the account</li>
        <li>Active email address</li>
        <li>BVN and the phone number registered with the BVN</li>
        <li>Ability to provide the estimated 40–50% down payment</li>
      </ul>
    ),
  },
  {
    heading: 'How to apply through WhatsApp',
    content: (
      <ol className="list-decimal ml-6 mt-2 text-gray-200">
        <li>Choose the phone you want from Fonestack.</li>
        <li>Review the requirements and prepare the expected down payment.</li>
        <li>Click the WhatsApp button and send an Easy Buy enquiry.</li>
        <li>Follow the secure instructions provided for the CreditDirect review.</li>
        <li>Proceed only after the final amount and terms are clearly confirmed.</li>
      </ol>
    ),
  },
  {
    heading: 'Protect your personal information',
    content: (
      <p>
        Do not post your BVN, card number, PIN, password, or banking login details on
        the website or in public comments. Fonestack will guide you to the appropriate
        WhatsApp conversation, while CreditDirect handles the eligibility review.
      </p>
    ),
  },
]

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${ARTICLE_URL}#article`,
  headline: 'Easy Buy Phone Financing in Lagos: BNPL Requirements and Down Payment',
  description: metadata.description,
  url: ARTICLE_URL,
  dateModified: '2026-09-25',
  author: { '@type': 'Organization', name: 'Fonestack', url: 'https://fonestack.com.ng' },
  publisher: { '@type': 'Organization', name: 'Fonestack', url: 'https://fonestack.com.ng' },
  about: {
    '@type': 'Service',
    name: 'Fonestack Easy Buy Phone Financing',
    provider: { '@type': 'Organization', name: 'CreditDirect' },
  },
}

export default function EasyBuyArticle() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <Script
        id="easy-buy-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="easy-buy-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SeoArticle
        h1="Easy Buy Phone Financing in Lagos: BNPL Requirements and Down Payment"
        hook="Want a new phone but prefer to spread the cost? Here is how Fonestack Easy Buy works, what you need to get started, and why you should plan for a 40–50% down payment."
        sections={sections}
        faqs={faqs}
      />
    </>
  )
}
