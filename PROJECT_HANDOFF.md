# StorageBuddy working direction — project handoff

> Current direction: read [MASTER_BRIEF.md](MASTER_BRIEF.md) first. Newton's September 11 Rama 3 building brief supersedes older site-search, rent-case and software-scope decisions below. Other property hunting and public landlord/JV intake are deferred. This file retains earlier context and compatible technical details.


Current working brand (2026-09-11): StorageBuddy / สตอเรจบดด. Newton resumed and requested all branding updated. This supersedes earlier SpaceBuddy/GetStorage naming preferences and the September 8 pause for this branding task. The existing address and hosting project remain getstorage.pages.dev / getstorage. No domain purchase is included. The expanded MVP remains unbuilt.


Saved from Newton's full business and technical handoff on 2026-09-08. This is the requested direction, not a claim that these features are already implemented. See SETUP_STATUS.md for verified production state.

## Brand and purpose

- StorageBuddy is Newton's selected working brand. It accommodates storage and potentially car parking. No final brand, domain purchase, domain availability check, or trademark clearance has been completed for this name.
- StorageBuddy uses the existing https://getstorage.pages.dev address.
- Build a demand-led storage operating network in Thailand: capture demand, understand local needs, find/control suitable supply, design and price storage, acquire customers, operate professionally, collect recurring revenue, and learn from occupancy/pricing/retention.
- North Star: turn underused physical space into recurring income by matching real local storage demand with the right property and operating suitable locations efficiently.
- Parking is possible future business context, not an instruction to implement parking inventory, payments, permits, or booking now.
- The current mission is to find where Node #1 should be and prove its economics. Tha Phra is only Candidate Site A. Measure it on the planned Sunday visit as supply research; do not hard-code it as Node #1 or bias demand reporting toward it. The exact visit date is not established here.
- Demand should determine where property hunting happens. Compare qualified demand, required size, budget, duration, urgency, moving needs and acquisition cost with usable space, rent and property economics. Low rent alone is not site validation.
- Future models: CONTROLLED (lease/control and operate), MANAGED/JV (owner supplies property/capital; company provides feasibility, design, demand and operations), PARTNER (refer customers to existing operators where own supply is absent).
- Long-term value is expected from recurring customer revenue, leases/control rights, management/JV contracts, local supply relationships, demand/operating data, brand and a repeatable opening/filling process. Neither valuation nor commercial success is assumed. AI is a supporting tool, not the business thesis.

## Scope and operating principle

BIG VISION, SMALL BUILD. Build the minimum production-ready backbone that captures real renter and property-owner evidence and lets a small team handle leads manually.

Newton's scope rule: if work does not help get a renter lead, understand a location, understand a property owner, or operate those leads in the near-term experiment, stop and put it in FUTURE.md. The pasted handoff says “68 weeks”; this likely means “6–8 weeks” but has not been explicitly confirmed. Do not invent a firm deadline from the typo. The demand comparison example likewise says “48 weeks”; treat the numbers as illustrative, not a forecast or actual data.

Use sensible, documented MVP defaults; do not ask Newton dozens of product questions. Inspect and reuse the existing repository before coding. Discuss the implementation approach before building; saving this handoff does not by itself initiate a rewrite or schema migration.

## Public experience

Thai-first with English available. Mobile-first, clean, modern and trustworthy: simple property utility/service platform, not neon, luxury imitation or cartoon styling. Use a replaceable placeholder brand. Communicate the current proposition in five seconds: need space, get help finding suitable storage; have unused space, request a partnership/feasibility evaluation.

Use easy progress-step forms, not one giant form. Three entry paths:

### Find Storage — primary

Collect location/address/neighborhood; district/province; postal code where available; latitude/longitude if obtainable; items; quantity; preferred sqm if known; duration; desired move-in date/month; monthly budget; AC/non-AC/no preference; access frequency; moving/pickup help yes/no/maybe; name/contact; phone; LINE; optional email; optional photos; automatic source/UTM/referrer attribution. Submission creates a Demand Lead.

