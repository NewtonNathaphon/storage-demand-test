# StorageBuddy — end-of-night handoff

Current working brand (2026-09-11): StorageBuddy / สตอเรจบดด. Newton resumed and requested all branding updated. This supersedes earlier SpaceBuddy/GetStorage naming preferences and the September 8 pause for this branding task. The existing address and hosting project remain getstorage.pages.dev / getstorage. No domain purchase is included. The expanded MVP remains unbuilt.


## Historical September 7-8 checkpoint (brand decisions superseded above)

Checkpoint: 2026-09-08, Asia/Bangkok.

## Latest instruction from Newton

Newton is tired and explicitly said not to build tonight. Save the full handoff and stop. No expanded MVP coding, migrations, domain purchases or rebranding are authorized as part of this checkpoint. On a later request to resume, read this handoff and inspect existing work before proposing the first implementation step.

## Read first

1. This file: session outcome, current state and next steps.
2. PROJECT_HANDOFF.md: the complete structured business/technical requirements, field lists, statuses, routes, security requirements, priorities and acceptance criteria.
3. SETUP_STATUS.md: verified launch and retirement evidence.
4. SETUP.md: operating/deployment instructions.
5. FUTURE.md: deferred features and scope boundary.
6. BUSINESS_THESIS.md: Newton's locked thesis to test, commercial model, supplied precedents, illustrative economics, failure conditions and evidence gates. Research claims are not independently verified; scenarios are not forecasts.

Repository: C:\Users\User\storage-demand-test

GitHub: NewtonNathaphon/storage-demand-test, branch main.

Related repository instructions: C:\Users\User\newton-life-os\AGENTS.md, root CLAUDE.md, .claude\mistakes.md and relevant domain CLAUDE.md. Flowcraft retirement context is in newton-life-os\flowcraft\CLAUDE.md. Do not scan the entire PC looking for these known projects.

## What exists and works now

- Public website: https://getstorage.pages.dev — still branded GetStorage, preserving Claude's existing design.
- Hosting: Cloudflare Pages project getstorage, GitHub main integration, build command node build.cjs, output public.
- Current code: static HTML/CSS/vanilla JavaScript; index.html, robots.txt, sitemap.xml. build.cjs publishes only those assets. Internal documentation and SQL must stay unpublished.
- Backend: existing Supabase project tmynmthxjcrnnukmpyox, renamed storage from Flowcraft. No new database instance was created.
- Saved leads: https://supabase.com/dashboard/project/tmynmthxjcrnnukmpyox/editor/18424?schema=public
- Current tables: public.leads and public.events. Launch handoff records RLS enabled, anonymous insert-only access and denied anonymous reads.
- On 2026-09-07 a browser submission saved successfully and was independently confirmed in Supabase as lead ID 3. IDs 1–3 are synthetic setup leads. Exclude sources setup_test_20260907 and setup_test_live_20260907 from business reporting.
- Launch verification checked that failed saves preserve form values and allow retry; success requires a saved lead. The September 8 session rechecked website HTTP 200, not a new end-to-end form submission.
- The website is remotely hosted and does not need Newton's computer running.
- The expanded SpaceBuddy MVP is NOT built. There is not yet a newly implemented authenticated admin dashboard, supply intake, private photo workflow, size-review workflow or location intelligence dashboard from this new brief. Use Supabase for existing saved leads; the website's ?admin=1 view is only a session tally.

## Flowcraft retirement — complete for the old Cloudflare app

