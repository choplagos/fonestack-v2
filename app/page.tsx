'use client'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
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

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (data) setProducts(data)
    }
    load()
  }, [])

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Fonestack | Premium Phones & Repairs in Ikeja, Lagos</title>
        <meta name="description" content="The best selection of new and fairly used smartphones in Computer Village, Ikeja, Lagos. Authenticity guaranteed, competitive prices, and expert repair services." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://fonestack.vercel.app/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Fonestack | Premium Phones & Repairs" />
        <meta property="og:description" content="Premium smartphones and expert repair services in Computer Village, Ikeja, Lagos." />
        <meta property="og:url" content="https://fonestack.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://fonestack.vercel.app/og-image.png" />
        <meta property="og:locale" content="en_NG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fonestack | Premium Phones & Repairs" />
        <meta name="twitter:description" content="Premium smartphones and expert repair services in Ikeja, Lagos." />
        <meta name="twitter:image" content="https://fonestack.vercel.app/og-image.png" />
      </Head>

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
          stats={{ total: products.length.toString(), brands: '12+', new: '24' }} 
          chips={products.slice(0, 3).map(p => ({ brand: p.brand, price: `₦${p.price.toLocaleString()}` }))}
        />

        {/* Phones Section with proper heading hierarchy */}
        <section id="phones" className="max-w-7xl mx-auto px-6 py-20" aria-labelledby="phones-heading">
          <h2 id="phones-heading" className="sr-only">Our Phone Collection</h2>
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