Accept demand outside the original four test areas. Never imply an operational facility exists merely because a location landing page exists.

### Help Me Choose Size

Collect several optional belongings photos, object description, optional rough dimensions/quantity, location and duration, with contact details to follow up. Start with human review.

Provide an AI-service abstraction later that returns an estimated sqm range, suggested unit size, confidence, short reasoning and clarification questions. Never present an exact area inferred from photos as fact. AI results remain labeled estimates until human review. Preserve private original uploads, AI estimates, human-confirmed estimates and eventually actual rented size as distinct information.

### I Have Space

Property partnership/feasibility enquiry, not public marketplace self-listing. Accept submissions from all Thailand without building nationwide operations.

Collect owner/contact name; phone/LINE/email; exact or general location; province/district; coordinates if available; property type (shophouse, commercial building, warehouse, unused floor, office, existing storage facility, other); gross sqm; dimensions; floor; ceiling height; vehicle/loading access; parking; lift/freight lift; security/CCTV; access/operating restrictions; current use; requested lease rent; openness to fixed rent/revenue share/management or JV/not sure; photos/videos/floorplan; notes.

Create a Supply Lead. Admin tags: ACTIVE MARKET, FUTURE MARKET, REJECT, INVESTIGATE. Future-market leads remain quiet without unnecessary notifications. Keep geographic market tagging distinct from the lead's progression status where practical.

## Relational data requirements

Prefer the existing Supabase/Postgres project. Do not turn everything into one giant lead table. Use versioned additive migrations and preserve existing leads/events and the locked Flowcraft archive. Production and development/seed data must remain separate.

### demand_leads

id, created_at, status, full_name, phone, line_id, email, raw_location_text, district, province, postal_code, latitude, longitude, desired_move_in_date, duration_months, budget_min, budget_max, known_size_sqm, recommended_size_min_sqm, recommended_size_max_sqm, confirmed_size_sqm, storage_items_text, climate_preference, access_frequency, moving_help, source, campaign, utm_source, utm_medium, utm_campaign, referrer, assigned_to, notes. Also retain quantity and date/month precision from the form rather than fabricating exact input.

Statuses: NEW, CONTACTED, QUALIFIED, QUOTED, RESERVATION_INTENT, RESERVED, CONVERTED, LOST, INVALID. A click expressing intent is not a paid reservation or conversion.

### demand_photos

demand_lead_id, private storage path, uploaded_at, consent flags. Files live in private object storage, not base64 blobs inside lead rows. Preserve originals privately; lightweight previews may be separate derivatives.

### size_estimates

demand_lead_id, source AI/HUMAN, min_sqm, max_sqm, recommended_sqm, confidence, explanation, reviewed_by, created_at. Keep estimate history and review provenance. Retain clarification questions and eventual actual rented size without overwriting source estimates.

### supply_leads

Relational structure covering the Have Space fields and private media references. Statuses: NEW, SCREENING, VISIT_REQUIRED, UNDERWRITING, LEASE_CANDIDATE, MANAGEMENT_CANDIDATE, PARTNER_CANDIDATE, FUTURE_MARKET, REJECTED.

### properties

Minimal scaffold so a qualified supply lead can later become a property; avoid speculative population.

### storage_sites

property_id, ownership_model CONTROLLED/MANAGED/PARTNER, brand, site status, rentable sqm, service area/catchment. Separate a candidate property from an actual operating facility.

### units

Scaffold only: site_id, size_sqm, unit_type, monthly_price, availability. No live booking functionality yet.

### lead_activity

Log each contact, follow-up and status change with lead reference, actor and time. Preserve operational history rather than merely overwriting status.

## Secure admin and research views

Secure authenticated admin with server-side authorization/RLS. Public visitors cannot read contacts, photos or internal notes.

