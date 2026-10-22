export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  sections: {
    heading: string
    paragraphs: string[]
  }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-check-a-used-phone-before-buying-nigeria',
    title: 'How to Check a Used Phone Before Buying in Nigeria',
    description:
      'A practical inspection checklist for used phones in Nigeria: verify the device, test its functions, check its history, and agree on the condition before paying.',
    publishedAt: '2026-10-22',
    sections: [
      {
        heading: 'Start with the seller, the device, and the agreement',
        paragraphs: [
          'Before testing a phone, ask what is included in the sale, whether the device has been repaired, and what happens if a fault appears after purchase. Get the final price and any return or warranty terms in writing. A confident seller should allow reasonable checks before you pay; do not let urgency replace inspection.',
          'Compare the phone in your hand with its listed model and storage. Check the model information in the settings menu, then compare it with the box or receipt if those are provided. A matching box is useful context, not proof by itself: boxes and accessories can be swapped.',
        ],
      },
      {
        heading: 'Check identity and account locks',
        paragraphs: [
          'Find the IMEI in the phone settings and, where supported, by dialing *#06#. Compare the numbers shown on the device with each other and with any paperwork supplied by the seller. If they do not match, the phone shows no identifier, or the seller refuses a basic check, pause the purchase and ask for an explanation.',
          'Ask the seller to remove their Apple, Google, or manufacturer account and any screen lock in front of you. Restart the phone and confirm that it can be set up without asking for the previous owner’s password. Do not buy a device that remains activation-locked or whose ownership cannot be reasonably established.',
        ],
      },
      {
        heading: 'Test the parts you will use every day',
        paragraphs: [
          'Inspect the screen under bright light for cracks, dead pixels, discoloration, touch areas that do not respond, and lifting around the edges. Move through several screens and type across the full keyboard. Test the physical buttons, fingerprint reader or face unlock, charging port, speakers, microphone, vibration, and headphone connection if the model has one.',
          'Take sample photos with each camera, switch between lenses where available, record a short video, and play audio at a moderate volume. Connect to Wi-Fi and mobile service if possible. Plug in a known-good charger and check that charging begins reliably; a brief test cannot prove battery health, so ask about battery condition and any available service history.',
        ],
      },
      {
        heading: 'Look for signs of damage or undisclosed repairs',
        paragraphs: [
          'Check the frame, screws, camera glass, and seams for dents, gaps, glue, or uneven finishes. These signs do not always mean a phone is faulty, but they are good reasons to ask whether it has been opened, repaired, or exposed to liquid. Water indicators and software diagnostics can help, but no single quick check guarantees that a phone is water-resistant or free of hidden faults.',
          'Review the battery and device-health screens available on that model. Treat unusually fast battery loss, unexpected restarts, overheating while idle, or warnings about parts as issues to investigate. If the seller allows it, use the manufacturer’s diagnostics or have a technician inspect the phone before you commit.',
        ],
      },
      {
        heading: 'Pay safely and keep a record',
        paragraphs: [
          'Agree on the device condition, included accessories, final price, and any warranty or return terms before payment. Ask for a receipt that identifies the seller, date, amount, and device. Use a payment method that gives you a clear transaction record, and do not hand over a verification code, banking password, or card PIN as part of a phone purchase.',
          'Walk away if the seller pressures you to skip checks, asks you to pay before showing the device, or will not explain a material mismatch. A fair deal is one where both sides can verify what is being sold. If you are unsure, take time to compare another device or get an independent inspection rather than relying on a rushed decision.',
        ],
      },
      {
        heading: 'Remember what an inspection can and cannot tell you',
        paragraphs: [
          'A careful check lowers the chance of surprises, but it cannot guarantee a used phone will never develop a fault. Prices, repair history, battery performance, and available warranty vary by model, seller, and condition. Confirm current details directly with the seller, and make sure any promises that matter to you appear on the receipt or written terms.',
        ],
      },
    ],
  },
]
