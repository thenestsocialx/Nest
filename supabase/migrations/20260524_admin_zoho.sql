-- ══════════════════════════════════════════════════════
-- Nest · Admin + Zoho integration schema
-- ══════════════════════════════════════════════════════

-- zoho_credentials: singleton row, service-role access only
CREATE TABLE IF NOT EXISTS zoho_credentials (
  id          TEXT PRIMARY KEY DEFAULT 'singleton',
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  zoho_org_id   TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Block ALL client-side access — only service role may touch this table
ALTER TABLE zoho_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_all_client_access" ON zoho_credentials
  AS RESTRICTIVE
  USING (false);

-- allies table (create if not already present from earlier migrations)
CREATE TABLE IF NOT EXISTS allies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio          TEXT,
  specialties  TEXT[],
  is_active    BOOLEAN DEFAULT false,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Zoho columns on allies
ALTER TABLE allies
  ADD COLUMN IF NOT EXISTS zoho_staff_id    TEXT,
  ADD COLUMN IF NOT EXISTS zoho_service_ids JSONB;
-- zoho_service_ids shape: { "30min": "service_id_xxx", "60min": "service_id_yyy" }

-- Allies RLS: public browse for active, non-deleted profiles
ALTER TABLE allies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'allies' AND policyname = 'public_read_allies'
  ) THEN
    CREATE POLICY "public_read_allies" ON allies
      FOR SELECT USING (is_active = true AND deleted_at IS NULL);
  END IF;
END $$;

-- sessions table (create if not already present)
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ally_id    UUID REFERENCES allies(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at   TIMESTAMPTZ,
  status     TEXT DEFAULT 'pending'
);

-- Zoho columns on sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS zoho_booking_id     TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS zoho_appointment_id TEXT;

-- Sessions RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'user_own_sessions'
  ) THEN
    CREATE POLICY "user_own_sessions" ON sessions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'ally_own_sessions'
  ) THEN
    CREATE POLICY "ally_own_sessions" ON sessions
      FOR SELECT USING (
        ally_id IN (SELECT id FROM allies WHERE user_id = auth.uid())
      );
  END IF;
END $$;
