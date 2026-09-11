# StorageBuddy

## Current September 11 release

Primary public address: **https://storagebuddyth.com** (purchased by Newton September 11), connected to the existing Cloudflare Pages project. `getstorage.pages.dev` remains the platform address. The no-purchase and experimental-site descriptions below are historical.

**Right Space. Right Price. Right for You. / พื้นที่พอดี ราคาพอดี สำหรับคุณ**

Rama 3 is Site #1. The website now offers Thai/English advice-first pages, supplied brand illustrations, original animated room comparisons, camera/gallery inputs with transient AI sizing, detailed Rama 3 enquiries and separate other-area requests. No confirmed inventory, approved tariff, payments or automatic reservations. Staff review Supabase leads; notifications and custom authenticated admin remain unbuilt.

Read [OPERATIONS.md](OPERATIONS.md) for current configuration and follow-up, [VERIFICATION.md](VERIFICATION.md) for test/deployment evidence, and [ASSETS.md](ASSETS.md) for image provenance. Build: `node build.cjs`; tests: `node --test tests/estimate.test.mjs`. GitHub main remains connected to Cloudflare Pages. AI uses the server-only `ANTHROPIC_API_KEY` Pages secret and `functions/api/estimate.js`. Never place that secret in HTML or public assets.

The four-area experiment described below is historical and superseded by the Rama 3 release. Existing records remain preserved. Property hunting is paused; votes only inform possible future demand.

## Historical project overview

> Current direction: read [MASTER_BRIEF.md](MASTER_BRIEF.md) first. Newton's September 11 Rama 3 building brief supersedes older site-search, rent-case and software-scope decisions below. Other property hunting and public landlord/JV intake are deferred. This file retains earlier context and compatible technical details.


Current working brand (2026-09-11): StorageBuddy / สตอเรจบดด. Newton resumed and requested all branding updated. This supersedes earlier SpaceBuddy/GetStorage naming preferences and the September 8 pause for this branding task. The existing address and hosting project remain getstorage.pages.dev / getstorage. No domain purchase is included. The expanded MVP remains unbuilt.


Public landing page that measures real demand for self-storage across four
Bangkok areas: **Tha Phra, Rama 3, Pinklao, ICONSIAM**.

Same price band everywhere, so **area is the only variable**. Ads point one
campaign per area at this page; leads and click events land in Supabase; the
area that produces the most deposit-ready leads wins.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole site. Single file, no build step, no framework. |
| `SETUP.md` | Supabase SQL, key wiring, deploy steps, reporting queries. |
| `sitemap.xml`, `robots.txt` | SEO. |

## Stack

- Static HTML/CSS/JS, hosted on Cloudflare Pages (git-backed, auto-deploy on push)
- Supabase Postgres, written to directly from the browser via PostgREST + `fetch`
- Row Level Security: public may **insert only**; reads happen in the Supabase dashboard

## Start here

For the latest end-of-night checkpoint and next-chat instructions, read `RESUME_HERE.md` first. Newton paused building on 2026-09-08; the expanded MVP is documented but not implemented.

`BUSINESS_THESIS.md` preserves the commercial thesis to test, including economics scenarios, risks and expansion evidence gates. Its supplied research claims require verification before reliance.

Read `PROJECT_HANDOFF.md` for Newton's expanded business direction and MVP requirements, `SETUP_STATUS.md` for what is actually live, and `SETUP.md` for current operations. The existing four-area landing page described above is the current implementation, not the limit of the planned network. StorageBuddy is the preferred brand candidate under discussion; parking remains future scope. See `FUTURE.md` for exclusions.
