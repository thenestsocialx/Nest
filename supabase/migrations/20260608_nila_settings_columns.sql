ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nila_default_mode  TEXT    NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS nila_language      TEXT    NOT NULL DEFAULT 'english',
  ADD COLUMN IF NOT EXISTS nila_nudge_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nila_nudge_time    TEXT    NOT NULL DEFAULT 'evening';
