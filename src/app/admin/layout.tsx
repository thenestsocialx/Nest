import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { StaffRole } from '@/lib/auth-admin';
import AdminSidebar from './_components/AdminSidebar';
import AdminTopbar from './_components/AdminTopbar';
import './admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role as string | undefined;
  if (!user || (role !== 'admin' && role !== 'manager')) {
    redirect('/login');
  }

  const staffRole = role as StaffRole;
  const rawName: string = user.user_metadata?.full_name ?? user.email ?? 'Staff';
  const initials = rawName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="ns-admin-shell">
      <AdminSidebar role={staffRole} userName={rawName} userInitials={initials} />
      <div className="ns-admin-main">
        <AdminTopbar />
        <div className="ns-admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
