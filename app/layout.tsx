import { ThemeProvider } from 'next-themes'
import './globals.css'
import Script from 'next/script'

// Dynamic metadata configuration
export const metadata = {
  title: {
    default: 'Fonestack | Premium Phones & Repairs in Ikeja, Lagos',
    template: `%s | Fonestack - Premium Phones & Repairs`,
  },
  description: 'The best selection of new and fairly used smartphones in Computer Village, Ikeja, Lagos. Authenticity guaranteed, competitive prices, and expert repair services.',
  keywords: 'smartphones, phones, iPhone, Samsung, repair, Ikeja, Lagos, Computer Village, mobile phones, used phones, new phones, phone repair, screen repair, battery replacement',
  authors: [{ name: 'Fonestack' }],
  creator: 'Fonestack',
  publisher: 'Fonestack',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  metadataBase: new URL('https://fonestack.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://fonestack.vercel.app',
    title: 'Fonestack | Premium Phones & Repairs in Ikeja, Lagos',
    description: 'The best selection of new and fairly used smartphones in Computer Village, Ikeja, Lagos. Authenticity guaranteed, competitive prices, and expert repair services.',
    siteName: 'Fonestack',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fonestack - Premium Phones & Repairs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fonestack | Premium Phones & Repairs in Ikeja, Lagos',
    description: 'The best selection of new and fairly used smartphones in Computer Village, Ikeja, Lagos.',
    creator: '@fonestack',
    images: ['/og-image.png'],
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
  '@id': 'https://fonestack.vercel.app/#organization',
  name: 'Fonestack',
  alternateName: 'Fonestack Phones & Repairs',
  url: 'https://fonestack.vercel.app',
  logo: 'https://fonestack.vercel.app/logo.png',
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
  image: 'https://fonestack.vercel.app/og-image.png',
}

// Website Schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://fonestack.vercel.app/#website',
  url: 'https://fonestack.vercel.app',
  name: 'Fonestack',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://fonestack.vercel.app/?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="bCa9t2i35MLBQeEsscB2atPqhE1UN0i_XRvJLoguSr4" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonestack.vercel.app" />
        
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
        </ThemeProvider>
      </body>
    </html>
  )
}