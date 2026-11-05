-- ─────────────────────────────────────────────────────────────
-- KANMANI FUND — keep donor data private
-- ─────────────────────────────────────────────────────────────
-- kanmani_donations holds donor names, emails and Razorpay ids. Until now it had
-- a select policy of `using (true)`, so anyone with the public anon key could read
-- every row, and the table was broadcast over Realtime.
--
-- Every read and write in the app goes through the service role (createAdminClient),
-- which bypasses RLS, so the stats API, payment verification and the webhook are
-- unaffected. The live counter now polls /api/kanmani/stats instead of Realtime.

-- 1. No public reads of donation rows. RLS stays on with no select policy.
drop policy if exists "kanmani: public read donations" on public.kanmani_donations;

-- 2. Stop broadcasting donation rows over Realtime.
do $$ begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'kanmani_donations'
  ) then
    alter publication supabase_realtime drop table public.kanmani_donations;
  end if;
end $$;

-- 3. Run the stats view with the caller's permissions, not its owner's
--    (Supabase advisor: "Security Definer View").
alter view public.kanmani_stats set (security_invoker = true);
