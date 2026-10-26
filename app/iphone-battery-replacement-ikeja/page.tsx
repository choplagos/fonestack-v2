import type { Metadata } from 'next'
import SeoArticle, { FAQ, Section } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

const title = 'iPhone Battery Repair in Ikeja'
const description =
  'Learn how to assess iPhone battery problems and what to ask before arranging battery repair in Ikeja. Confirm current quotes and terms with the shop.'
const canonicalUrl = `${SITE_URL}/iphone-battery-replacement-ikeja`

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: '/iphone-battery-replacement-ikeja',
})

const faqs: FAQ[] = [
  {
    question: 'How can I tell if my iPhone battery needs attention?',
    answer:
      'Review the battery information and service messages available in Settings, and note symptoms such as unexpected shutdowns or a rapid drop in charge. A technician can assess the device before recommending a replacement.',
  },
  {
    question: 'How much does iPhone battery replacement cost in Ikeja?',
    answer:
      'The cost depends on the iPhone model and the part selected. Ask for a current quote for your exact device and confirm the part, labour and any written warranty before authorizing work.',
  },
  {
    question: 'What should I do if the battery looks swollen?',
    answer:
      'Stop charging or using the phone and arrange professional assessment. Do not press, puncture or try to remove a swollen battery yourself.',
  },
]

const sections: Section[] = [
  {
    heading: 'Check the symptoms and battery information',
    content: (
      <p>
        Review the battery health and service information available in the phone settings, and note when the problem
        occurs. Unexpected shutdowns, rapid charge changes or battery warnings are useful details to share, but they
        do not by themselves identify the cause. A technician should assess the device before recommending a repair.
      </p>
    ),
  },
  {
    heading: 'Ask what the battery service includes',
    content: (
      <div>
        <p>Before agreeing to a replacement, ask the repairer to explain:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-200">
          <li>Which battery part is proposed for your exact iPhone model.</li>
          <li>The full quote, including diagnosis and labour.</li>
          <li>Whether any service warning may appear after the repair.</li>
          <li>How the phone will be tested and what written warranty, if any, applies.</li>
          <li>Whether you should back up the device before handing it over.</li>
        </ul>
      </div>
    ),
  },
  {
    heading: 'Confirm current details before visiting',
    content: (
      <p>
        Parts, quotes and repair timing can vary by model and device condition. Contact the shop with your exact
        model and symptoms to ask what is currently available. Do not rely on old price lists or assume that every
        repair can be completed in the same time.
      </p>
    ),
  },
]

export default function IPhoneBatteryRepairPage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <SeoArticle
        h1={title}
        hook="Battery problems can have more than one cause. Use this guide to describe the symptoms and request a clear assessment before arranging iPhone battery repair in Ikeja."
        sections={sections}
        faqs={faqs}
        description={description}
        canonicalUrl={canonicalUrl}
        dateModified="2026-10-25"
        relatedLinks={[
          { href: '/phone-screen-repair-ikeja-price', label: 'Phone screen repair guidance' },
          { href: '/contact', label: 'Contact Fonestack about a repair enquiry' },
          { href: '/#repair', label: 'Send a repair enquiry' },
        ]}
      />
    </>
  )
}
