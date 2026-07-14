import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import BottomNav from '@/components/layout/BottomNav';
import FindAlliesShell from './_components/FindAlliesShell';
import type { AllyPublicProfile } from '@/types/findAllies';

export const metadata = {
  title: 'Find your ally — Nest',
  description: 'Browse therapists, coaches, and counsellors on Nest. Find an ally who gets you — filter by what matters to you and book a free intro session.',
  openGraph: {
    title: 'Find your ally — Nest',
    description: 'Browse therapists, coaches, and counsellors on Nest. Find an ally who gets you — filter by what matters to you and book a free intro session.',
  },
};

const ALLY_SELECT = 'id,display_name,primary_role,years_experience,bio,tagline,quote,pronouns,specialties,user_vibes,modalities,approach_style,photo_url,session_price,intro_price,session_durations,session_formats,languages_spoken,location,manual_priority_score,zoho_embed_url,highest_qualification,session_count'

function mapAlly(a: Record<string, unknown>): AllyPublicProfile {
  return {
    id: a.id as string,
    display_name: (a.display_name as string) ?? '',
    primary_role: (a.primary_role as string) ?? null,
    years_experience: (a.years_experience as number) ?? 0,
    bio: (a.bio as string) ?? null,
    tagline: (a.tagline as string) ?? null,
    quote: (a.quote as string) ?? null,
    pronouns: (a.pronouns as string) ?? null,
    specialties: (a.specialties as string[]) ?? [],
    user_vibes: (a.user_vibes as string[]) ?? [],
    modalities: (a.modalities as string[]) ?? [],
    approach_style: (a.approach_style as string) ?? null,
    photo_url: (a.photo_url as string) ?? null,
    session_price: (a.session_price as number) ?? 0,
    intro_price: (a.intro_price as number) ?? null,
    session_durations: (a.session_durations as string[]) ?? [],
    session_formats: (a.session_formats as string[]) ?? [],
    languages_spoken: (a.languages_spoken as string) ?? null,
    location: (a.location as string) ?? null,
    manual_priority_score: (a.manual_priority_score as number) ?? 5,
    zoho_embed_url: (a.zoho_embed_url as string) ?? null,
    highest_qualification: (a.highest_qualification as string) ?? null,
    session_count: (a.session_count as number) ?? 0,
  }
}

export default async function AlliesPage({ searchParams }: { searchParams: Promise<{ highlight?: string }> }) {
  const params = await searchParams
  const highlightId = params.highlight ?? null

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── Guest view (unauthenticated) ────────────────────────────
  if (!user) {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawAllies } = await (admin as any)
      .from('allies')
      .select(ALLY_SELECT)
      .eq('is_active', true)
      .eq('onboarding_status', 'active')
      .eq('visibility_search', true)
      .is('deleted_at', null)
      .order('manual_priority_score', { ascending: false });

    const allies: AllyPublicProfile[] = (rawAllies ?? []).map(mapAlly);

    return (
      <main className="ns-main">
        <FindAlliesShell
          allies={allies}
          userName=""
          userInitial=""
          highlightId={highlightId}
          isGuest
        />
      </main>
    );
  }

  // ── Authenticated view ───────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, display_name')
    .eq('id', user.id)
    .maybeSingle();

  const firstName =
    profile?.display_name ??
    profile?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there';
  const initial = firstName[0]?.toUpperCase() ?? 'A';

  const { data: rawAllies } = await supabase
    .from('allies')
    .select(ALLY_SELECT)
    .eq('is_active', true)
    .eq('onboarding_status', 'active')
    .eq('visibility_search', true)
    .is('deleted_at', null)
    .order('manual_priority_score', { ascending: false });

  const allies: AllyPublicProfile[] = (rawAllies ?? []).map(mapAlly);

  return (
    <main className="ns-main">
      <FindAlliesShell
        allies={allies}
        userName={firstName}
        userInitial={initial}
        highlightId={highlightId}
      />
      <BottomNav />
    </main>
  );
}
