# GetStorage launch status - 2026-09-07

- LIVE: https://getstorage.pages.dev
- Backend: https://supabase.com/dashboard/project/tmynmthxjcrnnukmpyox/editor/18424?schema=public
- Existing Flowcraft Supabase project renamed storage and reused; no new database instance created.
- Cloudflare Pages getstorage deploys GitHub NewtonNathaphon/storage-demand-test main using node build.cjs, output public. Only the website, robots.txt and sitemap.xml are published.
- Live browser submission GETSTORAGE LIVE TEST saved as lead ID 3, independently confirmed in Supabase. Two earlier synthetic leads are IDs 1 and 2. Exclude utm_source setup_test_20260907 and setup_test_live_20260907 from demand reporting.
- Claude's styling preserved. Failed saves retain form values and enable retry; success requires a saved lead. Success/failure checks passed.
- leads and events have RLS enabled and anonymous INSERT only. Anonymous reads denied. SQL setup already applied; do not recreate or truncate tables.
- Flowcraft data archived at C:\Users\User\Business Archives\Flowcraft\2026-09-07\ and Flowcraft-2026-09-07.zip in its parent directory. OPEN_FLOWCRAFT_ARCHIVE.html provides a searchable offline view. Export counts independently verified.
- Original Flowcraft records also remain in locked flowcraft_archive schema, inaccessible to the old app's API paths.
- Flowcraft CRM source archived and retired in NewtonNathaphon/newton-life-os commit b3aebe7. Production https://flowcraft-evz.pages.dev and /api/claude independently verified HTTP 410 retired.
- Full Cloudflare Flowcraft project/deployment deletion remains incomplete: Cloudflare rejected deletion because it has over 100 deployments; bulk cleanup requires renewing expired Wrangler authorization. Historical deployment URLs may still serve older code, although archived data is inaccessible through its original paths. Do not describe the project as deleted.
- CCAQR code/data and its separate recovery project untouched.
- Custom getstorage.com domain not connected; ownership/DNS still needs verification. Canonical and sitemap use the working Pages URL.
