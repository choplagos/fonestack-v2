export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  relatedPages: { href: string; label: string }[]
  relatedPosts?: { slug: string; title: string }[]
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
      'A practical used-phone inspection checklist for Nigeria: verify the device, test key functions, check its history and agree on condition before paying.',
    publishedAt: '2026-10-22',
    updatedAt: '2026-10-25',
    relatedPages: [
      { href: '/fairly-used-iphone-price-computer-village', label: 'Buying a fairly used iPhone' },
      { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
      { href: '/trade-in-old-phone-lagos', label: 'Trading in an old phone in Lagos' },
    ],
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
  {
    slug: 'how-to-check-used-iphone-before-buying-nigeria',
    title: 'How to Check If a Used iPhone Is Original in Nigeria',
    description:
      'Check a used iPhone’s identity, account status, parts and everyday functions before buying in Nigeria, and know what a quick inspection cannot prove.',
    publishedAt: '2026-10-26',
    relatedPages: [
      { href: '/fairly-used-iphone-price-computer-village', label: 'Buying a fairly used iPhone in Computer Village' },
      { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
      { href: '/trade-in-old-phone-lagos', label: 'Phone trade-in options in Lagos' },
    ],
    relatedPosts: [
      { slug: 'how-to-check-a-used-phone-before-buying-nigeria', title: 'Used-phone inspection checklist' },
      { slug: 'prepare-phone-for-sale-or-trade-in-nigeria', title: 'Prepare a phone for sale or trade-in' },
    ],
    sections: [
      {
        heading: 'Start with the exact model and its settings',
        paragraphs: [
          `Ask the seller to open Settings, then General, then About. Read the model name, capacity and serial or IMEI information from the device itself, rather than relying on a listing, a box or a screenshot. Check that the model and storage are the ones you agreed to buy. A box can be useful, but it may belong to another phone, so it cannot establish what is inside it.`,
          `If the model or capacity is unclear, take time to confirm it before discussing payment. You can compare the device information with Apple’s model identification pages, but remember that the visible model name is only one part of a proper inspection. Do not publish or send a seller’s full IMEI to strangers or post it publicly. Keep identifiers private and use them only for a legitimate check or written sale record.`,
        ],
      },
      {
        heading: 'Confirm the previous owner has removed their account',
        paragraphs: [
          `Ask the seller to sign out of their Apple Account and turn off Find My before you pay. The seller should erase the iPhone and let you begin setup while they are present. If setup requests the previous owner’s Apple Account, the phone may still be linked to that account. Do not accept a promise that the lock will be removed later, and do not pay someone else to bypass Activation Lock.`,
          `A clean setup is a useful ownership and usability check, but it does not prove every part is original or the phone has no hidden damage. If you cannot finish setup because the seller is unavailable, the password is unknown, or the device is managed by an organisation, pause the transaction. Ask the seller to resolve the issue through the proper account owner or organisation before considering a purchase.`,
        ],
      },
      {
        heading: 'Inspect parts and service information carefully',
        paragraphs: [
          `On supported iPhone models and software versions, Settings may show Parts and Service History under General and About. Read any messages about the display, battery or camera and ask the seller what work was done and when. The exact information shown varies by model, iOS version and part. A missing history is not proof that a phone has never been repaired, and a history entry alone does not tell you whether the repair was good.`,
          `Do not use one online serial-number or IMEI checker as a guarantee that a device is genuine, safe to buy or free of an account lock. Database information can be incomplete, identifiers can be copied, and a correct identifier does not test the screen, camera or battery. If a material detail cannot be verified, treat it as unknown and decide whether an independent inspection is worth arranging.`,
        ],
      },
      {
        heading: 'Test the features you will use every day',
        paragraphs: [
          `With the seller’s permission, make a short call, connect to Wi-Fi and mobile service, open the camera and test each available lens. Play a voice note or recording to check the microphone and speakers. Type across the keyboard, swipe around all edges of the display, and test the buttons, vibration and charging connection. Take a few sample photos in ordinary lighting rather than judging the camera from a saved sample image.`,
          `Check Face ID or Touch ID if the model supports it and the seller is willing to set it up for a test. Look for cracks, display lifting, uneven gaps, moisture signs or a frame that appears bent. Notice unexpected restarts, unusual heat while the phone is idle, charging that repeatedly disconnects, or a battery percentage that falls unusually quickly during the inspection. These signs deserve questions; a short visit cannot predict the phone’s entire future.`,
        ],
      },
      {
        heading: 'Understand battery and network limitations',
        paragraphs: [
          `Review Battery Health where it is available, but interpret the result as one clue rather than a guarantee of runtime. How long a battery lasts also depends on age, temperature, signal strength, apps and recent use. Ask whether the battery or another part has been replaced and whether there is a receipt or service record. If you depend on a particular Nigerian network, test a compatible SIM where possible and confirm the exact model supports the bands and features you need.`,
          `A device can look polished and still have a weak battery, intermittent fault or repair that is not obvious at first glance. If the seller permits it, ask an independent technician to inspect a phone that is expensive or difficult to replace. Do not let a quick test be described as a full diagnostic unless the person performing it explains what was actually checked.`,
        ],
      },
      {
        heading: 'Agree condition and payment terms before handover',
        paragraphs: [
          `Before paying, write down the exact model and storage, the condition discussed, included accessories, amount, date and any return or warranty terms the seller has agreed to. Check that the receipt describes the same device you tested. If a seller makes a promise that matters to your decision, ask for it in writing rather than relying on a hurried verbal assurance.`,
          `Pause if the seller will not allow a reasonable check, pressures you to pay before showing the phone, gives conflicting model details, or asks you to share a banking password, card PIN or verification code. These behaviours do not establish that a device is counterfeit, but they increase transaction risk. Compare another device or walk away if you cannot verify the basics. Current prices and availability vary; confirm them directly before travelling to buy.`,
          `If you are comparing devices around Ikeja or Computer Village, set aside enough time to check each one using the same steps. Keep notes about the model, storage, visible condition and any stated repair history. A side-by-side comparison is more useful than trying to remember details from several conversations, and it makes it easier to notice when one seller has not answered an important question.`,
          `These checks help you make a more informed decision, but they cannot certify a phone or guarantee that it will remain fault-free. A seller’s answers, an online lookup, a box or a quick test should not be treated as proof on its own. If ownership, account status, parts or condition remains uncertain, ask for more evidence or choose not to proceed.`,
        ],
      },
    ],
  },
  {
    slug: 'phone-screen-repair-ikeja-questions',
    title: 'Questions to Ask Before Phone Screen Repair in Ikeja',
    description:
      'Compare phone screen repair options in Ikeja: clarify the part, quote, testing, data precautions and written terms before approving work.',
    publishedAt: '2026-10-26',
    relatedPages: [
      { href: '/phone-screen-repair-ikeja-price', label: 'Phone screen repair information for Ikeja' },
      { href: '/iphone-battery-replacement-ikeja', label: 'iPhone battery replacement information' },
      { href: '/contact', label: 'Contact Fonestack' },
    ],
    relatedPosts: [
      { slug: 'how-to-check-a-used-phone-before-buying-nigeria', title: 'Used-phone inspection checklist' },
      { slug: 'prepare-phone-for-sale-or-trade-in-nigeria', title: 'Prepare a phone for sale or trade-in' },
    ],
    sections: [
      {
        heading: 'Describe the symptoms before accepting a diagnosis',
        paragraphs: [
          `Tell the repairer what happened and what the phone does now: a cracked outer glass, a black display, lines, flickering, dead touch areas or a screen that works only sometimes are different symptoms. Mention whether the phone was dropped, exposed to liquid or repaired before, if you know. This gives the technician useful context, but it does not replace an inspection of the actual device.`,
          `Ask what checks are needed to identify the fault and whether there could be damage beyond the visible screen. A cracked panel can occur alongside frame, connector or other internal damage. A responsible quote should make clear whether it is preliminary or confirmed after diagnosis. Do not assume that every display problem has the same cause or that a screen replacement will resolve unrelated faults.`,
        ],
      },
      {
        heading: 'Ask what screen part is being offered',
        paragraphs: [
          `Ask for the part type and grade in plain language, and whether it is new, refurbished or pulled from another device. The terms used for replacement displays are not always consistent between sellers, so ask what the description means for your exact model. Confirm whether the part is compatible with the model number, not just the product family or screen size.`,
          `Ask whether any feature could work differently after replacement, such as brightness, colour, touch response, refresh rate, fingerprint or face-related functions, or an on-screen parts message. The answer depends on the model, part and repair method. If a feature matters to you, name it before authorising work and ask how it will be checked after the repair. Avoid treating a general assurance as a guarantee of a specific result.`,
        ],
      },
      {
        heading: 'Get the quote and scope in writing',
        paragraphs: [
          `Ask for a written breakdown of the part, labour, diagnosis charge if any, and any additional work that might change the total. Find out whether the quote expires or depends on opening the phone. Do not approve extra work automatically; ask to be contacted with a revised price and explanation before the repairer proceeds. If you compare options, make sure each quote covers the same part type and work.`,
          `Ask what is included in the quoted job and what is not. For example, does the quote cover only the display assembly, or also a damaged frame or other fault found during inspection? Confirm whether an unsuccessful repair or an unexpected condition changes the charge. An itemised quote helps you compare offers fairly and reduces confusion when you collect the device.`,
          `Write down the part description, total amount and what would trigger a change. If the repairer cannot confirm a final amount until opening the phone, agree on the diagnostic step and ask to be contacted before any additional charge. This gives you a chance to accept, decline or seek another opinion rather than discovering an unapproved cost at collection.`,
          `Different quotes may use different part grades, include different labour or assume different faults. Ask each repairer to explain the same details, and compare the answers rather than assuming all screen replacements are equivalent. If the proposed work or cost is still unclear, postpone authorisation while you get a second assessment.`,
        ],
      },
      {
        heading: 'Protect your data and account access',
        paragraphs: [
          `Back up important files before handing over a phone when you can. Screen repairs do not always require erasing personal data, but unexpected faults can make a device unusable during the process. Ask the repairer whether a passcode is needed and what they need to test. Do not share your Apple Account or Google password, banking password, card PIN or one-time verification code.`,
          `If a test requires the phone to be unlocked, ask whether you can unlock it yourself and stay present while the check is completed. Remove a SIM or memory card if it is not needed for the work. If a repairer asks for an account password, ask why and look for a safer alternative. Make a note of the phone’s visible condition and accessories at drop-off, and get a receipt or job record.`,
        ],
      },
      {
        heading: 'Ask how testing and collection will work',
        paragraphs: [
          `Before approving a repair, ask what checks will be performed before the phone is returned. Useful checks may include display brightness, colour, touch across the panel, proximity behaviour during a call, camera, charging and any feature affected by the work. The exact test list depends on the device. Ask the repairer to demonstrate the functions that matter to you while you collect it.`,
          `Ask for an estimated collection window, but understand that it can change if parts are unavailable or additional damage is found. A promised time without an inspection or parts confirmation is not a reliable diagnosis. Confirm how the shop will contact you if timing or cost changes, and whether you should collect the device in person for testing before making the final payment.`,
        ],
      },
      {
        heading: 'Clarify repair warranty and return terms',
        paragraphs: [
          `Ask whether the repair has a written warranty, what it covers, how long it lasts and what conditions may exclude coverage. A warranty on the replacement part may differ from coverage for labour or unrelated device faults. Request the terms on the receipt or job sheet and keep it. Do not assume that a verbal mention of a warranty covers accidental damage, liquid exposure or every future screen issue.`,
          `When comparing screen repair options in Ikeja or Computer Village, consider clarity, testing and written terms alongside cost. The lowest quote may use a different part or include less work; a higher quote is not automatically better either. Confirm current service availability, part details, price and turnaround directly with the repairer because these details vary by model and can change. If the answers remain unclear, pause before leaving the device.`,
          `Keep your job sheet and receipt until you are satisfied that the agreed checks are complete. If a symptom remains after collection, describe exactly what you observe and contact the repairer promptly using the written terms. Do not attempt to open the phone yourself to investigate a repair issue; ask the person who performed the work what follow-up is appropriate for that model.`,
        ],
      },
    ],
  },
  {
    slug: 'trade-in-vs-sell-phone-lagos',
    title: 'Sell or Trade In Your Phone in Lagos? Compare Both',
    description:
      'Compare a direct phone sale with a trade-in in Lagos, including offer terms, device condition, payment, data removal and the questions to ask first.',
    publishedAt: '2026-10-26',
    relatedPages: [
      { href: '/trade-in-old-phone-lagos', label: 'Phone trade-in information for Lagos' },
      { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
      { href: '/fairly-used-iphone-price-computer-village', label: 'Fairly used iPhone buying information' },
    ],
    relatedPosts: [
      { slug: 'prepare-phone-for-sale-or-trade-in-nigeria', title: 'Prepare a phone for sale or trade-in' },
      { slug: 'how-to-check-used-iphone-before-buying-nigeria', title: 'Inspect a used iPhone before buying' },
    ],
    sections: [
      {
        heading: 'Know what each option means',
        paragraphs: [
          `A direct sale means you transfer your old phone to a buyer in exchange for an agreed payment. A trade-in means the old device is assessed as part of a transaction that may involve buying another device or receiving a credit, depending on the seller’s terms. Shops use these labels differently, so ask exactly what happens to the device and how the value is applied before choosing.`,
          `In Lagos, you may compare offers from shops, private buyers or online listings, but these are not always comparable. One offer may be conditional on an in-person inspection, while another may depend on a purchase or a specific payment method. Do not compare only the headline amount. Compare what must be true for the amount to be paid and whether the terms are written down.`,
        ],
      },
      {
        heading: 'Prepare the same information for every quote',
        paragraphs: [
          `Write down the exact model, storage, colour if relevant, network status, known faults, repair history and included accessories. Describe the condition honestly, including cracked glass, weak battery, missing parts, charging problems or account issues. A clear description helps a buyer decide whether an initial indication is worth pursuing, but it cannot replace physical inspection.`,
          `Take photos of the device’s visible condition and note its serial or IMEI privately for your own record. Do not publish full identifiers or send them to unknown contacts. If a buyer needs to inspect the phone, agree on a safe, observable place and retain control of the device until you understand the offer and payment conditions.`,
        ],
      },
      {
        heading: 'Compare the written offer, not a headline estimate',
        paragraphs: [
          `Ask whether the amount is fixed or subject to inspection, what condition assumptions it uses, and which faults can change it. Find out whether a trade-in value is cash, store credit or a discount on a specific purchase. Confirm whether accessories affect the assessment and whether there are any fees, expiry dates or conditions. A written offer lets you compare the same details across different buyers.`,
          `An online estimate or quick message is not necessarily a final offer. The actual device may differ from the description, the buyer may need to test functions, or a quoted amount may be tied to current stock or a purchase. Ask what happens if the inspection finds an issue. If the buyer will not explain how a number was reached, treat it as provisional rather than planning around it.`,
          `Write down the date of each quote and the conditions attached to it. If one buyer offers a figure only after seeing the phone and another gives an early indication from a message, mark the difference clearly in your notes. A provisional number can help you decide whether to arrange an inspection, but it is not money you can count on until the buyer confirms the final terms.`,
        ],
      },
      {
        heading: 'Choose based on your next step and the terms',
        paragraphs: [
          `A trade-in may be convenient if you already intend to buy another phone from the same seller and the credit is clearly stated. A direct sale may suit you better if you want to compare buyers or do not want the money tied to a new purchase. Neither option is automatically worth more. Compare the final total you will pay or receive, the payment method, and any conditions that affect the deal.`,
          `Ask how payment is made and when it is considered complete. Verify any transfer in your own bank app or account rather than trusting a screenshot or notification shown by another person. Never share a one-time password, banking PIN or password to receive money. If the transaction is linked to buying another phone, confirm the purchase price, stock and trade-in credit separately so the total is clear.`,
          `For a trade-in, compare the device price before credit with the price after credit, then confirm whether the credit can be used only on a particular model or within a stated period. Ask what happens if the phone you want is unavailable or the assessment changes. For a direct sale, ask whether payment is made immediately after inspection or later, and include the timing in the written agreement.`,
          `A higher stated amount is not necessarily the better deal if it depends on conditions you cannot meet or includes deductions that have not been explained. Compare the net amount you will receive, the effort involved, payment certainty and how quickly you need to complete the transaction. The right choice depends on your next purchase, device condition and the buyer’s actual terms, not on the label alone.`,
        ],
      },
      {
        heading: 'Protect personal data before handing over a device',
        paragraphs: [
          `Back up photos, contacts, chats and files you want to keep, then check that the backup is usable. Remove SIM and memory cards. Sign out of the relevant Apple, Google or manufacturer accounts, disable device-finding locks where required, and erase the phone only after you have confirmed the backup. Steps differ between iPhone and Android models; follow the manufacturer’s current instructions for your device.`,
          `Do not give a buyer your account password or let someone else perform a reset while keeping your credentials. After erasing, check that the phone starts at its initial setup screen and is no longer linked to your account. If you cannot remove a lock because you do not have the account details, resolve that first; a phone that a buyer cannot activate may not be accepted or may lead to a disputed transaction.`,
        ],
      },
      {
        heading: 'Keep a record and do not rush the handover',
        paragraphs: [
          `Before you hand over the device, make sure the receipt or written agreement states the model, condition, agreed amount or credit, payment method, date and any relevant terms. Keep a copy of the conversation and receipt. If the device is being assessed rather than purchased immediately, ask who is responsible for it while it is held, how long assessment takes, and whether you can decline the final offer and collect it.`,
          `Walk away if someone changes the agreed terms without explanation, asks you to bypass account protections, pressures you to hand over the phone before payment is verified, or requests private banking credentials. These are sensible transaction safeguards, not proof that every unexpected request is a scam. Compare the options at your own pace, confirm current terms directly with the buyer, and choose the arrangement you can understand and document.`,
        ],
      },
    ],
  },
  {
    slug: 'prepare-phone-for-sale-or-trade-in-nigeria',
    title: 'How to Prepare Your Phone for Sale or Trade-In in Nigeria',
    description:
      'Back up, secure and document your phone before selling or trading it in Nigeria, then remove accounts and erase it safely before handover.',
    publishedAt: '2026-10-26',
    relatedPages: [
      { href: '/sell-my-phone-computer-village', label: 'Selling a phone in Computer Village' },
      { href: '/trade-in-old-phone-lagos', label: 'Phone trade-in options in Lagos' },
      { href: '/fairly-used-iphone-price-computer-village', label: 'Fairly used iPhone information' },
    ],
    relatedPosts: [
      { slug: 'trade-in-vs-sell-phone-lagos', title: 'Compare selling with trading in' },
      { slug: 'how-to-check-used-phone-before-buying-nigeria', title: 'Used-phone inspection checklist' },
    ],
    sections: [
      {
        heading: 'Decide what is included before you start',
        paragraphs: [
          `Make a list of the phone, box, charger, cable, case, SIM tool or other accessories you plan to include. Check the device model and storage in Settings and write down any known faults, repairs or account issues. Be accurate about the condition: a cracked screen, weak battery, intermittent charging or damaged camera can affect an assessment. A clear description helps you avoid confusion when you compare offers.`,
          `Take a few photos of the phone’s current exterior and accessories before packing or handing it over. Keep serial and IMEI details private; note them for your own records rather than posting them publicly. If you have a receipt or repair record, decide whether you want to share a copy with a buyer and remove any personal details that are not needed for the transaction.`,
        ],
      },
      {
        heading: 'Back up and check your important files',
        paragraphs: [
          `Use a trusted backup method for the type of phone you own, then check that recent photos, contacts, documents and messages you need are present in the backup. Do not assume a backup completed just because you tapped a button; check its date and contents. If you rely on chat history or an authenticator app, follow that service’s transfer instructions before erasing the old device.`,
          `Make sure you can sign in to the accounts you will need on your next phone. Keep recovery codes or other account-recovery information in a safe place, not in a note that will be erased with the device. If you use mobile banking, confirm how you will access it after the SIM and device change. Avoid sharing passwords, recovery codes or one-time verification codes with a buyer or repairer.`,
          `If your backup is stored online, check that the correct account is signed in and the latest backup completed before you begin the reset. Some apps keep data separately from the phone’s general backup, so open their own transfer or backup settings where relevant. If you are unsure whether something important has been saved, pause and verify it on another device before deleting the local copy.`,
        ],
      },
      {
        heading: 'Move your number and remove removable items',
        paragraphs: [
          `Remove the physical SIM and any microSD card before handover. If the phone uses an eSIM, follow your network provider’s instructions for transferring or deactivating it; do not assume that erasing the handset automatically moves the mobile plan to your next phone. Keep the SIM tray and any small accessories you intend to retain.`,
          `If you are moving to another device, confirm that calls, messages and any two-step verification you rely on will work after the transfer. A network account or eSIM can need a separate step from the phone reset. Make sure the phone you are selling will not continue receiving calls or notifications meant for you once the sale is complete.`,
        ],
      },
      {
        heading: 'Sign out and remove device locks',
        paragraphs: [
          `Before erasing, sign out of the Apple Account, Google Account or other manufacturer account associated with the phone and turn off device-finding or activation-lock features as the manufacturer directs. Menu names vary by model and software version. If you cannot sign out because you have forgotten a password, recover access through the official account process before the sale rather than asking a buyer to bypass the lock.`,
          `A buyer should not need your private password to test or activate the phone after you have prepared it. If the device belongs to a workplace, school or another person, obtain the proper owner’s approval and have them remove any management profile. A reset may not remove organisation management or an account lock. Resolve these issues before agreeing a handover date or final amount.`,
        ],
      },
      {
        heading: 'Erase only after the backup and account checks',
        paragraphs: [
          `Once you have checked the backup, moved what you need and signed out, use the device’s built-in erase or factory-reset option. Follow the current manufacturer instructions for your model. Do not use an unfamiliar computer tool or let a stranger connect to your account to erase the phone. A normal reset removes personal data from the handset, but it does not replace your responsibility to protect cloud accounts, email and payment services.`,
          `After the reset, allow the phone to restart and confirm that it opens to its initial setup screen without requesting your account password. Do not complete setup again with your personal account just to demonstrate the phone. If a lock remains, stop and resolve it before transfer. Keep your own SIM and memory card, and make sure the reset did not accidentally erase files from a different device or a shared cloud account.`,
          `Check the phone’s support instructions if the reset menu offers to keep or remove an eSIM, erase a secure folder or handle a memory card. These options vary, so read the confirmation screen instead of tapping through quickly. The aim is to remove your personal information from the device while keeping the phone usable for its next owner, not to erase unrelated information stored in another account.`,
        ],
      },
      {
        heading: 'Agree the condition, amount and handover record',
        paragraphs: [
          `Before the device changes hands, confirm the exact model, stated condition, accessories, agreed payment or trade-in credit, method of payment and any written conditions. If a quote is subject to inspection, ask what could change it and whether you may decline the final offer. For a trade-in tied to a new phone, confirm the purchase price and the credit separately so you can see the full calculation.`,
          `Verify a bank transfer in your own account rather than relying on a screenshot, SMS or another person’s device. Ask for a receipt or written record showing the date, phone description, amount or credit and the buyer’s terms. Keep a copy after handover. Prices, acceptance rules and trade-in terms vary by device and buyer, so confirm current details directly and do not erase or transfer the phone until you are comfortable with the arrangement.`,
          `If the buyer needs to hold the device for an assessment, ask for a receipt that records its visible condition, accessories and the time it was left. Confirm who to contact, when you should expect an update and whether you can collect the phone if you decline the offer. Do not hand over a device without understanding whether the buyer is inspecting it, purchasing it or holding it under a separate agreement.`,
        ],
      },
    ],
  },
]
