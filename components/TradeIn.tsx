'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const BRANDS = ['Apple', 'Samsung', 'Tecno', 'Infinix', 'Itel', 'Google', 'Xiaomi', 'OnePlus', 'Other']
const GRADES = [
  { value: 'A', label: 'A — Excellent, like new' },
  { value: 'B', label: 'B — Good, light wear' },
  { value: 'C', label: 'C — Fair, visible wear' },
]
const STORAGE = ['Not sure', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB']

export default function TradeIn() {
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', brand: '', model: '', storage_gb: '', condition_grade: 'B', condition_description: '', has_box: false, has_charger: false })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storage_gb: form.storage_gb && form.storage_gb !== 'Not sure' ? parseInt(form.storage_gb) : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get estimate')
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsApp = () => {
    if (!result) return
    const msg = encodeURIComponent(`Hi Fonestack! TRADE-IN REQUEST\nName: ${form.customer_name}\nPhone: ${form.customer_phone}\nDevice: ${form.brand} ${form.model} ${form.storage_gb && form.storage_gb !== 'Not sure' ? '('+form.storage_gb+')' : ''}\nGrade: ${form.condition_grade}\nAI Estimate: \u20a6${result.estimate_low.toLocaleString()} \u2013 \u20a6${result.estimate_high.toLocaleString()}\n\nReady to trade in!`)
    window.open(`https://wa.me/2349029928322?text=${msg}`, '_blank')
  }

  return (
    <section id="trade-in" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-premiumYellow/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// Sell or Swap</div>
          <h2 className="text-3xl md:text-5xl font-display font-black dark:text-white">
            Trade In Your <span className="text-premiumYellow">Old Phone</span>
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base">Get an instant AI-powered estimate, then finalize on WhatsApp.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} className="liquid-glass p-5 md:p-8 rounded-[2rem] relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Your Name</label>
                  <input required placeholder="Full name" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">WhatsApp Number</label>
                  <input required placeholder="08012345678" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Brand</label>
                  <select required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base">
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Model</label>
                  <input required placeholder="e.g. iPhone 13" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Storage</label>
                  <select value={form.storage_gb} onChange={e => setForm({ ...form, storage_gb: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base">
                    {STORAGE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Condition</label>
                  <select value={form.condition_grade} onChange={e => setForm({ ...form, condition_grade: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base">
                    {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Describe condition</label>
                <textarea rows={2} placeholder="e.g. Screen is perfect, battery drains a bit fast..." value={form.condition_description}
                  onChange={e => setForm({ ...form, condition_description: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base resize-none" />
              </div>

              <div className="flex gap-6">
                {[{ key: 'has_box', label: 'Has original box' }, { key: 'has_charger', label: 'Has charger' }].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} className="w-5 h-5 accent-premiumYellow rounded" />
                    <span className="text-sm dark:text-slate-300">{label}</span>
                  </label>
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-premiumYellow/20 transition-all disabled:opacity-50 min-h-[52px]">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Getting AI Estimate...</> : <><RefreshCw className="w-5 h-5" /> Get My Estimate</>}
              </button>
            </form>
          </motion.div>

          {/* Result Panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {!result && !error && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="liquid-glass rounded-[2rem] p-10 flex flex-col items-center justify-center text-center flex-1 min-h-[200px] lg:min-h-[300px]">
                  <div className="text-5xl mb-4">💰</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in your phone's details to get an instant AI-powered trade-in estimate.</p>
                </motion.div>
              )}

              {error && (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="liquid-glass rounded-[2rem] p-6 flex items-center gap-4">
                  <AlertCircle className="text-red-400 w-8 h-8 flex-shrink-0" />
                  <div><div className="font-bold text-red-400">Something went wrong</div><div className="text-sm text-slate-400 mt-1">{error}</div></div>
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="liquid-glass rounded-[2rem] p-5 md:p-8 space-y-5 relative">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-premiumYellow w-6 h-6" />
                    <span className="font-mono text-xs uppercase tracking-widest text-premiumYellow">AI Estimate Ready</span>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Estimated Trade-In Value</div>
                    <div className="text-3xl md:text-4xl font-display font-black text-premiumYellow">
                      &#8358;{result.estimate_low.toLocaleString()} &ndash; &#8358;{result.estimate_high.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-slate-400">
                      Confidence: {result.confidence}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 text-sm text-slate-400 leading-relaxed">{result.reasoning}</div>
                  {result.red_flags && (
                    <div className="flex gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                      <AlertCircle className="text-orange-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-300">{result.red_flags}</p>
                    </div>
                  )}
                  <button onClick={sendWhatsApp} className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all min-h-[52px]">
                    Finalize on WhatsApp
                  </button>
                  <p className="text-center text-xs text-slate-500">AI estimate only. Final price confirmed by Fonestack staff.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}