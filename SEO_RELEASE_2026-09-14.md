# StorageBuddy SEO release — September 14, 2026

## Status

Implementation and verification are in progress. Do not describe this release as live until the deployment section below is updated with live checks.

## Safety and rollback

- Pre-change production checkpoint: Git tag `backup/pre-seo-20260914` at commit `1918bdfab64d5cc013687f05c459b3cd0aed386b`.
- Original approved PNG artwork remains in the repository and is tested against pinned hashes. Responsive WebPs are delivery derivatives, not replacements for source artwork.
- Roll back website source by restoring/reverting to the checkpoint tag, then push the rollback commit. Do not reset shared history destructively.

## Implemented SEO architecture

Canonical public pages:

- `/` and `/en/`
- `/sizes/` and `/en/sizes/`
- `/location/rama-3/` and `/en/location/rama-3/`
- `/personal-storage/` and `/en/personal-storage/`
- `/business-storage/` and `/en/business-storage/`
- `/guides/choose-storage-size/` and `/en/guides/choose-storage-size/`
- `/guides/moving-renovation-checklist/` and `/en/guides/moving-renovation-checklist/`
- `/guides/sme-stock-document-plan/` and `/en/guides/sme-stock-document-plan/`

Each page has a unique title, description, H1 and canonical URL with reciprocal `th-TH`, `en-TH` and `x-default` hreflang links. The sitemap lists only these canonical pages. `/rooms` and `/en/rooms` permanently redirect to the matching size guides.

The Thai homepage targets `ห้องเก็บของให้เช่า พระราม 3`. Supporting pages naturally cover related high-intent terms without doorway pages or keyword lists. `/en/` is generated as crawlable English source rather than relying on JavaScript for meaningful content.

## Truthfulness rules

The customer-facing building, service address, opening date, room inventory, tariffs and operating features are not confirmed. Public copy must remain pre-opening and enquiry-led. Do not add availability, immediate move-in, visit, CCTV/security, insurance, air-conditioning or exact-price claims without confirmed operating evidence.

Founding Buddy and opening-update selections are unpaid expressions of interest. Current lead data intentionally records payment and discount terms as unconfirmed/null.

## Performance

The used hero, size-adviser and support illustrations have responsive 640 px and 1280 px WebP variants. The original PNGs remain as rollback fallbacks. Large unused promotional artwork is not published by the allowlisted build.

## Hosting and redirects

Cloudflare Pages remains the host. The chosen deployable `www.storagebuddyth.com` to `storagebuddyth.com` redirect is the Pages middleware in `functions/_middleware.js`; `_routes.json` controls its scope. Do not add a second Worker/Bulk Redirect unless the middleware is removed and the replacement is verified first.

## Google Search Console

The exact verification file supplied by Newton is `googlec5a82ac63469f274.html`. It is included by the allowlisted build. After deployment, verify that this URL returns the exact supplied content before Newton clicks Verify in Search Console. Then submit `https://storagebuddyth.com/sitemap.xml` and record the result here.

## Build and verification commands

```bash
node build.cjs
node --test --test-concurrency=1 tests/*.test.mjs
node tests/guides-browser.cjs
node tests/size-help-gate.cjs
node tests/room-review.cjs
node tests/presale-browser.cjs
node tests/campaign-browser.cjs
git diff --check
```

Browser tests require the repository's Playwright development dependency and a local server at `http://127.0.0.1:8788` serving `public/`. The campaign journey verifies that internal language/page navigation preserves attribution parameters without adding them to external links.

## Deployment record

- Release commit: pending
- GitHub push: pending
- Cloudflare Pages live verification: pending
- Apex canonical pages: pending
- `www` 301 redirect: pending
- `/rooms` redirects: pending
- Responsive WebP delivery: pending
- Google verification file: pending
- Search Console ownership: pending user verification
- Sitemap submission: pending user-authenticated Search Console action
