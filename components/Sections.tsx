'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const BRANDS = [
  { name: 'Apple', emoji: '🍎' }, { name: 'Samsung', emoji: '📱' },
  { name: 'Tecno', emoji: '📲' }, { name: 'Infinix', emoji: '⚡' },
  { name: 'Google', emoji: '🔍' }, { name: 'Xiaomi', emoji: '🌟' },
  { name: 'OnePlus', emoji: '🔴' }, { name: 'Itel', emoji: '💡' },
]

const TESTIMONIALS = [
  { text: 'Got my iPhone 14 from Fonestack at a great price. The phone is in perfect condition and the service was amazing!', author: 'Chioma Jide', tag: 'Verified Buyer', initials: 'CJ' },
  { text: 'Very professional team. I was worried about buying used, but they explained everything clearly and gave warranty.', author: 'Ahmed Okafor', tag: 'Verified Buyer', initials: 'AO' },
  { text: 'Fast WhatsApp response, delivered same day. Can\'t ask for better service in Lagos. Highly recommended!', author: 'Blessing Lagos', tag: 'Verified Buyer', initials: 'BL' },
  { text: 'Best deal I found in Computer Village. The Samsung S24 is flawless and came with full warranty!', author: 'Musa Taiwo', tag: 'Verified Buyer', initials: 'MT' },
]

const FAQS = [
  { q: 'Do you offer warranty on phones?', a: 'Yes! All our phones come with warranty. New phones have manufacturer warranty (1 year), and fairly used phones come with our 3–6 months warranty depending on condition.' },
  { q: 'What payment methods do you accept?', a: 'We accept cash, bank transfers, and mobile money. Payment plans are available for big purchases. Contact us via WhatsApp to discuss your payment preference.' },
  { q: 'How can I differentiate between new and fairly used?', a: 'New phones are factory sealed and untouched. Fairly used phones have been used but are in excellent condition with minimal wear. All phones undergo quality checks before sale.' },
  { q: 'Do you deliver outside Computer Village?', a: 'Yes, we offer delivery services within Lagos. You can visit us or we can arrange secure delivery to your location. Delivery fees apply based on distance.' },
  { q: 'What happens if I have issues with a phone I purchased?', a: 'Contact us immediately via WhatsApp. We offer quick troubleshooting and, if needed, repair or replacement within the warranty period.' },
  { q: 'How quickly can you respond to inquiries?', a: 'We typically respond to WhatsApp messages within 2 hours during business hours (9 AM – 6 PM). For urgent inquiries, call us directly.' },
]

const HOW_IT_WORKS = [
  { step: '1', icon: '📞', title: 'Contact Us', desc: 'Message us on WhatsApp with your phone preferences and budget.' },
  { step: '2', icon: '📋', title: 'Get Options', desc: 'We\'ll send you available phones in your price range with details.' },
  { step: '3', icon: '✅', title: 'Inspect & Buy', desc: 'Visit us at Computer Village or arrange home delivery.' },
  { step: '4', icon: '🎁', title: 'Warranty & Support', desc: 'Get warranty and after-sales support on your purchase.' },
]

export function BrandsSection({ products }: { products: any[] }) {
  const brandCounts = BRANDS.map(b => ({ ...b, count: products.filter(p => p.brand?.toLowerCase() === b.name.toLowerCase()).length }))
  return (
    <section id="brands" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// What We Carry</div>
        <h2 className="text-4xl font-display font-black dark:text-white mb-10">All Major <span className="text-premiumYellow">Brands</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {brandCounts.map((b, i) => (
            <motion.div key={b.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
              className="liquid-glass rounded-2xl p-6 flex flex-col items-center text-center gap-2 cursor-pointer hover:border-premiumYellow/20 transition-all border border-transparent">
              <span className="text-3xl">{b.emoji}</span>
              <div className="font-bold dark:text-white">{b.name}</div>
              {b.count > 0 && <div className="text-xs font-mono text-premiumYellow">{b.count} in stock</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section id="how" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// Process</div>
        <h2 className="text-4xl font-display font-black dark:text-white mb-10">How It <span className="text-premiumYellow">Works</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="liquid-glass rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-display font-black opacity-5 dark:text-white">{step.step}</div>
              <div className="text-3xl mb-4">{step.icon}</div>
              <div className="font-bold dark:text-white mb-2">{step.title}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// Social Proof</div>
        <h2 className="text-4xl font-display font-black dark:text-white mb-10">What Customers <span className="text-premiumYellow">Say</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.author} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
              className="liquid-glass rounded-3xl p-6 flex flex-col gap-4">
              <div className="text-premiumYellow text-sm tracking-widest">★★★★★</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-premiumYellow to-obsidian-800 flex items-center justify-center text-xs font-bold text-black">{t.initials}</div>
                <div>
                  <div className="text-sm font-bold dark:text-white">{t.author}</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{t.tag}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// Questions</div>
        <h2 className="text-4xl font-display font-black dark:text-white mb-10">Frequently Asked <span className="text-premiumYellow">Questions</span></h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className={`liquid-glass rounded-2xl overflow-hidden border transition-all ${open === i ? 'border-premiumYellow/20' : 'border-transparent'}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium dark:text-white pr-4">{faq.q}</span>
                {open === i ? <Minus className="text-premiumYellow w-5 h-5 flex-shrink-0" /> : <Plus className="text-slate-400 w-5 h-5 flex-shrink-0" />}
              </button>
              {open === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 pb-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="text-xl font-display font-black text-premiumYellow mb-3">FONESTACK</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Your trusted destination for new & fairly used phones in Lagos. Visit us at Computer Village or WhatsApp us anytime.</p>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">Quick Links</div>
            <div className="space-y-2">
              {[['#phones', 'Shop Phones'], ['#brands', 'All Brands'], ['#trade-in', 'Trade In'], ['#how', 'How It Works'], ['#faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} className="block text-sm text-slate-400 hover:text-premiumYellow transition-colors">{label}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">Contact</div>
            <div className="space-y-2">
              <a href="https://wa.me/2349029928322" className="block text-sm text-slate-400 hover:text-premiumYellow transition-colors">💬 WhatsApp: 0902 992 8322</a>
              <a href="tel:+2349029928322" className="block text-sm text-slate-400 hover:text-premiumYellow transition-colors">📞 Call: 0902 992 8322</a>
              <a href="mailto:info@fonestack.ng" className="block text-sm text-slate-400 hover:text-premiumYellow transition-colors">✉️ info@fonestack.ng</a>
              <div className="text-sm text-slate-500">📍 Computer Village, Ikeja, Lagos</div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2025 Fonestack. All rights reserved.</p>
          <p className="text-xs text-slate-600">Made with ❤️ for Lagos phone shoppers</p>
        </div>
      </div>
    </footer>
  )
}