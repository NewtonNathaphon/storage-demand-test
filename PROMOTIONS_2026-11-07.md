# Promotion alignment - 7 November 2026

Prepared locally for review. Not pushed or deployed.

## Authoritative source

StorageBuddy Sales Toolkit:
https://docs.google.com/spreadsheets/d/1jze4VDORiCYvi30OKTmCVGyshNp_xpob5x-m1cPUMNc/edit?gid=1#gid=1

Use Promotions!A5:I10 for the six Approved plans, Prices!A5:C13 for list rent, and Quote!B16:B20 for arithmetic. The sheet was read only. Plan!E8 still contains pay 5/get 6 and Plan!E9 defers deposit terms; these are older than the live Promotions values and must not override them.

## Current terms

- Monthly: full list rent, 30-day move-out notice.
- Three months: pay three months less 5%.
- Six months normal: pay six months less 10%.
- Twelve months normal: pay ten, store twelve.
- Founding six months: pay four, store six.
- Founding twelve months: pay seven, store twelve.
- Every plan: deposit equal to one month of LIST rent, added at contract signing.
- Reservation is free now; no money collected by the form.
- Founding limit: first 30 rooms, until 14 days after opening. Staff confirm eligibility. No live quota or confirmed calendar opening/expiry is configured.
- A longer-than-one-year enquiry quotes only the first twelve months.
- No refund rules, cancellation promises or automatic-renewal terms were added.
- Existing locker eligibility is preserved; the sheet has no explicit locker exclusion.

## Corrections

Normal annual and both Founding plans incorrectly had zero deposits. Config now uses one month for all six. Homepage, bilingual supporting-page CTA, registration introduction, price rows, contact-step summary, success summary and signing instructions distinguish free reservation from the later deposit. Backoffice shows the stored deposit and signing sum without changing old records.

The old calculator floored fractional baht. Quote formulas do not. Exact satang is now displayed and saved in customer_use.quote_total, quote_saving and quote_average_monthly. The legacy leads.price_shown column is an integer; it remains a rounded whole-baht summary, while the exact quote snapshot is authoritative. No schema change.

For a 4 sqm room (THB 3,990 list rent):
- 3 months: rent 11,371.50; deposit 3,990; signing total 15,361.50.
- Founding 6 months: rent 15,960; deposit 3,990; signing total 19,950.
- Founding 12 months: rent 27,930; deposit 3,990; signing total 31,920.

## Verification

- Build: 16 canonical pages.
- Unit suite: 81 passed, zero failures, including the full 9-size x 6-plan matrix.
- Browser suites: registration, launch prices, lead photos/backoffice, and bilingual promotion terms.
- 90 bilingual size-duration render combinations, mobile 390px and desktop 1440px.
- Failed save/retry, double submission, back navigation, language changes and exact saved payloads tested with mocked persistence and blocked external network calls.
- Thai and English mobile screenshots visually reviewed.
- Separate conversion-tracking work must be integrated and the combined build/tests rerun before release.

The site remains a static snapshot of the approved sheet. Later sheet edits require an explicit source sync and regression check; this patch does not create a live spreadsheet integration.
