-- ══════════════════════════════════════════════════════
-- Nest · Clients & Audit Logs
-- Applied via Supabase MCP on 2026-05-24
-- ══════════════════════════════════════════════════════

-- 1. Extend profiles table for client management
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan                TEXT        DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS credits             INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nila_message_count  INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS safety_flag         BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS safety_flag_reason  TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT        DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_active_at      TIMESTAMPTZ;
-- plan values: 'free' | 'core' | 'premium'
-- subscription_status values: 'active' | 'payment_failed' | 'cancelled'

-- 2. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT        NOT NULL,
  actor_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email   TEXT,
  actor_role    TEXT        NOT NULL DEFAULT 'admin',
  target_type   TEXT,
  target_id     UUID,
  target_label  TEXT,
  action        TEXT        NOT NULL,
  old_value     JSONB,
  new_value     JSONB,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id  ON public.audit_logs(target_id);

-- RLS: admin-only via service role; no client-side access
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'deny_all_client_access_audit'
  ) THEN
    CREATE POLICY "deny_all_client_access_audit" ON public.audit_logs
      AS RESTRICTIVE USING (false);
  END IF;
END $$;
