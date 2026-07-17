'use client'
import React from 'react'
import { motion } from 'framer-motion'

export default function PhoneRig({ chips }: { chips: Array<{ brand: string, price: string }> }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]" aria-hidden="true" role="presentation">
      <div className="relative w-[340px] h-[420px] preserve-3d">
        
        {/* Floating Glass Price Chips */}
        {chips.map((chip, idx) => (
          <motion.div
            key={idx}
            animate={{ 
              y: [0, -10, 0],
              rotateZ: idx % 2 === 0 ? [0, 2, 0] : [0, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: idx * 0.5, 
              ease: "easeInOut" 
            }}
            style={{ 
              top: idx === 0 ? '20%' : idx === 1 ? '50%' : '80%',
              left: idx === 0 ? '-10%' : idx === 1 ? '85%' : '20%'
            }}
            className="absolute z-50 liquid-glass p-3 px-5 rounded-2xl shadow-2xl border-white/20"
            role="presentation"
            aria-label={`${chip.brand} phone from ₦${chip.price}`}
          >
            <div className="text-[10px] font-mono text-premiumYellow uppercase tracking-tighter opacity-70">
              {chip.brand}
            </div>
            <div className="text-lg font-bold dark:text-white">
              {chip.price}
            </div>
          </motion.div>
        ))}

        {/* CSS 3D Phones (Simplification for visual) */}
        {/* Note: I'm keeping the 3D CSS logic from your code but styling the "Glass" */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[160px] h-[320px] bg-slate-800 rounded-[30px] border-4 border-slate-700 shadow-2xl rotate-y-12 translate-z-10 overflow-hidden relative">
             <div className="absolute top-0 inset-x-0 h-6 bg-black flex justify-center items-end pb-1" aria-hidden="true">
               <div className="w-12 h-1.5 bg-slate-900 rounded-full" />
             </div>
             <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-black p-4 pt-10">
               <div className="w-8 h-8 bg-white/10 rounded-lg blur-xl" aria-hidden="true" />
             </div>
           </div>
          
           <div className="absolute w-[150px] h-[310px] bg-slate-900 rounded-[30px] border-4 border-slate-800 shadow-2xl -rotate-y-12 -translate-z-10 translate-x-12 translate-y-6 overflow-hidden">
             <div className="w-full h-full bg-gradient-to-tr from-black via-slate-900 to-slate-800" aria-hidden="true" />
           </div>
        </div>
      </div>
    </div>
  )
}