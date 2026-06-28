-- Store latest assessment snapshot on profiles for fast Nila context lookup
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_assessment_branch  TEXT,
  ADD COLUMN IF NOT EXISTS last_assessment_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_assessment_summary TEXT;
