// POST /api/v1/allies/[id]/refresh-booking-url
//
// Fetches the current embed_url for this ally's Zoho staff record and saves it
// to zoho_embed_url in the DB. Safe to call multiple times; idempotent.
//
// Requires the ally to have a zoho_staff_id already set.
// Requires admin.

import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchZohoStaff } from '@/lib/zoho/fetchStaff';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('id, full_name, zoho_staff_id, zoho_embed_url')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  if (!ally.zoho_staff_id) {
    return NextResponse.json(
      { error: 'This ally has no Zoho staff record yet. Approve and activate them first.' },
      { status: 409 },
    );
  }

  let embedUrl: string;
  try {
    const staffData = await fetchZohoStaff(ally.zoho_staff_id as string);
    embedUrl = staffData.embed_url;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch booking URL from Zoho';
    console.error('[POST /refresh-booking-url] fetchZohoStaff error:', message);
    return NextResponse.json({ error: message, zoho_error: true }, { status: 502 });
  }

  const { error: updateError } = await admin
    .from('allies')
    .update({ zoho_embed_url: embedUrl })
    .eq('id', id);

  if (updateError) {
    console.error('[POST /refresh-booking-url] DB update error:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, zoho_embed_url: embedUrl });
}
