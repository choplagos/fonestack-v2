'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Trophy, Zap } from 'lucide-react'
import AICompareSection from './AICompareSection'

export default function ComparisonModal({ 
  isOpen, 
  onClose, 
  phones, 
  onRemove 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  phones: any[], 
  onRemove: (id: number) => void 
}) {
  if (!isOpen) return null;

  const specRows: { label: string; key: string; fmt: (v: any) => string }[] = [
    { label: 'Price', key: 'price', fmt: (v: any) => `₦${Number(v).toLocaleString()}` },
    { label: 'Condition', key: 'status', fmt: (v: any) => String(v ?? '').toUpperCase() },
    { label: 'Brand', key: 'brand', fmt: (v: any) => v },
    { label: 'Specifications', key: 'spec', fmt: (v: any) => v || '—' },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-3xl p-4 md:p-12 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display font-extrabold dark:text-white">
              Phone <span className="text-premiumYellow">Comparison</span>
            </h2>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full liquid-glass border-white/20 flex items-center justify-center hover:text-red-500 transition-colors"
            >
              <X />
            </button>
          </div>

          {/* Comparison Table Container */}
          <div className="liquid-glass rounded-3xl overflow-hidden border-white/10 shadow-2xl">
            <table className="w-full text-left border-collapse">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-20 liquid-glass border-b border-white/10">
                <tr>
                  <th className="p-6 w-1/4"></th>
                  {phones.map(p => (
                    <th key={p.id} className="p-6 w-1/4">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <img src={p.image_url} className="h-24 object-contain" alt={p.name} />
                        <div>
                          <div className="text-[10px] font-mono text-premiumYellow uppercase tracking-widest">{p.brand}</div>
                          <div className="font-bold dark:text-white text-sm line-clamp-1">{p.name}</div>
                        </div>
                        <a 
                          href={`https://wa.me/2349029928322?text=Hi, I compared phones and want to buy the ${p.name}`}
                          className="bg-wa text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2"
                        >
                          <MessageCircle className="w-3 h-3" /> Buy Now
                        </a>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/5">
                {specRows.map(row => (
                  <tr key={row.label} className="group hover:bg-white/5 transition-colors">
                    <td className="p-6 text-xs font-mono uppercase tracking-widest opacity-40 dark:text-white">
                      {row.label}
                    </td>
                    {phones.map(p => (
                      <td key={p.id} className="p-6 text-sm font-medium dark:text-slate-200 text-center">
                        {row.fmt(p[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Comparison Section below table */}
          <div className="mt-12">
             <AICompareSection phones={phones} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
