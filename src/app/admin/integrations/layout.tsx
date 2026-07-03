import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth-admin';

export default async function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/dashboard');
  return <>{children}</>;
}
