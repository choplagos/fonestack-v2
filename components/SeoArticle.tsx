import React from "react";
import Link from "next/link";
import { WHATSAPP_LINK } from "@/lib/constants";

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
}

export default function SeoArticle({ h1, hook, sections, faqs }: SeoArticleProps) {
  return (
    <article className="min-h-screen bg-black text-white px-6 py-12 md:px-20 md:py-20">
      <div className="max-w-3xl mx-auto prose prose-invert prose-headings:text-white">
        <h1 className="text-3xl md:text-4xl font-bold text-lime-400">{h1}</h1>
        <p className="mt-4 text-lg text-gray-200">{hook}</p>

        {sections.map((s, i) => (
          <section key={i} className="mt-8">
            <h2 className="text-2xl font-semibold text-lime-400">{s.heading}</h2>
            <div className="mt-3 text-gray-200">{s.content}</div>
          </section>
        ))}

        <div className="mt-10 p-6 rounded-lg bg-amber-900/5 border border-lime-400/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-lime-400">Want help now? Fonestack is here.</p>
            <p className="text-sm text-gray-300 mt-1">Quick checks, honest grading, and local warranty—no wahala.</p>
          </div>
          <div className="flex gap-3">
            <a href={WHATSAPP_LINK} className="inline-flex items-center px-4 py-2 rounded-md bg-lime-400 text-black font-medium hover:opacity-90">Chat on WhatsApp</a>
            <Link href="/" className="inline-flex items-center px-4 py-2 rounded-md border border-lime-400 text-lime-400 hover:bg-white/2">Browse Fonestack</Link>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-lime-400">Frequently asked questions</h3>
          <dl className="mt-4 space-y-4">
            {faqs.map((f, idx) => (
              <div key={idx}>
                <dt className="font-semibold text-gray-100">{f.question}</dt>
                <dd className="text-gray-300 mt-1">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}
