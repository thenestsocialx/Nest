-- Soft-delete support for conversations and messages

ALTER TABLE public.nila_conversations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.nila_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index: fast lookup of live (non-deleted) conversations per user
CREATE INDEX IF NOT EXISTS idx_nila_conversations_live
  ON public.nila_conversations (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Update existing SELECT policies to exclude soft-deleted rows
DROP POLICY IF EXISTS "nila_conversations: users can read own"   ON public.nila_conversations;
DROP POLICY IF EXISTS "nila_messages: users can read own"        ON public.nila_messages;

CREATE POLICY "nila_conversations: users can read own"
  ON public.nila_conversations FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "nila_messages: users can read own"
  ON public.nila_messages FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- pg_cron: nightly hard-delete of expired conversations + their messages
-- Runs 8:30pm UTC (2:00am IST). Retention window read from nest_config at job runtime.
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'nila-hard-delete-expired',
  '30 20 * * *',
  $$
    DELETE FROM public.nila_messages
    WHERE conversation_id IN (
      SELECT id FROM public.nila_conversations
      WHERE created_at < now() - (
        SELECT value::int FROM public.nest_config
        WHERE key = 'nila.history_retention_days'
      ) * interval '1 day'
    );

    DELETE FROM public.nila_conversations
    WHERE created_at < now() - (
      SELECT value::int FROM public.nest_config
      WHERE key = 'nila.history_retention_days'
    ) * interval '1 day';
  $$
);
