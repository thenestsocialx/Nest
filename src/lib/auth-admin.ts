// SERVER ONLY — never import in browser code
// Shared auth helpers for admin and manager access checks.

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export type StaffRole = 'admin' | 'manager';

export interface StaffUser {
  user: User;
  role: StaffRole;
}

/** Returns the authenticated user if they are admin OR manager, otherwise null. */
export async function getStaffUser(): Promise<StaffUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role as string | undefined;
  if (!user || (role !== 'admin' && role !== 'manager')) return null;
  return { user, role: role as StaffRole };
}

/** Returns the authenticated user only if they are admin, otherwise null. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') return null;
  return user;
}
