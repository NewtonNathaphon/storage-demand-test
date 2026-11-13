-- Monthly ad spend typed in the back office (from the Google Ads receipt). Owner-only through the role-checking Pages Function.
-- No public access: anon and signed-in browser roles cannot read or write; only the server-side key used by /api/backoffice can.
BEGIN;
CREATE TABLE IF NOT EXISTS public.ad_spend (
  month date NOT NULL CHECK (extract(day FROM month) = 1),
  channel text NOT NULL CHECK (channel IN ('google_ads','facebook_ads','other')),
  amount_thb numeric(12,2) NOT NULL CHECK (amount_thb >= 0 AND amount_thb < 10000000),
  note text NOT NULL DEFAULT '' CHECK (length(note) <= 500),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT '' CHECK (length(updated_by) <= 200),
  PRIMARY KEY (month, channel)
);
ALTER TABLE public.ad_spend ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ad_spend FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ad_spend TO service_role;
COMMIT;
