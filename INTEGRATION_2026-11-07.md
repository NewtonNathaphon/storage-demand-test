# Combined promotion and lead-tracking verification - 7 November 2026

Local release candidate only. No push or deployment.

## Included work

- 8ef7b23: align promotion definitions, list-rent deposits, exact satang and public wording with the live sheet.
- 5bc32f0: integrate tracking commit b6a13ce2f8835d0054233e1c5314501608ddcda5.
- 2b64953: integrate quote-copy commit f5769396413353c4109ff31ca868fef346087df0.

Conflicts were reconciled in registration-page.cjs and assets/registration.js. The resulting page retains deposit disclosures and signing totals, the exact stored quote and integer-compatible legacy summary, conditional reservation/quote copy, and separate after-save conversion events. The registration asset version is promotion-leads-v12.

Remote main was freshly fetched after verification and remains 6bab6f3a5c6477256f73f3bb9e727667c3e3478f. No newer Claude commit was present at that check.

## Passed checks

- node --check assets/registration.js
- node --check assets/backoffice.js
- node build.cjs: 16 canonical pages
- node --test --test-concurrency=1 tests/*.test.mjs: 95 passed, zero failures/skips
- tests/registration-browser.cjs
- tests/launch-prices-browser.cjs
- tests/lead-photos-browser.cjs
- tests/promotion-terms-browser.cjs
- tests/quote-copy-browser.cjs
- git diff 6bab6f3 --check

Browser runs were headless against local output. Supabase persistence was mocked and other external requests, including Google, were blocked. No real lead or Ads conversion was sent. Checked 54 size/plan calculations, 90 Thai/English size-duration renders, mobile/desktop layout, failed save/retry, concurrent/repeated submission, language changes before/after save, historical records and large/unknown/unlisted-size quote requests. Mobile quote and successful-reservation screenshots were visually reviewed.

## Release conditions and limits

Ready for authorized publication from a code/test perspective. Do not call this deployed or claim an Ads conversion was received. Before publishing, recheck remote main and integrate any intervening changes; never force-push over them. After publication, verify the exact deployed revision, public pricing/copy/asset version and conversion dispatch without contaminating real customer data. Record the production cutover in LEAD_TRACKING_SPLIT_2026-11-07.md. Real eligible Ads attribution remains a separate verification step.

The approved source is still a manual static snapshot. Quota enforcement and an exact opening/expiry date are not configured; staff confirm availability and eligibility. No sheet, refund policy, pricing schema, old customer data or campaign/bidding goals were changed by this local integration.
