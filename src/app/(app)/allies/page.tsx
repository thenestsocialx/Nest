import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import FindAlliesShell from './_components/FindAlliesShell';
import type { AllyPublicProfile } from '@/types/findAllies';

export const metadata = {
  title: 'Find your ally — Nest',
};

export default async function AlliesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // ── Fetch user profile for topbar ────────────────────────────
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

  // ── Fetch active browsable allies ────────────────────────────
  const { data: rawAllies } = await supabase
    .from('allies')
    .select('id,display_name,primary_role,years_experience,bio,tagline,quote,pronouns,specialties,user_vibes,modalities,approach_style,photo_url,session_price,intro_price,session_durations,session_formats,languages_spoken,location,manual_priority_score,zoho_embed_url')
    .eq('is_active', true)
    .eq('onboarding_status', 'active')
    .eq('visibility_search', true)
    .is('deleted_at', null)
    .order('manual_priority_score', { ascending: false });

  const allies: AllyPublicProfile[] = (rawAllies ?? []).map(a => ({
    id: a.id,
    display_name: a.display_name ?? '',
    primary_role: a.primary_role ?? null,
    years_experience: a.years_experience ?? 0,
    bio: a.bio ?? null,
    tagline: a.tagline ?? null,
    quote: a.quote ?? null,
    pronouns: a.pronouns ?? null,
    specialties: a.specialties ?? [],
    user_vibes: a.user_vibes ?? [],
    modalities: a.modalities ?? [],
    approach_style: a.approach_style ?? null,
    photo_url: a.photo_url ?? null,
    session_price: a.session_price ?? 0,
    intro_price: a.intro_price ?? null,
    session_durations: a.session_durations ?? [],
    session_formats: a.session_formats ?? [],
    languages_spoken: a.languages_spoken ?? null,
    location: a.location ?? null,
    manual_priority_score: a.manual_priority_score ?? 5,
    zoho_embed_url: a.zoho_embed_url ?? null,
  }));

  return (
    <div className="ns-shell" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar userName={firstName} userInitial={initial} />
      <main className="ns-main" style={{ height: '100vh', overflow: 'hidden', background: '#ECE5D8' }}>
        <FindAlliesShell
          allies={allies}
          userName={firstName}
          userInitial={initial}
        />
      </main>
    </div>
  );
}
