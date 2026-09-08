# GetStorage launch status - 2026-09-07

- LIVE: https://getstorage.pages.dev
- PAUSED FOR THE NIGHT 2026-09-08 at Newton's request. Full restart checkpoint: RESUME_HERE.md. Documentation saved only; do not start the expanded MVP until Newton returns and asks to resume.
- NEW DIRECTION SAVED 2026-09-08: PROJECT_HANDOFF.md records Newton's demand-led storage network vision, P0/P1/P2 requirements and MVP acceptance criteria. SpaceBuddy is the preferred brand candidate under discussion, with parking as possible future scope only. No rebrand, new MVP implementation, parking workflow or domain purchase has been performed. FUTURE.md records deferred scope.
- Backend: https://supabase.com/dashboard/project/tmynmthxjcrnnukmpyox/editor/18424?schema=public
- Existing Flowcraft Supabase project renamed storage and reused; no new database instance created.
- Cloudflare Pages getstorage deploys GitHub NewtonNathaphon/storage-demand-test main using node build.cjs, output public. Only the website, robots.txt and sitemap.xml are published.
- Live browser submission GETSTORAGE LIVE TEST saved as lead ID 3, independently confirmed in Supabase. Two earlier synthetic leads are IDs 1 and 2. Exclude utm_source setup_test_20260907 and setup_test_live_20260907 from demand reporting.
- Claude's styling preserved. Failed saves retain form values and enable retry; success requires a saved lead. Success/failure checks passed.
- leads and events have RLS enabled and anonymous INSERT only. Anonymous reads denied. SQL setup already applied; do not recreate or truncate tables.
- Flowcraft data archived at C:\Users\User\Business Archives\Flowcraft\2026-09-07\ and Flowcraft-2026-09-07.zip in its parent directory. OPEN_FLOWCRAFT_ARCHIVE.html provides a searchable offline view. Export counts independently verified.
- Original Flowcraft records also remain in locked flowcraft_archive schema, inaccessible to the old app's API paths.
- Flowcraft CRM source archived and retired in NewtonNathaphon/newton-life-os commit b3aebe7. Production https://flowcraft-evz.pages.dev and /api/claude independently verified HTTP 410 retired.
- COMPLETED 2026-09-08: refreshed Cloudflare authorization, removed 192 old deployments from the remaining 271, then deleted the entire Flowcraft Pages project and its final 79 deployments. Cloudflare API returned success and the account project list confirms flowcraft is absent while getstorage and the other projects remain. No Supabase data or archive was deleted.
- Post-deletion check: GetStorage returns HTTP 200; flowcraft-evz.pages.dev and sampled historical host 8e3a2fc6.flowcraft-evz.pages.dev no longer resolve in DNS.
- Rechecked archive integrity on 2026-09-08: all 26 records/schema files match manifest SHA-256 hashes; the ZIP opens and contains 52 entries. These local copies share this PC's disk; the locked Supabase archive remains the additional preserved copy.
- CCAQR code/data and its separate recovery project untouched.
- Custom domain not connected. On 2026-09-08 Newton confirmed he does not own getstorage.com; Cloudflare lists it as unavailable. Choose and register another location-neutral name before connecting DNS. Newton rejected getstoragebkk.com because the business may expand beyond Bangkok. getstoragespace.com is also unavailable. getstoragehub.com was listed as available for USD 10.46/year (same displayed renewal price), but Newton has not selected or purchased it. Recheck availability and price before purchase. Canonical and sitemap use the working Pages URL.
