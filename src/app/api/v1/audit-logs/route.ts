// GET /api/v1/audit-logs
// List audit log entries (admin-only).
// Query params:
//   ?event_type=  — filter by exact event type (e.g. "ally.approved")
//   ?category=    — filter by category prefix (e.g. "ally" matches ally.*)
//   ?target_type= — filter by target entity type (ally | client | system)
//   ?target_id=   — filter by specific target UUID
//   ?search=      — partial match on actor_email or target_label
//   ?from=        — ISO date/datetime lower bound (created_at >= from)
//   ?to=          — ISO date/datetime upper bound (created_at <= to)
//   ?page=1       — 1-indexed page number
//   ?limit=50     — rows per page (max 100)
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventType  = searchParams.get('event_type')?.trim()  ?? '';
  const category   = searchParams.get('category')?.trim()    ?? '';
  const targetType = searchParams.get('target_type')?.trim() ?? '';
  const targetId   = searchParams.get('target_id')?.trim()   ?? '';
  const search     = searchParams.get('search')?.trim()       ?? '';
  const from       = searchParams.get('from')?.trim()         ?? '';
  const to         = searchParams.get('to')?.trim()           ?? '';
  const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit      = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
  const offset     = (page - 1) * limit;

  const admin = createAdminClient();

  // When a search term is present we fetch all rows matching the structural
  // filters (up to 1 000) and filter client-side. This avoids embedding the
  // raw user string into PostgREST's or() logic-tree syntax, which cannot
  // handle values that contain commas, parentheses, or other reserved chars.
  const useClientSearch = search.length > 0;

  let query = admin
    .from('audit_logs')
    .select(
      'id, event_type, actor_id, actor_email, actor_role, ' +
      'target_type, target_id, target_label, action, ' +
      'old_value, new_value, metadata, created_at',
      { count: useClientSearch ? undefined : 'exact' },
    )
    .order('created_at', { ascending: false });

  if (!useClientSearch) {
    // DB-level pagination only when there is no text search
    query = query.range(offset, offset + limit - 1) as typeof query;
  } else {
    // Fetch up to 1 000 structurally-filtered rows then paginate client-side
    query = query.range(0, 999) as typeof query;
  }

  if (eventType)  query = query.eq('event_type', eventType) as typeof query;
  if (targetType) query = query.eq('target_type', targetType) as typeof query;
  if (targetId)   query = query.eq('target_id', targetId) as typeof query;
  if (from)       query = query.gte('created_at', from) as typeof query;
  if (to)         query = query.lte('created_at', to) as typeof query;

  // Category prefix filter (ally.* | client.* | system.*)
  if (category && !eventType) {
    query = query.like('event_type', `${category}.%`) as typeof query;
  }

  const { data: rawLogs, error, count } = await query;

  if (error) {
    console.error('[GET /api/v1/audit-logs]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logs: any[] = (rawLogs as any[]) ?? [];
  let total = count ?? 0;

  if (useClientSearch) {
    // Safe client-side search: the raw string is never embedded in SQL/PostgREST syntax
    const needle = search.toLowerCase();
    logs = logs.filter(l =>
      ((l.actor_email  as string | null) ?? '').toLowerCase().includes(needle) ||
      ((l.target_label as string | null) ?? '').toLowerCase().includes(needle),
    );
    total = logs.length;
    // Apply pagination to the filtered set
    logs = logs.slice(offset, offset + limit);
  }

  return NextResponse.json({ logs, total, page, limit });
}