- Original records and application source were archived before retirement.
- Private searchable archive: C:\Users\User\Business Archives\Flowcraft\2026-09-07\OPEN_FLOWCRAFT_ARCHIVE.html
- Backup folder: C:\Users\User\Business Archives\Flowcraft\2026-09-07\
- ZIP: C:\Users\User\Business Archives\Flowcraft\Flowcraft-2026-09-07.zip
- Records include 17 contacts, 33 customers/companies, 11 deals, 3 deal actions, 51 private pipeline targets, 4 products, 4 suppliers and 13 quote-log entries. Other exported business tables were empty. The archive includes original JSON/CSV exports, schema metadata and application source.
- September 8 integrity check: all 26 record/schema files covered by manifest.json match recorded SHA-256 hashes; ZIP opens with 52 entries. This is an integrity check, not a tested full disaster-recovery restore.
- The folder and ZIP share this PC's disk. Original rows also remain in the locked flowcraft_archive schema of the reused Supabase project, providing an additional preserved copy. Do not delete this archive.
- Old public/private database table paths no longer expose the original Flowcraft records. Archive files may contain personal/business information and legacy credentials: never publish or commit them.
- September 7: retired active Flowcraft routes to HTTP 410 and removed CRM source from the active checkout, commit b3aebe7 in newton-life-os.
- September 8: completed previously approved permanent Cloudflare Pages deletion. Started with 271 deployments, deleted 192 historical deployments individually, then deleted project flowcraft and its remaining 79 deployments. API confirmed success; account project list no longer contained flowcraft.
- Post-deletion checks: flowcraft-evz.pages.dev and sampled historical host 8e3a2fc6.flowcraft-evz.pages.dev no longer resolved in DNS. GetStorage still returned HTTP 200.
- This was retirement of the old Cloudflare app and deployment history. It was not deletion of all Flowcraft email, Google Drive/Sheets, accounting services or every other business account.
- CCAQR code/data and recovery project were not modified. Shared Anthropic credentials were not revoked.
- Earlier documents inside the historical archive may still say deletion or GetStorage launch is pending. They are historical snapshots; this handoff and SETUP_STATUS.md contain the newer state.

## New business direction

Latest addition: Newton explicitly wants to lock the thesis for testing. BUSINESS_THESIS.md preserves the September 8 commercial rationale and financial scenarios. This strengthens the business brief without expanding the software build or lifting tonight's pause. The evidence gates are Node #1 economics without Newton's daily presence, Node #2 replication, then viable landlord-funded management/JV arrangements. Referral fees are supplementary; controlled operations and later managed/JV sites are the core economic thesis.

Build a demand-led storage operating network in Thailand. Capture real local storage demand first, identify catchments and customer needs, find/control appropriate supply, evaluate economics, design and operate storage, then learn from recurring revenue, occupancy, pricing and retention.

The goal is to learn where Node #1 belongs and prove its economics. Tha Phra is Candidate Site A, not the assumed first branch. The planned Sunday measurement visit is supply research; no exact calendar date was established. Do not privilege Tha Phra in reporting simply because a cheap building was found there.

Long-term operating models:
- CONTROLLED: lease/control and operate space.
- MANAGED/JV: owner supplies property/capital, company supplies demand, design and operation.
- PARTNER: refer demand to existing operators where own coverage is absent.

The website first needs to collect structured renter demand and landlord/property supply. Operations can be manual. Do not turn the long-term vision into a marketplace build.

## Brand and domain decisions

- SpaceBuddy is Newton's preferred working candidate. He likes its ability to include car parking later, inspired by his wife's family's PowerBuddy EV-station name.
- StorageBuddy was discussed; SpaceBuddy feels broader for future storage/parking services. Neither is registered or cleared in this session.
- SpaceBuddy domain availability and existing-brand/trademark conflicts have NOT been checked. No claim of uniqueness or clearance has been made.
- Parking is future context only. Do not build parking inventory, booking, payments or access management in the current storage MVP.
- getstorage.com is not owned by Newton; Cloudflare lists it as unavailable. It points to Afternic nameservers.
- getstoragespace.com was also unavailable.
- getstoragebkk.com was available at the time but rejected because the company may expand beyond Bangkok.
- getstoragehub.com was available at USD 10.46/year with the same displayed renewal price; it was a suggestion, not a selected or purchased name.
- No replacement domain was purchased or connected. The live name, canonical URLs and sitemap still use getstorage.pages.dev.
- Recheck availability and price before any future purchase. A brand choice does not authorize payment.

## MVP to build later

Three entry paths, Thai-first with English available, mobile-first, clean and trustworthy step forms:

1. Find Storage: location, items/quantity, optional photos/known size, budget, duration, move-in timing, climate/access/moving preferences, contact and attribution.
2. Help Me Choose Size: private belongings photos and descriptions; human review first; distinguish AI estimates, human-confirmed size and actual rented size. Future vision-provider interface returns ranges, confidence and questions, not false precision.
3. I Have Space: property location, type, sqm/dimensions, access/loading/parking/lift/security/restrictions, rent and partnership preference, contact and private photos/video/floorplan. All-Thailand intake is permitted; nationwide operations are not part of MVP. Future-market enquiries remain quiet.

