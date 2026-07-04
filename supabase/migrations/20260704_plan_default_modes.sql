-- Default Nila conversation mode per plan tier
-- Used as the fallback when a user has not explicitly set their own preference
INSERT INTO nest_config (key, value) VALUES
  ('plan.nila_default_mode.free',    'normal'),
  ('plan.nila_default_mode.core',    'normal'),
  ('plan.nila_default_mode.premium', 'normal')
ON CONFLICT (key) DO NOTHING;
