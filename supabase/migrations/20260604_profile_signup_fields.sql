-- Add signup profile fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone                   TEXT,
  ADD COLUMN IF NOT EXISTS phone_country_code      TEXT DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS terms_accepted_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_completed       BOOLEAN NOT NULL DEFAULT FALSE;

-- Back-fill existing users who were already onboarded before this migration
UPDATE public.profiles
SET profile_completed = TRUE
WHERE nila_onboarded = TRUE OR onboarding_completed = TRUE;
