import type { Metadata } from 'next'
import Script from 'next/script'
import BNPLSection from '@/components/BNPLSection'

const BNPL_URL = 'https://fonestack.com.ng/bnpl'

export const metadata: Metadata = {
  title: 'Buy Now, Pay Later Phones in Lagos | CreditDirect BNPL',
  description:
    'Get a phone through Fonestack Buy Now, Pay Later in Lagos with CreditDirect. See the requirements, including an active bank account, ATM card, email, BVN and registered phone number.',
  keywords: [
    'buy now pay later phones Lagos',
    'BNPL phones Nigeria',
    'CreditDirect phones',
    'phone financing Ikeja',
    'pay later phone Computer Village',
  ],
  alternates: { canonical: BNPL_URL },
  openGraph: {
    title: 'Buy Now, Pay Later Phones in Lagos | CreditDirect BNPL',
    description:
      'See the requirements for Fonestack phone financing through CreditDirect and start your BNPL enquiry on WhatsApp.',
    url: BNPL_URL,
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BNPL_URL}#service`,
  name: 'Fonestack Buy Now, Pay Later Phone Service',
  serviceType: 'Buy Now, Pay Later phone financing',
  description:
    'Phone financing enquiries from Fonestack in partnership with CreditDirect for eligible customers in Lagos.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Fonestack',
    url: 'https://fonestack.com.ng',
    areaServed: {
      '@type': 'Place',
      name: 'Lagos, Nigeria',
    },
  },
  broker: {
    '@type': 'Organization',
    name: 'CreditDirect',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Lagos, Nigeria',
  },
  url: BNPL_URL,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What do I need to qualify for Fonestack BNPL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need an active bank account, an active ATM card, an active email address, and your BVN together with the phone number registered with the BVN.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who provides the BNPL service?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fonestack partners with CreditDirect for the BNPL service. CreditDirect reviews applications and confirms final eligibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does meeting the requirements guarantee approval?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The listed requirements are needed to get started, but final approval is subject to CreditDirect review.',
      },
    },
  ],
}

export default function BNPLPage() {
  return (
    <>
      <Script
        id="bnpl-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="bnpl-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main>
        <nav aria-label="Breadcrumb" className="sr-only">
          <ol>
            <li><a href="/">Home</a></li>
            <li aria-current="page">Buy Now, Pay Later</li>
          </ol>
        </nav>
        <BNPLSection />
      </main>
    </>
  )
}
