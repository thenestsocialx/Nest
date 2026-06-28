-- Seed plan-level Nila mode config.
-- free gets Normal only; core adds Rant; premium gets all three.
-- ON CONFLICT DO NOTHING makes this safe to re-run.
INSERT INTO nest_config (key, value, description) VALUES
  ('plan.nila_modes.free',    'normal',                    'Enabled Nila modes for free plan (comma-separated)'),
  ('plan.nila_modes.core',    'normal,rant',               'Enabled Nila modes for core plan (comma-separated)'),
  ('plan.nila_modes.premium', 'normal,rant,figure_it_out', 'Enabled Nila modes for premium plan (comma-separated)')
ON CONFLICT (key) DO NOTHING;
