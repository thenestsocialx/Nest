-- ── Plans table (display + checkout config) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.plans (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  price_inr       INTEGER NOT NULL DEFAULT 0,
  tag             TEXT NOT NULL,
  features        JSONB NOT NULL DEFAULT '[]',
  cta             TEXT NOT NULL,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  stripe_price_id TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: authenticated read"
  ON public.plans FOR SELECT TO authenticated USING (true);

CREATE POLICY "plans: service role full access"
  ON public.plans FOR ALL USING (auth.role() = 'service_role');

INSERT INTO public.plans (id, name, price_inr, tag, features, cta, is_featured, stripe_price_id, display_order)
VALUES
  ('free', 'Free', 0, 'Where you are now',
   '["10 conversations with Nila per day","Access to Resources","Weekend event discovery"]'::jsonb,
   'You''re on this plan', false, null, 0),
  ('core', 'Core', 299, 'Most chosen',
   '["Unlimited Nila conversations","1 Ally session per month","Full Resources library","Priority support"]'::jsonb,
   'Start Core', true, null, 1),
  ('premium', 'Premium', 599, 'For when you''re ready to go deeper',
   '["Everything in Core","Unlimited Ally sessions","Early access to events","Priority Ally matching"]'::jsonb,
   'Start Premium', false, null, 2)
ON CONFLICT (id) DO NOTHING;

-- ── Behavioral config (nest_config) ──────────────────────────────────────
INSERT INTO public.nest_config (key, value, description) VALUES
  -- Chat limits (per reset period)
  ('nila.core_message_limit',           '999',   'Max Nila messages per period for Core plan (999 = unlimited)'),
  ('nila.premium_message_limit',        '999',   'Max Nila messages per period for Premium plan (999 = unlimited)'),
  ('nila.limit_reset_period',           'daily', 'Limit reset cadence: daily (midnight) or weekly (Monday 00:00)'),
  -- Ally sessions
  ('plan.ally_sessions.core',           '1',     'Ally sessions per month for Core plan (999 = unlimited)'),
  ('plan.ally_sessions.premium',        '999',   'Ally sessions per month for Premium plan (999 = unlimited)'),
  -- Credit wallet
  ('plan.credits.signup_bonus',         '50',    'Credits given on account creation'),
  ('plan.credits.per_nila_message_free','1',     'Credits consumed per Nila message (Free plan only)'),
  ('plan.credits.expiry_days',          '90',    'Days before unused credits expire'),
  -- Billing & dunning
  ('plan.dunning.grace_period_days',    '7',     'Days after a failed payment before the subscription is downgraded'),
  ('plan.dunning.max_retries',          '3',     'Maximum payment retry attempts before downgrading to Free')
ON CONFLICT (key) DO NOTHING;
