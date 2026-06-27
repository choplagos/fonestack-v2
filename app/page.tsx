'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import ComparisonDock from '@/components/ComparisonDock'
import ComparisonModal from '@/components/ComparisonModal'
import RepairHub from '@/components/RepairHub'
import TradeIn from '@/components/TradeIn'
import { BrandsSection, HowItWorks, Testimonials, FAQ, Footer } from '@/components/Sections'
import { supabase } from '@/lib/supabase'

export default function Storefront() {
  const [products, setProducts] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [compareList, setCompareList] = useState<any[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ brand: 'all', maxPrice: 0, sort: 'newest', condition: 'all' })
  const [visibleCount, setVisibleCount] = useState(12)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (data) setProducts(data)
    }
    load()
  }, [])

  useEffect(() => {
    setVisibleCount(12)
  }, [search, filter])

  const maxProductPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 2000000

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
      const matchBrand = filter.brand === 'all' || p.brand.toLowerCase() === filter.brand.toLowerCase()
      const matchPrice = !filter.maxPrice || p.price <= filter.maxPrice
      const matchCondition = filter.condition === 'all' || (filter.condition === 'new' ? p.status === 'new' : p.status !== 'new')
      return matchSearch && matchBrand && matchPrice && matchCondition
    })
    .sort((a, b) => {
      if (filter.sort === 'price_asc') return a.price - b.price
      if (filter.sort === 'price_desc') return b.price - a.price
      return 0
    })

  const visible = filtered.slice(0, visibleCount)
  const sliderValue = filter.maxPrice || maxProductPrice

  const toggleWishlist = (item: any) => setWishlist(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : [...prev, item])
  const toggleCompare = (item: any) => setCompareList(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : prev.length < 3 ? [...prev, item] : prev)

  return (
    <main className="min-h-screen">
      <Navbar wishlistCount={wishlist.length} onSearch={setSearch} />

      <Hero
        stats={{ total: products.length.toString(), brands: '12+', new: products.filter(p => p.status === 'new').length.toString() }}
        chips={products.slice(0, 3).map(p => ({ brand: p.brand, price: `\u20a6${p.price.toLocaleString()}` }))}
      />

      <BrandsSection products={products} />

      <section id="phones" className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-3 md:mb-4">// Shop</div>

          {/* Filters - scroll horizontally on mobile */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black dark:text-white">
              Available <span className="text-premiumYellow">Phones</span>
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:ml-auto sm:flex-wrap">
              <select
                value={filter.brand}
                onChange={e => setFilter({ ...filter, brand: e.target.value })}
                className="flex-shrink-0 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50"
              >
                <option value="all">All Brands</option>
                {Array.from(new Set(products.map(p => p.brand))).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={filter.condition}
                onChange={e => setFilter({ ...filter, condition: e.target.value })}
                className="flex-shrink-0 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50"
              >
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>

              <select
                value={filter.sort}
                onChange={e => setFilter({ ...filter, sort: e.target.value })}
                className="flex-shrink-0 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Low to High</option>
                <option value="price_desc">High to Low</option>
              </select>

              {products.length > 0 && (
                <div className="flex-shrink-0 flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">Max:</span>
                  <input
                    type="range"
                    min={Math.min(...products.map(p => p.price))}
                    max={maxProductPrice}
                    step={Math.max(1000, Math.round(maxProductPrice / 100))}
                    value={sliderValue}
                    onChange={e => {
                      const val = Number(e.target.value)
                      setFilter({ ...filter, maxPrice: val >= maxProductPrice ? 0 : val })
                    }}
                    className="w-20 sm:w-28 accent-premiumYellow cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-premiumYellow whitespace-nowrap min-w-[50px]">
                    {filter.maxPrice ? `\u20a6${(filter.maxPrice / 1000).toFixed(0)}k` : 'Any'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {products.length === 0 ? 'Loading products...' : 'No phones match your filters.'}
            </div>
          ) : (
            <>
              {/* Fluid 3-col on mobile, 4 on tablet, 5 on desktop */}
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {visible.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isInWishlist={wishlist.some(w => w.id === p.id)}
                    isInCompare={compareList.some(c => c.id === p.id)}
                    onToggleWishlist={toggleWishlist}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>

              {filtered.length > visibleCount && (
                <div className="flex flex-col items-center mt-8 md:mt-12 gap-3">
                  <button
                    onClick={() => setVisibleCount(v => v + 12)}
                    className="liquid-glass px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold dark:text-white hover:border-premiumYellow/30 border border-transparent transition-all text-sm md:text-base"
                  >
                    Load More — {filtered.length - visibleCount} more phone{filtered.length - visibleCount !== 1 ? 's' : ''}
                  </button>
                  <span className="text-xs font-mono text-slate-500">
                    Showing {visibleCount} of {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <TradeIn />
      <RepairHub />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Footer />

      <ComparisonDock
        compareList={compareList}
        onRemove={(id) => setCompareList(p => p.filter(x => x.id !== id))}
        onClear={() => setCompareList([])}
        onOpenModal={() => setIsCompareOpen(true)}
      />

      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        phones={compareList}
        onRemove={(id) => setCompareList(p => p.filter(x => x.id !== id))}
      />

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/2349029928322"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        <span className="text-xl sm:text-2xl">💬</span>
      </a>
    </main>
  )
}