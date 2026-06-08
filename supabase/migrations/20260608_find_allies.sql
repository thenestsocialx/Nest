-- ══════════════════════════════════════════════════════════════
-- Nest · Find Allies — User-facing matching support
-- ══════════════════════════════════════════════════════════════

-- 1. User-vibe column: admin tags which vibes each ally supports
ALTER TABLE allies ADD COLUMN IF NOT EXISTS user_vibes TEXT[] DEFAULT '{}';

-- 2. Performance indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_allies_specialties
  ON allies USING GIN (specialties);

CREATE INDEX IF NOT EXISTS idx_allies_user_vibes
  ON allies USING GIN (user_vibes);

CREATE INDEX IF NOT EXISTS idx_allies_active_search
  ON allies (is_active, onboarding_status, visibility_search)
  WHERE deleted_at IS NULL;

-- 3. Session request support
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS request_message TEXT;
-- Valid status values: 'pending' | 'requested' | 'confirmed' | 'completed' | 'cancelled'
