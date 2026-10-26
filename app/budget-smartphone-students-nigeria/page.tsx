import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'Budget Phones for Students in Nigeria'
const description =
  'A practical guide for Nigerian students choosing a phone for classes, study apps and daily use—without relying on stale model prices.'
const canonicalUrl = `${SITE_URL}/budget-smartphone-students-nigeria`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/budget-smartphone-students-nigeria',
})

const faqs: FAQ[] = [
  {
    question: 'What should a student prioritize in a budget phone?',
    answer:
      'Start with the tasks you need it to handle, such as reading course material, messaging, video calls, or taking notes. Check battery condition, usable storage, network compatibility, and whether the phone can run the apps you rely on.',
  },
  {
    question: 'Should a student choose a new or fairly used phone?',
    answer:
      'Compare the specific devices rather than assuming one condition is always better. A new phone may have a clearer service history; a fairly used phone may offer a different feature mix. Inspect any used device and confirm the seller’s written terms before paying.',
  },
  {
    question: 'How can I compare current prices?',
    answer:
      'Prices and stock change. Ask the shop for a current quote for the exact model, storage and condition, then compare what is included and any written terms. This guide does not publish unconfirmed prices.',
  },
]

const sections: Section[] = [
  {
    heading: 'Compare phone types by the way you study',
    content: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/20 text-lime-400">
              <th className="p-3">Phone option</th>
              <th className="p-3">May suit</th>
              <th className="p-3">Check before choosing</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            <tr className="border-b border-white/10">
              <td className="p-3">Entry-level Android</td>
              <td className="p-3">Calls, messaging, reading and essential apps</td>
              <td className="p-3">App compatibility, available storage and battery condition</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="p-3">Mid-range Android</td>
              <td className="p-3">Students who use several apps or take frequent photos</td>
              <td className="p-3">The exact model variant, storage, update support and warranty terms</td>
            </tr>
            <tr>
              <td className="p-3">Fairly used phone</td>
              <td className="p-3">Buyers comparing condition and features across a budget</td>
              <td className="p-3">Screen, cameras, charging, battery, account locks and repair history</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm text-gray-300">
          Prices are intentionally not listed here; confirm the current price and availability for the exact device before buying.
        </p>
      </div>
    ),
  },
  {
    heading: 'Make a shortlist before visiting a shop',
    content: (
      <div>
        <p>Write down the apps and tasks the phone must handle. Then compare each candidate against the same checklist:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
          <li>Confirm the exact model and storage shown in the phone settings.</li>
          <li>Check that your study, messaging and video-call apps are supported.</li>
          <li>Inspect battery behaviour and test charging with a known-good cable if possible.</li>
          <li>Try the screen, cameras, speakers, microphone and mobile connection.</li>
          <li>Ask what is included and have any return or warranty terms written down.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Plan for more than the phone itself',
    content: (
      <p>
        Consider the accessories you actually need, mobile data, charging access and the cost of keeping your existing
        apps and files available. Avoid paying for features you will not use, but do not choose a device that cannot
        handle your essential schoolwork. For a fairly used device, allow time to inspect it instead of rushing a
        decision because of a low advertised price.
      </p>
    ),
  },
  {
    heading: 'Inspect fairly used phones carefully',
    content: (
      <p>
        Ask the seller to remove their account lock and let you test the phone before payment. Check the model and
        identifier in the device settings, look for screen or body damage, and test the features you rely on most.
        Our <a className="text-lime-400 underline" href="/blog/how-to-check-a-used-phone-before-buying-nigeria">
          used-phone inspection guide
        </a>{' '}
        has a longer checklist.
      </p>
    ),
  },
]

export default function BudgetSmartphoneStudentsPage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="A student phone should fit your actual school routine. Use this checklist to compare options in Nigeria without relying on old model prices or claims that may no longer be true."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/buy-android-phone-ikeja-cheap', label: 'Choosing an Android phone in Ikeja' },
          { href: '/fairly-used-iphone-price-computer-village', label: 'Inspecting a fairly used iPhone' },
          { href: '/#products', label: 'Browse the Fonestack device catalogue' },
        ]}
      />
    </>
  )
}
