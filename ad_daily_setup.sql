-- Daily Google Ads numbers sent by the Google Ads script (tools/google_ads_daily_sync.js) to /api/ads-ingest. Owner-only, like ad_spend.
BEGIN;
CREATE TABLE IF NOT EXISTS public.ad_daily (
  day date NOT NULL,
  channel text NOT NULL CHECK (channel IN ('google_ads')),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  cost_thb numeric(12,2) NOT NULL DEFAULT 0 CHECK (cost_thb >= 0),
  conversions numeric(10,2) NOT NULL DEFAULT 0 CHECK (conversions >= 0),
  line_clicks numeric(10,2) NOT NULL DEFAULT 0 CHECK (line_clicks >= 0),
  reservations numeric(10,2) NOT NULL DEFAULT 0 CHECK (reservations >= 0),
  quote_requests numeric(10,2) NOT NULL DEFAULT 0 CHECK (quote_requests >= 0),
  currency text NOT NULL DEFAULT 'THB' CHECK (length(currency) = 3),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (day, channel)
);
ALTER TABLE public.ad_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ad_daily FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ad_daily TO service_role;
COMMIT;
-- Feed keys: only SHA-256 hashes are stored. The key itself lives in the Google Ads script (Newton's Drive copy), never in git.
BEGIN;
CREATE TABLE IF NOT EXISTS public.ad_ingest_keys (
  key_hash text PRIMARY KEY CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  label text NOT NULL DEFAULT '' CHECK (length(label) <= 100),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_ingest_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ad_ingest_keys FROM anon, authenticated;
GRANT SELECT ON public.ad_ingest_keys TO service_role;
COMMIT;
