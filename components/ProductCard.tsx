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
      {/* Image — fixed aspect ratio prevents CLS when Supabase images load */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-white/5 overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-3 sm:p-6 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl select-none">
            📱
          </div>
        )}

        {/* Condition badge */}
        <span className={`absolute top-2 left-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${conditionColor[badge] ?? conditionColor['New']}`}>
          {badge}
        </span>

        {/* Wishlist button — 44×44px tap target */}
        <button
          onClick={() => onToggleWishlist(product)}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-1.5 right-1.5 min-h-[44px] min-w-[44px] rounded-xl backdrop-blur-md transition-all flex items-center justify-center
            ${isInWishlist
              ? 'bg-premiumYellow text-black'
              : 'bg-black/20 text-white active:bg-premiumYellow active:text-black'}`}
        >
          <Bookmark className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4 gap-1.5 sm:gap-3">
        <div>
          <p className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest font-medium truncate">{product.brand}</p>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight mt-0.5 line-clamp-2 text-xs sm:text-sm">
            {product.name}
          </h3>
        </div>

        {/* Specs chips — hidden on mobile to avoid cramping 3-col cards */}
        {(product.storage || product.ram) && (
          <div className="hidden sm:flex flex-wrap gap-1.5">
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
          <div className="hidden sm:flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-premiumYellow fill-premiumYellow" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-1.5 sm:pt-2 border-t border-white/5">
          <p className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
            ₦{product.price.toLocaleString()}
          </p>
          {product.is_available !== false && (
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3 flex-shrink-0" /> In Stock
            </p>
          )}
        </div>

        {/* Compare toggle — 44px tap target */}
        <button
          onClick={() => onToggleCompare(product)}
          aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
          className={`w-full flex items-center justify-center gap-1.5 px-2 min-h-[40px] sm:min-h-[44px] rounded-xl transition-all text-[10px] sm:text-xs font-bold active:scale-95
            ${isInCompare
              ? 'bg-premiumYellow text-black'
              : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}
        >
          <GitCompare className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">{isInCompare ? 'Added' : 'Compare'}</span>
          <span className="sm:hidden">{isInCompare ? '✓' : '⚖'}</span>
        </button>

        {/* WhatsApp CTA — min-h-[48px] primary CTA */}
        
          href={`https://wa.me/2349029928322?text=${encodeURIComponent(`Hi, I'm interested in the ${product.name} for ₦${product.price.toLocaleString()}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-premiumYellow text-black text-[11px] sm:text-sm font-bold min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Buy via WhatsApp</span>
          <span className="sm:hidden">Buy</span>
        </a>
      </div>
    </motion.div>
  )
}