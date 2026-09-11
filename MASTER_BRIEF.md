# StorageBuddy master project brief

Current source of truth: 11 September 2026. This project thread is the main StorageBuddy thread.

This document records Newton's September 11 brief and reconciles it with the supplied research. It supersedes earlier location-search, micro-node and marketplace/supply-intake priorities in this repository. Older research remains evidence and history, not current instructions.

## Objective and decisions

Underwrite and launch StorageBuddy at the wife/family Rama 3 building correctly. Build a professional, value-oriented self-storage business earning recurring monthly rent, with operations that can function if Newton is away for 30 days.

- Brand: **StorageBuddy / สตอเรจบดด**, using Newton's exact supplied spelling.
- Active Site #1: wife/family Rama 3 building. Other property hunting and new business brainstorming are paused unless this site fails underwriting.
- Core product hypothesis: **2–5 sqm** rooms, with some larger units. The pasted summary lost range punctuation; the September 10 note and Playbook Dashboard A5 explicitly establish 2–5 sqm, not 25 sqm.
- Positioning: professional, trustworthy and good value. Functional modular steel partitions, with investment in dryness, cleanliness, lighting, security, loading, carts, access and support.
- Plan all six floors, fit out fewer floors first, expand according to actual occupancy and economics. Floors **1–2** are the provisional Phase 1 recommendation, subject to measurements and feasibility.
- Moving is a potential partner/add-on service. No owned logistics fleet or fulfillment operation.
- The website sells StorageBuddy and captures demand intelligence for this facility. It is not a separate startup.
- Existing static HTML/CSS/vanilla JS, Cloudflare Pages and Supabase remain the implementation basis. Preserve existing data, working design and the locked Flowcraft archive.

## Source order and review

1. Newton's September 11 Master Project Brief in the current conversation: newest business decisions, including Rama 3 priority and three rent cases.
2. `E:\Newton's files\Work - Property\Storage\storagebuddy III\Storage_Thesis_Rama3_Website_Next_Steps_2026-09-10.md`: newer LEO visit, building assumptions and website reasoning. Its multi-area testing and site-selection objectives are superseded by item 1.
3. Same folder, `Micro_Self_Storage_Research_Master_v9.xlsx`: 13 worksheets, reviewed read-only. Detailed calls/visits, benchmarks, candidate building and old financial model.
4. Same folder, `Micro_Self_Storage_Final_Competitor_and_Site1_Playbook_v5.xlsx`: 12 worksheets, reviewed read-only. Competitors, demand evidence, RFQ and historical site-search work.
5. Older repository handoffs: technical detail remains useful when consistent with this brief.

The original workbooks and source note were not edited. Review covers populated research records, sheet structure and relevant financial formulas/cached values, not a full spreadsheet recalculation or independent re-verification of historical fieldwork. No new general competitor research is needed for this handoff.

## Building facts and unknowns

| Item | Working input |
|---|---|
| Property | Rama 3 family/wife commercial/garment/office/stock building |
| Location recorded in Master v9 | Charoen Rat 7 / Bang Khlo, Candidate_Sites row 2; confirm public map pin before publishing |
| Footprint | Approximately 12 m × 30 m |
| Floors | 6 |
| Total usable area | Approximately 1,500 sqm, user estimate |
| Existing infrastructure | CCTV, fire systems, loading/forecourt reported |
| Lift | Approximately 2 m × 2 m, budget estimate THB 700,000–1,000,000 |
| Whole-building rent cases | Best THB 100,000 / Mid THB 150,000 / Worst THB 200,000 per month |

The dimensions do not constitute a measured floor plan: 12 × 30 × 6 = 2,160 sqm nominal footprint area, while usable area is reported as 1,500 sqm. Keep these distinct until actual plans establish exclusions, stairs, shafts, voids, current uses and usable area by floor. Do not assume identical 250 sqm floors are measured facts.

Existing fire equipment does not establish suitability for the new use. Floor loading, lift route/specification, fire/egress, permitted use, electrical supply, moisture/flood history and accessible loading remain technical checks. Family control does not establish agreed lease terms or zero property cost.

