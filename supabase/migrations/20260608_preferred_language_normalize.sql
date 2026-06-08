-- Normalize preferred_language values to match UI options (english/tamil/hindi).
-- The original column default was 'en' which did not match any select option in the UI,
-- causing the language dropdown to appear blank for newly signed-up users.
ALTER TABLE public.profiles
  ALTER COLUMN preferred_language SET DEFAULT 'english';

UPDATE public.profiles
SET preferred_language = 'english'
WHERE preferred_language = 'en' OR preferred_language IS NULL;
