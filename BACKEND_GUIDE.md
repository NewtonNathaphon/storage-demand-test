# StorageBuddy backend guide

## View customer registrations

Open https://storagebuddyth.com/backoffice and sign in with the existing CCAQR owner account. Only active owners can access customer records. Refresh to load new submissions. Use search, the type filter and View & follow up to see details, record notes/status and set a follow-up date. CSV export includes the filtered records, email, customer type and company. Marked test records are hidden by default; enable Include tests to see acceptance tests.

## Where data is saved

Supabase project: tmynmthxjcrnnukmpyox. In the Supabase dashboard, choose this project, then Table Editor.

- public.leads: submitted contact forms. Name, phone, size, purpose (segment), requested timing (when_needed), source and timestamp are columns.
- leads.customer_use: JSON text holding email, customer_type, company_name, items, customer_area (requested service location), duration, moving_help, requested_sqm/custom dimensions, offer, consent timestamp and other preferences. kind=presale_signup identifies registrations; kind=size_help_signup identifies the size-helper gate. Historical fields are retained in old records.
- public.events: page activity and CTA events, including clicks on the success-screen LINE link. A click does not prove the person added the account or sent a message.
- public.lead_followups: owner notes, status and follow-up dates.

Public pages can insert records but cannot read the customer list. The owner backoffice calls functions/api/backoffice.js, which verifies an active owner and accesses Supabase with a server-side secret. Never place that secret in frontend code.

## Website and size helper

GitHub repository: NewtonNathaphon/storage-demand-test. Main branch deploys through Cloudflare Pages to storagebuddyth.com. index.html contains the public form and insert logic; assets/backoffice.js is the owner UI. build.cjs publishes only explicitly allowed website assets. This guide is not published.

functions/api/estimate.js handles size recommendations. Photo data is used for estimation, not stored in lead records. The free-use/signup gate is remembered in localStorage on that browser; it is not verified customer authentication and can be bypassed by clearing browser storage. Existing server rate limiting is separate.

## After registration

The thank-you screen appears only after Supabase accepts the insert. It links to https://line.me/R/ti/p/%40storagebuddy and displays assets/line_official.jpg. No customer LINE ID is requested in the form.

Email/LINE onboarding delivery is NOT automated. Staff must follow up from the backoffice and LINE Official Account. No payment processor or actual deposit collection is connected. The current registration records interest and offer preference, not a paid reservation.

## September 13 checks

Responsive TH/EN and both-offer submission/failure tests passed. Custom sqm still carries through to registration. A real marked TEST ONLY REFINED FORM submission returned HTTP 201 with the new fields; source setup_test_refined_form_20260913. No email or LINE message was sent by the tests.
