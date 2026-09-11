# StorageBuddy operations

> Current direction: read [MASTER_BRIEF.md](MASTER_BRIEF.md) first. Newton's September 11 Rama 3 building brief supersedes older site-search, rent-case and software-scope decisions below. Other property hunting and public landlord/JV intake are deferred. This file retains earlier context and compatible technical details.


Current working brand (2026-09-11): StorageBuddy / สตอเรจบดด. Newton resumed and requested all branding updated. This supersedes earlier SpaceBuddy/GetStorage naming preferences and the September 8 pause for this branding task. The existing address and hosting project remain getstorage.pages.dev / getstorage. No domain purchase is included. The expanded MVP remains unbuilt.


The site is live at https://getstorage.pages.dev. See SETUP_STATUS.md for the verified launch checkpoint and remaining Flowcraft deployment cleanup.

## View customer submissions

Open https://supabase.com/dashboard/project/tmynmthxjcrnnukmpyox/editor/18424?schema=public while signed in to your Supabase account. Project name: storage. Table: public.leads. The events table contains interaction tracking. Public visitors can submit but cannot read customer records.

The ?admin=1 website view is a session-only tally; use Supabase for all saved leads.

## Deploy changes

Push main in NewtonNathaphon/storage-demand-test. Cloudflare Pages project getstorage runs node build.cjs and publishes public. Do not change the output to the repository root: SQL and internal documents must remain unpublished.

Supabase is already connected. supabase_setup.sql and archive_flowcraft.sql were applied; do not rerun setup or truncate live data.

## Test and report

A live browser lead was saved and verified in the database. Synthetic launch records use utm_source setup_test_20260907 or setup_test_live_20260907. Exclude these from reporting without deleting real submissions.

A failed database save preserves the form for retry and does not display success or log submit_success.

Example campaign URL: https://getstorage.pages.dev/?utm_source=fb&utm_area=rama3
Supported area values: thapra, rama3, pinklao, iconsiam.

## Custom domain

Choose and register a location-neutral domain before connecting it in Cloudflare Pages Custom domains. Newton does not own getstorage.com, and it is unavailable for registration. See SETUP_STATUS.md for the latest candidates; no replacement has been selected or purchased. Once the chosen domain is active, update canonical/OG URLs, structured data, robots.txt and sitemap.xml together. Until then, the Pages URL is the working public address.
