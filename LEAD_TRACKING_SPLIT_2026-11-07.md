# Lead conversion split handoff (7 November 2026)

Prepared only. No push or deployment performed. Base: 6bab6f3a5c6477256f73f3bb9e727667c3e3478f (main / PR #6).

## Event contract
- After a successful save only, reserve_free uses existing reservation destination AW-16778280533/c4qzCMDIurMdENX8wMA-.
- After a successful save only, quote_request uses AW-16778280533/aIXhCOD09LMdENX8wMA-. Parent verified this as StorageBuddy Quote Request Submitted, Secondary, Contact category, Count One, fixed value 0 THB. No bid-goal change intended.
- Unknown/unlisted and large sizes remain quote requests, never reservations. Existing activeQuote classification and stored next_step/readiness_level are unchanged.
- reserve_free remains an unpaid price reservation request, not proof of payment, allocated inventory, or a signed rental.
- Existing LINE destination and listener are unchanged.
- Event payload includes only destination and a random transaction_id, never contact data or quoted amounts. The ID is stable for failed-save retries in the current form. Existing busy/submitted guards and a conversion guard prevent repeated or concurrent submit dispatch. A fresh form is a new attempt; this does not deduplicate the same person across devices or sessions.

## Cutover record
Production cutover: PENDING (not deployed).
Record deployed commit and UTC timestamp here when publication is separately authorized and verified. From that cutover forward, the existing reservation action receives only reserve_free. Historical reservation totals before the cutover can include quote requests because PR #6 sent both intents to that action. This code does not relabel historical Ads data. The new Secondary quote action will not receive website events until this change is deployed.

## Verification
- npm test: 90/90 passed, including 14 new conversion tests and unchanged LINE tests.
- node --check assets/registration.js and git diff --check passed.
- tests/registration-browser.cjs passed: local Chrome, mobile/desktop, failed save/retry, repeat submission, reservation payload, reload.
- tests/launch-prices-browser.cjs passed: current plans, persisted quote, large-space company quote with ZERO reservation events and ONE quote event, locker.
- Browser runs used local public output, mocked Supabase persistence, and blocked all other external requests, including Google. No real leads or Ads conversions were sent. Existing installed Playwright was reused with installed Chrome; bundled Playwright Chromium was absent.

## Parallel promotion merge
Promotion worker is editing pricing and summary sections of assets/registration.js, registration-page.cjs, and both browser tests in a separate checkout. Preserve both workers' hunks. This change touches only the registration tracking helper/dispatch, registration asset cache version, and tracking assertions. The new tests/lead-conversions.test.mjs imports current demand-config.cjs. Rerun full tests and both browser flows after integration. Never overwrite either checkout wholesale.
