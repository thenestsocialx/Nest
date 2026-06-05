CREATE TABLE IF NOT EXISTS public.nila_conversations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  last_mode     TEXT        NOT NULL DEFAULT 'normal'
                CHECK (last_mode IN ('normal', 'rant', 'figure_it_out')),
  message_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.nila_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nila_conversations: users can read own"
  ON public.nila_conversations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nila_conversations: users can insert own"
  ON public.nila_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nila_conversations: users can update own"
  ON public.nila_conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "nila_conversations: service role full access"
  ON public.nila_conversations FOR ALL USING (auth.role() = 'service_role');
