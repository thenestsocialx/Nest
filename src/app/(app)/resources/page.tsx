import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import ResourcesTabs from './_components/ResourcesTabs'

export const metadata = {
  title: 'Resources — Nest',
}

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    <div className="ns-shell">
      <Sidebar userName={firstName} userInitial={initial} />

      <main className="ns-main">
        <header className="ns-topbar">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">Resources</div>
            <div className="ns-topbar__sub">Curated for how you&rsquo;re feeling</div>
          </div>
        </header>

        {/* Replace ns-content children with real resource grid when data is available */}
        <div className="ns-content">
          <ResourcesTabs />
        </div>

        <BottomNav />
      </main>
    </div>
  )
}
