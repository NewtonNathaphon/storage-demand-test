# Enquiry-focused update — September 12

Newton approved improving the customer journey and withholding the map because the building is not confirmed.

- Hero explains planned self-storage in Rama 3 with enquiry and LINE actions. Fixed mobile actions provide both choices. Existing contact-click and enquiry events still record activity.
- Removed exact map/directions, capacity claims and visit invitations. Planning card and FAQ explicitly state that the building and opening date are unconfirmed and move-ins/visits are unavailable. Company address remains labelled as a registered address, not a storage location. Banner is labelled illustrative.
- Room examples follow benefits. Removed repetitive three-card use-case section. Photo sizing remains optional.
- Replaced two-step form with one step: name, phone, optional LINE and items, plus consent. Other preferences are in an optional disclosure. Area is optional; unspecified timing defaults to unsure. Existing lead schema, AI attachment and backoffice remain compatible. Details version 3 records planning_location_unconfirmed.
- Local browser checks passed in Thai/English at widths 360/390/768/1440: no overflow, no map, required-field rejection and successful minimal enquiry payloads. Actual file upload with mocked provider response passed through to an enquiry containing the estimate and optional budget. No production AI quota was consumed for this unchanged provider flow.

Conversion improvement is an intended outcome, not a measured claim. Compare enquiry and LINE activity after genuine traffic arrives; setup_test records remain excluded in the backoffice.

Published as `4c0cd13` and verified live. Minimal enquiry with optional fields blank returned 201 and the resulting marked test record was verified in the authenticated owner backoffice. Test name: `TEST ONLY CONVERSION 20260912`; source: `setup_test_conversion_live`. No customer contact was made. Newton then requested saving and stopping for departure.
