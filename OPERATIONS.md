# StorageBuddy Rama 3 website operations

## Latest verified photo flow and customer records

September 11 follow-up: removed the photo checkbox and “AI SIZE HELP” badge at Newton's request. Photo selection/capture now automatically requests a recommendation, with a short processing notice/privacy link and loading/error/result feedback. Live camera uses `getUserMedia`; browser camera permission is still needed. Text-only estimates use the button. The API still receives `consent:true` as its existing request authorization flag; this no longer represents a separate checkbox.

Live verification after commit `c7883f3`: a real photo request returned HTTP 200 and a visible 0.25–1 sqm result for detected document boxes. This proves connectivity and rendering, not estimate accuracy for every photo. Fresh form submission named `TEST ONLY PHOTO FOLLOWUP` returned HTTP 201 and showed success. Its source is `setup_test_photo_followup_20260911`; exclude it from customer reporting. Anonymous lead reading returned HTTP 401.

Open customer records: https://supabase.com/dashboard/project/tmynmthxjcrnnukmpyox/editor/18424?schema=public — project **storage**, table **public.leads**. Contact/basic fields have their own columns; detailed form answers are JSON in `customer_use`. Submitted enquiries and area votes are saved; abandoned/unfinished forms and photos are not. An estimate is saved only if attached using the result's enquiry button and then submitted. There is no custom admin dashboard or automatic LINE/email notification yet.

Current code's provider model default is `claude-sonnet-5`, overridable by `ANTHROPIC_MODEL`. Older model/checkbox references below are historical. Current brand positioning is professional care, thoughtful help and Buddy pricing, as recorded in `STRATEGY_UPDATE_2026-09-11.md`.

Primary public domain: **https://storagebuddyth.com**. Newton purchased it on September 11. It connects to the existing `getstorage` Pages project. The old `getstorage.pages.dev` remains the platform address. Public canonical URL, social metadata, robots and sitemap use the purchased domain. Earlier no-purchase notes below are historical.

## Current customer journey

Rama 3 enquiries, AI size advice, an illustrative animated size guide, and separate other-area requests. No payments, confirmed room reservations, live inventory, approved tariff or guaranteed opening date. Staff confirm size, availability, access, price and move-in timing.

Positioning: **The right space for you.** Brand line: **Right Space. Right Price. Right for You. / พื้นที่พอดี ราคาพอดี สำหรับคุณ**. Help customers avoid unnecessary space, with personal advice supported by AI.

## Enquiries and follow-up

Review `public.leads` in the existing Supabase dashboard daily. No email/LINE notifications have been configured. Website saves do not automatically contact staff or customers. The public site has no authenticated administration application; use the existing authorized Supabase dashboard.

New rows use `lean=rama3_enquiry` or `lean=area_vote`. Existing historical rows remain unchanged. Do not count area votes, repeated anonymous requests, setup tests, AI estimates or enquiry clicks as customers or reservations.

The existing `customer_use` TEXT column now contains JSON with `version:2`. It includes inventory description, customer area, duration, budget, LINE, access frequency, moving/climate preferences, entry point, language, consent timestamp and campaign fields. An explicitly attached AI result appears in `ai_estimate`, with its input description and photo count. No image data is stored. Historical plain-text values must remain supported in future reporting; parse only rows with the expected JSON version.

`area=rama3` identifies the facility for enquiries. For votes, `area` holds the requested area. `size` is a preference, not a confirmed recommendation. `price_shown=null` because no tariff is published. Retain actual human recommendation, quote, accepted/rejected result and actual rented size separately in the staff workflow; an expanded relational admin remains future work.

Exclude any `utm_source` starting `setup_test` from demand reporting, including `setup_test_redesign_20260911`. Synthetic test phone `0000000000` is not a real contact.

The site retains entered values on a failed/uncertain save. Network timeouts can be ambiguous; deduplicate repeat requests by contact/time in staff review. Anonymous public insertion is retained from the existing database; it is not authenticated or a guarantee against spam. No public reading was granted.

## AI configuration and limitations

Cloudflare Pages project `getstorage`, production secret `ANTHROPIC_API_KEY`. Never place the key in HTML, Git, build output or browser storage. Existing shared credential remains unchanged at its source. Model defaults to `claude-sonnet-4-6`; `ANTHROPIC_MODEL` can override it after validation. Set `AI_ENABLED=false` to disable paid estimation and redeploy. Normal enquiry forms remain usable when AI is unavailable.

Endpoint `/api/estimate` accepts only same-origin JSON POST, explicit consent, up to four JPEG/PNG/WebP images and 1,600 description characters. Client resizes photos to 1,280px maximum dimension and re-encodes JPEG, removing original metadata. Server independently checks byte limits, signatures and response structure. Max response tokens and provider timeout are bounded. Neither StorageBuddy's server nor its lead table retains the submitted images; Anthropic processes them under its provider terms. Photos are held in browser memory until removed or the page is closed.

Five requests per IP per hour are limited with hashed, rotating Cache API keys. This is **best-effort per Cloudflare datacentre**, not a globally atomic quota or a financial cap; concurrent requests, cache eviction and distributed clients can evade it. Apply provider spending controls and monitor usage before scaling advertising. A dedicated provider key and stronger durable rate limiting are sensible when traffic grows. Do not claim the endpoint is abuse-proof.

Photo estimates are rough ranges. AI can misidentify objects, miss items, overlap photos or estimate dimensions incorrectly. Staff must verify actual measurements, safe stacking, retrieval access, room height and fit. No auto-quote, automated billing or inventory allocation depends on the result.

## Privacy and location maintenance

Privacy requests can be submitted using the enquiry form, marked as such. Verify the requester before correcting/deleting records. Review inactive enquiries after 12 months in accordance with the published notice; this is a manual operational task, not a scheduled deletion job.

Map link is Newton's supplied pin, Charoen Rat 7 Yaek 9, Bang Khlo, Bang Kho Laem 10120, coordinates 13.6943813,100.5158207. Google currently labels the previous garment business. Do not inherit that business's phone, reviews or temporary-closure label as StorageBuddy facts. Update the public listing when the business identity is ready.

The user reports over 1,000 sqm available to rent. Website describes total building space, not fitted vacant storage inventory. Verify measured rentable area and release dates before publishing availability.

## Build and deployment

Run `node build.cjs`, `node --test tests/estimate.test.mjs`, and compile Pages Functions with Wrangler. GitHub main remains connected to Cloudflare Pages. `build.cjs` explicitly allowlists public files; internal docs, source research and secrets remain outside `public/`. Functions live in the repository's `functions/` directory, not the static asset output. `_routes.json` invokes Functions only on `/api/*`.

On this Windows machine Wrangler required `NODE_USE_SYSTEM_CA=1` to trust the system certificate roots. Do not disable TLS verification. A domain purchase is not required for deployment on `getstorage.pages.dev`. No domain has been bought by this task.
