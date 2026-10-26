import React from "react";
import Link from "next/link";
import { SITE_URL, WHATSAPP_LINK } from "@/lib/constants";

export interface FAQ {
  question: string;
  answer: string;
}

export interface Section {
  heading: string;
  content: React.ReactNode;
}

export interface SeoArticleProps {
  h1: string;
  hook: string;
  sections: Section[];
  faqs: FAQ[];
  description: string;
  canonicalUrl: string;
  dateModified?: string;
  relatedLinks: { href: string; label: string }[];
}

export default function SeoArticle({
  h1,
  hook,
  sections,
  faqs,
  description,
  canonicalUrl,
  dateModified,
  relatedLinks,
}: SeoArticleProps) {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: h1,
    description,
    ...(dateModified ? { dateModified } : {}),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: h1,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      <article className="min-h-screen bg-black text-white px-6 py-12 md:px-20 md:py-20">
        <div className="max-w-3xl mx-auto prose prose-invert prose-headings:text-white">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{h1}</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-lime-400">{h1}</h1>
          <div className="mt-2 text-sm text-gray-400">
            <p>By Fonestack</p>
            <p className="mt-2">
              Fonestack is a phone retail, repair and trade-in shop in Computer Village, Ikeja.{' '}
              <Link href="/contact" className="text-lime-400 underline">Contact the shop</Link>.
            </p>
          </div>
          {dateModified && (
            <p className="mt-1 text-sm text-gray-400">
              Updated{" "}
              <time dateTime={dateModified}>
                {new Intl.DateTimeFormat("en-NG", {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(`${dateModified}T00:00:00Z`))}
              </time>
            </p>
          )}
          <p className="mt-4 text-lg text-gray-200">{hook}</p>

          {sections.map((s, i) => (
            <section key={i} className="mt-8">
              <h2 className="text-2xl font-semibold text-lime-400">{s.heading}</h2>
              <div className="mt-3 text-gray-200">{s.content}</div>
            </section>
          ))}

          <nav className="mt-10" aria-label="Related shop and service pages">
            <h2 className="text-xl font-semibold text-lime-400">Related Fonestack pages</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {relatedLinks.map((link) => (
                <li key={link.href}><Link className="text-lime-400 underline" href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="mt-10 p-6 rounded-lg bg-amber-900/5 border border-lime-400/10">
            <p className="text-lg font-semibold text-lime-400">Need current information?</p>
            <p className="text-sm text-gray-300 mt-1">Contact Fonestack to ask about current availability, repairs, or trade-in options.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/#products" className="inline-flex items-center px-4 py-2 rounded-md border border-lime-400 text-lime-400 hover:bg-white/2">
                Browse Phones
              </Link>
              <Link href="/#repair" className="inline-flex items-center px-4 py-2 rounded-md bg-lime-400 text-black font-medium hover:opacity-90">
                Book a Repair
              </Link>
              <Link href="/blog" className="inline-flex items-center px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/5">
                Read phone guides
              </Link>
              <a href={WHATSAPP_LINK} className="inline-flex items-center px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/5">
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {faqs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-lime-400">Frequently asked questions</h2>
              <dl className="mt-4 space-y-4">
                {faqs.map((f) => (
                  <div key={f.question}>
                    <dt className="font-semibold text-gray-100">{f.question}</dt>
                    <dd className="text-gray-300 mt-1">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
