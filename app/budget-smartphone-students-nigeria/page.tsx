import type { Metadata } from "next";
import SeoArticle, { FAQ, Section } from "@/components/SeoArticle";
import { buildFaqSchema } from "@/lib/faqSchema";

export const metadata: Metadata = {
  title: "Best Budget Smartphones for Students in Nigeria (2026): Good Enough for School, Not Painful for Your Pocket",
  description: "Student-friendly budget smartphone guide for Nigeria in 2026 — specs, price ranges, and what to avoid so your phone lasts a semester.",
  alternates: { canonical: "https://fonestack.vercel.app/budget-smartphone-students-nigeria" },
};

const faqs: FAQ[] = [
  { question: "Best budget smartphone for a Nigerian student?", answer: "Look for reliable battery life and at least 64GB storage with 4GB RAM. Models change fast, but aim for value brands with service presence in Nigeria." },
  { question: "New vs fairly used for students?", answer: "Fairly used can offer better specs for the same money, but buy from trusted sellers and check battery health. New is safer when you need warranty and peace of mind." },
  { question: "How much RAM does a student phone need?", answer: "4GB is minimum for basic multitasking; 6GB+ is recommended if you multitask or run heavier apps like Zoom or editing tools." },
];

const sections: Section[] = [
  {
    heading: "What a Student Phone Actually Needs",
    content: (
      <div>
        <p>Students need dependable battery life, enough storage for notes and apps, and enough RAM to handle video calls and multitasking without choking.</p>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>Battery life: long enough for a full day of classes</li>
          <li>Storage: 64GB min, 128GB ideal</li>
          <li>RAM: 4GB min, 6GB+ preferred</li>
          <li>Durable build — mistakes happen</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "Budget Smartphone Price Ranges for Students",
    content: (
      <div>
        <ul className="list-disc ml-6 mt-2 text-gray-200">
          <li>Entry-level new: ₦70k–110k</li>
          <li>Solid mid-range new: ₦140k–220k</li>
          <li>Fairly used Samsung A-series: ₦75k–150k</li>
          <li>Fairly used iPhone SE/11: ₦230k–380k</li>
        </ul>
      </div>
    ),
  },
  {
    heading: "How to Avoid Buying the Wrong Phone",
    content: (
      <div>
        <p>Don’t be drawn by camera megapixel numbers alone. Check usable storage, test battery drain with real apps, avoid swollen batteries, and confirm LTE bands for your campus area.</p>
      </div>
    ),
  },
];

export default function Page() {
  const faqSchema = buildFaqSchema(faqs);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SeoArticle h1={metadata.title as string} hook={'Tight on cash but need a phone that actually lasts classes and calls? Here\'s a student-friendly guide that skips hype and gives practical picks.'} sections={sections} faqs={faqs} />
    </>
  );
}
