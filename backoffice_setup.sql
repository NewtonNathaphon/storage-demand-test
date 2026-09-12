-- StorageBuddy owner-only reporting and follow-up. Existing leads/events are retained.
BEGIN;
CREATE OR REPLACE FUNCTION public.backoffice_authorized() RETURNS boolean
LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT coalesce((auth.jwt()->>'email') = 'nathaphon.u@gmail.com', false)
    AND auth.uid() IS NOT NULL;
$$;
REVOKE ALL ON FUNCTION public.backoffice_authorized() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backoffice_authorized() TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.leads, public.events TO authenticated;
CREATE POLICY "owner reads storage leads" ON public.leads FOR SELECT TO authenticated USING ((SELECT public.backoffice_authorized()));
CREATE POLICY "owner reads storage events" ON public.events FOR SELECT TO authenticated USING ((SELECT public.backoffice_authorized()));
CREATE TABLE public.lead_followups (
  lead_id bigint PRIMARY KEY REFERENCES public.leads(id),
  status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','quoted','won','lost')),
  notes text NOT NULL DEFAULT '' CHECK(length(notes)<=10000),
  contacted_on date,
  follow_up_on date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_followups FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lead_followups TO authenticated;
CREATE POLICY "owner manages followups" ON public.lead_followups FOR ALL TO authenticated
  USING ((SELECT public.backoffice_authorized())) WITH CHECK ((SELECT public.backoffice_authorized()));
COMMIT;