## Evidence that informs the product

- **NKP:** Master v9 Calls_Visits row 5, Unit_Benchmark row 3 and Playbook Demand_Evidence row 2 record 4 sqm rooms full on the August 30 visit. Prices recorded were 3 sqm THB 2,000; 4 sqm THB 2,500; 8 sqm THB 4,500. Owned property and rough visually estimated room counts prevent treating this as audited revenue or a transferable leased-site margin. The earlier ambiguous 2+ sqm call report was superseded by the 4 sqm visit finding. No confirmation that 8 sqm rooms were full.
- **i-Store Sathorn:** Master v9 Unit_Benchmark rows 6–8 and Calls_Visits row 3 record fan 2.25 sqm at THB 3,500 (~15 full), 3 sqm at THB 4,500 (7 full), and 4.5 sqm at THB 5,800 (7 of 9 occupied). Ground-floor convenience, price, climate and supply depth are confounded. This supports testing a good non-AC product, not claiming climate control never matters.
- **LEO Rama 3:** September 10 source note records conventional 2–5 sqm rooms unavailable, tall 1 sqm also reported full, and next conventional room about 6 sqm at THB 6,500. The workbooks mainly retain the earlier website-availability evidence; do not misattribute the newer visit detail to those rows.
- Competitor observations are historical snapshots. Newton regards general demand as proven enough to move forward with site underwriting. StorageBuddy-specific achievable prices, unit mix, lease-up, retention and acquisition cost remain to be measured.
- Master v9 `Demand_Interviews` contains only headers. Competitor research is not a set of completed StorageBuddy customer interviews or paid reservations.
- Raw-room substitutes, transient lockers, moving/valet models and hospitality comparables remain references. They do not establish conventional monthly-storage occupancy or economics.

## Website concept and customer experience

The customer should quickly understand: StorageBuddy offers professional, value-oriented self-storage in Rama 3, helps choose the right space and provides a straightforward way to enquire.

Primary journey:

1. Understand the Rama 3 location, intended service and current opening stage.
2. Choose a known size or ask for help based on items, quantity, dimensions and optional private photos.
3. See an indicative or confirmed price clearly labeled according to actual pricing status.
4. Provide move-in timing, expected duration and contact details to request availability/a quote or express pre-opening interest.
5. Staff follow up, recommend a size, quote and record acceptance/rejection and eventual rental.

Thai-first with English available, mobile-first, clean and trustworthy. Use real building imagery and verified access/loading details when available. Explain practical value rather than presenting the building's private feasibility calculations to customers.

Public launch-stage claims must match reality: the building is the active development site, not an already operating storage facility. Opening date, live inventory, contracted prices, customer testimonials, 24/7 access and paid reservation capability are not established merely by this brief. Until confirmed, use an enquiry/pre-opening interest journey. An intent click is not a reservation or revenue.

### Priority features

- Rama 3-focused homepage with benefits, size guidance, location/loading information, FAQs and enquiry/contact action.
- Find Storage enquiry collecting area/postcode, items/quantity, requested size, budget, move-in timing/precision, duration, climate/access needs and optional moving help.
- Help Me Choose Size with private photo handling and human review. Existing AI can later provide ranges, confidence and questions. Keep AI estimate, human recommendation and actual rented size separate.
- Secure admin with all historical and new leads, source attribution, quote history, accepted/rejected quotes and reasons, contact/status/follow-up history and actual rental outcomes.
- Useful reporting: lead quality, customer catchment/travel fit, size demand, price acceptance, move-in timing, duration and campaign performance for Rama 3.
- Track cost per qualified lead separately from customer acquisition cost. CAC requires actual customers and matching spend, not just enquiries. Expected duration is not realized lifetime value.
- Eventually connect customer/unit records, contracts, billing, payment status and access with support/maintenance procedures to support the 30-day absence test. That operational target does not authorize building a custom payment or access platform now.

### Deferred under this pivot

