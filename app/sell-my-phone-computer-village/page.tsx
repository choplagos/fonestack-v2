import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "Sell My Phone in Computer Village: How to Get Paid Fair and Fast (Without the Runaround)",
  description: "Sell your phone in Computer Village with confidence — realistic resale values, negotiation tips, and how to avoid being lowballed.",
  alternates: { canonical: "https://fonestack.vercel.app/sell-my-phone-computer-village" },
};

const faqs: FAQ[] = [
  { question: "Best place to sell a phone in Computer Village?", answer: "Reputable stalls that offer immediate cash and have clear grading processes are best. Fonestack and similar tested sellers are safer than anonymous buyers." },
  { question: "How much can I sell a used iPhone for in Lagos?", answer: "It varies by model and condition — see the ranges in this article. Recent iPhones still fetch high resale values if in good condition and with decent battery health." },
  { question: "Do I need to factory reset before selling?", answer: "Yes — back up your data and factory reset, and sign out of any cloud accounts to avoid transfer issues and to prove ownership to the buyer." },
];

const sections: Section[] = [
  {
    heading: "What Determines Your Phone's Resale Value",
    content: (
      <div>
        <p>Buyers price phones on model, battery, screen and body condition, storage and whether it comes with chargers or the original box. Account lock status also kills value fast.</p>
      </div>
    ),
  },
  {
    heading: "Realistic Resale Value Ranges (Cash Sale)",
    content: (
      <div>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>iPhone 11/12: ₦170k–350k</li>
          <li>iPhone 13/14: ₦380k–650k</li>
          <li>Samsung A-series: ₦35k–100k</li>
          <li>Samsung S-series: ₦140k–320k</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "How to Avoid Getting Lowballed",
    content: (
      <div>
        <ol className="list-decimal ml-6 mt-2 text-gray-200">
          <li>Know battery health and storage beforehand and present the phone cleanly.</li>
          <li>Get multiple quotes and avoid offers that ask you to wait for resale to get paid.</li>
          <li>Never hand the phone over before payment clears or you have cash on hand.</li>
        </ol>
      </div>
    ),
  },
];

export default function Page() {
  const faqSchema = buildFaqSchema(faqs);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SeoArticle h1={metadata.title as string} hook={'Walking Computer Village to sell a phone can feel like a runaround — different lowball offers, some asking you to wait for resale. Here\'s how to sell fast and fair.'} sections={sections} faqs={faqs} />
    </>
  );
}
