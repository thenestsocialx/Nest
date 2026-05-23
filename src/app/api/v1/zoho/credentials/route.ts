import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('zoho_credentials').delete().eq('id', 'singleton');

  if (error) {
    return NextResponse.json({ error: { code: 'DELETE_FAILED', message: 'Failed to disconnect Zoho.' } }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
