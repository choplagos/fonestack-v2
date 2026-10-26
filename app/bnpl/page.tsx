import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ } from '@/components/SeoArticle'
import { buildFaqSchema } from '@/lib/faqSchema'
import { createSeoMetadata } from '@/lib/seoMetadata'

export const metadata: Metadata = createSeoMetadata({
  title: 'Phone Financing in Lagos: What to Confirm',
  description:
    'Considering a phone payment plan in Lagos? Compare the provider, total repayment, schedule, fees and eligibility before you agree.',
  path: '/bnpl',
})

const faqs: FAQ[] = [
  {
    question: 'How can I ask about phone payment options?',
    answer:
      'Contact Fonestack to ask whether any options are currently available. Request the provider name and written terms before submitting an application or paying.',
  },
  {
    question: 'What should I compare before accepting a payment plan?',
    answer:
      'Compare the total amount payable, upfront amount, instalment dates, fees, late-payment consequences, eligibility rules and cancellation terms.',
  },
  {
    question: 'Does asking about financing guarantee approval?',
    answer:
      'No. Any application is subject to the finance provider’s own eligibility checks, decision and final terms.',
  },
]

export default function PhoneFinancingPage() {
  const faqSchema = buildFaqSchema(faqs)

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
          <ol className="flex gap-2">
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Phone financing</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-lime-400 md:text-4xl">
          Phone financing in Lagos: what to confirm
        </h1>
        <p className="mt-4 leading-7 text-gray-300">
          Payment options and terms can change. Contact Fonestack to ask what is currently available, and verify the
          provider’s terms before you share information, pay a deposit or commit to instalments.
        </p>

        <section className="mt-8" aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="text-2xl font-semibold">Compare the complete cost</h2>
          <p className="mt-3 leading-7 text-gray-300">
            Ask for the full amount payable, the upfront payment, every instalment amount and due date, and any
            account, service or late-payment fees. Compare the complete plan with the current cash price of the exact
            device and condition.
          </p>
        </section>
        <section className="mt-8" aria-labelledby="provider-heading">
          <h2 id="provider-heading" className="text-2xl font-semibold">Verify the provider and application process</h2>
          <p className="mt-3 leading-7 text-gray-300">
            Ask who makes the approval decision, what information is required, how it will be handled and where the
            application should be submitted. Never share passwords, card PINs or one-time verification codes.
            Confirm important promises in writing through an official channel.
          </p>
        </section>
        <section className="mt-8" aria-labelledby="device-heading">
          <h2 id="device-heading" className="text-2xl font-semibold">Confirm the phone details too</h2>
          <p className="mt-3 leading-7 text-gray-300">
            Make sure the agreement identifies the correct phone model, storage, condition and included accessories.
            Confirm what happens if the device is unavailable or if the application is not approved before making a
            payment.
          </p>
        </section>

        <section className="mt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-semibold">Frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-lime-400">{faq.question}</dt>
                <dd className="mt-1 leading-7 text-gray-300">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <nav className="mt-10 border-t border-white/10 pt-6" aria-label="Related pages">
          <h2 className="text-xl font-semibold">Related Fonestack pages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li><Link className="text-lime-400 underline" href="/easy-buy-phone-financing-lagos">Compare phone payment plans</Link></li>
            <li><Link className="text-lime-400 underline" href="/budget-smartphone-students-nigeria">Budget phone guide for students</Link></li>
            <li><Link className="text-lime-400 underline" href="/contact">Contact Fonestack</Link></li>
          </ul>
        </nav>
      </article>
    </main>
  )
}
