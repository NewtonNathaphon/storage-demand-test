# SETUP — storage demand test

Three things to do, in order. ~15 minutes total.

---

## 1. Create the Supabase project

1. https://supabase.com -> your account -> **New project**
2. Name: `storage-demand-test`
3. Region: **Southeast Asia (Singapore)** — closest to Thailand, fastest for users
4. Set a strong DB password, save it in your password manager
5. Wait ~2 minutes for it to provision

Then go to **Project Settings -> API** and copy TWO values:

| What | Looks like | Safe to make public? |
|---|---|---|
| Project URL | `https://abcdefgh.supabase.co` | yes |
| `anon` / `publishable` key | long string starting `eyJ...` or `sb_publishable_...` | **yes** |
| `service_role` key | long string | **NO — never put this anywhere** |

The anon key is *designed* to be in public frontend code. Row Level Security
(step 2) is what protects the data, not key secrecy.

---

## 2. Create the tables + lock them down

Supabase dashboard -> **SQL Editor** -> New query -> paste ALL of this -> Run.

```sql
-- LEADS: one row per form submission (the hard signal)
create table public.leads (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  area         text not null,            -- 'thapra' | 'rama3' | 'pinklao' | 'iconsiam'
  size         text not null,            -- '2sqm' | '3sqm' | '4sqm' | '5sqm'
  segment      text,                     -- 'residential' | 'business'
  customer_use text,                     -- free-form use case they picked
  lean         text,                     -- 'interested' | 'reserve' | 'deposit'
  lean_score   int,                      -- 1 | 2 | 3
  name         text not null,
  phone        text not null,
  when_needed  text,
  price_shown  int,
  utm_source   text,
  utm_area     text,
  user_agent   text
);

-- EVENTS: one row per meaningful interaction (the soft signal / funnel)
create table public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  session_id  text,
  event_type  text not null,             -- page_view | area_select | size_select |
                                         -- segment_select | use_select | lean_select |
                                         -- cta_click | form_start | submit_success
  area        text,
  detail      text,
  utm_source  text
);

-- Row Level Security ON = everything blocked by default
alter table public.leads  enable row level security;
alter table public.events enable row level security;

-- Public (anon key) may INSERT only. No select/update/delete policy exists,
-- so the public can never read, change, or wipe your data.
create policy "public can insert leads"
  on public.leads for insert to anon with check (true);

create policy "public can insert events"
  on public.events for insert to anon with check (true);

-- Helpful indexes for the reporting queries below
create index leads_area_idx  on public.leads (area);
create index events_area_idx on public.events (area, event_type);
```

**Verify:** dashboard -> Authentication -> Policies. You should see exactly ONE
insert policy on each table and NO select policy. That is correct.

---

## 3. Paste the keys

Open `index.html`, find the CONFIG block near the top (~line 120):

```js
const SUPABASE_URL      = "";
const SUPABASE_ANON_KEY = "";
```

Paste your two values between the quotes. That is the only wiring needed.

If they are empty, the page still works but shows a red warning and saves nothing.

---

## 4. Test it

Python is **not installed** on your machine (that `python` command is only a
Microsoft Store placeholder), so skip the local web server the original handoff
suggested. Test on the real deployed site instead — it is the environment that
actually matters, and Cloudflare Pages redeploys about a minute after every
push. So: do step 5 first, then come back here.

On the live URL:

1. Open it on your **phone**. This is a mobile ad campaign — test where the
   traffic will be.
2. Submit 2-3 test leads across different areas.
3. Supabase -> Table Editor -> `leads` and `events`. Your rows should be there.
4. Add `?admin=1` to the URL to see this session's own tally, broken down by area.
5. Try an ad-style URL: `?utm_source=fb&utm_area=rama3`. Rama 3 should already be
   selected when the page loads, and `utm_source` should appear on the saved row.

If nothing lands in Supabase, open the browser console. The page logs the exact
Supabase error there and still shows the user a success screen on purpose — a
backend problem must never cost you a lead.

Delete the test rows before running ads:

```sql
truncate public.leads;
truncate public.events;
```

---

## 5. Deploy on Cloudflare Pages

1. Cloudflare dashboard -> **Workers & Pages** -> Create -> **Pages** ->
   **Connect to Git**
2. Pick the `storage-demand-test` repo, branch `main`
3. Framework preset: **None**
4. Build command: **leave empty**
5. Build output directory: **`/`**  (the site is at the repo root — do NOT type
   the repo name here, that causes the doubled-path 404)
6. Save and Deploy

You get `https://storage-demand-test.pages.dev`. Every `git push` redeploys.

After the first deploy, replace `REPLACE-WITH-YOUR-DOMAIN` in `index.html`,
`sitemap.xml` and `robots.txt` with the real hostname (needed for correct SEO
canonical + Facebook share previews).

---

## 6. Ad URLs

```
https://storage-demand-test.pages.dev/?utm_source=fb&utm_area=thapra
https://storage-demand-test.pages.dev/?utm_source=fb&utm_area=rama3
https://storage-demand-test.pages.dev/?utm_source=fb&utm_area=pinklao
https://storage-demand-test.pages.dev/?utm_source=fb&utm_area=iconsiam
https://storage-demand-test.pages.dev/?utm_source=google&utm_area=thapra
```

`utm_area` also pre-selects that area on the page, so an ad-targeted visitor
starts one step ahead.

---

## 7. Reading the results (SQL editor)

```sql
-- deposit-ready leads by area  <- THE PRIMARY METRIC
select area, count(*) as deposit_ready
from public.leads where lean_score = 3
group by area order by deposit_ready desc;

-- leads by area and lean tier
select area, lean, count(*)
from public.leads group by area, lean order by area, lean;

-- qualified (reserve + deposit) by area
select area, count(*) as qualified
from public.leads where lean_score >= 2
group by area order by qualified desc;

-- residential vs business split by area  (>25% business = sticky signal)
select area, segment, count(*)
from public.leads group by area, segment order by area;

-- funnel: events by type and area
select area, event_type, count(*)
from public.events group by area, event_type order by area, event_type;

-- visitors vs leads (conversion) by area
select l.area,
       (select count(distinct session_id) from public.events e
         where e.event_type='page_view' and e.area = l.area) as visitors,
       count(*) as leads
from public.leads l group by l.area order by leads desc;

-- which ad source is working
select utm_source, utm_area, count(*) as leads
from public.leads group by utm_source, utm_area order by leads desc;
```

**Pass bar, pre-committed:** the winning area needs ~10-15 genuine
reserve/deposit leads before moving to lease negotiation.
ICONSIAM is the control and is expected to lose.
