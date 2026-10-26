import { ThemeProvider } from 'next-themes'
import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Sora } from 'next/font/google'
import Footer from '@/components/Footer'
import PoweredByOtprent from '@/components/PoweredByOtprent'
import { SITE_URL } from '@/lib/constants'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Dynamic metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'Fonestack Phones, Repairs & Trade-ins in Ikeja',
    template: '%s',
  },
  description: 'Explore phones, repair enquiries and trade-in options from Fonestack in Computer Village, Ikeja, Lagos.',
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
    title: 'Fonestack Phones, Repairs & Trade-ins in Ikeja',
    description: 'Explore phones, repair enquiries and trade-in options from Fonestack in Computer Village, Ikeja, Lagos.',
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
    title: 'Fonestack Phones, Repairs & Trade-ins in Ikeja',
    description: 'Explore phones, repair enquiries and trade-in options from Fonestack in Computer Village, Ikeja, Lagos.',
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

// Website Schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Fonestack',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${sora.variable} ${inter.variable} ${jetBrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="bCa9t2i35MLBQeEsscB2atPqhE1UN0i_XRvJLoguSr4" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#050505" />
        <meta name="msapplication-TileColor" content="#050505" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c'),
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