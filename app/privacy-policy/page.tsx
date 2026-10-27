import type { Metadata } from 'next'
import Link from 'next/link'
import { createSeoMetadata } from '@/lib/seoMetadata'

export const metadata: Metadata = createSeoMetadata({
  title: 'Privacy Policy | Fonestack',
  description:
    'How Fonestack collects, uses, shares and protects personal data, including cookies, analytics, your rights under the Nigeria Data Protection Act, and how to contact us.',
  path: '/privacy-policy',
})

const LAST_UPDATED = 'October 27, 2026'
const PRIVACY_EMAIL = 'info@fonestack.com.ng'

type TableProps = {
  headers: string[]
  rows: string[][]
}

function InfoTable({ headers, rows }: TableProps) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm leading-6">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-gray-700 py-2 pr-4 font-semibold text-white">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className="border-b border-gray-800 py-2 pr-4 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-20 md:py-20">
      <article className="mx-auto max-w-3xl space-y-8 text-gray-300">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
          <ol className="flex gap-2">
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Privacy Policy</li>
          </ol>
        </nav>

        <header>
          <h1 className="text-3xl font-bold text-lime-400 md:text-4xl">Privacy Policy and Cookie Notice</h1>
          <p className="mt-3">Last updated: {LAST_UPDATED}</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-white">1. Who we are</h2>
          <p className="mt-3 leading-7">
            This website is operated by Fonestack (&quot;Fonestack&quot;, &quot;we&quot;, &quot;us&quot;), which sells new and fairly used
            phones and provides phone repairs and trade-ins at Computer Village, Ikeja, Lagos, Nigeria. For the
            purposes of the Nigeria Data Protection Act 2023 (the NDPA) and the General Application and
            Implementation Directive 2025 (the GAID), Fonestack is the data controller of the personal data
            described in this policy.
          </p>
          <p className="mt-3 leading-7">
            Privacy contact:{' '}
            <a className="text-lime-400 underline" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. You can also
            reach us through our <Link className="text-lime-400 underline" href="/contact">contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Information we collect</h2>
          <p className="mt-3 leading-7">We collect only what we need to run the business.</p>
          <h3 className="mt-4 font-semibold text-white">Information you give us</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>
              Repair enquiries: your name and device model. These are prepared on this site and sent to WhatsApp
              only if you choose to submit them.
            </li>
            <li>
              Trade-in estimate requests: your name, phone number, device details, condition and accessories. These
              are sent to Fonestack and stored in our service database so we can prepare your estimate and follow up.
            </li>
            <li>Any message, photo or other detail you send us when you contact us.</li>
            <li>If you ask about an instalment or pay-later option, the details needed to handle that request.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-white">Information collected automatically</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>Browser, device type, operating system, screen size and language.</li>
            <li>Pages visited, buttons and links clicked, and how you arrived at the site.</li>
            <li>Approximate location based on your IP address, at city or country level.</li>
            <li>Security, performance and error data from our hosting and service providers.</li>
            <li>With your consent, anonymised session recordings with form fields masked.</li>
          </ul>
          <p className="mt-3 leading-7">
            The website also requests product catalogue information from our database to display current listings.
            We do not knowingly collect special categories of personal data such as health, biometric or religious
            information. Please do not send us any.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Why we use your information and our legal basis</h2>
          <InfoTable
            headers={['Purpose', 'Legal basis']}
            rows={[
              ['Answering enquiries and booking repairs', 'Steps you request before a contract; legitimate interest'],
              ['Preparing trade-in estimates and completing trade-ins', 'Performance of a contract'],
              ['Selling phones, issuing receipts and handling warranties', 'Performance of a contract; legal obligation'],
              ['Verifying device ownership and preventing fraud or the handling of stolen devices', 'Legitimate interest; legal obligation'],
              ['Keeping the site secure and working', 'Legitimate interest'],
              ['Understanding how the site is used (analytics and session recordings)', 'Consent'],
              ['Sending offers or updates', 'Consent, which you can withdraw at any time'],
              ['Tax, accounting and law-enforcement requirements', 'Legal obligation'],
            ]}
          />
          <p className="mt-3 leading-7">
            Where we rely on legitimate interest, we balance our interests against your rights and freedoms. Where we
            rely on consent, you can withdraw it at any time without affecting earlier processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Phone diagnostic tools</h2>
          <p className="mt-3 leading-7">
            If you use a diagnostic test on this site, tests such as the screen, touch, speaker, microphone, camera
            and motion sensors run in your own browser after you grant permission. Camera and microphone input is
            used only to run the test on your device. We do not record, upload or store it. Test results are stored
            only if you choose to send them to us, for example through WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Who we share information with</h2>
          <p className="mt-3 leading-7">
            We do not sell personal data. We share it only with service providers that help us run the business, and
            where the law requires it.
          </p>
          <InfoTable
            headers={['Provider', 'Purpose']}
            rows={[
              ['Vercel', 'Website hosting and delivery'],
              ['Supabase', 'Database for forms, catalogue and business records'],
              ['PostHog', 'Website analytics and session recordings'],
              ['Google', 'Business tools such as spreadsheets, and advertising if enabled'],
              ['WhatsApp (Meta)', 'Messaging when you choose to contact us there'],
            ]}
          />
          <p className="mt-3 leading-7">
            Providers handle information under their own terms and privacy notices. We may also disclose information
            to the police, regulators or courts where the law requires it or to investigate theft or fraud, to
            professional advisers under confidentiality, and to a successor if our business is sold or restructured.
            Links to third-party sites are not controlled by Fonestack.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Transfers outside Nigeria</h2>
          <p className="mt-3 leading-7">
            Some of our providers store or process information outside Nigeria, including in the United States and
            other regions. Where we transfer personal data abroad, we do so only as the NDPA permits, for example
            where the destination offers adequate protection, where appropriate safeguards such as contractual
            protections are in place, or where you have given consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. How long we keep information</h2>
          <InfoTable
            headers={['Information', 'Retention']}
            rows={[
              ['Enquiries that did not lead to a sale', 'Up to 12 months'],
              ['Trade-in, repair and sales records', 'Up to 6 years, for tax, accounting and warranty purposes'],
              ['Marketing contacts', 'Until you unsubscribe or withdraw consent'],
              ['Analytics data', 'Up to 12 months'],
              ['Session recordings', 'Up to 30 days'],
            ]}
          />
          <p className="mt-3 leading-7">
            After that we delete or securely dispose of the information where practicable. We may keep it longer
            where the law requires, or where it is needed to establish or defend a legal claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">8. Security</h2>
          <p className="mt-3 leading-7">
            We use reasonable technical and organisational measures, including encrypted connections (HTTPS), access
            controls and limiting access to people who need it. No system is completely secure, so we cannot
            guarantee absolute security. If a personal data breach is likely to put your rights and freedoms at risk,
            we will notify the Nigeria Data Protection Commission and, where required, the people affected, within
            the time the law requires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">9. Cookies, browser storage and analytics</h2>
          <p className="mt-3 leading-7">
            Cookies and similar tools such as local storage are small pieces of data kept on your device. Site fonts
            are served from this website.
          </p>
          <InfoTable
            headers={['Type', 'Purpose', 'Consent needed']}
            rows={[
              ['Strictly necessary', 'Remember display preferences such as your theme, keep the site secure and remember your cookie choice', 'No'],
              ['Analytics', 'Understand visits, clicks and drop-off points (PostHog)', 'Yes'],
              ['Session recordings', 'See how pages are used, with inputs masked', 'Yes'],
              ['Advertising, if enabled', 'Show or measure ads (for example Google)', 'Yes'],
            ]}
          />
          <p className="mt-3 leading-7">
            For session recordings, input values are masked, text marked as sensitive is masked, and the repair and
            trade-in forms are excluded. Analytics events do not include submitted names, phone numbers, email
            addresses or IMEIs. You can accept or decline non-essential cookies and change your choice at any time,
            and you can also manage browser storage through your browser settings. Blocking some cookies may affect
            parts of the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">10. Your rights</h2>
          <p className="mt-3 leading-7">Under the NDPA you have the right to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>be informed about how your data is used, which is the purpose of this policy;</li>
            <li>access the personal data we hold about you and get a copy;</li>
            <li>correct inaccurate or incomplete data;</li>
            <li>ask us to delete your data in the circumstances the law allows;</li>
            <li>restrict or object to certain processing, including direct marketing, at any time;</li>
            <li>receive your data in a commonly used format where applicable;</li>
            <li>withdraw consent at any time;</li>
            <li>not be subject to a decision based solely on automated processing that significantly affects you.</li>
          </ul>
          <p className="mt-3 leading-7">
            To use these rights, email{' '}
            <a className="text-lime-400 underline" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We may need
            to verify your identity first and may retain information where the law requires it. We aim to respond
            within 30 days or the period the law requires. If you are unhappy with how we handle your data, please
            contact us first. You also have the right to complain to the Nigeria Data Protection Commission at{' '}
            <a
              className="text-lime-400 underline"
              href="https://ndpc.gov.ng"
              target="_blank"
              rel="noopener noreferrer"
            >
              ndpc.gov.ng
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">11. Children</h2>
          <p className="mt-3 leading-7">
            Our services are intended for adults. We do not knowingly collect personal data from anyone under 18
            without the consent of a parent or guardian. If you believe a child has given us personal data, contact
            us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">12. Trade-ins, repairs and data on your device</h2>
          <p className="mt-3 leading-7">
            Before handing over a phone for trade-in or repair, please back up your data, sign out of your accounts
            (such as Google and Apple ID), remove any screen lock and factory-reset the device. We do not need, and
            do not intentionally access, your personal files, messages or accounts. We are not responsible for data
            left on a device you give us. We may record a device&apos;s IMEI or serial number to verify ownership and
            prevent the handling of stolen devices, and may share it with the authorities where the law requires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">13. Limits of our responsibility</h2>
          <p className="mt-3 leading-7">
            We take reasonable care to keep this website and your information safe. To the fullest extent permitted
            by law, we are not liable for losses caused by events outside our reasonable control, such as internet
            failures, attacks by third parties despite our reasonable security measures, or your own sharing of your
            login details or device. Nothing in this policy limits any right you have under the NDPA or other
            Nigerian law that cannot lawfully be limited, or our liability for anything that cannot lawfully be
            excluded.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">14. Changes and governing law</h2>
          <p className="mt-3 leading-7">
            We may update this policy when our practices or legal requirements change. The current version will be
            published on this page with the date at the top, and we will ask for your consent again where the law
            requires it. This policy is governed by the laws of the Federal Republic of Nigeria, and disputes are
            subject to the courts of Lagos State, without affecting your right to complain to the Nigeria Data
            Protection Commission.
          </p>
          <p className="mt-3 leading-7">
            Questions about this policy? Email{' '}
            <a className="text-lime-400 underline" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> or use our{' '}
            <Link className="text-lime-400 underline" href="/contact">contact page</Link>.
          </p>
        </section>
      </article>
    </main>
  )
}
