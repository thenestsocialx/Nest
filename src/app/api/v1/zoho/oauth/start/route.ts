import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  const authUrl = new URL('https://accounts.zoho.in/oauth/v2/auth');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.ZOHO_CLIENT_ID!);
  authUrl.searchParams.set('scope', 'zohobookings.data.ALL');
  authUrl.searchParams.set('redirect_uri', process.env.ZOHO_REDIRECT_URI!);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