- Demand table and detail workflow: every lead, assignment, contact notes, qualification and status updates, follow-ups and estimate review.
- Summaries: total/qualified leads; district/province; requested sqm; budget; duration; moving-help percentage; source/campaign; conversion stage.
- Demand by Area: District | Leads | Qualified | Average desired sqm | Median budget | Reservations/Conversions. Do not silently treat unknown size/budget as zero. Document metric and qualification/scoring definitions. Do not invent scoring weights as validated economics.
- Basic points/clusters map if practical, secondary to a useful grouped table.
- Supply table: location, sqm, property type, asking rent, partnership preference, status and market tags.
- Lightweight matching: for a demand lead, show potentially relevant known supply/sites in roughly the same geography; manual assessment initially, no complex algorithm.
- CAC requires campaign spend as well as attributable leads/conversions; do not claim that event tracking alone measures it. Choose a simple documented spend input if needed, not a large ad-platform integration.

## Routes and experiments

Build /, /find-storage, /size-help, /have-space, /how-it-works, /privacy, /terms, /admin.

Future-ready /storage/[location-slug] route, for example tha-phra, rama-3, bang-khae. No dozens of fake location pages.

Reusable location landing templates/configuration: location name, headline, target starting price, example unit sizes, value proposition, CTA, campaign ID. Distinguish target/test prices from real available inventory. Compare location, demand, size and price, not click-through alone.

## Analytics

Instrument homepage viewed; find-storage started/submitted; size-help started/submitted; photos uploaded; have-space started/submitted; LINE clicked; phone clicked; reservation-intent clicked. Persist attribution to the lead. Submission success requires a persisted lead.

GA4 or another simple analytics layer; leave clear integration points for Meta/Google conversion tracking. No invented tracking IDs or exaggerated conversion events. Keep contact details and home photos out of third-party analytics.

## Privacy/security

Private object-storage bucket, signed URLs only, no public enumerable uploads. Explain photo purpose and collect consent; preserve consent metadata. Admin can delete photos. Provide reasonable documented retention/deletion handling. Authenticated administration, least-privilege access/RLS, server-only secrets and proper environment variables. Privacy/terms copy must reflect the actual service and actual processors; do not present draft legal copy as reviewed advice.

## Development priority and stop condition

P0: database/auth/storage, Find Storage form, admin lead table, analytics.

P1: private photo and human size-help workflow, Have Space form, area-demand dashboard.

P2: location landing system, simple map, AI provider abstraction. Activating an AI service is not necessary for the human-review MVP. Anything beyond P2 requires explicit approval.

MVP complete only when these work reliably:
1. Send Google/Meta traffic to a specific catchment.
2. Receive structured renter leads.
3. Receive renter photos safely.
4. Manually or with AI assistance estimate storage needs.
5. See every lead in admin.
6. See geographically grouped demand.
7. Track lead source.
8. Record qualification, contact and status.
9. Receive structured landlord supply leads.
10. Compare multiple test areas.

Then stop building features and launch the experiment. Verify full public submission → persistence → admin visibility and update paths, including failures and unauthorized access, before calling it production-ready.

## Stack and documentation expectations

The handoff suggests Next.js/TypeScript, Tailwind, Supabase and Vercel IF STARTING FRESH. This project already has static HTML/CSS/vanilla JS, Cloudflare Pages and Supabase. The suggestion is not a mandate to migrate or start over. Inspect current code, preserve sensible existing work and Claude's design, and present the trade-offs before changing architecture.

Keep external services modular, validate boundaries, use strong typing where appropriate, migrations, environment variables and no frontend secrets. README must cover architecture, setup, environment variables, migrations, deployment, demand metric/scoring definitions and intentional exclusions.

Current safety constraints: keep SQL/internal docs outside the public build; do not recreate/truncate existing tables; exclude synthetic setup leads from business reporting; do not touch CCAQR or delete Flowcraft archives. Existing production is a simple lead-capture site, not this completed MVP.
