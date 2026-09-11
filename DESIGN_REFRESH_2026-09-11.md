# StorageBuddy complete page refresh — September 11, 2026

## Follow-up: Thai wording and useful room examples

Newton flagged incomplete Thai branding and uninformative room illustrations. Corrected all public occurrences of the brand to `สตอเรจบัดดี้`, including metadata/header/footer, and enlarged subtitle line height. Reviewed page wording and localized room dimensions to Thai `ม.`. Replaced the abstract blocks with constant-scale recognizable objects and matching TH/EN inventories: 2 sqm = 8 archive boxes; 3 sqm = shelving, 2 suitcases, 4 boxes; 4 sqm = bicycle and 6 boxes; 5 sqm = sofa, suitcase and 6 boxes; 8 sqm = sofa, shelving, bicycle and 8 boxes. Examples are illustrative, not capacity guarantees. Checked SVG bounds and layout widths 360/390/768/1440; inspected all five scenes and mobile bicycle rendering.

Newton explicitly resumed Codex design work after Claude's size-guide changes. The prior documentation-only/design pause is superseded for this request.

## Final design

- Main headline: **ดูแลแบบมือโปร ราคาแบบบัดดี้ / Professional care. At a Buddy price.** Supporting promise: professional care, thoughtful guidance and Buddy pricing.
- Deep green and brighter green anchor the page; sky blue, white and warm cream distinguish sections; small coral accents add emphasis.
- Full-width supplied banners replace the cropped narrow hero image. Desktop uses `banner_thai.png` / `banner_eng.png`; mobile uses `banner_fat_thai.png` / `banner_fat_eng.png`. All four are optimized as WebP without changing their artwork. The banner links to size guidance; its pictured CTA is therefore actionable.
- Matching blue/green cube mark is rendered as a small vector in navigation/footer. No image-generated edits were needed.
- Page sequence: hero → three-part Buddy promise → personal/moving/business use cases → size guide → photo sizing → three steps → Rama 3 map and area voting → FAQ → closing enquiry.
- Reworked use-case cards, mobile step cards, blue room stage, enquiry modal styling, FAQ cards and closing CTA. Room views retain a common coordinate frame for relative comparison; notes are in normal document flow to avoid caption overlap.
- Existing enquiry, area-vote, camera/gallery, consent and estimator request logic are retained. Language switching now also switches the mobile picture source.
- Proposed prices, inventory, 24/7 access, payments and unverified facility capabilities were not added as live promises. No backend/model/database changes.

## Verification

- Browser checks at 1440px desktop and 390px mobile in Thai and English; additional 360px English width check. No horizontal overflow or uncaught JavaScript errors.
- All five size views (2/3/4/5/8 sqm) fit the SVG viewBox; relative dimensions preserved. Thai/English responsive banner selection verified.
- Photo selection/resizing to JPEG, consent gate, estimate display and estimate-to-enquiry tested with a local mocked AI response.
- Two-step enquiry and anonymous area-vote submission tested with local mocked Supabase responses; no synthetic production leads added.
- Visual screenshots inspected for desktop/full page, mobile, size guide, steps and enquiry dialog. Local browser captures may not load the external Google map; existing map URL and embedding remain unchanged.
- Inline JavaScript syntax and build checked. Backend tests run as a regression check; backend file untouched.

Local review scripts/screenshots are outside the repository under `C:\Users\User\AppData\Local\Temp\storagebuddy-review-tools`. `build.cjs` explicitly publishes the four new banner assets; internal docs remain private.
