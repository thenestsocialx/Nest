import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ZohoTokenResponse } from '@/types/zoho';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${origin}/admin/integrations?error=zoho_auth_failed`);
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      redirect_uri: process.env.ZOHO_REDIRECT_URI!,
    });

    const tokenRes = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/admin/integrations?error=zoho_token_exchange_failed`);
    }

    const tokenData: ZohoTokenResponse = await tokenRes.json();
    if (!tokenData.access_token || !tokenData.refresh_token) {
      console.error(
        '[zoho/callback] Missing token fields — access_token:',
        !!tokenData.access_token,
        'refresh_token:',
        !!tokenData.refresh_token,
      );
      return NextResponse.redirect(`${origin}/admin/integrations?error=zoho_token_exchange_failed`);
    }

    const supabase = createAdminClient();
    const { error: upsertError } = await supabase
      .from('zoho_credentials')
      .upsert(
        {
          id: 'singleton',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          zoho_org_id: tokenData.api_domain,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    if (upsertError) {
      return NextResponse.redirect(`${origin}/admin/integrations?error=zoho_token_exchange_failed`);
    }

    return NextResponse.redirect(`${origin}/admin/integrations?success=zoho_connected`);
  } catch {
    return NextResponse.redirect(`${origin}/admin/integrations?error=zoho_token_exchange_failed`);
  }
}
