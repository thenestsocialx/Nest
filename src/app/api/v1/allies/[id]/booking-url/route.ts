// POST /api/v1/allies/[id]/booking-url
//
// User-accessible endpoint: returns the ally's booking URL.
// If the URL is already in the DB it is returned immediately (no Zoho call).
// If the DB value is null, the URL is fetched from Zoho, saved to the DB,
// and then returned — so subsequent requests are fast.
//
// Requires any authenticated user (not admin-only).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchZohoStaff } from '@/lib/zoho/fetchStaff';
import { ZohoTokenError } from '@/lib/zoho/types';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = createAdminClient();

  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('id, zoho_staff_id, zoho_embed_url')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  // URL already cached — return it without hitting Zoho.
  if (ally.zoho_embed_url) {
    return NextResponse.json({ zoho_embed_url: ally.zoho_embed_url });
  }

  if (!ally.zoho_staff_id) {
    return NextResponse.json(
      { error: "This ally's Zoho account hasn't been activated yet." },
      { status: 409 },
    );
  }

  let embedUrl: string;
  try {
    const staffData = await fetchZohoStaff(ally.zoho_staff_id as string);
    embedUrl = staffData.embed_url;
  } catch (err) {
    if (err instanceof ZohoTokenError) {
      console.error('[POST /booking-url] Zoho token error:', err.code);
      return NextResponse.json(
        {
          error: 'The Zoho integration has expired and needs to be reconnected. Please contact support.',
          zoho_token_error: true,
          code: err.code,
        },
        { status: 502 },
      );
    }
    const message = err instanceof Error ? err.message : 'Failed to fetch booking URL from Zoho';
    console.error('[POST /booking-url] Zoho API error:', message);
    return NextResponse.json({ error: message, zoho_error: true }, { status: 502 });
  }

  // Persist the URL so future requests skip the Zoho call.
  const { error: updateError } = await admin
    .from('allies')
    .update({ zoho_embed_url: embedUrl })
    .eq('id', id);

  if (updateError) {
    console.error('[POST /booking-url] DB update error:', updateError);
    // Non-fatal: return the URL even if the save fails.
  }

  return NextResponse.json({ zoho_embed_url: embedUrl });
}
