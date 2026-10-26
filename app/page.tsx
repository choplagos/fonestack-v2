import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'
import { BUSINESS_REGISTRATION_NUMBER, GOOGLE_BUSINESS_PROFILE_URL, SITE_URL } from '@/lib/constants'
import { createSeoMetadata } from '@/lib/seoMetadata'

export const metadata: Metadata = createSeoMetadata({
  title: 'Fonestack Phones, Repairs & Trade-ins in Ikeja',
  description: 'Explore phones, repair enquiries and trade-in options from Fonestack in Computer Village, Ikeja, Lagos.',
  path: '/',
})

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  additionalType: 'https://schema.org/ElectronicsStore',
  '@id': `${SITE_URL}/#organization`,
  name: 'Fonestack',
  alternateName: 'Fonestack Phones & Repairs',
  url: SITE_URL,
  hasMap: GOOGLE_BUSINESS_PROFILE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Phone retail, repair and trade-in services in Computer Village, Ikeja, Lagos.',
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
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-16:00'],
  sameAs: ['https://wa.me/2349029928322'],
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'businessRegistration',
    value: BUSINESS_REGISTRATION_NUMBER,
  },
  image: `${SITE_URL}/og-image.png`,
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c'),
        }}
      />
      <HomePage />
    </>
  )
}
