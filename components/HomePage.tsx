'use client'
import { useState, useEffect, useMemo } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import ComparisonDock from '@/components/ComparisonDock'
import ComparisonModal from '@/components/ComparisonModal'
import RepairHub from '@/components/RepairHub'
import { supabase } from '@/lib/supabase'
import TradeInEstimator from '@/components/TradeInEstimator'
import BNPLSection from '@/components/BNPLSection'
import { sortProductsForCatalogue, sortProductsForSearch } from '@/lib/productMerchandising'
import { PRODUCT_CATEGORIES, getProductCategory, type ProductCategory } from '@/lib/productCategories'
import { SITE_URL } from '@/lib/constants'

// FAQ Schema for AI Search
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What types of devices do you sell?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We sell new and fairly used smartphones, laptops, and audio products from premium brands. All devices are authenticity guaranteed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer phone repair services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we offer expert repair services for all smartphone brands including screen replacement, battery replacement, water damage repair, camera repair, and more. Located in Computer Village, Ikeja.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your warranty policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All our devices come with a 7-14 days standard warranty. Repair services also include warranty coverage. Contact us for full warranty terms.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I pay for my purchase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept Bank Transfer, Cash, and other payment methods. All transactions are secure and verified.',
      },
    },
  ],
}

// Product Collection Schema
const productCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProductCollection',
  name: 'Fonestack Device Collection',
  description: 'Premium selection of phones, laptops, and audio products in Ikeja, Lagos.',
  url: `${SITE_URL}/#products`,
}

const PRODUCTS_PER_PAGE = 12
type StoreProduct = {
  id: number
  name: string
  brand: string
  price: number
  status: string
  image_url: string
  spec: string
  stock_quantity: number
  category?: ProductCategory
}

