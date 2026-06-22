-- ══════════════════════════════════════════════════════════════
-- Nest · Zoho Services mirror + Ally Session Config
-- ══════════════════════════════════════════════════════════════

-- ── zoho_services ────────────────────────────────────────────────────────────
-- Mirror of Zoho Bookings service records. Populated by sync job.
-- Only APPOINTMENT-type services are stored.
CREATE TABLE IF NOT EXISTS public.zoho_services (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  zoho_service_id           TEXT        UNIQUE NOT NULL,
  zoho_workspace_id         TEXT        NOT NULL,
  name                      TEXT        NOT NULL,
  duration_mins             INTEGER     NOT NULL,
  pre_buffer_mins           INTEGER     NOT NULL DEFAULT 0,
  post_buffer_mins          INTEGER     NOT NULL DEFAULT 0,
  effective_slot_mins       INTEGER     NOT NULL,
  price_zoho                NUMERIC(10,2),
  currency                  TEXT        NOT NULL DEFAULT 'INR',
  description               TEXT        NOT NULL DEFAULT '',
  service_type              TEXT        NOT NULL DEFAULT 'APPOINTMENT',
  session_format            TEXT[]      NOT NULL DEFAULT '{"online"}',
  let_customer_select_staff BOOLEAN     NOT NULL DEFAULT true,
  embed_url                 TEXT,
  assigned_staffs           TEXT[]      NOT NULL DEFAULT '{}',
  is_active                 BOOLEAN     NOT NULL DEFAULT true,
  last_synced_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zoho_services_active
  ON public.zoho_services (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_zoho_services_workspace
  ON public.zoho_services (zoho_workspace_id);

DROP TRIGGER IF EXISTS set_zoho_services_updated_at ON public.zoho_services;
CREATE TRIGGER set_zoho_services_updated_at
  BEFORE UPDATE ON public.zoho_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.zoho_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to zoho_services" ON public.zoho_services;
CREATE POLICY "Admin full access to zoho_services"
  ON public.zoho_services FOR ALL
  TO authenticated
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── ally_session_config ───────────────────────────────────────────────────────
-- Nest's configuration layer per Ally from Step 3 onboarding.
-- One row per ally (UNIQUE on ally_id). Upsert on conflict.
CREATE TABLE IF NOT EXISTS public.ally_session_config (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  ally_id             UUID    UNIQUE NOT NULL REFERENCES public.allies(id) ON DELETE CASCADE,
  zoho_service_id     TEXT    REFERENCES public.zoho_services(zoho_service_id) ON DELETE SET NULL,
  pricing_tier        TEXT    NOT NULL CHECK (pricing_tier IN ('spark', 'glow', 'radiance')),
  price_inr           INTEGER NOT NULL,
  session_format      TEXT[]  NOT NULL DEFAULT '{"online"}',
  buffer_mins         INTEGER NOT NULL DEFAULT 15,
  max_sessions_week   INTEGER NOT NULL DEFAULT 10,
  visibility_search   BOOLEAN NOT NULL DEFAULT false,
  visibility_bookings BOOLEAN NOT NULL DEFAULT false,
  visibility_matching BOOLEAN NOT NULL DEFAULT true,
  visibility_featured BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_ally_session_config_updated_at ON public.ally_session_config;
CREATE TRIGGER set_ally_session_config_updated_at
  BEFORE UPDATE ON public.ally_session_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.ally_session_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to ally_session_config" ON public.ally_session_config;
CREATE POLICY "Admin full access to ally_session_config"
  ON public.ally_session_config FOR ALL
  TO authenticated
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Ally reads own session config" ON public.ally_session_config;
CREATE POLICY "Ally reads own session config"
  ON public.ally_session_config FOR SELECT
  TO authenticated
  USING (
    ally_id IN (
      SELECT id FROM public.allies WHERE user_id = auth.uid()
    )
  );

-- ── allies: new Step-3 denorm columns ────────────────────────────────────────
-- zoho_service_id: FK for quick joins, kept in sync by the PATCH auto-save.
-- pricing_tier: denorm tier value for display on ally cards.
ALTER TABLE public.allies
  ADD COLUMN IF NOT EXISTS zoho_service_id TEXT
    REFERENCES public.zoho_services(zoho_service_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pricing_tier TEXT
    CHECK (pricing_tier IN ('spark', 'glow', 'radiance'));
