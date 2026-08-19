import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "Buy Android Phone in Ikeja Cheap — Without Landing a Fake or 'Half-Dead' Unit",
  description: "Find honest cheap Android phones in Ikeja for 2026. Price ranges, on-spot checks, and Fonestack's warranty-backed listings to avoid 'cheap today, expensive tomorrow'.",
  alternates: { canonical: "https://fonestack.vercel.app/buy-android-phone-ikeja-cheap" },
};

const faqs: FAQ[] = [
  { question: "Cheapest good Android in Ikeja right now?", answer: "Entry-level new models around ₦70k can be decent for basic use — aim for reputable sellers and check battery and network compatibility before buying." },
  { question: "New vs fairly used for tight budgets?", answer: "New gives warranty and known history, but fairly used can deliver much better specs for the same budget. Inspect and ask for receipts and battery health." },
  { question: "How to tell a cheap phone is a bad deal?", answer: "If it powers off quickly, shows swollen battery signs, has inconsistent IMEI info, or the seller avoids hands-on testing, walk away — that’s a bad deal." },
];

const sections: Section[] = [
  {
    heading: "Realistic Cheap Android Price Ranges in Ikeja (2026)",
    content: (
      <div>
        <p>Here are sensible ranges when hunting cheap Android phones around Ikeja:</p>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>Entry-level: ₦65k–120k</li>
          <li>Mid-range new: ₦130k–230k</li>
          <li>Fairly used flagship Samsung: ₦280k–480k</li>
          <li>Fairly used Samsung A-series: ₦90k–180k</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "Tips to Avoid 'Cheap Today, Expensive Tomorrow'",
    content: (
      <div>
        <ol className="list-decimal ml-6 mt-2 text-gray-200">
          <li>Test screen, cameras, mics and speakers on the spot.</li>
          <li>Ask for battery health and observe charging behaviour.</li>
          <li>Avoid devices with cracked or replaced backs unless price reflects it.</li>
          <li>Confirm network bands for your area and get IMEI on the receipt.</li>
        </ol>
      </div>
    ),
  },
  {
    heading: "Why Fonestack Is the Smarter 'Cheap' Option",
    content: (
      <div>
        <p>Fonestack runs hardware and network checks before listing, includes battery info, and offers short warranties. That means you get a cheap phone that stays cheap — no hidden costs from repairs after a week.</p>
      </div>
    ),
  },
];

export default function Page() {
  const faqSchema = buildFaqSchema(faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SeoArticle h1={metadata.title as string} hook={'"Cheap" can mean a good deal, or a phone you’re back to selling in three weeks — here’s how to spot the difference.'} sections={sections} faqs={faqs} />
    </>
  );
}
