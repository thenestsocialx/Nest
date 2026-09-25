-- Add is_active flag to plans so admin can enable/disable plans without deleting them.
-- At least two plans must remain active at all times (enforced by the admin UI).
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
