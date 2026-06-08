CREATE TABLE IF NOT EXISTS public.nest_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.nest_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nest_config: authenticated users can read"
  ON public.nest_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "nest_config: service role full access"
  ON public.nest_config FOR ALL USING (auth.role() = 'service_role');

INSERT INTO public.nest_config (key, value, description) VALUES
  ('nila.free_daily_message_limit',   '10',                                                                                      'Max messages per day for free users'),
  ('nila.session_restore_window_hours','24',                                                                                      'Hours within which an open session is restored'),
  ('nila.history_retention_days',     '90',                                                                                      'Days before conversation history is hard deleted'),
  ('nila.max_topics_displayed',       '3',                                                                                       'Max topic chips shown in the Topics Tonight rail'),
  ('nila.greeting_pool.morning',      'Good morning. What''s on your mind today?|Hey, morning. I''m here whenever you''re ready.|Morning. No rush — what''s going on?',
                                                                                                                                  'Pipe-separated greeting pool for morning sessions'),
  ('nila.greeting_pool.afternoon',    'Hey. I''m here — what''s going on?|Afternoon. What''s on your mind?|Hey. Take your time — I''m listening.',
                                                                                                                                  'Pipe-separated greeting pool for afternoon sessions'),
  ('nila.greeting_pool.evening',      'Hey. I''m Nila. I''m here to listen — no rush, no judgment. What''s on your mind?|Evening. Long day? I''m here.|Hey. What are you carrying tonight?',
                                                                                                                                  'Pipe-separated greeting pool for evening sessions'),
  ('nila.greeting_pool.night',        'Hey. Couldn''t sleep, or just needed somewhere to put it?|Late night. I''m here — what''s going on?|Hey. It''s late. I''m listening.',
                                                                                                                                  'Pipe-separated greeting pool for night sessions')
ON CONFLICT (key) DO NOTHING;
