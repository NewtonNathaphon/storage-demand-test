-- Applied after backoffice_setup.sql: sign-in now uses the existing CCAQR owner.
-- All back-office data access goes through the role-checking Pages Function.
BEGIN;
REVOKE SELECT ON public.leads, public.events FROM authenticated;
REVOKE ALL ON public.lead_followups FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.backoffice_authorized() FROM authenticated;
GRANT SELECT ON public.leads, public.events TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.lead_followups TO service_role;
COMMIT;
