ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nila_push_subscription JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_nila_nudge
  ON public.profiles (nila_nudge_enabled, nila_nudge_time)
  WHERE nila_push_subscription IS NOT NULL;
