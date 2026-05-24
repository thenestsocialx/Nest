// GET /api/v1/dashboard/counts
// Lightweight counts used by the sidebar badges and topbar subtitles.
// Runs on every admin page — must stay fast (HEAD queries only).
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  // ── Auth check ───────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
