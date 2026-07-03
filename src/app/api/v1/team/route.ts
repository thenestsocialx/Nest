// GET  /api/v1/team        — List current staff (admin + manager roles)
// POST /api/v1/team/search — Search a user by email to preview before granting access
import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'manager';
  created_at: string;
}

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: { users: allUsers }, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    console.error('[GET /api/v1/team] listUsers error:', error.message);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }

  const staffAuth = (allUsers ?? []).filter(
    u => u.app_metadata?.role === 'admin' || u.app_metadata?.role === 'manager',
  );

  // Enrich with avatar_url from profiles table
  const staffIds = staffAuth.map(u => u.id);
  const { data: profiles } = staffIds.length
    ? await admin.from('profiles').select('id, avatar_url').in('id', staffIds)
    : { data: [] };
  const avatarMap = new Map<string, string | null>(
    (profiles ?? []).map(p => [p.id as string, p.avatar_url as string | null]),
  );

  const staff: StaffMember[] = staffAuth.map(u => ({
    id:         u.id,
    email:      u.email ?? '',
    full_name:  (u.user_metadata?.full_name as string | null) ?? null,
    avatar_url: avatarMap.get(u.id) ?? null,
    role:       u.app_metadata.role as 'admin' | 'manager',
    created_at: u.created_at,
  }));

  return NextResponse.json({ staff });
}

// POST /api/v1/team — search a user by email
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const admin = createAdminClient();
  const { data: { users: allUsers }, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }

  const found = (allUsers ?? []).find(u => u.email?.toLowerCase() === email);
  if (!found) return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });

  return NextResponse.json({
    user: {
      id:        found.id,
      email:     found.email ?? '',
      full_name: (found.user_metadata?.full_name as string | null) ?? null,
      role:      (found.app_metadata?.role as string | null) ?? null,
    },
  });
}
