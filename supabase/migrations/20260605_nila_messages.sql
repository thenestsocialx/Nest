CREATE TABLE IF NOT EXISTS public.nila_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID        NOT NULL REFERENCES public.nila_conversations(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role             TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT        NOT NULL,
  mode             TEXT        NOT NULL DEFAULT 'normal'
                   CHECK (mode IN ('normal', 'rant', 'figure_it_out')),
  is_mode_opening  BOOLEAN     NOT NULL DEFAULT FALSE,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.nila_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_nila_messages_conversation_id ON public.nila_messages (conversation_id);
CREATE INDEX idx_nila_messages_user_id         ON public.nila_messages (user_id);

CREATE POLICY "nila_messages: users can read own"
  ON public.nila_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nila_messages: users can insert own"
  ON public.nila_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nila_messages: service role full access"
  ON public.nila_messages FOR ALL USING (auth.role() = 'service_role');
