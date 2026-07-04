-- Daily nudge cron schedules for the nila-push-nudge Edge Function.
-- These run via pg_cron + pg_net (both enabled by default on Supabase).
--
-- Replace <PROJECT_REF> and <ANON_KEY> with your actual values from
-- Supabase Dashboard → Settings → API before applying this migration.
-- Alternatively, configure schedules directly in the Supabase Dashboard
-- under Edge Functions → nila-push-nudge → Add schedule.

-- 9am IST = 03:30 UTC
SELECT cron.schedule(
  'nila-nudge-morning',
  '30 3 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/nila-push-nudge?cohort=morning',
      headers := jsonb_build_object(
                   'Authorization', 'Bearer <ANON_KEY>',
                   'Content-Type',  'application/json'
                 ),
      body    := '{}'::jsonb
    );
  $$
);

-- 8pm IST = 14:30 UTC
SELECT cron.schedule(
  'nila-nudge-evening',
  '30 14 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/nila-push-nudge?cohort=evening',
      headers := jsonb_build_object(
                   'Authorization', 'Bearer <ANON_KEY>',
                   'Content-Type',  'application/json'
                 ),
      body    := '{}'::jsonb
    );
  $$
);
