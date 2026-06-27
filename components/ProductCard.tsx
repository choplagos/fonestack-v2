'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, GitCompare, MessageCircle, Star, CheckCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  image_url?: string
  storage?: string
  ram?: string
  condition?: string
  color?: string
  rating?: number
  is_available?: boolean
}

interface ProductCardProps {
  product: Product
  isInWishlist: boolean
  isInCompare: boolean
  onToggleWishlist: (item: Product) => void
  onToggleCompare: (item: Product) => void
}

export default function ProductCard({
  product,
  isInWishlist,
  isInCompare,
  onToggleWishlist,
  onToggleCompare,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false)

  const conditionColor: Record<string, string> = {
    New: 'text-emerald-400 bg-emerald-400/10',
    'Like New': 'text-sky-400 bg-sky-400/10',
    Good: 'text-amber-400 bg-amber-400/10',
    Fair: 'text-orange-400 bg-orange-400/10',
  }

  const badge = product.condition ?? 'New'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-2xl liquid-glass overflow-hidden flex flex-col transition-shadow ${isInCompare ? 'ring-2 ring-premiumYellow' : ''}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-slate-100 dark:bg-white/5 overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl select-none">
            📱
          </div>
        )}

        {/* Condition badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${conditionColor[badge] ?? conditionColor['New']}`}>
          {badge}
        </span>

        {/* Wishlist button — 44px tap target, always visible on mobile */}
        <button
          onClick={() => onToggleWishlist(product)}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 p-3 min-h-[44px] min-w-[44px] rounded-xl backdrop-blur-md transition-all flex items-center justify-center
            ${isInWishlist
              ? 'bg-premiumYellow text-black'
              : 'bg-black/20 text-white active:bg-premiumYellow active:text-black'}`}
        >
          <Bookmark className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">{product.brand}</p>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight mt-0.5 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Specs chips — min 12px font */}
        {(product.storage || product.ram) && (
          <div className="flex flex-wrap gap-1.5">
            {product.storage && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 font-medium">
                {product.storage}
              </span>
            )}
            {product.ram && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 font-medium">
                {product.ram} RAM
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-premiumYellow fill-premiumYellow" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price + Compare — flex-wrap prevents collision on narrow screens */}
        <div className="flex items-center justify-between gap-2 flex-wrap mt-auto pt-2 border-t border-white/5">
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              ₦{product.price.toLocaleString()}
            </p>
            {product.is_available !== false && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> In Stock
              </p>
            )}
          </div>

          {/* Compare toggle — visible label, solid bg, 44px tap target */}
          <button
            onClick={() => onToggleCompare(product)}
            aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
            className={`flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl transition-all text-xs font-bold active:scale-95
              ${isInCompare
                ? 'bg-premiumYellow text-black'
                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}
          >
            <GitCompare className="w-4 h-4 flex-shrink-0" />
            <span>{isInCompare ? 'Added' : 'Compare'}</span>
          </button>
        </div>

        {/* WhatsApp CTA — fully encoded message */}
        <a
          href={`https://wa.me/2349029928322?text=${encodeURIComponent(`Hi, I'm interested in the ${product.name} for ₦${product.price.toLocaleString()}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-premiumYellow text-black text-sm font-bold min-h-[44px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
          Buy via WhatsApp
        </a>
      </div>
    </motion.div>
  )
}