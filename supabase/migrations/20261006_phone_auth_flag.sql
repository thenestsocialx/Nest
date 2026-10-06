-- Admin switch for phone (Firebase SMS OTP) sign-in. On by default; the app also treats a
-- missing row as on, so this seed is only for visibility in nest_config.
INSERT INTO public.nest_config (key, value, description) VALUES
  ('features.phone_auth.enabled', 'true', 'Allow sign-in and sign-up with a phone number (Firebase SMS OTP)')
ON CONFLICT (key) DO NOTHING;
