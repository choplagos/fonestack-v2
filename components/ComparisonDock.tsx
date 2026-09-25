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
    <div className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex justify-center sm:bottom-8" role="region" aria-label="Phone comparison dock">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="liquid-glass w-full max-w-xl p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-white/20 flex items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6"
      >
        <div className="flex items-center gap-2 pr-2 border-r border-white/10 sm:pr-4">
          <div className="w-8 h-8 rounded-full bg-premiumYellow/20 flex items-center justify-center" aria-hidden="true">
            <Scale className="w-4 h-4 text-premiumYellow" />
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 dark:text-white">Compare</div>
            <div className="text-xs font-bold dark:text-white" aria-live="polite">{compareList.length} / 3 Selected</div>
          </div>
        </div>

        {/* Selected Phone Avatars */}
        <div className="flex gap-1.5 sm:gap-3" role="list" aria-label="Selected phones for comparison">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl liquid-glass border-white/10 flex items-center justify-center overflow-hidden" role="listitem">
              {compareList[idx] ? (
                <>
                  <img 
                    src={compareList[idx].image_url} 
                    className="w-8 h-8 object-contain" 
                    alt={compareList[idx].name}
                    loading="lazy"
                  />
                  <button 
                    onClick={() => onRemove(compareList[idx].id)}
                    className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
                    aria-label={`Remove ${compareList[idx].name} from comparison`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <div className="text-white/10 text-xl font-bold" aria-hidden="true">+</div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pl-2 border-l border-white/10 sm:gap-2 sm:pl-4">
          <button 
            disabled={compareList.length < 2}
            onClick={onOpenModal}
            className={`flex items-center gap-1 px-3 py-3 rounded-2xl font-bold text-[10px] sm:gap-2 sm:px-6 sm:text-xs transition-all
              ${compareList.length >= 2 ? 'bg-premiumYellow text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            aria-label={compareList.length >= 2 ? 'Compare selected phones' : 'Select at least 2 phones to compare'}
          >
            <span className="sm:hidden">Compare</span>
            <span className="hidden sm:inline">Compare Now</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button 
            onClick={onClear} 
            className="p-3 hover:text-red-500 transition-colors text-slate-500"
            aria-label="Clear all comparisons"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}