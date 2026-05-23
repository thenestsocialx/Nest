import { createAdminClient } from '@/lib/supabase/admin';
import ZohoCard from './_components/ZohoCard';
import IntegrationsToast from './_components/IntegrationsToast';

const ENV_KEYS = [
  'ZOHO_CLIENT_ID',
  'ZOHO_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'SUPABASE_SERVICE_KEY',
  'DEEPGRAM_API_KEY',
] as const;

const OTHER_INTEGRATIONS = [
  { icon: '💳', name: 'Stripe', desc: 'Payment processing · India', status: 'live' as const, action: 'Webhook log' },
  { icon: '🤖', name: 'Anthropic API', desc: 'Nila AI backbone · Claude', status: 'live' as const, action: 'Usage' },
  { icon: '📧', name: 'Resend', desc: 'Transactional email', status: 'live' as const, action: 'Stats' },
  { icon: '📊', name: 'PostHog', desc: 'Product analytics', status: 'live' as const, action: 'Open' },
  { icon: '🛡️', name: 'Sentry', desc: 'Error tracking', status: 'warn' as const, statusText: '2 issues', action: 'View' },
];

export default async function IntegrationsPage() {
  const adminClient = createAdminClient();
  const { data: zohoRow } = await adminClient
    .from('zoho_credentials')
    .select('expires_at, updated_at, zoho_org_id, workspace_id, workspace_name')
    .eq('id', 'singleton')
    .maybeSingle();

  const zohoConnected = !!zohoRow;

  return (
    <>
      <IntegrationsToast />

      {/* Info notice */}
      <div className="ns-notice">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ns-forest)" strokeWidth="1.4" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/>
        </svg>
        <span>Client IDs and secrets are loaded from environment variables — they are never stored in the database. Only OAuth tokens are persisted (encrypted at rest).</span>
      </div>

      {/* Zoho card */}
      <div className="ns-card">
        <div className="ns-card__head">
          <div>
            <div className="ns-card__label">Zoho Bookings</div>
            <div className="ns-card__title">Ally session scheduling</div>
          </div>
          <div style={{ fontSize: 28 }}>📅</div>
        </div>
        <ZohoCard
          connected={zohoConnected}
          expiresAt={zohoRow?.expires_at ?? null}
          lastUpdated={zohoRow?.updated_at ?? null}
          orgId={zohoRow?.zoho_org_id ?? null}
          workspaceId={zohoRow?.workspace_id ?? null}
          workspaceName={zohoRow?.workspace_name ?? null}
        />
      </div>

      {/* Other integrations */}
      <div className="ns-card">
        <div className="ns-card__label" style={{ marginBottom: 12 }}>Other integrations</div>
        {OTHER_INTEGRATIONS.map((integ) => (
          <div key={integ.name} className="ns-connect">
            <div className="ns-connect__icon">{integ.icon}</div>
            <div className="ns-connect__body">
              <div className="ns-connect__name">{integ.name}</div>
              <div className="ns-connect__desc">{integ.desc}</div>
            </div>
            <div className="ns-connect__actions">
              <div className="ns-status">
                <span className={`ns-status__dot ns-status__dot--${integ.status === 'live' ? 'live' : 'warn'}`} />
                {integ.statusText ?? 'Live'}
              </div>
              <button className="ns-btn ns-btn--ghost ns-btn--sm">{integ.action}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Env vault */}
      <div className="ns-card">
        <div className="ns-card__label" style={{ marginBottom: 12 }}>Environment vault</div>
        {ENV_KEYS.map((key) => {
          const present = !!process.env[key];
          return (
            <div key={key} className="ns-env-row">
              <span className="ns-env-key">{key}</span>
              {present ? (
                <span className="ns-env-present">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
                  Present
                </span>
              ) : (
                <span className="ns-env-missing">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l8 8M10 2L2 10"/></svg>
                  Missing
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
