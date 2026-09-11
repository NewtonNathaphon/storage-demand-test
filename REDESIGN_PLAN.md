# StorageBuddy Rama 3 redesign — September 11

User authorized redesign after the master brief review, restoring secondary other-area voting and requesting animated size guidance plus camera/upload AI sizing.

## Implementation

- Extend the existing static site and Supabase lead/event persistence. Keep hosting address and existing records.
- Rama 3 primary enquiry, size guide (2/3/4/5/8 sqm plus larger enquiries), location and practical service explanation.
- Use supplied Pexels photographs for illustrative lifestyle sections, not as facility photographs. Create original SVG room illustrations with animated belongings.
- Camera and gallery inputs with client-side downsizing, explicit AI consent, server-side vision analysis and a range/reasoning/questions result. Never return a made-up estimate when the provider fails. In this release photos are processed transiently; only the chosen enquiry details and AI result are saved, not photos. Staff photo retention is a later private-storage workflow.
- Keep public enquiry save compatible with existing leads schema. Store additional structured text fields and estimate provenance in customer_use as versioned JSON (no binary data). Add no unsafe public read policy. This compatibility step precedes the expanded relational admin migration.
- Other-area votes use lean=area_vote, with desired area separately saved. Count separately from Rama 3 enquiries and never label as reservations.
- Do not publish old test prices as a Rama 3 tariff. Quote request is the default. Current availability and move-in date are confirmed by staff.
- Thai and English UI, mobile layout, keyboard access and reduced-motion support.

## References reviewed

- NKP https://nkpselfstorage.com/storage-sizes-prices/ — animated cutaway rooms and dimensions; original StorageBuddy drawings, no copied assets.
- LEO https://leoselfstorage.com/th/ — clear location, size, quotation entry points.
- i-Store https://i-store.co.th/ — separate size guide/estimator and customer process.
- CH https://ch-selfstorage.com/ — personal/business use cases and practical facility information.
- Jingjo https://jingjostorage.com/ — clear product presentation and direct enquiries; container model is not our product.

## Confirmed location

User map: https://maps.app.goo.gl/Yt1FtdtEJJ4cLRUZ6

Pin coordinates: 13.6943813,100.5158207. Google currently labels the old garment business, not StorageBuddy. Charoen Rat 7 Yaek 9, Bang Khlo, Bang Kho Laem, Bangkok 10120. Do not inherit the old business phone, reviews or opening status as StorageBuddy facts.

User states more than 1,000 sqm to rent. Display as total building space, not live fitted vacancy.

## Verification

Check desktop/mobile layout, both languages, every size selector, camera/gallery validation, remove/reset images, AI success/failure/malformed responses, limits, successful/failed enquiry and area-vote saves, Unicode, no public reads and published asset allowlist. Use synthetic source tags for persistence checks.
