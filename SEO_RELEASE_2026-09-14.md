# StorageBuddy SEO release — September 14, 2026

## Status

Live on Cloudflare Pages. The bilingual foundation, six practical guides and branded HTTP 404 were verified on the apex domain after release commit `7f00bf23c806f0c8d28b5921cc6d5063dbc4d510`.

## Safety and rollback

- Pre-change production checkpoint: Git tag `backup/pre-seo-20260914` at commit `1918bdfab64d5cc013687f05c459b3cd0aed386b`.
- Pre-visibility checkpoint: Git tag `backup/pre-visibility-20260914` at commit `30bc0e37903ee21ff425d683a5cf4b6e95991113`.
- Post-visibility checkpoint: Git tag `backup/visibility-live-20260914` records the final release state.
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

The exact verification file supplied by Newton is `googlec5a82ac63469f274.html`. It is included by the allowlisted build and was verified byte-for-byte in production. Search Console ownership is verified. The sitemap URL was submitted successfully before this expansion; it now serves all 16 canonical pages at the same URL, so Google can recrawl it without repeated manual submission.

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

- Release commit: `7f00bf23c806f0c8d28b5921cc6d5063dbc4d510`
- GitHub push: verified on `origin/main`
- Cloudflare Pages live verification: passed on apex and `getstorage.pages.dev`
- Apex canonical pages: 16/16 returned HTTP 200 with exact canonical, language and reciprocal alternate metadata
- Branded unknown-route response: HTTP 404 with `noindex,nofollow` and no canonical
- `www` redirect: verified with path and query preserved
- `/rooms` redirects: verified to the matching Thai and English size pages
- Responsive WebP delivery: verified for 640 px and 1280 px hero/support assets
- Google verification file: exact production content verified
- Search Console ownership: verified
- Sitemap: submitted successfully; production sitemap now contains exactly 16 unique canonical URLs
