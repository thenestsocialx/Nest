// GET /api/v1/dashboard/counts
// Lightweight counts used by the sidebar badges and topbar subtitles.
// Runs on every admin page — must stay fast (HEAD queries only).
import { NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Pending applications = allies in 'submitted' or 'approved' state
  const { count: applications, error } = await admin
    .from('allies')
    .select('*', { count: 'exact', head: true })
    .in('onboarding_status', ['submitted', 'approved'])
    .is('deleted_at', null);

  if (error) {
    console.error('[GET /api/v1/dashboard/counts]', error.message);
    return NextResponse.json({ applications: 0 });
  }

  return NextResponse.json({ applications: applications ?? 0 });
}
