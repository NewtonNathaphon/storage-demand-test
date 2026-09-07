-- Run ONLY in existing Flowcraft project tmynmthxjcrnnukmpyox.
-- Preserve all old records in a locked schema. Do not delete any records.
-- Verified local archive: C:\Users\User\Business Archives\Flowcraft\2026-09-07
BEGIN;
DO $$
BEGIN
  IF to_regclass('public.po_log') IS NOT NULL THEN
    RAISE EXCEPTION 'Refusing to run in a CCAQR database';
  END IF;
  IF to_regclass('public.contacts') IS NULL OR
     to_regclass('private.newton_pipeline_targets') IS NULL THEN
    RAISE EXCEPTION 'Expected Flowcraft tables not present';
  END IF;
  IF (SELECT count(*) FROM public.contacts) <> 17 OR
     (SELECT count(*) FROM private.newton_pipeline_targets) <> 51 THEN
    RAISE EXCEPTION 'Flowcraft changed since archive verification; export again';
  END IF;
END $$;
CREATE SCHEMA flowcraft_archive AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA flowcraft_archive FROM PUBLIC, anon, authenticated, service_role;
ALTER TABLE public.attachments SET SCHEMA flowcraft_archive;
ALTER TABLE public.contacts SET SCHEMA flowcraft_archive;
ALTER TABLE public.customers SET SCHEMA flowcraft_archive;
ALTER TABLE public.deal_actions SET SCHEMA flowcraft_archive;
ALTER TABLE public.deals SET SCHEMA flowcraft_archive;
ALTER TABLE public.quotations SET SCHEMA flowcraft_archive;
ALTER TABLE private.lot_items SET SCHEMA flowcraft_archive;
ALTER TABLE private.newton_pipeline_targets SET SCHEMA flowcraft_archive;
ALTER TABLE private.products SET SCHEMA flowcraft_archive;
ALTER TABLE private.purchase_lots SET SCHEMA flowcraft_archive;
ALTER TABLE private.quote_log SET SCHEMA flowcraft_archive;
ALTER TABLE private.suppliers SET SCHEMA flowcraft_archive;
REVOKE ALL ON ALL TABLES IN SCHEMA flowcraft_archive FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA flowcraft_archive FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON SCHEMA flowcraft_archive IS 'Retired Flowcraft business records. Private archive, 2026-09-07. Never expose through the Data API.';
COMMIT;
