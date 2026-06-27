-- ══════════════════════════════════════════════════════
-- Nest · Razorpay Subscriptions
-- Replaces Stripe integration
-- ══════════════════════════════════════════════════════

-- 1. Add razorpay_plan_id to plans table (keeps stripe_price_id as NULL for history)
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;

-- 2. Add razorpay_customer_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

-- 3. Subscriptions table — source of truth for Razorpay billing state
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   TEXT        PRIMARY KEY,       -- Razorpay sub_xxx
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id              TEXT        NOT NULL REFERENCES public.plans(id),
  status               TEXT        NOT NULL DEFAULT 'created',
  -- status: created | authenticated | active | paused | halted | cancelled | completed
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN     NOT NULL DEFAULT false,
  razorpay_customer_id TEXT,
  raw_payload          JSONB,                          -- last webhook payload for debugging
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: own read"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions: service role full"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Update dunning descriptions to reference Razorpay instead of Stripe
UPDATE public.nest_config
  SET description = 'Days after a failed payment before the subscription is downgraded (Razorpay halts after max retries)'
  WHERE key = 'plan.dunning.grace_period_days';

UPDATE public.nest_config
  SET description = 'Maximum payment retry attempts by Razorpay before subscription is halted and user is downgraded to Free'
  WHERE key = 'plan.dunning.max_retries';
