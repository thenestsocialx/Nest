// GET /api/v1/dashboard/stats
// Full dashboard statistics — used only by the dashboard page.
// All queries run in parallel via Promise.allSettled so a single
// table failure never breaks the entire response.
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

  // Start of today in UTC (Supabase stores timestamps in UTC)
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  // ── Parallel queries ─────────────────────────────────────────
  const [
    totalUsersRes,
    activeSubsRes,
    paymentFailsRes,
    totalAlliesRes,
    activeAlliesRes,
    pendingAppsRes,
    auditLogsRes,
    allySnapshotRes,
    nilaMessagesTodayRes,
    weeklyActivityRes,
    sessionsTotalRes,
    sessionsCompletedRes,
    sessionsPendingRes,
    safetyFlagRes,
    mrrRes,
  ] = await Promise.allSettled([
    // 1. Total user profiles
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true }),

    // 2. Active paid subscriptions (plan != 'free' AND status = 'active')
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('plan', 'free')
      .eq('subscription_status', 'active'),

    // 3. Payment failures
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'payment_failed'),

    // 4. Total allies (non-deleted)
    admin
      .from('allies')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),

    // 5. Active allies
    admin
      .from('allies')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('deleted_at', null),

    // 6. Pending applications (submitted + approved)
    admin
      .from('allies')
      .select('*', { count: 'exact', head: true })
      .in('onboarding_status', ['submitted', 'approved'])
      .is('deleted_at', null),

    // 7. Recent audit logs (last 5 events)
    admin
      .from('audit_logs')
      .select('id, event_type, actor_email, target_label, action, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

    // 8. Active ally snapshot (top 5 by most recently updated)
    admin
      .from('allies')
      .select('id, full_name, email, specialties, is_active, onboarding_status')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(5),

    // 9. Nila messages sent today (UTC midnight boundary)
    admin
      .from('nila_messages')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', todayUTC.toISOString())
      .is('deleted_at', null),

    // 10. Weekly Nila activity — per-day counts for last 7 days
    admin.rpc('nila_weekly_counts'),

    // 11. Total sessions (all time)
    admin
      .from('sessions')
      .select('*', { count: 'exact', head: true }),

    // 12. Completed sessions
    admin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),

    // 13. Pending / active sessions
    admin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['requested', 'confirmed']),

    // 14. Safety-flagged users
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('safety_flag', true),

    // 15. MRR — sum plan prices for active subscriptions
    admin
      .from('subscriptions')
      .select('plans(price_inr)')
      .eq('status', 'active'),
  ]);

  // ── Safe extractors ──────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function safeCount(res: PromiseSettledResult<any>): number {
    if (res.status === 'fulfilled' && !res.value.error) {
      return (res.value.count as number | null) ?? 0;
    }
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function safeData<T>(res: PromiseSettledResult<any>): T[] {
    if (res.status === 'fulfilled' && !res.value.error) {
      return (res.value.data as T[] | null) ?? [];
    }
    return [];
  }

  // MRR: sum price_inr across all active subscriptions.
  // Supabase returns the FK relation as an array even for one-to-one joins.
  function safeMrr(): number {
    if (mrrRes.status !== 'fulfilled' || mrrRes.value.error) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (mrrRes.value.data ?? []) as any[];
    return rows.reduce((sum: number, row: any) => {
      const plan = Array.isArray(row.plans) ? row.plans[0] : row.plans;
      return sum + (plan?.price_inr ?? 0);
    }, 0);
  }

  return NextResponse.json({
    totalUsers:          safeCount(totalUsersRes),
    activeSubscriptions: safeCount(activeSubsRes),
    paymentFailures:     safeCount(paymentFailsRes),
    totalAllies:         safeCount(totalAlliesRes),
    activeAllies:        safeCount(activeAlliesRes),
    pendingApplications: safeCount(pendingAppsRes),
    recentAuditLogs:     safeData(auditLogsRes),
    allySnapshot:        safeData(allySnapshotRes),
    nilaMessagesToday:   safeCount(nilaMessagesTodayRes),
    weeklyActivity:      safeData<{ day: string; cnt: number }>(weeklyActivityRes),
    sessionsTotal:       safeCount(sessionsTotalRes),
    sessionsCompleted:   safeCount(sessionsCompletedRes),
    sessionsPending:     safeCount(sessionsPendingRes),
    safetyFlagCount:     safeCount(safetyFlagRes),
    mrrInr:              safeMrr(),
  });
}
