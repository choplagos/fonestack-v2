'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Scale } from 'lucide-react'

export default function ComparisonDock({ compareList, onRemove, onClear, onOpenModal }: {
  compareList: any[]
  onRemove: (id: number) => void
  onClear: () => void
  onOpenModal: () => void
}) {
  if (compareList.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[80] w-[95%] max-w-lg"
      >
        <div className="liquid-glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border border-premiumYellow/20">
          {/* Phone Avatars */}
          <div className="flex gap-2 flex-1 overflow-x-auto">
            {compareList.map(p => (
              <div key={p.id} className="relative flex-shrink-0 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl liquid-glass flex items-center justify-center overflow-hidden">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                    : <span className="text-lg">📱</span>
                  }
                </div>
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
              <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-slate-600 text-xs">+</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors hidden sm:block"
            >
              Clear
            </button>
            <button
              onClick={onOpenModal}
              disabled={compareList.length < 2}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-premiumYellow text-black text-xs font-bold disabled:opacity-40 transition-all hover:scale-105 min-h-[44px] whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare {compareList.length > 0 ? `(${compareList.length})` : ''}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}