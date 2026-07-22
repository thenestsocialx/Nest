-- Add 'refunded' as a valid donation status so refunded payments are
-- excluded from kanmani_stats without being miscategorised as 'failed'.
alter table kanmani_donations
  drop constraint kanmani_donations_status_check,
  add constraint kanmani_donations_status_check
    check (status in ('created', 'captured', 'failed', 'refunded'));
