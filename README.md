# storage-demand-test

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

Read `SETUP.md`.
