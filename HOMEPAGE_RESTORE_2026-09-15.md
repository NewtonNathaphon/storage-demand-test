# Homepage restoration and separate registration — September 15

Newton supplied screenshots of the previous and current homepage and explicitly requested action: restore the original homepage and provide a separate link to the form. He did not authorize a homepage redesign as a substitute for that form.

- Source of unintended visual changes: September 14 SEO foundation commit 0211834. Earlier local checkout was stale until origin/main was fetched.
- Restored approved visible homepage body and offers from backup/pre-seo-20260914 (1918bdf), including the already corrected contact number. Retained current metadata, canonical English page generation, language URL and campaign query handling, guide pages, redirects and Search Console file.
- New shareable URL: https://storagebuddyth.com/register/ (English directly via ?lang=en). It displays the form immediately without the homepage or size helper. Homepage links and design remain the restored version.
- registration-page.cjs generates the independent page using the maintained form, validation and save handler; assets/registration.js adds page-specific language/privacy/size behavior. No database migration or backend change.
- Saved leads use the existing schema and owner inbox, with entry_point=standalone_registration and default utm_source=shared_form; supplied campaign parameters are retained. Payment remains not_collected. No personal form data is stored in browser storage.
- Verified: standalone mobile/desktop rendering; required fields; language switching retains entered fields; privacy dialog; failed save retains fields; successful mocked save payload includes company/email/custom size/offer/attribution; success LINE link. Existing bilingual homepage/presale/photo flow and free-estimate signup gate regression passed. Visual screenshots inspected for homepage and mobile form.
- Production verification must check both fresh homepage content and /register/ following the deployment. No real customer data should be created merely to repeat mocked tests.

The September 14 SEO tests that pin the superseded homepage marketing copy/offer payload are historical expectations. The presale browser regression now asserts the restored approved offers.
