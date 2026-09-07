# GetStorage setup status — 2026-09-07

This checkpoint supersedes the new-project instructions in SETUP.md.

- Supabase: existing project `tmynmthxjcrnnukmpyox`, renamed from Flowcraft to `storage`. No new database instance or additional project compute charge.
- Old Flowcraft records preserved in private local archive `C:\Users\User\Business Archives\Flowcraft\2026-09-07\` and in locked `flowcraft_archive` schema. All exported business counts match an independent live count.
- `archive_flowcraft.sql` applied once. It moves tables and revokes API access without deleting records.
- `supabase_setup.sql` applied once; new public tables `leads` and `events`, RLS on, anon INSERT only.
- `index.html` configured with the existing public anon key. Claude's CSS is byte-for-byte unchanged.
- False success fixed: lead save is awaited; only successful persistence shows confirmation and counts a conversion. Failure retains values and re-enables retry.
- API verification passed: lead/event INSERT 201, public SELECT denied, former Flowcraft public table paths unavailable, archive schema inaccessible. Database owner UI confirms two synthetic leads.
- Browser submission succeeded from local preview. `utm_area=rama3` correctly preselects Rama 3. Synthetic API/browser records use `utm_source=setup_test_20260907`; exclude them from real demand reporting.
- Public Cloudflare GetStorage deployment is not yet created. No custom domain connected. Source currently says getstorage.co; Newton subsequently requested getstorage.com. Verify domain ownership before setting canonical, OG, robots and sitemap or connecting DNS. Use the actual Pages URL until ownership is established.
- Old Cloudflare Pages project `flowcraft` deletion is at the final confirmation screen. Its old deployments/functions remain until approved and deleted. It has no access to archived Flowcraft records through its original table paths.
- Old CRM removal is staged in `C:\Users\User\newton-life-os` but not committed/pushed, to avoid failed auto-deployments while the old Pages project exists. No CCAQR code/data changed.
- CCAQR recovery project is untouched; it is a separate cleanup decision.

Next: confirm/delete only the obsolete Cloudflare `flowcraft` Pages project; commit/push scoped retirement changes; deploy this repository to Cloudflare Pages; verify the live URL and a saved lead; confirm the desired owned domain.
