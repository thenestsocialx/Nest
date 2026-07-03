import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import MobileProfileLink from '@/components/layout/MobileProfileLink'
import ResourcesTabs from './_components/ResourcesTabs'

export const metadata = {
  title: 'Resources — Nest',
}

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: flag } = await supabase
    .from('nest_config')
    .select('value')
    .eq('key', 'features.resources.enabled')
    .maybeSingle()
  if (flag?.value !== 'true') redirect('/home')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, display_name')
    .eq('id', user.id)
    .maybeSingle()

  const firstName =
    profile?.display_name ??
    profile?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there'
  const initial = firstName[0]?.toUpperCase() ?? 'A'

  return (
    <main className="ns-main">
        <header className="ns-topbar">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">Resources</div>
            <div className="ns-topbar__sub">Curated for how you&rsquo;re feeling</div>
          </div>
          <MobileProfileLink initial={initial} />
        </header>

        {/* Replace ns-content children with real resource grid when data is available */}
        <div className="ns-content" style={{ paddingTop: 40 }}>
          <div style={{ maxWidth: '48rem', width: '100%', margin: '0 auto' }}>
            <ResourcesTabs />
          </div>
        </div>

        <BottomNav />
      </main>
  )
}
