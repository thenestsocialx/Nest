// POST /api/v1/allies — Create a blank draft ally record
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  // Admin-only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('allies')
    .insert({
      display_name:      '',
      onboarding_status: 'draft',
      onboarding_step:   1,
      is_active:         false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[POST /api/v1/allies]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
