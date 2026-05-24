// POST /api/v1/allies/[id]/submit
// Final submission: validates all required fields, creates Zoho staff, saves zoho_staff_id
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { addZohoStaff, genderFromPronouns } from '@/lib/zoho/addStaff';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Admin-only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch full ally record
  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  // Already submitted — skip Zoho call, just return existing ID
  if (ally.zoho_staff_id) {
    return NextResponse.json({
      ok:            true,
      zoho_staff_id: ally.zoho_staff_id,
      already_exists: true,
    });
  }

  // Server-side validation of required fields
  const missing: string[] = [];
  if (!ally.full_name?.trim()) missing.push('Full name (Step 1)');
  if (!ally.email?.trim())     missing.push('Email (Step 1)');
  if (!ally.phone?.trim())     missing.push('Phone (Step 1)');
  if (!ally.pronouns)          missing.push('Pronouns (Step 1)');
  if (!ally.location?.trim())  missing.push('Location (Step 1)');
  if (!ally.tagline?.trim())   missing.push('Tagline (Step 1)');
  if (!ally.quote?.trim())     missing.push('Quote (Step 1)');

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  // Create Zoho staff
  let zohoStaffId: string;
  try {
    const result = await addZohoStaff({
      name:            ally.full_name,
      email:           ally.email,
      gender:          genderFromPronouns(ally.pronouns),
      role:            'Staff',
      phone:           ally.phone  ?? undefined,
      designation:     ally.primary_role ?? undefined,
      additional_info: ally.bio    ?? undefined,
    });
    zohoStaffId = result.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Zoho staff creation failed';
    console.error('[POST /submit] Zoho error:', message);
    return NextResponse.json(
      { error: message, zoho_error: true },
      { status: 502 },
    );
  }

  // Save zoho_staff_id and mark submitted
  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      zoho_staff_id:     zohoStaffId,
      onboarding_status: 'submitted',
      onboarding_step:   5,
    })
    .eq('id', id)
    .select('id, zoho_staff_id, onboarding_status')
    .single();

  if (updateError) {
    console.error('[POST /submit] DB update error:', updateError);
    // Zoho staff was created — return the ID even if DB update failed
    return NextResponse.json(
      {
        ok:            true,
        zoho_staff_id: zohoStaffId,
        warning:       `DB update failed: ${updateError.message} — Zoho ID: ${zohoStaffId}`,
      },
      { status: 207 },
    );
  }

  return NextResponse.json({
    ok:            true,
    zoho_staff_id: zohoStaffId,
    ally:          updated,
  });
}
