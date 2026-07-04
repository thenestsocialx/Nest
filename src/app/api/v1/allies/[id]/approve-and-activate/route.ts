// POST /api/v1/allies/[id]/approve-and-activate
//
// Merged action: replaces the old two-step approve → activate flow.
//
// Step 1 — Create Zoho staff record (skipped if zoho_staff_id already exists)
// Step 2 — Create Zoho services for each session duration
// Step 3 — Set onboarding_status = "active", is_active = true in DB
//
// Accepts allies in "submitted" OR "approved" (recovery) state.
// If Zoho service creation fails after staff is created, the ally is moved to
// "approved" and the zoho_staff_id is saved so step 1 is not repeated on retry.
//
// Requires admin.

import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { addZohoStaff, genderFromPronouns } from '@/lib/zoho/addStaff';
import { createAllyServices } from '@/lib/zoho/addService';
import { fetchZohoStaff } from '@/lib/zoho/fetchStaff';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { user, role: actorRole } = staff;

  const admin = createAdminClient();

  // Fetch full ally record (needs all profile fields for Zoho)
  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  // Already fully active — idempotent
  if (ally.is_active && ally.onboarding_status === 'active') {
    return NextResponse.json({ ok: true, already_active: true, ally });
  }

  // Must be in "submitted" or "approved" (recovery) state
  if (!['submitted', 'approved'].includes(ally.onboarding_status as string)) {
    return NextResponse.json(
      {
        error: `Cannot approve — current status is "${ally.onboarding_status}". ` +
               `Ally must be in "submitted" or "approved" state.`,
      },
      { status: 409 },
    );
  }

  // ── Step 1: Zoho staff ───────────────────────────────────────────────────────
  let zohoStaffId: string;

  if (ally.zoho_staff_id) {
    // Already created (approved recovery path or re-try after a DB failure)
    zohoStaffId = ally.zoho_staff_id as string;
    console.log('[POST /approve-and-activate] reusing zoho_staff_id:', zohoStaffId);
  } else {
    try {
      const preSelectedServiceId = ally.zoho_service_id as string | null | undefined;
      const result = await addZohoStaff({
        name:             ally.full_name,
        email:            ally.email,
        gender:           genderFromPronouns(ally.pronouns),
        role:             'Staff',
        phone:            ally.phone        ?? undefined,
        designation:      ally.primary_role ?? undefined,
        additional_info:  ally.bio          ?? undefined,
        assigned_services: preSelectedServiceId ? [preSelectedServiceId] : undefined,
      });
      zohoStaffId = result.id;
      console.log('[POST /approve-and-activate] Zoho staff created:', zohoStaffId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Zoho staff creation failed';
      console.error('[POST /approve-and-activate] Zoho staff error:', message);
      return NextResponse.json(
        { error: message, zoho_error: true, step: 'staff' },
        { status: 502 },
      );
    }
  }

  // ── Step 1.5: Fetch staff from Zoho — verify + capture embed_url ─────────────
  let zohoEmbedUrl: string | null = null;
  let embedUrlMissing = false;
  try {
    const staffData = await fetchZohoStaff(zohoStaffId);
    zohoEmbedUrl = staffData.embed_url;
    console.log('[POST /approve-and-activate] zoho embed_url captured');
  } catch (err) {
    embedUrlMissing = true;
    console.warn(
      '[POST /approve-and-activate] fetchZohoStaff failed (non-fatal):',
      err instanceof Error ? err.message : err,
    );
  }

  // ── Step 2: Zoho services ────────────────────────────────────────────────────
  // If the ally already has a pre-selected Zoho service (from Step 3 / zoho_services table),
  // we passed it as assigned_services during staff creation above — no new service needed.
  // Only fall back to createAllyServices for allies that don't have a pre-selected service.
  let zohoServiceIds: Record<string, string> =
    (ally.zoho_service_ids as Record<string, string> | null) ?? {};

  const existingServiceId = ally.zoho_service_id as string | null | undefined;

  if (!existingServiceId) {
    const durations  = (ally.session_durations as string[] | null) ?? [];
    const price      = (ally.session_price     as number   | null) ?? 0;
    const allyName   = (ally.full_name         as string   | null) ?? 'Ally';

    const missedDurations = durations.filter(d => !zohoServiceIds[d]);

    if (missedDurations.length > 0) {
      try {
        const newServiceIds = await createAllyServices(
          missedDurations,
          price,
          allyName,
          zohoStaffId,
        );
        zohoServiceIds = { ...zohoServiceIds, ...newServiceIds };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Zoho service creation failed';
        console.error('[POST /approve-and-activate] Zoho service error:', message);

        // Persist the staff ID we just created so retrying skips step 1
        await admin
          .from('allies')
          .update({ zoho_staff_id: zohoStaffId, onboarding_status: 'approved' })
          .eq('id', id);

        return NextResponse.json(
          { error: message, zoho_error: true, step: 'services', zoho_staff_id: zohoStaffId },
          { status: 502 },
        );
      }
    }
  } else {
    console.log('[POST /approve-and-activate] skipping service creation — using pre-selected service:', existingServiceId);
  }

  // ── Step 3: Persist to DB — ally is now fully active ────────────────────────
  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      zoho_staff_id:     zohoStaffId,
      zoho_service_ids:  zohoServiceIds,
      zoho_embed_url:    zohoEmbedUrl,
      onboarding_status: 'active',
      is_active:         true,
    })
    .eq('id', id)
    .select('id, full_name, is_active, onboarding_status, zoho_staff_id, zoho_service_ids, zoho_embed_url')
    .single();

  if (updateError) {
    console.error('[POST /approve-and-activate] DB error:', updateError);
    // Both Zoho records exist — return partial success with IDs so they are not lost
    return NextResponse.json(
      {
        ok:               false,
        warning:          `DB update failed: ${updateError.message}`,
        zoho_staff_id:    zohoStaffId,
        zoho_service_ids: zohoServiceIds,
      },
      { status: 207 },
    );
  }

  // Fire-and-forget audit log (single combined event for the merged action)
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   'ally.activated',
    target_type:  'ally',
    target_id:    id,
    target_label: allyName,
    action:       'approved and activated',
    old_value:    { onboarding_status: ally.onboarding_status as string, is_active: false },
    new_value:    { onboarding_status: 'active', is_active: true },
  });

  return NextResponse.json({
    ok: true,
    ally: updated,
    ...(embedUrlMissing && {
      embed_url_warning: 'Booking URL could not be fetched from Zoho. The ally is live but their booking page will not load for clients until the URL is set. You can fix this by editing the ally profile.',
    }),
  });
}
