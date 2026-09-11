# September 11 Rama 3 redesign verification

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

## Release notes

No confirmed opening date, live inventory or approved tariff was supplied. Website accepts enquiries and asks staff to confirm move-in timing and price. Notifications and authenticated admin remain outside this release; review the Supabase lead inbox daily. Supplied/generated imagery is labelled illustrative. No domain purchase.

Production deployment verification is recorded below after publishing.
