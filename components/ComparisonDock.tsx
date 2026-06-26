'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Scale, ArrowRight } from 'lucide-react'

export default function ComparisonDock({ 
  compareList, 
  onRemove, 
  onClear, 
  onOpenModal 
}: { 
  compareList: any[], 
  onRemove: (id: number) => void,
  onClear: () => void,
  onOpenModal: () => void 
}) {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="liquid-glass p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-white/20 flex items-center gap-4 px-6"
      >
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <div className="w-8 h-8 rounded-full bg-premiumYellow/20 flex items-center justify-center">
            <Scale className="w-4 h-4 text-premiumYellow" />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 dark:text-white">Compare</div>
            <div className="text-xs font-bold dark:text-white">{compareList.length} / 3 Selected</div>
          </div>
        </div>

        {/* Selected Phone Avatars */}
        <div className="flex gap-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="relative w-12 h-12 rounded-2xl liquid-glass border-white/10 flex items-center justify-center overflow-hidden">
              {compareList[idx] ? (
                <>
                  <img src={compareList[idx].image_url} className="w-8 h-8 object-contain" />
                  <button 
                    onClick={() => onRemove(compareList[idx].id)}
                    className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="text-white/10 text-xl font-bold">+</div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <button 
            disabled={compareList.length < 2}
            onClick={onOpenModal}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs transition-all
              ${compareList.length >= 2 ? 'bg-premiumYellow text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
          >
            Compare Now
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onClear} className="p-3 hover:text-red-500 transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}