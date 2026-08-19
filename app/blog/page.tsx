import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fonestack Blog — Guides, Prices & Repair Tips (Lagos)",
  description: "Practical guides and local price guides from Fonestack — Computer Village, Ikeja and Lagos-focused posts to help you buy, sell and repair phones without wahala.",
  alternates: { canonical: "https://fonestack.vercel.app/blog" },
};

const posts = [
  { slug: 'fairly-used-iphone-price-computer-village', title: 'Fairly Used iPhone Price in Computer Village: The Real 2026 Price List (No Wahala)' },
  { slug: 'buy-android-phone-ikeja-cheap', title: "Buy Android Phone in Ikeja Cheap — Without Landing a Fake or 'Half-Dead' Unit" },
  { slug: 'phone-screen-repair-ikeja-price', title: "Phone Screen Repair Price in Ikeja: What It Actually Costs (And Why the Cheapest Quote Isn't Always Best)" },
  { slug: 'trade-in-old-phone-lagos', title: "Trade In Your Old Phone in Lagos: How to Actually Get a Fair Value (Not 'Mumu' Price)" },
  { slug: 'budget-smartphone-students-nigeria', title: "Best Budget Smartphones for Students in Nigeria (2026): Good Enough for School, Not Painful for Your Pocket" },
  { slug: 'sell-my-phone-computer-village', title: "Sell My Phone in Computer Village: How to Get Paid Fair and Fast (Without the Runaround)" },
  { slug: 'iphone-battery-replacement-ikeja', title: "iPhone Battery Replacement in Ikeja: Prices, Warning Signs, and How to Avoid a Fake Battery" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 md:px-20 md:py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-lime-400">Fonestack Guides & Local Price Posts</h1>
        <p className="mt-3 text-gray-300">Practical, Lagos-focused posts to help you buy, sell and repair phones without the wahala.</p>

        <ul className="mt-8 space-y-4">
          {posts.map((p) => (
            <li key={p.slug} className="p-4 rounded-md border border-lime-400/10 hover:bg-white/2">
              <Link href={`/${p.slug}`} className="text-lg font-semibold text-lime-400">{p.title}</Link>
              <div className="mt-1 text-gray-300"><Link href={`/${p.slug}`} className="underline">Read post</Link></div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
