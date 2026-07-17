'use client'
import React, { useState, useEffect } from 'react'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import ComparisonDock from '@/components/ComparisonDock'
import ComparisonModal from '@/components/ComparisonModal'
import RepairHub from '@/components/RepairHub'
import { supabase } from '@/lib/supabase'

// FAQ Schema for AI Search
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What types of phones do you sell?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We sell a wide selection of new and fairly used smartphones including iPhones, Samsung Galaxy series, Google Pixel, and other premium brands. All devices are authenticity guaranteed.',
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
        text: 'All our devices come with a 6-month standard warranty. Repair services also include warranty coverage. Contact us for full warranty terms.',
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
  name: 'Fonestack Phone Collection',
  description: 'Premium selection of new and fairly used smartphones in Ikeja, Lagos.',
  url: 'https://fonestack.vercel.app/#phones',
}

export default function Storefront() {
  const [products, setProducts] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [compareList, setCompareList] = useState<any[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setProducts(data)
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

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

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
          chips={products.slice(0, 3).map(p => ({ 
            brand: p.brand, 
            price: `₦${p.price.toLocaleString()}` 
          }))}
        />

        {/* Phones Section with proper heading hierarchy */}
        <section id="phones" className="max-w-7xl mx-auto px-6 py-20" aria-labelledby="phones-heading">
          <h2 id="phones-heading" className="sr-only">Our Phone Collection</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-slate-600 dark:text-slate-400">Loading phones...</p>
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
              <p className="text-slate-600 dark:text-slate-400">No phones available yet.</p>
            </div>
          )}
          
          {/* Products Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  isInWishlist={wishlist.some(w => w.id === p.id)}
                  isInCompare={compareList.some(c => c.id === p.id)}
                  onToggleWishlist={(item) => setWishlist(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : [...prev, item])}
                  onToggleCompare={(item) => setCompareList(prev => prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : prev.length < 3 ? [...prev, item] : prev)}
                />
              ))}
            </div>
          )}
          
          {/* No search results */}
          {!loading && !error && products.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-600 dark:text-slate-400">No phones match your search.</p>
            </div>
          )}
        </section>

        <RepairHub />

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