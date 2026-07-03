// GET /api/v1/clients
// List client profiles (admin-only).
// Query params:
//   ?search=   — filter by name or email (case-insensitive, partial)
//   ?plan=     — filter by plan (free | core | premium)
//   ?status=   — filter by subscription_status (active | payment_failed | cancelled)
//   ?flag=true — filter only safety-flagged clients
//   ?page=1    — 1-indexed page number
//   ?limit=50  — rows per page (max 100)
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search  = searchParams.get('search')?.trim() ?? '';
  const plan    = searchParams.get('plan')?.trim() ?? '';
  const status  = searchParams.get('status')?.trim() ?? '';
  const flagged = searchParams.get('flag') === 'true';
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit   = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
  const offset  = (page - 1) * limit;

  const admin = createAdminClient();

  // ── Fetch profiles ───────────────────────────────────────────
  let query = admin
    .from('profiles')
    .select(
      'id, full_name, display_name, avatar_url, primary_concern, preferred_language, ' +
      'onboarding_completed, nila_onboarded, plan, credits, nila_message_count, ' +
      'safety_flag, safety_flag_reason, subscription_status, last_active_at, ' +
      'created_at, updated_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (plan)    query = query.eq('plan', plan) as typeof query;
  if (status)  query = query.eq('subscription_status', status) as typeof query;
  if (flagged) query = query.eq('safety_flag', true) as typeof query;
  if (search)  query = query.ilike('full_name', `%${search}%`) as typeof query;

  const { data: profiles, error, count } = await query;

  if (error) {
    console.error('[GET /api/v1/clients]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Enrich with emails from auth.users ───────────────────────
  // Fetch all users from auth (paginated via listUsers) and build an id→email map.
  // We only fetch up to 1000 users; for larger datasets a targeted approach is needed.
  const listResult = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = listResult.data?.users ?? [];
  const emailMap = new Map<string, string>(
    authUsers.map((u: { id: string; email?: string }) => [u.id, u.email ?? '']),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileList: any[] = (profiles as any[]) ?? [];
  const clients = profileList.map(p => ({
    ...p,
    email: emailMap.get(p.id as string) ?? null,
  }));

  // If search was used and email search is needed, filter client-side too
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered: any[] = search
    ? clients.filter(c =>
        (c.full_name as string | null)?.toLowerCase().includes(search.toLowerCase()) ||
        ((c.email as string | null) ?? '').toLowerCase().includes(search.toLowerCase()) ||
        ((c.display_name as string | null) ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : clients;

  return NextResponse.json({ clients: filtered, total: count ?? 0, page, limit });
}