Have Space / landlord acquisition / property-owner JV platform, broad supply matching, multi-location demand competitions and new property-search dashboards are no longer launch priorities. Keep historical supply research privately. Record a customer's home area to understand Rama 3 demand without implying another branch is being built.

No native app, peer-to-peer or national marketplace, host payouts, logistics fleet, warehouse SaaS, complex dynamic pricing or fundraising platform. Reopen other property searches only if Rama 3 fails underwriting.

## Current website gap (source inspected September 11)

The StorageBuddy name is deployed, but `index.html` still implements the old four-area experiment:

- Step 1 asks users to select Tha Phra, Rama 3, Pinklao or ICONSIAM.
- Hero/social copy, FAQ, success screen and footer say the location with most interest will open first.
- The price ladder is THB 1,500 / 2,300 / 3,000 / 3,600 for 2/3/4/5 sqm, with equal-pricing-across-branches wording. These are legacy test prices, not an approved Rama 3 tariff.
- The form captures basic selection/contact information, not the full revised demand/quote journey.
- Public `?admin=1` is a session tally, not authenticated administration.

Next implementation should adapt those sections and their metadata/structured data consistently while preserving stored leads and events. Business terms and numerical prices need explicit decisions rather than silently copying competitor rates. This review changes internal context only; it does not deploy a new customer flow.

## Feasibility V1 brief

The next dedicated model is **StorageBuddy Rama 3 Feasibility V1**, with side-by-side whole-building rent cases of **THB 100k / 150k / 200k monthly**. Rent case selection must remain separate from assumed rent concessions or floor phasing.

Required inputs/builds: measured six-floor layout, activated floors and timing, room mix and usable-to-rentable reconciliation, price ladder, discounts, occupied units/sqm, month-by-month move-ins and move-outs, lift/partition/access/fire/electrical/ventilation capex, contingencies, deposits, fit-out period, rent commencement/escalation, replacement labour and other operating expenses, marketing/spend and collections. Outputs: monthly P&L, cash requirement including lease-up losses, break-even occupancy, cumulative cash payback and full-building sensitivity. Do not treat refundable deposits as rental revenue.

| Planning sensitivity | Calculation | Gross monthly revenue |
|---|---|---:|
| Phase 1 low | 325 rentable sqm × THB 850 × 80% | THB 221,000 |
| Phase 1 high | 375 rentable sqm × THB 1,050 × 80% | THB 315,000 |
| Full building conservative | 1,050 × THB 850 × 70% | THB 624,750 |
| Full building base | 1,125 × THB 950 × 80% | THB 855,000 |
| Full building strong | 1,200 × THB 1,050 × 85% | THB 1,071,000 |

Arithmetic checked; these are sensitivities, not forecasts or net profit. Phase 1 assumes 500 usable sqm and 65–75% efficiency. The full-building table instead implies 70–80% of 1,500 sqm. Reconcile different efficiency assumptions in the measured model rather than silently applying them as one layout.

The old Master v9 `Underwrite` uses 150 gross sqm and THB 30k rent. Its total-project-cash formula sums fit-out items plus contingency, not a complete month-by-month funding requirement. Its simple payback divides that sum by stabilized monthly contribution; it does not include the elapsed lease-up path. Blank candidate assumptions can also yield zeros in cached outputs. Do not reuse these results as Rama 3 feasibility conclusions.

The old THB 1.2m target / THB 1.5m ceiling belonged to the micro-node model and is not the current Rama 3 total-project cap. No replacement spending budget is approved. Preserve protected family/personal/business reserves, staged commitment and recoverable fit-out philosophy. No new debt or funding authorization is implied by the pivot. Keep personal financial figures in the private source workbook, out of public website assets.

## Immediate next work

Align the website implementation plan with the Rama 3 customer journey. In parallel at the business level, obtain actual floor measurements, written lift/fit-out inputs and rent terms for Feasibility V1. General competitor hunting and other property searches remain paused.

The outcome to earn is profitable occupied rooms, reliable collection and operations that do not depend on Newton's daily presence.