Relational backbone: demand_leads, demand_photos, size_estimates, supply_leads, properties, storage_sites, units scaffold and lead_activity. Full fields and statuses are in PROJECT_HANDOFF.md. Preserve current leads and events through versioned additive migrations. Keep property candidates separate from operating sites.

Admin: authenticated lead management, activity log, manual qualification/status/follow-up, photo/size review, supply review, geographic demand comparisons and lightweight manual matching. Demand by Area must compare leads, qualified leads, desired size, budget and reservation/conversion stages. Unknown values are not zeros; intent is not a paid reservation. Campaign spend is needed to calculate CAC.

Privacy: private storage, signed URLs, consent, admin deletion and retention handling, server-side authorization/RLS, no public contact data, no base64 photos in frequently fetched lead rows, no secrets in frontend or documentation.

Routes: /, /find-storage, /size-help, /have-space, /how-it-works, /privacy, /terms, /admin; reusable /storage/[location-slug] experiments. No fake operational locations or dozens of filler pages.

Analytics: track form starts and persisted submissions, photo uploads, LINE/phone and reservation-intent clicks; retain attribution to leads. Simple first-party or GA4-compatible analytics with future Meta/Google hooks. Do not invent tracking IDs or send private home photos/contact details to analytics.

## Implementation order and boundaries

P0: database/auth/storage + Find Storage + secure admin lead table + analytics.

P1: private photo/size-help workflow + Have Space + area-demand dashboard.

P2: reusable location landing pages + simple map + AI provider abstraction.

Beyond P2 requires explicit approval. No native app, full marketplace, booking engine, mover operation, host payouts, insurance product, custom AI training, automatic underwriting, full operator portal, SaaS or investor pages. See FUTURE.md.

The pasted fresh-start stack suggestion was Next.js/TypeScript/Tailwind/Supabase/Vercel. It is not a decision to abandon the existing static Cloudflare/Supabase project. Inspect it and compare practical extension versus migration before changing architecture. Keep Claude's sensible design work; branding can remain a placeholder.

Stop after the ten MVP outcomes work reliably: catchment traffic, structured demand, safe photos, manual/AI-assisted size review, every lead visible in admin, geographic aggregation, source attribution, contact/qualification/status recording, structured supply intake and cross-area comparison. Test successful and failed submissions, persistence, admin updates and unauthorized access before declaring completion. Then launch the experiment instead of adding features.

## Resume sequence

When Newton returns and explicitly asks to resume:
1. Read these files, check repository status and inspect the current form, build and schema. Do not ask him to repeat the full idea.
2. If naming is the next requested task, check SpaceBuddy domains and brand conflicts and present concrete options before a purchase or rebrand.
3. If product work is requested, present a short recommended implementation approach grounded in the current repository, plus meaningful stack trade-offs. Do not start by rebuilding from scratch or provisioning another database.
4. Begin only the agreed P0 work, preserve current production records and archived Flowcraft data, and document migrations/rollback and qualification/metric assumptions.
5. Keep Newton updated in plain English; use sensible defaults and ask only decisions that materially affect the business or authorization.

No next-step execution is required tonight. This checkpoint is documentation only.

## Saved history

- storage-demand-test 13c0e5e: completed Flowcraft retirement and domain choices.
- newton-life-os 69b84f0: completed Flowcraft hosting deletion recorded.
- storage-demand-test 059a6c5: SpaceBuddy vision, detailed PROJECT_HANDOFF.md and FUTURE.md saved.
- This end-of-night checkpoint adds RESUME_HERE.md and links it from README/status; its commit follows those entries.

## Copy/paste for the next chat

Read C:\Users\User\storage-demand-test\RESUME_HERE.md, then BUSINESS_THESIS.md, PROJECT_HANDOFF.md, SETUP_STATUS.md, SETUP.md and FUTURE.md. We paused on September 8 after saving the SpaceBuddy vision and locked business thesis to test; the expanded MVP has not been built. GetStorage is live; old Flowcraft Cloudflare hosting is deleted and its data is archived. SpaceBuddy is the preferred working name with parking as future scope. Resume by checking current state and proposing the next narrow step; do not assume Tha Phra is Node #1 or rebuild from scratch. Treat the thesis research claims as awaiting primary-source verification and the financial examples as scenarios, not forecasts.
