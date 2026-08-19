import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "Trade In Your Old Phone in Lagos: How to Actually Get a Fair Value (Not 'Mumu' Price)",
  description: "How to trade in your old phone in Lagos for fair credit — what affects value, realistic ranges, and tips to avoid lowball offers.",
  alternates: { canonical: "https://fonestack.vercel.app/trade-in-old-phone-lagos" },
};

const faqs: FAQ[] = [
  { question: "How much can I get trading in an old phone in Lagos?", answer: "Range depends on model and condition — expect from a few tens of thousands for older budget phones to several hundred thousand for recent iPhones; see our ranges above for guidance." },
  { question: "Trade-in vs selling outright?", answer: "Trade-ins are faster and reduce hassle but usually give less money than selling privately. Trade-in is good when you want credit toward a new purchase and speed." },
  { question: "Do I need to factory reset before trade-in?", answer: "Yes, back up and factory reset before handing over the device. Ensure account sign-out (iCloud/Google) to avoid issues." },
];

const sections: Section[] = [
  {
    heading: "What Affects Your Trade-In Value",
    content: (
      <div>
        <p>Factors buyers check closely:</p>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>Battery health and cycle count</li>
          <li>Screen and body condition</li>
          <li>Original accessories and box</li>
          <li>Storage size and whether the account is signed out</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "Realistic Trade-In Value Ranges (Toward a New Purchase)",
    content: (
      <div>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>iPhone 11/12: ₦180k–380k credit</li>
          <li>iPhone 13/14: ₦400k–680k credit</li>
          <li>Samsung A-series: ₦40k–110k credit</li>
          <li>Samsung S-series: ₦150k–350k credit</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "How to Avoid Getting Undervalued",
    content: (
      <div>
        <ol className="list-decimal ml-6 mt-2 text-gray-200">
          <li>Back up and factory reset so buyer can’t ask for discounts over account locks.</li>
          <li>Clean the phone and present it with honest condition notes.</li>
          <li>Know battery health and ask for an itemized valuation.</li>
          <li>Compare offers from at least two buyers.</li>
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
      <SeoArticle h1={metadata.title as string} hook={'Not knowing your old phone\'s worth can leave you feeling lowballed. Here\'s a practical Lagos guide to get fair trade-in credit.'} sections={sections} faqs={faqs} />
    </>
  );
}
