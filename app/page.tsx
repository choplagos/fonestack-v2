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

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (data) setProducts(data)
    }
    load()
  }, [])

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

  const toggleWishlist = (item: any) => setWishlist(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : [...prev, item])
  const toggleCompare = (item: any) => setCompareList(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : prev.length < 3 ? [...prev, item] : prev)

  return (
    <main className="min-h-screen">
      <Navbar wishlistCount={wishlist.length} onSearch={setSearch} />

      <Hero
        stats={{ total: products.length.toString(), brands: '12+', new: products.filter(p => p.status === 'new').length.toString() }}
        chips={products.slice(0, 3).map(p => ({ brand: p.brand, price: `₦${p.price.toLocaleString()}` }))}
      />

      <BrandsSection products={products} />

      <section id="phones" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-4">// Shop</div>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <h2 className="text-4xl font-display font-black dark:text-white">Available <span className="text-premiumYellow">Phones</span></h2>
            <div className="ml-auto flex flex-wrap gap-3">
              <select value={filter.brand} onChange={e => setFilter({ ...filter, brand: e.target.value })} className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50">
                <option value="all">All Brands</option>
                {[...new Set(products.map(p => p.brand))].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={filter.condition} onChange={e => setFilter({ ...filter, condition: e.target.value })} className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50">
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="used">Fairly Used</option>
              </select>
              <select value={filter.sort} onChange={e => setFilter({ ...filter, sort: e.target.value })} className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {products.length === 0 ? 'Loading products...' : 'No phones match your filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => (
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

      {/* Floating WhatsApp button */}
      <a href="https://wa.me/2349029928322" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
        <span className="text-2xl">💬</span>
      </a>
    </main>
  )
}