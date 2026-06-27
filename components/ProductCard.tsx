'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Bookmark, MessageCircle, Scale, Smartphone } from 'lucide-react'

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  status: string;
  image_url: string;
  spec: string;
  stock_quantity: number;
  rating?: number;
}

export default function ProductCard({ product, onToggleWishlist, onToggleCompare, isInWishlist, isInCompare }: { product: Product, onToggleWishlist: (p: Product) => void, onToggleCompare: (p: Product) => void, isInWishlist: boolean, isInCompare: boolean }) {
  const isSoldOut = (product.stock_quantity || 0) <= 0
  const price = product.price.toLocaleString()
  const waMsg = encodeURIComponent('Hi Fonestack! I am interested in: ' + product.name + ' Price: N' + price + ' Is this available?')
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} viewport={{ once: true }}
      className={`group relative liquid-glass rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 flex flex-col gap-2 sm:gap-3 md:gap-4 transition-all duration-500 ${isSoldOut ? 'opacity-60 grayscale' : 'hover:border-premiumYellow/40 hover:shadow-2xl hover:shadow-premiumYellow/10'}`}>
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl" />
      <div className="flex justify-between items-start z-10">
        <span className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-bold font-mono tracking-wide uppercase ${product.status === 'hot' ? 'bg-red-500 text-white' : product.status === 'used' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-premiumYellow text-black'}`}>
          {product.status === 'hot' ? 'Hot' : product.status === 'used' ? 'Used' : 'New'}
        </span>
        <button onClick={() => onToggleWishlist(product)} className={`p-1 sm:p-1.5 md:p-2 rounded-full liquid-glass transition-colors ${isInWishlist ? 'text-premiumYellow bg-premiumYellow/10' : 'text-slate-400'}`}>
          <Bookmark className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="relative h-20 sm:h-32 md:h-44 w-full flex items-center justify-center p-1 sm:p-2 md:p-4">
        {isSoldOut && (<div className="absolute inset-0 flex items-center justify-center z-20"><span className="bg-black/80 text-white border border-white/20 px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-bold tracking-widest">SOLD OUT</span></div>)}
        {product.image_url ? (<img src={product.image_url} alt={product.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />) : (<Smartphone className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-slate-300 dark:text-slate-600" />)}
      </div>
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-premiumYellow opacity-70">{product.brand}</span>
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-premiumYellow transition-colors line-clamp-1 text-[10px] sm:text-xs md:text-sm">{product.name}</h3>
        <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 hidden sm:block">{product.spec || 'Contact for specs.'}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 sm:pt-3 md:pt-4 border-t border-white/5">
        <div className="flex flex-col">
          <span className="text-[7px] sm:text-[8px] md:text-[9px] opacity-50 dark:text-white uppercase font-mono">Price</span>
          <span className="text-[10px] sm:text-xs md:text-base font-display font-extrabold text-slate-900 dark:text-white">&#8358;{product.price.toLocaleString()}</span>
        </div>
        <a href={isSoldOut ? '#' : 'https://wa.me/2349029928322?text=' + waMsg} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] md:text-xs font-bold transition-all ${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none' : 'bg-premiumYellow text-black hover:scale-105 active:scale-95'}`}>
          <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /><span className="hidden sm:inline">Buy</span>
        </a>
      </div>
      <button onClick={() => onToggleCompare(product)}
        className={`w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-dashed transition-all text-[8px] sm:text-[9px] md:text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-1 sm:gap-2 ${isInCompare ? 'border-premiumYellow text-premiumYellow bg-premiumYellow/5' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
        <Scale className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="hidden sm:inline">{isInCompare ? 'In Compare' : 'Add to Compare'}</span>
        <span className="sm:hidden">{isInCompare ? 'Added' : 'Compare'}</span>
      </button>
    </motion.div>
  )
}
