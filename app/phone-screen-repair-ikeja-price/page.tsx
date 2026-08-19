import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "Phone Screen Repair Price in Ikeja: What It Actually Costs (And Why the Cheapest Quote Isn't Always Best)",
  description: "Real-world screen repair prices in Ikeja for 2026, signs of bad aftermarket screens, and how Fonestack handles OEM-grade replacements and warranty.",
  alternates: { canonical: "https://fonestack.vercel.app/phone-screen-repair-ikeja-price" },
};

const faqs: FAQ[] = [
  { question: "Cost to fix a cracked screen in Ikeja?", answer: "Depends on device and parts: budget Androids from ~₦8k, mid-range ₦15k–35k, iPhones from ₦20k up; OEM parts cost more but last longer." },
  { question: "How long does replacement take?", answer: "Small repairs often take 30–90 minutes; more complex devices or back-glass work can take several hours or same-day slots at busy shops." },
  { question: "Is data safe during screen repair?", answer: "Data is usually safe if you keep the device locked and the technician does not need account access. Back up first to be safe." },
];

const sections: Section[] = [
  {
    heading: "Phone Screen Repair Price Range in Ikeja (2026)",
    content: (
      <div>
        <p>Typical ranges when you need a screen fix in Ikeja:</p>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>Budget Android: ₦8k–18k</li>
          <li>Samsung A-series / mid-range: ₦15k–35k</li>
          <li>Samsung S/Note flagship: ₦40k–90k</li>
          <li>iPhone 8–11: ₦20k–45k</li>
          <li>iPhone 12–14: ₦45k–90k</li>
          <li>iPhone 15: ₦90k–160k+</li>
        </ul>
        <p className="mt-2">OEM vs generic parts drive the gap — OEM costs more but keeps display accuracy, touch feel and longevity.</p>
      </div>
    ),
  },
  {
    heading: "How to Avoid 'Roadside Engineer' Wahala",
    content: (
      <div>
        <ol className="list-decimal ml-6 mt-2 text-gray-200">
          <li>Ask what screen type they will use (OEM/qualified aftermarket).</li>
          <li>Ask for turnaround time (30–90 minutes typical for simple swaps).</li>
          <li>Get a short warranty and watch for surprise upsells after opening.</li>
          <li>Back up your data before handing over the phone.</li>
        </ol>
      </div>
    ),
  },
  {
    heading: "The Fonestack Repair Promise",
    content: (
      <div>
        <p>Fonestack fits OEM-grade or high-quality glass, offers same-day repair where possible, and provides a minimum warranty. That saves you the wahala of repeat fixes from cheaper vendors.</p>
      </div>
    ),
  },
];

export default function Page() {
  const faqSchema = buildFaqSchema(faqs);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SeoArticle h1={metadata.title as string} hook={'Cracked screen panic is real — and so is the risk of a poor aftermarket replacement from a roadside engineer. Here’s what to watch.'} sections={sections} faqs={faqs} />
    </>
  );
}
