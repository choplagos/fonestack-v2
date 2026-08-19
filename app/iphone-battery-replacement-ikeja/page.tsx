import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "iPhone Battery Replacement in Ikeja: Prices, Warning Signs, and How to Avoid a Fake Battery",
  description: "iPhone battery replacement prices in Ikeja for 2026, signs you need replacement, and how to avoid low-quality batteries or bad installs.",
  alternates: { canonical: "https://fonestack.vercel.app/iphone-battery-replacement-ikeja" },
};

const faqs: FAQ[] = [
  { question: "Cost of iPhone battery replacement in Ikeja?", answer: "Ranges by model: older iPhones start lower, newer models cost more. Expect from ₦15k up to ₦70k depending on series and OEM vs generic choice." },
  { question: "How long does it take?", answer: "Battery swaps are often done same-day within 30–90 minutes for simple swaps; some models need longer if device needs careful disassembly." },
  { question: "Is a generic/non-OEM battery bad?", answer: "Generic batteries can work, but they often degrade faster and may show warnings. OEM or high-quality replacements are recommended for longevity and safety." },
];

const sections: Section[] = [
  {
    heading: "Signs You Actually Need a Battery Replacement",
    content: (
      <div>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>Battery health below 80%</li>
          <li>Sudden shutdowns or big drops in charge</li>
          <li>Warm or swollen back panel</li>
          <li>Slower performance or "Peak Performance Capability" warnings</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "iPhone Battery Replacement Price in Ikeja (2026)",
    content: (
      <div>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>iPhone 8–X: ₦15k–25k</li>
          <li>iPhone 11 series: ₦20k–32k</li>
          <li>iPhone 12–13 series: ₦28k–42k</li>
          <li>iPhone 14 series: ₦35k–55k</li>
          <li>iPhone 15 series: ₦45k–70k</li>
        </ul>
        <p className="mt-2">OEM vs generic batteries explain most of the quality and price gap — OEM costs more but gives better long-term results.</p>
      </div>
    ),
  },
  {
    heading: "How to Avoid a Bad Battery Job",
    content: (
      <div>
        <ol className="list-decimal ml-6 mt-2 text-gray-200">
          <li>Ask if the replacement is OEM or generic and insist on checking battery health after the job (95–100% is ideal right after swap).</li>
          <li>Watch for "Important Battery Message" in Settings after replacement — it can indicate non-genuine parts.</li>
          <li>Get a minimum 30-day warranty and avoid pressure upsells.</li>
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
      <SeoArticle h1={metadata.title as string} hook={'Battery dropping fast? Scared of a fake battery job? Here\'s how to check, price expectations, and what to demand from any repairer in Ikeja.'} sections={sections} faqs={faqs} />
    </>
  );
}
