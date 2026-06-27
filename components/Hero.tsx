'use client'
import React from 'react'
import { motion } from 'framer-motion'
import PhoneRig from './PhoneRig'

export default function Hero({ stats, chips }: {
  stats: { total: string, brands: string, new: string },
  chips: Array<{ brand: string, price: string }>
}) {
  return (
    <section className="relative min-h-screen pt-36 pb-20 overflow-hidden flex items-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-premiumYellow/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left Content */}
        <div className="z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1.5 rounded-full border border-premiumYellow/30 bg-premiumYellow/10 text-premiumYellow text-xs font-mono mb-5"
          >
            📍 COMPUTER VILLAGE, IKEJA
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] dark:text-white"
          >
            YOUR NEXT <br />
            <span className="text-premiumYellow">PHONE</span> <br />
            <span className="opacity-40">STARTS HERE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed"
          >
            Premium selection of new and fairly used smartphones. Authenticity guaranteed, localized prices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#phones" className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-premiumYellow/20 transition-all text-sm md:text-base">
              Browse Store
            </a>
            <a href="#repair" className="liquid-glass px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold dark:text-white text-sm md:text-base">
              Repair Request
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 md:mt-16 flex gap-6 md:gap-12"
          >
            <StatItem label="Devices" value={stats.total} />
            <StatItem label="Brands" value={stats.brands} />
            <StatItem label="New Arrivals" value={stats.new} />
          </motion.div>
        </div>

        {/* Right Content - 3D Rig (desktop only) */}
        <div className="relative hidden lg:block h-[600px]">
          <PhoneRig chips={chips} />
        </div>
      </div>
    </section>
  )
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-display font-bold text-premiumYellow">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">{label}</div>
    </div>
  )
}