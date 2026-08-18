'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCcw,
  Package,
  BatteryCharging,
  Sparkles,
  MessageCircle,
  Loader2,
} from 'lucide-react'
import Script from 'next/script'

const CONDITIONS = [
  { id: 'excellent', label: 'Excellent', desc: 'Like new, no visible wear' },
  { id: 'good', label: 'Good', desc: 'Light wear, fully functional' },
  { id: 'fair', label: 'Fair', desc: 'Visible wear, works fine' },
  { id: 'poor', label: 'Poor', desc: 'Heavy wear or minor faults' },
]

const tradeInServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Phone Trade-In',
  provider: { '@type': 'LocalBusiness', name: 'Fonestack', url: 'https://fonestack.vercel.app' },
  areaServed: { '@type': 'Place', name: 'Ikeja, Lagos, Nigeria' },
}

type Estimate = {
  estimate_low: number
  estimate_high: number
  estimate_reasoning: string
  estimate_confidence: 'high' | 'medium' | 'low'
}

export default function TradeInEstimator() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    brand: '',
    model: '',
    storage_gb: '',
    condition_description: '',
  })
  const [conditionGrade, setConditionGrade] = useState<string | null>(null)
  const [hasBox, setHasBox] = useState(false)
  const [hasCharger, setHasCharger] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<Estimate | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!conditionGrade) {
      setError('Please select a condition.')
      return
    }
    setLoading(true)
    setError(null)
    setEstimate(null)
    try {
      const res = await fetch('/api/trade-in/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          condition_grade: conditionGrade,
          has_box: hasBox,
          has_charger: hasCharger,
        }),
      })
      if (!res.ok) throw new Error('Failed to get estimate')
      const data = await res.json()
      setEstimate(data)
    } catch (err) {
      setError('Could not generate an estimate right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleWhatsApp() {
    const waMsg = encodeURIComponent(
      `Hi Fonestack! 🔄\n\n*TRADE-IN REQUEST*\n👤 Name: ${formData.customer_name}\n📱 Device: ${formData.brand} ${formData.model}${
        formData.storage_gb ? ` (${formData.storage_gb}GB)` : ''
      }\n🔧 Condition: ${conditionGrade}\n📦 Box: ${hasBox ? 'Yes' : 'No'} | 🔌 Charger: ${
        hasCharger ? 'Yes' : 'No'
      }\n💰 AI Estimate: ₦${estimate?.estimate_low.toLocaleString()} - ₦${estimate?.estimate_high.toLocaleString()}\n\nCan we confirm this trade-in value?`
    )
    window.open(`https://wa.me/2349029928322?text=${waMsg}`, '_blank')
  }

  return (
    <>
      <Script
        id="trade-in-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tradeInServiceSchema) }}
      />

      <section id="trade-in" className="py-24 relative overflow-hidden" aria-labelledby="trade-in-heading">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Intro + trust copy */}
            <div>
              <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">
                // AI Price Trade-In
              </div>
              <h2 id="trade-in-heading" className="text-4xl font-display font-black dark:text-white mb-6">
                What's your old <br />
                <span className="text-premiumYellow">phone worth?</span>
              </h2>
              <p className="text-slate-400 mb-8 max-w-md">
                Tell us about your device and get an instant AI-powered estimate,
                grounded in real prices from our current catalog. Confirm the
                final offer on WhatsApp — no obligation.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {CONDITIONS.map((c) => (
                  <motion.button
                    key={c.id}
                    type="button"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConditionGrade(c.id)}
                    className={`liquid-glass p-5 rounded-3xl flex flex-col items-start text-left gap-1 transition-all border-2
                      ${conditionGrade === c.id ? 'border-premiumYellow bg-premiumYellow/5' : 'border-transparent'}`}
                    aria-pressed={conditionGrade === c.id}
                  >
                    <div className="text-sm font-bold dark:text-white">{c.label}</div>
                    <div className="text-[9px] opacity-40 uppercase font-mono leading-tight">{c.desc}</div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setHasBox(!hasBox)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all text-xs font-bold
                    ${hasBox ? 'border-premiumYellow bg-premiumYellow/5 text-premiumYellow' : 'border-white/10 text-slate-400'}`}
                >
                  <Package className="w-4 h-4" aria-hidden="true" />
                  Original Box
                </button>
                <button
                  type="button"
                  onClick={() => setHasCharger(!hasCharger)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all text-xs font-bold
                    ${hasCharger ? 'border-premiumYellow bg-premiumYellow/5 text-premiumYellow' : 'border-white/10 text-slate-400'}`}
                >
                  <BatteryCharging className="w-4 h-4" aria-hidden="true" />
                  Charger
                </button>
              </div>
            </div>

            {/* Form / Result */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="liquid-glass p-8 md:p-12 rounded-[3rem] border-white/10 shadow-2xl relative"
            >
              <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden="true" />

              <AnimatePresence mode="wait">
                {!estimate ? (
                  <motion.form
                    key="form"
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    aria-label="Trade-in estimate form"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          Your Name
                        </label>
                        <input
                          required
                          value={formData.customer_name}
                          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white"
                          placeholder="Chioma Jide"
                        />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          WhatsApp Number
                        </label>
                        <input
                          required
                          type="tel"
                          value={formData.customer_phone}
                          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white"
                          placeholder="+234 902 992 8322"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          Brand
                        </label>
                        <input
                          required
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white"
                          placeholder="Apple"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          Model
                        </label>
                        <input
                          required
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white"
                          placeholder="iPhone 13 Pro"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        Storage (GB) — optional
                      </label>
                      <input
                        type="number"
                        value={formData.storage_gb}
                        onChange={(e) => setFormData({ ...formData, storage_gb: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white"
                        placeholder="128"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        Anything we should know? — optional
                      </label>
                      <textarea
                        value={formData.condition_description}
                        onChange={(e) => setFormData({ ...formData, condition_description: e.target.value })}
                        rows={2}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white resize-none"
                        placeholder="e.g. Small scratch on back, battery health 89%"
                      />
                    </div>

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-premiumYellow/20 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                          Estimating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" aria-hidden="true" />
                          GET AI PRICE ESTIMATE
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCcw className="text-premiumYellow w-6 h-6" aria-hidden="true" />
                      <div className="text-xs uppercase font-mono tracking-widest text-slate-500">
                        Estimated Trade-In Value
                      </div>
                    </div>

                    <div className="text-4xl font-display font-black text-premiumYellow">
                      ₦{estimate.estimate_low.toLocaleString()} – ₦{estimate.estimate_high.toLocaleString()}
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">{estimate.estimate_reasoning}</p>

                    <div className="flex gap-3">
                      <button
                        onClick={handleWhatsApp}
                        className="flex-1 py-4 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-premiumYellow/20 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" aria-hidden="true" />
                        Confirm on WhatsApp
                      </button>
                      <button
                        onClick={() => setEstimate(null)}
                        className="px-5 py-4 rounded-2xl border border-white/10 text-slate-400 text-xs font-bold hover:border-premiumYellow/40 hover:text-premiumYellow transition-all"
                      >
                        Try Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}