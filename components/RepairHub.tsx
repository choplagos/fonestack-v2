'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Battery, Zap, Droplets, Camera, Speaker, Wrench, MessageCircle } from 'lucide-react'

const REPAIR_TYPES = [
  { id: 'screen', label: 'Screen', icon: Smartphone, desc: 'Cracked or bleeding display' },
  { id: 'battery', label: 'Battery', icon: Battery, desc: 'Fast drain or shut downs' },
  { id: 'port', label: 'Charging', icon: Zap, desc: 'Loose port or slow charging' },
  { id: 'water', label: 'Water', icon: Droplets, desc: 'Liquid damage diagnosis' },
  { id: 'camera', label: 'Camera', icon: Camera, desc: 'Blurry or cracked lens' },
  { id: 'speaker', label: 'Audio', icon: Speaker, desc: 'Muffled sound or mic issues' },
]

export default function RepairHub() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', model: '' })

  const handleRepairWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    const waMsg = encodeURIComponent(
      `Hi Fonestack!\n\nREPAIR REQUEST\nName: ${formData.name}\nDevice: ${formData.model}\nIssue: ${selectedIssue || 'General Checkup'}\n\nWhat is the estimated cost?`
    )
    window.open(`https://wa.me/2349029928322?text=${waMsg}`, '_blank')
  }

  return (
    <section id="repair" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">

          {/* Diagnostic Grid */}
          <div>
            <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// Repair Services</div>
            <h2 className="text-3xl md:text-4xl font-display font-black dark:text-white mb-6 md:mb-8">
              What's wrong with <br /><span className="text-premiumYellow">your device?</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {REPAIR_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedIssue(type.label)}
                  className={`liquid-glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center text-center gap-2 md:gap-3 transition-all border-2 min-h-[100px]
                    ${selectedIssue === type.label ? 'border-premiumYellow bg-premiumYellow/5' : 'border-transparent'}`}
                >
                  <type.icon className={`w-6 h-6 md:w-8 md:h-8 ${selectedIssue === type.label ? 'text-premiumYellow' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-sm font-bold dark:text-white">{type.label}</div>
                    <div className="text-[9px] opacity-40 uppercase font-mono mt-1 leading-tight hidden sm:block">{type.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="liquid-glass p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/10 shadow-2xl relative"
          >
            <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <form onSubmit={handleRepairWhatsApp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Device Owner</label>
                <input
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Phone Model</label>
                <input
                  required
                  placeholder="e.g. iPhone 14 Pro Max"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-premiumYellow/50 transition-all dark:text-white text-base"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 min-h-[60px]">
                <Wrench className="text-premiumYellow w-6 h-6 flex-shrink-0" />
                <div className="text-xs">
                  <span className="opacity-50">Selected Service:</span>
                  <div className="font-bold dark:text-white">{selectedIssue || 'General Diagnostic'}</div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 md:py-5 rounded-2xl bg-premiumYellow text-black font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-premiumYellow/20 transition-all min-h-[52px]"
              >
                <MessageCircle className="w-5 h-5" />
                BOOK REPAIR ON WHATSAPP
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}