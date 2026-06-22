INSERT INTO public.nest_config (key, value, description) VALUES
  ('features.resources.enabled', 'false', 'Show Resources section to app users'),
  ('features.events.enabled',    'false', 'Show Events section to app users')
ON CONFLICT (key) DO NOTHING;
