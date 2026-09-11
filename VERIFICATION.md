# September 11 Rama 3 redesign verification

## Later palette refinement

Expanded the page palette to multiple green shades, cream, white and sky blue, with restrained coral-red accents. Removed visible brand/facility photo labels in both languages per Newton's explicit request. No form, AI or persistence behavior changed. JavaScript/metadata/DOM checks passed; Thai and English desktop/mobile layouts reviewed at 390px. Domain searches performed in Cloudflare; no purchase made.

## Completed locally

- JavaScript parse, structured metadata JSON and DOM ID/reference checks passed.
- `node --test tests/estimate.test.mjs`: four test groups passed. Covers consent, image signatures/limits, origin restrictions, invalid/oversized requests, provider success, provider errors, malformed AI output and insufficient information.
- Wrangler Pages Functions compilation passed.
- Desktop and 390px mobile browser review in Thai and English; no horizontal overflow observed. All five animated room size controls exercised. SVG dimensions revised to reflect the advertised illustrative width/depth proportions.
- Real Anthropic description-only estimate rendered in the browser and carried into a sample enquiry. An initial response contained unhelpful arithmetic and an assumed standard room; prompt tightened to concise assumptions and no invented standard units. Ranges still require human verification.
- Real Anthropic photo request using the supplied illustrative stock photo returned a Thai range, low confidence and useful clarification questions. No photos stored in the lead table.
- Enquiry test independently confirmed in Supabase: **lead ID 4**, `lean=rama3_enquiry`, extended JSON and attached AI estimate preserved, Unicode intact.
- Anonymous area-vote test independently confirmed: **lead ID 5**, `lean=area_vote`, separate from Rama 3 enquiries.
- Both have `utm_source=setup_test_redesign_20260911`; exclude from reporting. Historical IDs 1–3 remain.
- Anonymous reads of leads and events returned HTTP 401. No public read permission added.
- A local-only missing-configuration test showed the failed-save message and retained form inputs; success was not shown.
- Cloudflare production secret installed server-side; no secret placed in static assets. System certificate trust fixed Wrangler login without disabling TLS verification.

## Photo UI coverage

Automated Chrome file chooser attachment returned `Not allowed` from the browser automation provider. A local-only upload harness exercises the same production `addPhotos` and `preparePhoto` functions with a stock file, including decoding, JPEG re-encoding, preview and removal. Native mobile camera hardware remains a manual device check; HTML uses `capture=environment` and falls back to the device's file-selection behavior.

The harness produced a 1,000 × 666 JPEG preview from the supplied WebP, received a real Thai photo estimate, and confirmed that removing the photo leaves zero previews and hides the stale result. Neither local test harness route is in the repository or published assets.

## Release notes

No confirmed opening date, live inventory or approved tariff was supplied. Website accepts enquiries and asks staff to confirm move-in timing and price. Notifications and authenticated admin remain outside this release; review the Supabase lead inbox daily. Supplied/generated imagery is labelled illustrative. No domain purchase.

Production deployment verification is recorded below after publishing.

- Published implementation commit **946d015**, Cloudflare production deployment **9e5d4af0-d458-4c26-938b-9eff4d4dd769**.
- `https://getstorage.pages.dev/` serves the new design and latest Thai banner, HTTP 200, with the expected Content Security Policy. Public logo/banner assets return image/webp. Internal document and function-source paths return the static homepage fallback, not their private source contents.
- Live `/api/estimate` returned HTTP 200 for both description-only and photo inputs, with appropriate `anthropic_text` / `anthropic_vision` provenance. GET returns 405. No secret is returned to the browser.
- A Thai enquiry submitted through the live site was independently confirmed as **lead ID 6** in Supabase, preserving UTF-8 and source attribution. Exclude `setup_test_redesign_20260911` from reporting (IDs 4–6).
- Latest supplied banner is **09_40_40 PM**, used in Thai. The 09_26_55 English version switches with the language control.
- Browser viewport restored after responsive checks. Only documentation/ignore-list updates followed this implementation deployment.
