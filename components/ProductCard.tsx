'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Bookmark, MessageCircle, Scale } from 'lucide-react'
import type { StoreProduct } from '@/lib/productTypes'

export default function ProductCard({ 
  product, 
  onToggleWishlist, 
  onToggleCompare, 
  isInWishlist, 
  isInCompare,
  showCompare = true,
}: { 
  product: StoreProduct,
  onToggleWishlist: (p: StoreProduct) => void,
  onToggleCompare: (p: StoreProduct) => void,
  isInWishlist: boolean,
  isInCompare: boolean,
  showCompare?: boolean
}) {
  const isDemo = product.status === 'demo';
  const isSoldOut = isDemo || (product.stock_quantity || 0) <= 0;
  const category = product.category ?? 'phones'
  const categoryLabel = category === 'audio' ? 'audio product' : category === 'laptops' ? 'laptop' : 'smartphone'
  
  // Existing WhatsApp logic preserved
  const waMsg = encodeURIComponent(
    `Hi Fonestack! 👋\nI'm interested in: *${product.name}*\nPrice: ₦${product.price.toLocaleString()}\nIs this available?`
  );

  return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        viewport={{ once: true }}
        className={`group liquid-glass rounded-3xl p-4 flex flex-col gap-4 transition-all duration-500 
          ${isSoldOut ? 'opacity-60 grayscale' : 'hover:border-premiumYellow/40 hover:shadow-2xl hover:shadow-premiumYellow/10'}`}
      >
        {/* Specular Shine Effect Layer */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Top Actions */}
        <div className="flex justify-between items-start z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase
            ${isDemo ? 'bg-slate-700 text-white' :
              product.status === 'hot' ? 'bg-red-500 text-white' :
              product.status === 'used' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-premiumYellow text-black'}`}
            aria-label={`Status: ${isDemo ? 'Demo listing, not for sale' : product.status === 'hot' ? 'Hot Deal' : product.status === 'used' ? 'Used' : 'New'}`}
          >
            {isDemo ? 'Demo only' : product.status === 'hot' ? '🔥 Hot Deal' : product.status === 'used' ? 'Used' : 'New'}
          </span>
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2 rounded-full liquid-glass transition-colors ${isInWishlist ? 'text-premiumYellow bg-premiumYellow/10' : 'text-slate-400'}`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isInWishlist}
          >
            <Bookmark className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {/* Image Area */}
        <div className="relative h-48 w-full flex items-center justify-center p-4">
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <span className="bg-black/80 text-white border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest">
                {isDemo ? 'DEMO ONLY' : 'SOLD OUT'}
              </span>
            </div>
          )}
          {product.image_url ? (
            <Image
              src={product.image_url} 
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              alt={`${product.brand} ${product.name} ${categoryLabel} at Fonestack, Computer Village, Ikeja, Lagos`}
              className="p-4 object-contain group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div
              className="text-6xl"
              role="img"
              aria-label={`${product.brand} ${product.name} ${categoryLabel} at Fonestack, Computer Village, Ikeja, Lagos`}
            >
            {category === 'audio' ? '🎧' : category === 'laptops' ? '💻' : '📱'}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-premiumYellow opacity-70">
            {product.brand}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-premiumYellow transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">
            {product.spec || 'Contact for full specifications.'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-xs opacity-50 dark:text-white uppercase font-mono text-[9px]">{isDemo ? 'Demo listing' : 'Price'}</span>
            <span className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
              {isDemo ? 'Price not set' : (
                <>
                  <span>₦</span>
                  <span>{product.price.toLocaleString()}</span>
                </>
              )}
            </span>
          </div>
          
          <a 
            href={isSoldOut ? '#' : `https://wa.me/2349029928322?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-11 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all
              ${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-premiumYellow text-black hover:scale-105 active:scale-95'}`}
            aria-label={isSoldOut ? 'Item sold out' : `Buy ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Buy
          </a>
        </div>

        {/* Compare Trigger */}
        {showCompare && (
          <button
            onClick={() => onToggleCompare(product)}
            className={`w-full min-h-11 py-2 rounded-xl border border-dashed transition-all text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2
              ${isInCompare ? 'border-premiumYellow text-premiumYellow bg-premiumYellow/5' : 'border-white/10 text-slate-500 hover:border-white/30'}`}
            aria-label={isInCompare ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
            aria-pressed={isInCompare}
          >
            <Scale className="w-3 h-3" aria-hidden="true" />
            {isInCompare ? 'In Compare' : 'Add to Compare'}
          </button>
        )}
      </motion.article>
  )
}