export default function Storefront() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [wishlist, setWishlist] = useState<StoreProduct[]>([])
  const [compareList, setCompareList] = useState<StoreProduct[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (err) {
          console.error('Supabase error:', err)
          setError('Failed to load products. Check your Supabase connection.')
          return
        }
        
        if (data) {
          setProducts(data.map(product => ({
            ...product,
            category: getProductCategory(product.category),
          })))
        }
      } catch (err) {
        console.error('Error loading products:', err)
        setError('An unexpected error occurred while loading products.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const catalogueProducts = useMemo(
    () => sortProductsForCatalogue(products, PRODUCTS_PER_PAGE),
    [products]
  )

  const categoryProducts = useMemo(
    () => selectedCategory === 'all'
      ? catalogueProducts
      : catalogueProducts.filter(product => product.category === selectedCategory),
    [catalogueProducts, selectedCategory]
  )

  const filtered = useMemo(
    () => sortProductsForSearch(categoryProducts, search),
    [categoryProducts, search]
  )

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }, [search, selectedCategory])

  return (
    <>
      {/* Structured Data for AI Search */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <Script
        id="product-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productCollectionSchema),
        }}
      />

      <main>
        {/* Breadcrumb Schema for Homepage */}
        <nav aria-label="Breadcrumb" className="sr-only">
          <ol>
            <li><a href="/">Home</a></li>
          </ol>
        </nav>

        <Navbar wishlistCount={wishlist.length} onSearch={setSearch} />
        
        <Hero 
          stats={{ 
            total: products.length.toString(), 
            brands: '12+', 
            new: '24' 
          }} 
          chips={catalogueProducts.slice(0, 3).map(p => ({
            brand: p.brand, 
            price: `₦${p.price.toLocaleString()}` 
          }))}
        />

        <section id="products" className="max-w-7xl mx-auto px-6 py-20" aria-labelledby="products-heading">
          <div className="flex flex-col gap-6 mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-premiumYellow font-mono text-xs tracking-widest uppercase mb-3">
                // Device Collection
              </div>
              <h2 id="products-heading" className="text-3xl md:text-4xl font-display font-black dark:text-white">
                Find your next device
              </h2>
            </div>
            <div className="w-full sm:max-w-sm">
              <label htmlFor="product-catalog-search" className="sr-only">Search the product collection</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="product-catalog-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name or brand"
                  className="w-full rounded-2xl border border-white/10 bg-black/10 py-3.5 pl-11 pr-11 text-sm dark:text-white focus:outline-none focus:border-premiumYellow/50"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 hover:text-white"
                    aria-label="Clear product search"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                {loading ? 'Loading products…' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'} available`}
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3" role="group" aria-label="Filter products by category">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${selectedCategory === 'all' ? 'bg-premiumYellow text-black' : 'liquid-glass text-slate-500 dark:text-white'}`}
            >
              All products
            </button>
            {PRODUCT_CATEGORIES.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${selectedCategory === category.id ? 'bg-premiumYellow text-black' : 'liquid-glass text-slate-500 dark:text-white'}`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="py-10 sm:py-20" aria-live="polite" aria-busy="true">
              <p className="text-center text-slate-600 dark:text-slate-400">Loading products...</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="liquid-glass rounded-3xl p-4 h-80 animate-pulse">
                    <div className="h-48 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
                    <div className="mt-6 h-3 w-1/3 rounded bg-slate-200/50 dark:bg-white/5" />
                    <div className="mt-3 h-5 w-2/3 rounded bg-slate-200/50 dark:bg-white/5" />
                    <div className="mt-8 h-10 rounded-xl bg-slate-200/50 dark:bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <p className="text-red-500 dark:text-red-500 text-sm mt-2">
                Check your Supabase environment variables in Vercel
              </p>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-600 dark:text-slate-400">No products available yet.</p>
            </div>
          )}
          
          {/* Products Grid */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.slice(0, displayCount).map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    showCompare={p.category === 'phones'}
                    isInWishlist={wishlist.some(w => w.id === p.id)}
                    isInCompare={compareList.some(c => c.id === p.id)}
                    onToggleWishlist={(item: StoreProduct) => setWishlist(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : [...prev, item])}
                    onToggleCompare={(item: StoreProduct) => setCompareList(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : prev.length < 3 ? [...prev, item] : prev)}
                  />
                ))}
              </div>

              {/* Show More Button */}
              {displayCount < filtered.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setDisplayCount(prev => prev + PRODUCTS_PER_PAGE)}
                    className="px-8 py-3 bg-premiumYellow text-obsidian-900 font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Show More Products
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* No search results */}
          {!loading && !error && products.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-600 dark:text-slate-400">
                {search
                  ? `No ${selectedCategory === 'all' ? 'products' : PRODUCT_CATEGORIES.find(category => category.id === selectedCategory)?.label.toLowerCase()} match your search.`
                  : `No ${selectedCategory === 'all' ? 'products' : PRODUCT_CATEGORIES.find(category => category.id === selectedCategory)?.label.toLowerCase()} available yet.`}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-4 rounded-xl bg-premiumYellow px-5 py-3 text-sm font-bold text-black"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>

        <RepairHub />
        <BNPLSection />
                
        <TradeInEstimator />
        <section className="mx-auto max-w-7xl px-6 py-16" aria-labelledby="guides-heading">
          <p className="text-xs font-mono uppercase tracking-widest text-premiumYellow">Phone guides & checks</p>
          <h2 id="guides-heading" className="mt-3 text-3xl font-display font-black dark:text-white">
            Make a more informed phone decision
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Browse practical buying and repair advice, or run quick checks on the phone you are using.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link className="rounded-2xl border border-premiumYellow/40 bg-premiumYellow/5 p-5 text-premiumYellow hover:border-premiumYellow" href="/diagnose">
              Run a free phone diagnostic check
            </Link>
            <Link className="rounded-2xl border border-white/10 p-5 text-premiumYellow hover:border-premiumYellow/50" href="/plan">
              How to use the phone diagnostic
            </Link>
            <Link className="rounded-2xl border border-white/10 p-5 text-premiumYellow hover:border-premiumYellow/50" href="/blog">
              Read all Fonestack phone guides
            </Link>
          </div>
        </section>

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
      </main>
    </>
  )
} 