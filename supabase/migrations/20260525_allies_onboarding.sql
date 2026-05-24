-- ══════════════════════════════════════════════════════════════
-- Nest · Ally Onboarding — Full Schema Expansion
-- Applied via Supabase MCP on 2026-05-25
-- ══════════════════════════════════════════════════════════════

-- 1. Make display_name nullable (drafts start empty)
ALTER TABLE allies ALTER COLUMN display_name DROP NOT NULL;
ALTER TABLE allies ALTER COLUMN display_name SET DEFAULT '';

-- 2. Add updated_at column
ALTER TABLE allies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ── Step 1: Identity ──────────────────────────────────────────
ALTER TABLE allies ADD COLUMN IF NOT EXISTS full_name        TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS pronouns         TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS location         TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS email            TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS phone            TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS whatsapp         TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS tagline          TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS quote            TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS photo_url        TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS photo_storage_path TEXT;

-- ── Step 2: Expertise ─────────────────────────────────────────
ALTER TABLE allies ADD COLUMN IF NOT EXISTS primary_role               TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS years_experience           INTEGER DEFAULT 0;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS highest_qualification      TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS license_number             TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS additional_certifications  TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS modalities                 TEXT[]  DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS age_groups                 TEXT[]  DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS gender_preferences         TEXT[]  DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS languages_spoken           TEXT    DEFAULT 'English';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS languages_therapy          TEXT    DEFAULT 'English';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS approach_style             TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS session_tones              TEXT[]  DEFAULT '{}';

-- ── Step 3: Sessions ──────────────────────────────────────────
ALTER TABLE allies ADD COLUMN IF NOT EXISTS session_formats        TEXT[]  DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS session_durations      TEXT[]  DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS session_price          INTEGER DEFAULT 0;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS intro_price            INTEGER;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS max_clients_per_week   INTEGER DEFAULT 10;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS buffer_minutes         INTEGER DEFAULT 15;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS availability           JSONB   DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS visibility_search      BOOLEAN DEFAULT false;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS visibility_bookings    BOOLEAN DEFAULT false;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS visibility_matching    BOOLEAN DEFAULT true;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS visibility_featured    BOOLEAN DEFAULT false;

-- ── Step 4: Documents / admin ─────────────────────────────────
ALTER TABLE allies ADD COLUMN IF NOT EXISTS admin_notes            TEXT;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS doc_agreement_status   TEXT DEFAULT 'pending';

-- ── Step 5: Matching ──────────────────────────────────────────
ALTER TABLE allies ADD COLUMN IF NOT EXISTS match_weights          JSONB DEFAULT '{}';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS sort_priority          TEXT  DEFAULT 'Earliest availability';
ALTER TABLE allies ADD COLUMN IF NOT EXISTS manual_priority_score  INTEGER DEFAULT 7;

-- ── Workflow ──────────────────────────────────────────────────
ALTER TABLE allies ADD COLUMN IF NOT EXISTS onboarding_step        INTEGER DEFAULT 1;
ALTER TABLE allies ADD COLUMN IF NOT EXISTS onboarding_status      TEXT    DEFAULT 'draft';
-- onboarding_status values: draft | submitted | approved | active | rejected

-- 3. updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_allies_updated_at ON allies;
CREATE TRIGGER set_allies_updated_at
  BEFORE UPDATE ON allies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. ally_documents table
CREATE TABLE IF NOT EXISTS ally_documents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ally_id       UUID        NOT NULL REFERENCES allies(id) ON DELETE CASCADE,
  doc_type      TEXT        NOT NULL,
  file_name     TEXT,
  storage_path  TEXT,
  file_url      TEXT,
  file_size     INTEGER,
  mime_type     TEXT,
  is_required   BOOLEAN     DEFAULT false,
  status        TEXT        DEFAULT 'uploaded',
  uploaded_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ally_documents_ally_doc_unique UNIQUE (ally_id, doc_type)
);

DROP TRIGGER IF EXISTS set_ally_documents_updated_at ON ally_documents;
CREATE TRIGGER set_ally_documents_updated_at
  BEFORE UPDATE ON ally_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS on ally_documents (service role only)
ALTER TABLE ally_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_client_access_docs" ON ally_documents;
CREATE POLICY "deny_all_client_access_docs" ON ally_documents
  AS RESTRICTIVE USING (false);

-- 6. Service-role write policy for allies
DROP POLICY IF EXISTS "service_role_allies_write" ON allies;
CREATE POLICY "service_role_allies_write" ON allies
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. Storage buckets (created via MCP execute_sql, documented here for reference)
-- ally-photos:    public  bucket, 5MB,  JPEG/PNG/WebP
-- ally-documents: private bucket, 20MB, JPEG/PNG/PDF
