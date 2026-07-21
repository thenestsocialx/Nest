-- ─────────────────────────────────────────────────────────────
-- KANMANI FUND — database objects
-- ─────────────────────────────────────────────────────────────

-- Tracks every donation attempt and its Razorpay payment outcome
create table if not exists kanmani_donations (
  id                  uuid        primary key default gen_random_uuid(),
  razorpay_order_id   text        not null unique,
  razorpay_payment_id text,
  amount_inr          integer     not null check (amount_inr > 0),
  sessions_funded     integer     not null default 0,
  status              text        not null default 'created'
                                    check (status in ('created', 'captured', 'failed')),
  donor_email         text,
  donor_name          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Impact entries added by admins after sessions are actually delivered
create table if not exists kanmani_fund_entries (
  id         uuid        primary key default gen_random_uuid(),
  entry_text text        not null,
  detail     text,
  created_at timestamptz not null default now()
);

-- Live aggregate view — single row, always reflects current captured donations
create or replace view kanmani_stats as
  select
    coalesce(sum(amount_inr), 0)::integer      as total_raised_inr,
    coalesce(sum(sessions_funded), 0)::integer  as sessions_funded
  from kanmani_donations
  where status = 'captured';

-- ── Row-level security ───────────────────────────────────────────────────────
alter table kanmani_donations    enable row level security;
alter table kanmani_fund_entries enable row level security;

-- Public read so the stats counter and entries work without auth
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'kanmani_donations' and policyname = 'kanmani: public read donations'
  ) then
    create policy "kanmani: public read donations"
      on kanmani_donations for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'kanmani_fund_entries' and policyname = 'kanmani: public read entries'
  ) then
    create policy "kanmani: public read entries"
      on kanmani_fund_entries for select using (true);
  end if;
end $$;

-- ── Trigger: auto-compute sessions_funded on insert / amount change ───────────
create or replace function kanmani_set_sessions_funded()
returns trigger language plpgsql as $$
begin
  new.sessions_funded := new.amount_inr / 799;
  return new;
end;
$$;

drop trigger if exists kanmani_sessions_funded_trigger on kanmani_donations;
create trigger kanmani_sessions_funded_trigger
  before insert or update of amount_inr
  on kanmani_donations
  for each row execute function kanmani_set_sessions_funded();

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists kanmani_donations_status_idx on kanmani_donations (status);
create index if not exists kanmani_donations_order_id_idx on kanmani_donations (razorpay_order_id);
