import { ThemeProvider } from 'next-themes'
import './globals.css'
import Script from 'next/script'
import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import PoweredByOtprent from '@/components/PoweredByOtprent'
import { BUSINESS_REGISTRATION_NUMBER, GOOGLE_BUSINESS_PROFILE_URL, SITE_URL } from '@/lib/constants'

const adsensePublisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
const validAdsensePublisherId = adsensePublisherId && /^ca-pub-\d+$/.test(adsensePublisherId)

// Dynamic metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'Fonestack | Buy New & Fairly Used Phones & Repairs in Ikeja, Lagos',
    template: `%s | Fonestack - Premium Phones & Repairs`,
  },
  description: 'Buy verified new and fairly used phones and get expert repairs at Fonestack, Computer Village, Ikeja. Transparent prices and CreditDirect BNPL.',
  keywords: 'smartphones, phones, iPhone, Samsung, repair, BNPL, buy now pay later phones, CreditDirect, phone financing, Ikeja, Lagos, Computer Village, mobile phones, used phones, new phones, phone repair, screen repair, battery replacement',
  authors: [{ name: 'Fonestack' }],
  creator: 'Fonestack',
  publisher: 'Fonestack',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    title: 'Fonestack | Buy New & Fairly Used Phones & Repairs in Ikeja, Lagos',
    description: 'Buy verified new and fairly used phones and get expert repairs at Fonestack, Computer Village, Ikeja. Transparent prices and CreditDirect BNPL.',
    siteName: 'Fonestack',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fonestack smartphones and phone repairs in Computer Village, Ikeja, Lagos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fonestack | Buy New & Fairly Used Phones & Repairs in Ikeja, Lagos',
    description: 'Buy verified new and fairly used phones and get expert repairs at Fonestack, Computer Village, Ikeja. Transparent prices and CreditDirect BNPL.',
    creator: '@fonestack',
    site: '@fonestack',
    images: [
      {
        url: '/og-image.png',
        alt: 'Fonestack smartphones and phone repairs in Computer Village, Ikeja, Lagos',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Organization Schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  additionalType: 'https://schema.org/ElectronicsStore',
  '@id': `${SITE_URL}/#organization`,
  name: 'Fonestack',
  alternateName: 'Fonestack Phones & Repairs',
  url: SITE_URL,
  hasMap: GOOGLE_BUSINESS_PROFILE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Premium smartphones and expert repair services in Computer Village, Ikeja, Lagos.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Computer Village',
    addressLocality: 'Ikeja',
    addressRegion: 'Lagos',
    postalCode: '100001',
    addressCountry: 'NG',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 6.6048,
    longitude: 3.3490,
  },
  telephone: '+2349029928322',
  email: 'info@fonestack.com',
  priceRange: '₦₦₦',
  openingHours: [
    'Mo-Fr 09:00-18:00',
    'Sa 10:00-16:00',
  ],
  sameAs: [
    'https://wa.me/2349029928322',
  ],
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'businessRegistration',
    value: BUSINESS_REGISTRATION_NUMBER,
  },
  image: `${SITE_URL}/og-image.png`,
}

// Website Schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Fonestack',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="bCa9t2i35MLBQeEsscB2atPqhE1UN0i_XRvJLoguSr4" />

        {validAdsensePublisherId && (
          <Script
            id="google-adsense"
            strategy="beforeInteractive"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${validAdsensePublisherId}`}
            crossOrigin="anonymous"
          />
        )}
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={SITE_URL} />
        
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#050505" />
        <meta name="msapplication-TileColor" content="#050505" />
        
        {/* Structured Data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Footer />
          <PoweredByOtprent />
        </ThemeProvider>
      </body>
    </html>
  )
}