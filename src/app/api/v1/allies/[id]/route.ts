// GET  /api/v1/allies/[id] — Fetch ally + documents
// PATCH /api/v1/allies/[id] — Auto-save any subset of fields
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AllyPatchPayload } from '@/types/ally';

// Only these fields are accepted in PATCH to prevent over-posting
const PATCHABLE_FIELDS = new Set<string>([
  'full_name', 'display_name', 'pronouns', 'location', 'email', 'phone',
  'whatsapp', 'emergency_contact', 'tagline', 'quote', 'bio',
  'photo_url', 'photo_storage_path',
  'primary_role', 'years_experience', 'highest_qualification', 'license_number',
  'additional_certifications', 'specialties', 'modalities', 'age_groups',
  'gender_preferences', 'languages_spoken', 'languages_therapy',
  'approach_style', 'session_tones', 'user_vibes',
  'session_formats', 'session_durations', 'session_price', 'intro_price',
  'max_clients_per_week', 'buffer_minutes', 'availability',
  'visibility_search', 'visibility_bookings', 'visibility_matching', 'visibility_featured',
  'zoho_service_id',
  'admin_notes', 'doc_agreement_status',
  'match_weights', 'sort_priority', 'manual_priority_score',
  'onboarding_step', 'onboarding_status',
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const [allyResult, docsResult] = await Promise.all([
    admin.from('allies').select('*').eq('id', id).single(),
    admin.from('ally_documents').select('*').eq('ally_id', id),
  ]);

  if (allyResult.error) {
    return NextResponse.json({ error: allyResult.error.message }, { status: 404 });
  }

  return NextResponse.json({
    ally:      allyResult.data,
    documents: docsResult.data ?? [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist fields
  const updates: AllyPatchPayload = {};
  for (const [key, value] of Object.entries(body)) {
    if (PATCHABLE_FIELDS.has(key)) {
      (updates as Record<string, unknown>)[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('allies')
    .update(updates)
    .eq('id', id)
    .select('id, updated_at, onboarding_step, onboarding_status')
    .single();

  if (error) {
    console.error('[PATCH /api/v1/allies/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...data });
}
