import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { WHATSAPP_LINK } from '@/lib/constants'

const whatsappMessage = encodeURIComponent(
  'Hi Fonestack! Are any phone payment or financing options currently available? Please share the current terms.'
)

export default function BNPLSection() {
  return (
    <section id="bnpl" className="py-24 relative overflow-hidden" aria-labelledby="bnpl-heading">
      <div className="absolute top-1/2 left-[-10%] w-72 h-72 -translate-y-1/2 bg-premiumYellow/10 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">
              {'//'} Buy Now, Pay Later
            </div>
            <h2 id="bnpl-heading" className="text-4xl font-display font-black dark:text-white mb-6">
              Ask about current <br />
              <span className="text-premiumYellow">payment options.</span>
            </h2>
            <p className="text-slate-400 max-w-lg leading-relaxed">
              Considering paying for a phone over time? Ask Fonestack whether an option is currently available and
              confirm the provider&apos;s terms before applying.
            </p>

            <div className="mt-8 p-5 rounded-3xl bg-premiumYellow/10 border border-premiumYellow/20">
              <p className="text-sm text-slate-300 leading-relaxed">
                Before agreeing, request the total amount payable, any upfront payment, instalment dates, fees and
                eligibility conditions in writing. Approval and terms are set by the finance provider.
              </p>
            </div>
          </div>

          <div className="liquid-glass p-8 md:p-10 rounded-[3rem] border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold dark:text-white">Questions to ask first</h3>
            <ul className="mt-6 list-disc space-y-3 pl-5 text-slate-300">
              <li>Who provides the financing and who makes the approval decision?</li>
              <li>What is the full repayment amount and schedule?</li>
              <li>Are there fees or consequences for late payment?</li>
              <li>Which verified channel should be used for any application?</li>
            </ul>

            <a
              href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-5 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-premiumYellow/20 transition-all"
              aria-label="Ask Fonestack about current phone payment options on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              ASK ABOUT CURRENT OPTIONS
            </a>
            <Link href="/bnpl" className="mt-4 block text-center text-sm text-slate-300 underline">
              Read the phone financing checklist
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
