import { createAdminClient } from '@/lib/supabase/admin';
import ZohoCard from './_components/ZohoCard';
import IntegrationsToast from './_components/IntegrationsToast';

export default async function IntegrationsPage() {
  const adminClient = createAdminClient();
  const { data: zohoRow } = await adminClient
    .from('zoho_credentials')
    .select('zoho_org_id, workspace_id, workspace_name')
    .eq('id', 'singleton')
    .maybeSingle();

  const zohoConnected = !!zohoRow;

  return (
    <>
      <IntegrationsToast />

      {/* Zoho card */}
      <div className="ns-card">
        <div className="ns-card__head">
          <div className="ns-card__label">Zoho Bookings</div>
        </div>
        <ZohoCard
          connected={zohoConnected}
          orgId={zohoRow?.zoho_org_id ?? null}
          workspaceId={zohoRow?.workspace_id ?? null}
          workspaceName={zohoRow?.workspace_name ?? null}
        />
      </div>
    </>
  );
}
