import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "Fairly Used iPhone Price in Computer Village: The Real 2026 Price List (No Wahala)",
  description: "Fairly used iPhone prices in Computer Village for 2026 — honest ranges, tips to avoid swapped parts, and where Fonestack stands for tested, warranted units.",
  alternates: { canonical: "https://fonestack.vercel.app/fairly-used-iphone-price-computer-village" },
};

const faqs: FAQ[] = [
  { question: "Is it safe to buy fairly used from Computer Village?", answer: "Yes, if you inspect the unit, check battery health, IMEI, and buy from a seller with a short warranty or a tested supplier like Fonestack. Walk away from sealed boxes without checks." },
  { question: "UK-used vs Nigerian-used difference?", answer: "UK-used units often have cleaner bodies and better battery cycles but may use different network bands. Check IMEI origin and battery health — UK-used can command a premium." },
  { question: "Why do prices vary so much between sellers?", answer: "Condition, battery health, whether parts are original or swapped, included accessories, and the seller's confidence/warranty all affect pricing. Ask for a breakdown before paying." },
];

const sections: Section[] = [
  {
    heading: "Fairly Used iPhone Price Range in Computer Village (2026)",
    content: (
      <div>
        <p>Here are typical ballparks you should expect when shopping fairly used iPhones in Computer Village this year:</p>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>iPhone 11: ₦280k–380k</li>
          <li>iPhone 12 / 12 Pro: ₦380k–550k</li>
          <li>iPhone 13 / 13 Pro: ₦550k–750k</li>
          <li>iPhone 14 / 14 Pro: ₦750k–1.05m</li>
          <li>iPhone 15 series: ₦950k–1.4m+</li>
        </ul>
        <p className="mt-2">Battery health, whether a unit is UK used, and swapped parts will push the price up or down — always verify battery cycles and IMEI history.</p>
      </div>
    ),
  },
  {
    heading: "How to Avoid Getting Scammed",
    content: (
      <div>
        <p>Don’t let the market rush you. Before paying:</p>
        <ol className="list-decimal ml-6 mt-2 text-gray-200">
          <li>Check battery health yourself in Settings → Battery (aim for 85%+ for fair value).</li>
          <li>Confirm the phone is not iCloud locked and ask the seller to show the account sign-out.</li>
          <li>Check IMEI against online checks and ensure it isn’t blacklisted.</li>
          <li>Watch for "Non-Genuine Parts" messages and screen mismatches.</li>
          <li>Never pay full price before inspection; do the checks on the spot.</li>
        </ol>
      </div>
    ),
  },
  {
    heading: "The Fonestack Difference",
    content: (
      <div>
        <p>Fonestack grades units, runs battery and diagnostics, and offers short warranties on fairly used stock. Based in Computer Village, Fonestack focuses on transparency — what you see is tested and described honestly, so you avoid the wahala of swapped parts or hidden faults.</p>
      </div>
    ),
  },
];

export default function Page() {
  const faqSchema = buildFaqSchema(faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SeoArticle h1={metadata.title as string} hook={"Computer Village hustle — it’s hard to tell a genuine fairly used iPhone from a swapped-parts phone. Here’s how to shop smart."} sections={sections} faqs={faqs} />
    </>
  );
}
