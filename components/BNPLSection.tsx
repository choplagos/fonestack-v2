import { CreditCard, Landmark, Mail, MessageCircle, ShieldCheck } from 'lucide-react'
import { WHATSAPP_LINK } from '@/lib/constants'

const REQUIREMENTS = [
  {
    label: 'Active bank account',
    description: 'A bank account that is currently open and in use.',
    icon: Landmark,
  },
  {
    label: 'Active ATM card',
    description: 'An active ATM card linked to your bank account.',
    icon: CreditCard,
  },
  {
    label: 'Active email address',
    description: 'An email address you can access for updates.',
    icon: Mail,
  },
  {
    label: 'BVN and registered phone number',
    description: 'Your BVN and the phone number registered with it.',
    icon: ShieldCheck,
  },
]

const whatsappMessage = encodeURIComponent(
  'Hi Fonestack! I am interested in the CreditDirect BNPL service. Please share the next steps.'
)

export default function BNPLSection() {
  return (
    <section id="bnpl" className="py-24 relative overflow-hidden" aria-labelledby="bnpl-heading">
      <div className="absolute top-1/2 left-[-10%] w-72 h-72 -translate-y-1/2 bg-premiumYellow/10 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">
              // Buy Now, Pay Later
            </div>
            <h2 id="bnpl-heading" className="text-4xl font-display font-black dark:text-white mb-6">
              Get your next phone <br />
              <span className="text-premiumYellow">on flexible payments.</span>
            </h2>
            <p className="text-slate-400 max-w-lg leading-relaxed">
              Fonestack has partnered with CreditDirect to help eligible customers spread
              the cost of their phone. Check what you need below, then chat with us on
              WhatsApp to get started.
            </p>

            <div className="mt-8 p-5 rounded-3xl bg-premiumYellow/10 border border-premiumYellow/20">
              <p className="text-sm text-slate-300 leading-relaxed">
                Meeting these requirements does not guarantee approval. CreditDirect will
                review your application and confirm your eligibility.
              </p>
            </div>
          </div>

          <div className="liquid-glass p-8 md:p-10 rounded-[3rem] border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold dark:text-white">What you need to qualify</h3>
            <ul className="mt-6 space-y-4" aria-label="BNPL qualification requirements">
              {REQUIREMENTS.map(({ label, description, icon: Icon }) => (
                <li key={label} className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-premiumYellow/10 text-premiumYellow flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-bold dark:text-white">{label}</div>
                    <p className="mt-1 text-sm text-slate-400">{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-5 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-premiumYellow/20 transition-all"
              aria-label="Start a CreditDirect BNPL enquiry on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              START BNPL ENQUIRY ON WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
