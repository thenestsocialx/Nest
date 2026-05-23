import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from './_components/AdminSidebar';
import AdminTopbar from './_components/AdminTopbar';
import './admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="ns-admin-shell">
      <AdminSidebar />
      <div className="ns-admin-main">
        <AdminTopbar />
        <div className="ns-admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
