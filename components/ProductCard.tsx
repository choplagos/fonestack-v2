'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Bookmark, MessageCircle, Scale, Star } from 'lucide-react'
import Script from 'next/script'

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

export default function ProductCard({ 
  product, 
  onToggleWishlist, 
  onToggleCompare, 
  isInWishlist, 
  isInCompare 
}: { 
  product: Product, 
  onToggleWishlist: (p: Product) => void,
  onToggleCompare: (p: Product) => void,
  isInWishlist: boolean,
  isInCompare: boolean
}) {
  const isSoldOut = (product.stock_quantity || 0) <= 0;
  
  // Product Schema for SEO
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    description: product.spec || `${product.brand} ${product.name} - Premium smartphone available at Fonestack, Computer Village Ikeja.`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NGN',
      price: product.price,
      availability: isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: {
        '@type': 'LocalBusiness',
        name: 'Fonestack',
      },
      url: `https://fonestack.vercel.app/#phones`,
    },
    image: product.image_url ? [product.image_url] : [],
  };

  // Existing WhatsApp logic preserved
  const waMsg = encodeURIComponent(
    `Hi Fonestack! 👋\nI'm interested in: *${product.name}*\nPrice: ₦${product.price.toLocaleString()}\nIs this available?`
  );

  return (
    <>
      {/* Product Schema - JSON-LD */}
      <Script
        id={`product-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        viewport={{ once: true }}
        className={`group liquid-glass rounded-3xl p-4 flex flex-col gap-4 transition-all duration-500 
          ${isSoldOut ? 'opacity-60 grayscale' : 'hover:border-premiumYellow/40 hover:shadow-2xl hover:shadow-premiumYellow/10'}`}
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* Specular Shine Effect Layer */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Top Actions */}
        <div className="flex justify-between items-start z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase
            ${product.status === 'hot' ? 'bg-red-500 text-white' : 
              product.status === 'used' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
              'bg-premiumYellow text-black'}`}
            aria-label={`Status: ${product.status === 'hot' ? 'Hot Deal' : product.status === 'used' ? 'Used' : 'New'}`}
          >
            {product.status === 'hot' ? '🔥 Hot Deal' : product.status === 'used' ? 'Used' : 'New'}
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
              <span className="bg-black/80 text-white border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest">SOLD OUT</span>
            </div>
          )}
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={`${product.brand} ${product.name} - ${product.spec || 'Smartphone'}`}
              className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              itemProp="image"
            />
          ) : (
            <div className="text-6xl" role="img" aria-label={`${product.brand} ${product.name}`}>
              📱
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-premiumYellow opacity-70" itemProp="brand" itemScope itemType="https://schema.org/Brand">
            {product.brand}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-premiumYellow transition-colors line-clamp-1" itemProp="name">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8" itemProp="description">
            {product.spec || 'Contact for full specifications.'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-xs opacity-50 dark:text-white uppercase font-mono text-[9px]">Best Price</span>
            <span className="text-lg font-display font-extrabold text-slate-900 dark:text-white" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="priceCurrency" content="NGN">₦</span>
              <span itemProp="price" content={product.price.toString()}>{product.price.toLocaleString()}</span>
            </span>
          </div>
          
          <a 
            href={isSoldOut ? '#' : `https://wa.me/2349029928322?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all
              ${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-premiumYellow text-black hover:scale-105 active:scale-95'}`}
            aria-label={isSoldOut ? 'Item sold out' : `Buy ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Buy
          </a>
        </div>

        {/* Compare Trigger */}
        <button 
          onClick={() => onToggleCompare(product)}
          className={`w-full py-2 rounded-xl border border-dashed transition-all text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2
            ${isInCompare ? 'border-premiumYellow text-premiumYellow bg-premiumYellow/5' : 'border-white/10 text-slate-500 hover:border-white/30'}`}
          aria-label={isInCompare ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
          aria-pressed={isInCompare}
        >
          <Scale className="w-3 h-3" aria-hidden="true" />
          {isInCompare ? 'In Compare' : 'Add to Compare'}
        </button>
      </motion.article>
    </>
  )
}