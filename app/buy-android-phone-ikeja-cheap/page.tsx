import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Buy an Android Phone in Ikeja'
const description =
  'Compare Android phones in Ikeja by model, condition and the features you need. Use this checklist before asking for a current quote.'
const canonicalUrl = `${SITE_URL}/buy-android-phone-ikeja-cheap`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/buy-android-phone-ikeja-cheap',
})

const faqs: FAQ[] = [
  {
    question: 'How do I compare Android phones before buying?',
    answer:
      'Compare the exact model and storage variant, supported apps, battery condition, screen, cameras, charging and the written sale terms. Ask for a current quote for the exact unit rather than relying on an old price list.',
  },
  {
    question: 'What should I check on a fairly used Android phone?',
    answer:
      'Test the screen, buttons, cameras, speakers, microphone, charging and mobile connection. Ask the seller to remove their account lock and confirm the device can be set up before you pay.',
  },
  {
    question: 'Can I confirm stock and price online?',
    answer:
      'Listings and prices can change. Contact the shop to confirm current availability and the exact device details before making a trip or payment.',
  },
]

const sections: Section[] = [
  {
    heading: 'Start with how you will use the phone',
    content: (
      <div>
        <p>List the tasks the phone needs to handle, then compare devices against those needs:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
          <li>Check that the apps you rely on support the phone’s software version.</li>
          <li>Compare the exact model variant and storage shown in the device settings.</li>
          <li>Try the screen, cameras, microphone, speaker, buttons and charging port.</li>
          <li>Test Wi-Fi and mobile service where possible, using your own SIM if appropriate.</li>
          <li>Ask what is included and have the agreed condition and terms written down.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Check the exact device, not just its name',
    content: (
      <p>
        Phones with similar names can have different storage, network support or condition. Open the settings screen
        to confirm the model and storage, and compare those details with the seller’s description. For a used device,
        check for account locks, visible damage, unusual heat or unexpected shutdowns. If something does not match,
        pause and ask before paying.
      </p>
    ),
  },
  {
    heading: 'Ask for current availability and terms',
    content: (
      <p>
        Phone models, stock and prices change. Ask for the current price of the exact unit, whether it is new or used,
        what accessories are included, and any written return or warranty terms. Do not treat an old guide or an
        online message as confirmation of current stock.
      </p>
    ),
  },
]

export default function BuyAndroidPhonePage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="Shopping for an Android phone around Ikeja? A careful comparison starts with the exact device and how you plan to use it—not just the headline name."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/budget-smartphone-students-nigeria', label: 'Budget phone guide for students' },
          { href: '/fairly-used-iphone-price-computer-village', label: 'Comparing fairly used iPhones' },
          { href: '/#products', label: 'Browse the Fonestack device catalogue' },
        ]}
      />
    </>
  )
}
