-- ══════════════════════════════════════════════════════
-- Nest · Zoho workspace selection columns
-- Runs AFTER 20260524_admin_zoho.sql
-- ══════════════════════════════════════════════════════

-- Add workspace_id and workspace_name to the zoho_credentials singleton.
-- Both are nullable — they are populated after the admin picks a workspace
-- from the Zoho Bookings API following initial OAuth connection.

ALTER TABLE zoho_credentials
  ADD COLUMN IF NOT EXISTS workspace_id   TEXT,
  ADD COLUMN IF NOT EXISTS workspace_name TEXT;
