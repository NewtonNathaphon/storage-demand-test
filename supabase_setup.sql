-- GetStorage: ALREADY APPLIED on 2026-09-07. Do not rerun on the current project.
-- Existing project tmynmthxjcrnnukmpyox (formerly Flowcraft) is now named storage.
-- Old Flowcraft tables are preserved in locked flowcraft_archive; see archive_flowcraft.sql.
-- This creates the tables expected by Claude's current frontend.
-- No existing data is deleted. Transaction rolls back on any error.
BEGIN;

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

-- Explicitly limit browser database privileges to inserts.
REVOKE ALL ON TABLE public.leads, public.events FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.leads, public.events TO anon;
GRANT USAGE ON SEQUENCE public.leads_id_seq, public.events_id_seq TO anon;

COMMIT;
