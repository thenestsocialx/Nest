# 🛡️ Nest Admin Panel — Complete Implementation Prompt
> Generated from a full analysis of the `user_manickavasagam` branch.
> Paste this entire file as your prompt in a new Claude Code session on the target branch.

---

## ⚠️ AUTHORITATIVE UI DESIGN REFERENCES

**Two HTML files in `screens/` are the pixel-perfect design source of truth. Read them before building ANY page, component, or CSS class.**

| File | What it governs |
|---|---|
| `screens/nest-admin-panel.html` | All 7 admin pages (dashboard, pricing, integrations, resources, events, allies, users), sidebar, topbar, CSS design system — this is the canonical reference |
| `screens/NEST_Admin_Onboarding.html` | Sidebar menu extended with Allies sub-section + System section; full 5-step Ally Onboarding multi-form page (`/admin/allies/onboard`) |

**Workflow:** Open each HTML file in a browser first to see exactly what you're building. Every class name, color token, layout, and piece of copy in those files must be reproduced faithfully in React/TypeScript.

---

## CONTEXT

You are implementing the `/admin` console for the **Nest** mental-wellness platform. This is a Next.js 16 (App Router) project using Supabase Auth + PostgreSQL, TypeScript, and Tailwind v4. The admin panel is a fully server-rendered, role-gated console with Zoho Bookings OAuth integration and **nine** sub-pages (7 standard + 1 ally list + 1 ally onboarding form).

Before writing any code, **read** `node_modules/next/dist/docs/` for Next.js 16 API conventions — they differ from earlier versions. Follow all patterns already established in the codebase (check `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/app/(app)/layout.tsx`, and `src/app/globals.css`).

---

## PHASE 0 — ORIENTATION (do this first, write nothing yet)

1. Run `git status` and `git log --oneline -10` to understand the branch state.
2. Read `AGENTS.md` and `CLAUDE.md` for project-level constraints.
3. Read these existing files so you match established patterns exactly:
   - `src/lib/supabase/server.ts` — server client factory
   - `src/lib/supabase/admin.ts` — service-role client factory
   - `src/app/layout.tsx` — root layout (fonts, globals)
   - `src/app/globals.css` — global CSS variables and resets
   - `src/app/(auth)/login/page.tsx` — login page (admin redirect target)
   - `supabase/migrations/` — all existing migrations (understand schema)
   - `.env.example` — all required environment variables
4. Check `src/types/` for any existing type files.
5. Verify the `allies` and `sessions` tables exist in migrations — if not, the Zoho migration must create them.
6. **Open `screens/nest-admin-panel.html` in a browser** — study the full layout, all 7 pages, all CSS classes.
7. **Open `screens/NEST_Admin_Onboarding.html` in a browser** — study the sidebar extensions and the 5-step onboarding form.

---

## PHASE 1 — DATABASE MIGRATION

Create file: `supabase/migrations/20260524_admin_zoho.sql`

```sql
-- ══════════════════════════════════════════════════════
-- Nest · Admin + Zoho integration schema
-- ══════════════════════════════════════════════════════

-- zoho_credentials: singleton row, service-role access only
CREATE TABLE IF NOT EXISTS zoho_credentials (
  id          TEXT PRIMARY KEY DEFAULT 'singleton',
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  zoho_org_id   TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Block ALL client-side access — only service role may touch this table
ALTER TABLE zoho_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_all_client_access" ON zoho_credentials
  AS RESTRICTIVE
  USING (false);

-- allies table (create if not already present from earlier migrations)
CREATE TABLE IF NOT EXISTS allies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio          TEXT,
  specialties  TEXT[],
  is_active    BOOLEAN DEFAULT false,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Zoho columns on allies
ALTER TABLE allies
  ADD COLUMN IF NOT EXISTS zoho_staff_id    TEXT,
  ADD COLUMN IF NOT EXISTS zoho_service_ids JSONB;
-- zoho_service_ids shape: { "30min": "service_id_xxx", "60min": "service_id_yyy" }

-- Allies RLS: public browse for active, non-deleted profiles
ALTER TABLE allies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'allies' AND policyname = 'public_read_allies'
  ) THEN
    CREATE POLICY "public_read_allies" ON allies
      FOR SELECT USING (is_active = true AND deleted_at IS NULL);
  END IF;
END $$;

-- sessions table (create if not already present)
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ally_id    UUID REFERENCES allies(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at   TIMESTAMPTZ,
  status     TEXT DEFAULT 'pending'
);

-- Zoho columns on sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS zoho_booking_id     TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS zoho_appointment_id TEXT;

-- Sessions RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'user_own_sessions'
  ) THEN
    CREATE POLICY "user_own_sessions" ON sessions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'ally_own_sessions'
  ) THEN
    CREATE POLICY "ally_own_sessions" ON sessions
      FOR SELECT USING (
        ally_id IN (SELECT id FROM allies WHERE user_id = auth.uid())
      );
  END IF;
END $$;
```

Apply via the Supabase MCP tool (`mcp__plugin_supabase_supabase__apply_migration`) or note it must be run manually.

---

## PHASE 2 — TYPES

### File: `src/types/zoho.ts`

```typescript
export interface ZohoTokenRow {
  id: 'singleton';
  access_token: string;
  refresh_token: string;
  expires_at: string;
  zoho_org_id: string | null;
  updated_at: string;
}

export interface ZohoStatusResponse {
  connected: boolean;
  expires_at: string | null;
  last_updated: string | null;
  org_id: string | null;
}

export interface ZohoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
}

export class ZohoTokenError extends Error {
  constructor(public readonly code: 'NOT_CONNECTED' | 'REFRESH_FAILED') {
    super(`Zoho token error: ${code}`);
    this.name = 'ZohoTokenError';
  }
}

export class ZohoAPIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ZohoAPIError';
  }
}
```

---

## PHASE 3 — ZOHO LIBRARY

### File: `src/lib/zoho/types.ts`
```typescript
export type { ZohoTokenRow, ZohoStatusResponse, ZohoTokenResponse } from '@/types/zoho';
export { ZohoTokenError, ZohoAPIError } from '@/types/zoho';
```

### File: `src/lib/zoho/tokenManager.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import type { ZohoTokenRow } from './types';
import { ZohoTokenError } from './types';

async function refreshAccessToken(
  row: Pick<ZohoTokenRow, 'refresh_token'>,
): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: row.refresh_token,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
  });

  let res: Response;
  try {
    res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch {
    throw new ZohoTokenError('REFRESH_FAILED');
  }

  if (!res.ok) throw new ZohoTokenError('REFRESH_FAILED');

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token || data.expires_in == null) throw new ZohoTokenError('REFRESH_FAILED');

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('zoho_credentials')
    .update({ access_token: data.access_token, expires_at: newExpiresAt, updated_at: new Date().toISOString() })
    .eq('id', 'singleton');

  if (error) throw new ZohoTokenError('REFRESH_FAILED');
  return data.access_token;
}

export async function getValidAccessToken(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('zoho_credentials')
    .select('access_token, refresh_token, expires_at')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'access_token' | 'refresh_token' | 'expires_at'>>();

  if (error || !data) throw new ZohoTokenError('NOT_CONNECTED');

  const expiresAt = new Date(data.expires_at).getTime();
  const bufferMs = 5 * 60 * 1000; // 5-minute buffer

  if (expiresAt > Date.now() + bufferMs) return data.access_token;
  return refreshAccessToken(data);
}

export function scheduleTokenRefresh(): ReturnType<typeof setInterval> {
  const INTERVAL_MS = 45 * 60 * 1000; // 45 minutes

  const tick = async () => {
    try {
      await getValidAccessToken();
      console.log(`[zoho] token warm at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[zoho] proactive refresh failed:`, err instanceof Error ? err.message : err);
    }
  };

  void tick();
  return setInterval(tick, INTERVAL_MS);
}
```

### File: `src/lib/zoho/client.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import { getValidAccessToken } from './tokenManager';
import { ZohoAPIError } from './types';
import type { ZohoTokenRow } from './types';

async function getZohoBaseUrl(): Promise<string> {
  if (process.env.ZOHO_API_BASE) return process.env.ZOHO_API_BASE;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('zoho_credentials')
    .select('zoho_org_id')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'zoho_org_id'>>();

  if (!data?.zoho_org_id) {
    throw new ZohoAPIError(0, 'Zoho API base URL not configured — connect via OAuth first');
  }
  return data.zoho_org_id;
}

export async function zohoFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const [token, baseUrl] = await Promise.all([getValidAccessToken(), getZohoBaseUrl()]);
  const url = `${baseUrl}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    throw new ZohoAPIError(0, `Network error: ${err instanceof Error ? err.message : err}`);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch { /* not JSON */ }
    throw new ZohoAPIError(res.status, message);
  }

  return res;
}
```

---

## PHASE 4 — API ROUTES

### File: `src/app/api/v1/zoho/oauth/start/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  const authUrl = new URL('https://accounts.zoho.in/oauth/v2/auth');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.ZOHO_CLIENT_ID!);
  authUrl.searchParams.set('scope', 'zohobookings.data.ALL');
  authUrl.searchParams.set('redirect_uri', process.env.ZOHO_REDIRECT_URI!);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
```

### File: `src/app/api/v1/zoho/oauth/callback/route.ts`
```typescript
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
    if (!tokenData.access_token) {
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
```

### File: `src/app/api/v1/zoho/status/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ZohoStatusResponse } from '@/types/zoho';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('zoho_credentials')
    .select('expires_at, updated_at, zoho_org_id')
    .eq('id', 'singleton')
    .maybeSingle();

  const response: ZohoStatusResponse = {
    connected: !!data,
    expires_at: data?.expires_at ?? null,
    last_updated: data?.updated_at ?? null,
    org_id: data?.zoho_org_id ?? null,
  };

  return NextResponse.json(response);
}
```

### File: `src/app/api/v1/zoho/credentials/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('zoho_credentials').delete().eq('id', 'singleton');

  if (error) {
    return NextResponse.json({ error: { code: 'DELETE_FAILED', message: 'Failed to disconnect Zoho.' } }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

## PHASE 5 — ADMIN DESIGN SYSTEM CSS

### File: `src/app/admin/admin.css`

> **Primary reference: `screens/nest-admin-panel.html`** — copy the full `<style>` block exactly, then convert all bare class names (`.green`, `.active`, `.hi`) to the `ns-` prefixed equivalents used in the React implementation. Also add the onboarding-specific classes from `screens/NEST_Admin_Onboarding.html` under a clearly marked `/* ── ALLY ONBOARDING STYLES ── */` section.

**CSS Custom Properties (`:root` — copy exact hex values from HTML):**
```
--ns-cream: #F8F4ED
--ns-cream-2: #F2EBE0
--ns-cream-3: #E8DDD0
--ns-forest: #2F4C3A
--ns-forest-2: #3D6150
--ns-forest-3: #507A66
--ns-forest-light: #EBF2EE
--ns-gold: #C49A5A
--ns-gold-light: #F0E2C8
--ns-gold-mid: #E8C8A0
--ns-ink: #1A2B22
--ns-ink-2: #3A4F42
--ns-ink-3: #627A6E
--ns-ink-4: #94A89E
--ns-border: #DDD5C8
--ns-border-soft: #EDE8E0
--ns-red: #C44B3A
--ns-red-light: #FAF0EE
--ns-amber: #C47A2A
--ns-amber-light: #FBF3E8
--ns-teal: #2A7A6A
--ns-teal-light: #E8F5F2
--ns-sidebar-w: 220px
--ns-topbar-h: 60px
--ns-radius: 10px
--ns-radius-sm: 6px
--ns-shadow: 0 1px 3px rgba(47,76,58,0.08), 0 4px 16px rgba(47,76,58,0.04)
--ns-font-serif: 'DM Serif Display', Georgia, serif
--ns-font-sans: 'DM Sans', system-ui, sans-serif
```

**Shell & Sidebar classes** (from `nest-admin-panel.html`): `.ns-admin-shell`, `.ns-admin-sidebar` (with `::after` gradient overlay), `.ns-sidebar__brand`, `.ns-sidebar__logo`, `.ns-sidebar__brand-text`, `.ns-sidebar__name`, `.ns-sidebar__label`, `.ns-sidebar__nav`, `.ns-sidebar__section-label`, `.ns-nav-item` (with `:hover` and `.ns-nav-item--active` + `::before` gold indicator), `.ns-nav-icon`, `.ns-nav-badge`, `.ns-sidebar__footer`, `.ns-sidebar__avatar`, `.ns-sidebar__user`, `.ns-sidebar__user-name`, `.ns-sidebar__user-role`, `.ns-sidebar__divider` (for separators between section groups).

**Main area / topbar**: `.ns-admin-main`, `.ns-admin-topbar`, `.ns-topbar__page`, `.ns-topbar__page-title` (serif), `.ns-topbar__page-sub`, `.ns-topbar__actions`, `.ns-topbar__icon-btn`, `.ns-bell-wrap`, `.ns-bell-dot`, `.ns-env-status`, `.ns-env-dot`, `.ns-admin-content`.

**Section header**: `.ns-section-hd`, `.ns-section-hd h2`, `.ns-section-hd__note`.

**Cards**: `.ns-card`, `.ns-card--flat`, `.ns-card__label`, `.ns-card__title`, `.ns-card__head`.

**Metrics**: `.ns-metrics` (auto-fit grid, minmax 160px), `.ns-metric` (with `::before` 3px top bar), color modifiers `.ns-metric--green`, `--red`, `--amber`, `--teal`, `.ns-metric__label`, `.ns-metric__val` (serif 28px), `.ns-metric__sub`, `.ns-metric__delta`, `.ns-metric__delta--up` (teal), `.ns-metric__delta--dn` (red).

**Grids**: `.ns-two-col` (1fr 1fr), `.ns-three-col` (1fr 1fr 1fr), `.ns-60-40` (1.6fr 1fr).

**Table**: `.ns-table-wrap`, `.ns-table`, full thead/tbody/tr/td styles.

**Badges**: `.ns-badge`, `.ns-badge--green`, `--red`, `--amber`, `--forest`, `--gray`, `.ns-badge__dot`.

**Status dots**: `.ns-status`, `.ns-status__dot`, `.ns-status__dot--live` (teal + glow), `--warn` (amber), `--off` (gray), `--err` (red).

**Buttons**: `.ns-btn`, `.ns-btn--primary`, `--secondary`, `--danger`, `--ghost`, `--sm`.

**Forms**: `.ns-field`, `.ns-label`, `.ns-hint`, `.ns-input` (focus: forest border + shadow), `.ns-select` (custom SVG arrow), `.ns-toggle-row`, `.ns-toggle-row__info`, `.ns-toggle-row__title`, `.ns-toggle-row__desc`, `.ns-toggle`, `.ns-toggle__track`, `.ns-toggle__thumb`.

**Integrations**: `.ns-connect`, `.ns-connect__icon`, `.ns-connect__body`, `.ns-connect__name`, `.ns-connect__desc`, `.ns-connect__actions`, `.ns-notice`, `.ns-oauth-box`, `.ns-oauth-box--connected`, `.ns-oauth-box__title`, `.ns-oauth-box__sub`, `.ns-oauth-meta`, `.ns-oauth-meta__item`, `.ns-oauth-meta__label`, `.ns-oauth-meta__val`, `.ns-env-row`, `.ns-env-key`, `.ns-env-present`, `.ns-env-missing`.

**Audit**: `.ns-audit`, `.ns-audit-item`, `.ns-audit__icon` + color variants (`--green`, `--red`, `--amber`, `--forest`), `.ns-audit__body`, `.ns-audit__title`, `.ns-audit__sub`, `.ns-audit__time`.

**Charts**: `.ns-bar-chart`, `.ns-bar-chart__col`, `.ns-bar-chart__bar` (+ `--hi` variant), `.ns-bar-chart__day`.

**Progress**: `.ns-progress`, `.ns-progress__fill`, `--amber`, `--red` variants.

**Plans**: `.ns-plan-grid` (3-col), `.ns-plan`, `.ns-plan--featured` (forest border), `.ns-plan__badge` (absolute top tab), `.ns-plan__tier`, `.ns-plan__price`, `.ns-plan__price-unit`, `.ns-plan__features`, `.ns-plan__feat` (gold `·` bullet).

**Limits**: `.ns-limit-card`, `.ns-limit-row`, `.ns-limit-plan`, `.ns-limit-val`, `.ns-limit-bar` (range slider with custom forest thumb).

**Credit/Events/Resources/Allies rows**: `.ns-credit-row`, `.ns-event-row`, `.ns-event-row__date`, `.ns-event-row__month`, `.ns-event-row__day`, `.ns-event-row__body`, `.ns-event-row__name`, `.ns-event-row__meta`, `.ns-event-row__cap`, `.ns-resource-row`, `.ns-resource-row__type`, `.ns-resource-row__body`, `.ns-resource-row__title`, `.ns-resource-row__tags`, `.ns-tag`, `.ns-tag--forest`, `.ns-tag--teal`, `.ns-ally-row`, `.ns-ally-avatar` (+ `--v2`, `--v3`), `.ns-ally__body`, `.ns-ally__name`, `.ns-ally__meta`, `.ns-ally__sessions`.

**Search/Flag/Tabs/Divider/Toast**: `.ns-search-row`, `.ns-search-input-wrap`, `.ns-search-input`, `.ns-flagged`, `.ns-flagged__icon`, `.ns-flagged__body`, `.ns-flagged__title`, `.ns-flagged__desc`, `.ns-tabs`, `.ns-tab`, `.ns-tab--active`, `.ns-divider`, `.ns-toast`, `.ns-toast--success`, `.ns-toast--error`, `@keyframes ns-toast-in`.

---

**Ally Onboarding additions** (from `screens/NEST_Admin_Onboarding.html` — add under `/* ── ALLY ONBOARDING STYLES ── */`):

```css
/* Onboarding design tokens (complement admin tokens) */
:root {
  --ob-dp: #2F4C3A;      /* same as --ns-forest */
  --ob-moss: #5C7A66;
  --ob-cream: #F8F0E5;
  --ob-terra: #9B6651;
  --ob-honey: #E8C8A0;
  --ob-pine-t: #EFF5EE;
  --ob-hm: #E0D5C5;
  --ob-terra15: rgba(155,102,81,0.12);
}
```

Classes to implement: `.ob-step-progress`, `.ob-step-item` (+ `.active`, `.done`), `.ob-step-item__num`, `.ob-step-item__label`, `.ob-step-item__sub`, `.ob-form-panel`, `.ob-panel-header`, `.ob-panel-header__eyebrow`, `.ob-panel-header__title`, `.ob-panel-header__sub`, `.ob-form-section`, `.ob-section-title` (with `::after` line separator), `.ob-grid-2`, `.ob-grid-3`, `.ob-grid-1`, `.ob-field`, `.ob-field--span2`, `.ob-field__label`, `.ob-field__hint`, `.ob-field__input`, `.ob-field__select`, `.ob-field__textarea`, `.ob-char-counter`, `.ob-photo-upload`, `.ob-photo-preview`, `.ob-photo-preview__label`, `.ob-photo-meta`, `.ob-btn-upload`, `.ob-chip-group`, `.ob-chip-opt` (+ `.selected`), `.ob-range-row`, `.ob-price-prefix`, `.ob-price-row`, `.ob-toggle-row` (onboarding variant), `.ob-avail-grid`, `.ob-avail-cell` (+ `.header`, `.day-header`, `.selected`), `.ob-doc-grid`, `.ob-doc-card` (+ `.uploaded`), `.ob-doc-card__icon`, `.ob-doc-card__name`, `.ob-doc-card__meta`, `.ob-doc-card__status` (+ `--pending`, `--ok`), `.ob-doc-required`, `.ob-match-row`, `.ob-match-row__label`, `.ob-match-row__tag`, `.ob-tag-primary`, `.ob-tag-secondary`, `.ob-match-bar`, `.ob-notice` (+ `--info`, `--warn`), `.ob-panel-footer`, `.ob-panel-footer__left`, `.ob-footer-actions`, `.ob-btn` (onboarding pill buttons — `border-radius: 50px`), `.ob-btn--primary` (terra/brown color `#9B6651`), `.ob-btn--secondary`, `.ob-btn--ghost`, `.ob-btn--sm`, `.ob-preview-col`, `.ob-preview-card`, `.ob-preview-left`, `.ob-preview-avatar`, `.ob-preview-name`, `.ob-preview-role`, `.ob-preview-badges`, `.ob-preview-badge`, `.ob-preview-right`, `.ob-preview-tags`, `.ob-preview-tag--filled`, `.ob-preview-tag--outline`, `.ob-preview-quote`, `.ob-preview-row`, `.ob-preview-divider`, `.ob-preview-label`, `.ob-match-score`, `.ob-match-score__title`, `.ob-match-bar-row`, `.ob-match-bar-item`, `.ob-match-bar-label`, `.ob-match-bar-track`, `.ob-match-bar-fill`, `.ob-match-bar-pct`, `.ob-completion`, `.ob-ring-svg`, `.ob-completion__pct`, `.ob-completion__label`, `.ob-content-grid` (1fr 300px), scrollbar styles.

---

## PHASE 6 — ADMIN LAYOUT & SHELL COMPONENTS

### File: `src/app/admin/layout.tsx`
```typescript
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
```

### File: `src/app/admin/page.tsx`
```typescript
import { redirect } from 'next/navigation';
export default function AdminRoot() {
  redirect('/admin/dashboard');
}
```

---

### File: `src/app/admin/_components/AdminSidebar.tsx`

`'use client'` — uses `usePathname()`.

> **Design source: merge of `screens/nest-admin-panel.html` (primary nav groups) + `screens/NEST_Admin_Onboarding.html` (Allies sub-section + System section).** The final sidebar is the superset of both files.

**Navigation groups (exact order):**

```
OVERVIEW
  ├─ Dashboard          /admin/dashboard       (grid icon)

CONFIGURE
  ├─ Pricing & limits   /admin/pricing         (coin icon)
  └─ Integrations       /admin/integrations    (plug icon, badge "1" red)

CONTENT
  ├─ Resources          /admin/resources       (lines icon)
  └─ Events             /admin/events          (calendar icon)

ALLIES                                         ← section from NEST_Admin_Onboarding.html
  ├─ All Allies         /admin/allies          (group icon)
  ├─ Onboard Ally       /admin/allies/onboard  (person-with-arrow icon)
  └─ Applications       /admin/allies/applications  (list icon, badge "3" terra/red)

PEOPLE
  ├─ Clients            /admin/users           (single person icon — renamed from "Users")

SYSTEM                                         ← new section from NEST_Admin_Onboarding.html
  ├─ Matching Engine    /admin/matching        (gear/settings icon)
  └─ Audit Logs         /admin/audit           (lines icon)
```

**Active state**: `ns-nav-item--active` class + gold left border via `::before` pseudo-element (as in `nest-admin-panel.html`).

**Sidebar dividers**: A `.ns-sidebar__divider` (1px rgba(255,255,255,0.08) line) between major section groups — specifically between CONFIGURE/CONTENT, CONTENT/ALLIES, and ALLIES/PEOPLE.

**Brand**: Nest shield SVG + "Nest" serif + "Admin console" uppercase label (from `nest-admin-panel.html`).

**Footer**: Avatar "SK", "Sanjay Karthick", "Super admin".

---

### File: `src/app/admin/_components/AdminTopbar.tsx`

`'use client'` — uses `usePathname()`.

Page meta map (extend from `nest-admin-panel.html` + new pages):
```typescript
const PAGE_META = {
  '/admin/dashboard':          { title: 'Dashboard',          sub: 'Platform overview · May 2026' },
  '/admin/pricing':            { title: 'Pricing & limits',   sub: 'Configure plans, message caps, credit wallet' },
  '/admin/integrations':       { title: 'Integrations',       sub: 'Connect and monitor third-party services' },
  '/admin/resources':          { title: 'Resources',          sub: 'Manage content library and mood tags' },
  '/admin/events':             { title: 'Weekend events',     sub: 'Create events, manage registrations' },
  '/admin/allies':             { title: 'Allies',             sub: 'Human listener network and payout tracking' },
  '/admin/allies/onboard':     { title: 'Onboard Ally',       sub: 'Allies · New application' },
  '/admin/allies/applications':{ title: 'Applications',       sub: '3 pending applications to review' },
  '/admin/users':              { title: 'Clients',            sub: 'User management · handle with care' },
  '/admin/matching':           { title: 'Matching Engine',    sub: 'Algorithm weights and configuration' },
  '/admin/audit':              { title: 'Audit Logs',         sub: 'System events and admin actions' },
};
```

Right actions: "All systems live" (teal dot badge), notification bell (red dot), settings gear.

---

## PHASE 7 — ADMIN PAGES

> **For every page, open the corresponding section in `screens/nest-admin-panel.html` and reproduce the exact HTML structure, data, and CSS classes in React JSX.**

### 7-A · `src/app/admin/dashboard/page.tsx` (Server Component)

**6 metric cards** (from `nest-admin-panel.html` `#page-dashboard`):
| Label | Value | Modifier | Delta |
|---|---|---|---|
| Total users | 4,821 | `green` | ↑ +14% this month |
| Active subscriptions | 1,204 | `teal` | ↑ +8% vs last month |
| MRR | ₹2.4L | `amber` | ↑ +₹28k this month |
| Nila messages today | 9,341 | — | Avg 14ms response · 0.3% error |
| Ally sessions this week | 183 | — | ↓ −5 vs last week |
| Payment failures | 12 | `red` | 3 in grace period · 9 dunning |

**60/40 grid:**
- Left: Bar chart (M 58%, T 72%/hi, W 49%, T 88%/hi, F 95%/hi, S 64%, S 38%) + divider + 3 mini stats (Credit burn ₹1,840/day 62%/amber, Churn 3.2% 32%, Avg mood 2.8/5 56%)
- Right: Audit log (5 entries in exact order from HTML)

**Ally snapshot table** (3 rows: Priya Nair/34 sessions/★4.9, Riya Menon/21/★4.7, Kiran V./9/★4.3).

---

### 7-B · `src/app/admin/integrations/page.tsx` + sub-components

> **Design reference: `screens/nest-admin-panel.html` `#page-integrations` — the Zoho card shows the CONNECTED state by default in the HTML. Implement both connected and disconnected states in the client component.**

Server component: fetches `zoho_credentials` via `createAdminClient()`, reads env var presence.

Sections (exact order from HTML):
1. Info notice (green, "Client IDs and secrets are loaded from environment variables…")
2. ZohoCard (client component — shows connected state with OAuth2 active, meta grid, Sync/View/Disconnect buttons)
3. Other integrations — exact 5 entries from HTML: Stripe (Live, "Webhook log"), Anthropic API (Live, "Usage"), Resend (Live, "Stats"), PostHog (Live, "Open"), Sentry (warn "2 issues", "View")
4. Env vault — 8 keys: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_KEY`, `DEEPGRAM_API_KEY`

**`src/app/admin/integrations/_components/ZohoCard.tsx`**: Client component — disconnected (dashed box, Connect button → `/api/v1/zoho/oauth/start`) and connected (solid green box with meta grid: Client ID source, Client Secret source, Last Ally sync "2h ago · 8 profiles synced", Webhook endpoint `/api/v1/webhooks/zoho`). Disconnect calls `DELETE /api/v1/zoho/credentials` then `router.refresh()`.

**`src/app/admin/integrations/_components/IntegrationsToast.tsx`**: `'use client'` inside `<Suspense>`. Shows for `?success=zoho_connected`, `?error=zoho_auth_failed`, `?error=zoho_token_exchange_failed`. Auto-dismiss 4s.

---

### 7-C · `src/app/admin/pricing/page.tsx` (Server Component)

> **Reference: `screens/nest-admin-panel.html` `#page-pricing`**

**Notice**: "Changes here update the `platform_config` table in Supabase and take effect immediately — no redeploy needed."

**Plan cards** (exact prices from HTML — note: different from the original prompt):
| Tier | Price | Features |
|---|---|---|
| Free | ₹0/month | Limited Nila messages/day, No Ally access, Public resources only, No event access |
| Core (Most popular badge) | ₹499/month | Unlimited Nila messages, 1 Ally session/month, Full resources library, Weekend events access |
| Premium | ₹999/month | Unlimited everything, Priority Ally matching, Voice notes with Nila, Exclusive events + drops |

**Two-col below plans:**
- Left: Message limit sliders (Free=5, Core=∞, Premium=∞) + Voice note toggles (Free=off, Core=on)
- Right: Credit wallet config card (Credits on signup=50, Credits/Nila msg Free plan=1, Credit expiry=90 days) + Top-up packs (100cr/₹49, 300cr/₹129, 1000cr/₹349)

**Grace period card** (two-col): Grace period=7 days, Max retries=3, Downgrade to (select), Re-activation rule (select) + Reset/Save buttons.

---

### 7-D · `src/app/admin/resources/page.tsx` (Server Component)

> **Reference: `screens/nest-admin-panel.html` `#page-resources` — note: resource content differs from original prompt**

Header: search input + "All types" select + "All moods" select + "Add resource" primary button.

**Two-col:**
- Left: Published card — "24 resources" green badge, 5 rows:
  - 🎵 "For nights when quiet feels too loud" — tags: Loneliness, Healing
  - 📄 "Why feeling lonely in a crowd is real" — tags: Loneliness, Anxiety
  - 🎬 "Past Lives — a film about letting go" — tags: Heartbreak, Healing
  - 🎧 "Rain on leaves · ambient sound" — tags: Anxiety, Calm
  - 📄 "Talking to someone you trust — how to start" — tags: Relationships
- Right column (stacked):
  - Drafts card — "3 unpublished" amber badge, 2 rows: "Morning stillness playlist" (Publish btn), "On trust after betrayal" (Publish btn)
  - Mood tags card — "Used by Nila" gray badge, 8 clickable tags with counts: Loneliness·9, Healing·7, Anxiety·6, Heartbreak·5, Calm·4, Grief·3, Relationships·3, Trust·2 — "+ Add tag" ghost button

---

### 7-E · `src/app/admin/events/page.tsx` (Server Component)

> **Reference: `screens/nest-admin-panel.html` `#page-events` — note: event data differs from original prompt**

Header: Tabs (Upcoming | Past) + "Create event" primary button.

**Two-col:**
- Left: 3 upcoming events:
  - Jul 26 — "Sunday Circle — Bangalore" — Indiranagar · 6:00 PM · 20 capacity — 12/20 Open
  - Aug 2 — "Quiet Gathering — Chennai" — Nungambakkam · 5:30 PM · 15 capacity — 15/15 Full (amber)
  - Aug 9 — "Evening Walk — Pune" — Koregaon Park · 6:30 PM · 25 capacity — 4/25 Open
- Right (stacked):
  - Event registrations mini-metric grid: This month 47 registrations | Waitlisted 8 Chennai event (amber)
  - Post-event flow toggles: "Send reflection email after event" (on, 2h after), "Nila follow-up prompt" (on, next day), "24h reminder to registrants" (on, via Resend)

---

### 7-F · `src/app/admin/allies/page.tsx` (Server Component)

> **Reference: `screens/nest-admin-panel.html` `#page-allies`**

Header: search + "All statuses" select + "Add Ally" primary button.

**60/40 grid:**
- Left (60%): All allies table — "11 total" gray badge, 4 rows:
  | Avatar | Name | Specialties | Sessions | Rating | Status | Actions |
  |---|---|---|---|---|---|---|
  | PN | Priya Nair | Anxiety · Relationships | 86 | ★ 4.9 | Active | Edit / Pause |
  | RM | Riya Menon | Loneliness · Grief | 54 | ★ 4.7 | Active | Edit / Pause |
  | KV (v3) | Kiran V. | Breakups · Trust | 9 | ★ 4.3 | Pending | Activate / Edit |
  | SA (cream-3) | Sneha A. | Depression · Self-worth | 31 | ★ 4.8 | Paused | Reactivate |
- Right (40%, stacked):
  - This week's session stats (2×2 mini grid): Completed 61 (green), Cancelled 7 (red), Avg duration 48min, Avg rating 4.7 (amber)
  - Payout summary: Priya Nair 34 sessions ₹8,500 owed (amber Pending) | Riya Menon 21 sessions ₹5,250 owed (amber Pending) + "Export CSV" button

---

### 7-G · `src/app/admin/users/page.tsx` (Server Component)

> **Reference: `screens/nest-admin-panel.html` `#page-users`**

**Flagged alert** (top, red): "2 users need attention" — "Nila triggered a safety flag for these users. Assign to a human Ally or review. Visible to super-admin only." + "Review flags" danger button.

Search row: search input + "All plans" select + "All statuses" select.

**Users table** (4 rows, exact from HTML — note columns differ from original prompt):
| User | Plan | Joined | Last active | Nila msgs | Credits | Status | Action |
|---|---|---|---|---|---|---|---|
| Aryan K. / aryan@gmail.com | Core (forest) | Jul 12, 2025 | 2h ago | 841 | 128 | Active | View |
| Kavitha S. / kavitha@mail.com | Free (gray) | Mar 3, 2026 | 1d ago | 34 | 50 | Payment failed (red) | View |
| anon_7821 / anonymous user | Free (gray) | May 18, 2026 | 14m ago | 7 | 43 | Safety flag (red) | Assign (danger) |
| Meera P. / meera@icloud.com | Premium (amber) | Jan 8, 2026 | 3h ago | 2,140 | 0 | Active | View |

**Info notice** (bottom): "Nila conversation content is never visible here. Flagged users show only signal type and timestamp. Message content is stored encrypted and accessible only by the user."

---

### 7-H · Ally Onboarding Page — `src/app/admin/allies/onboard/page.tsx`

> **Full design reference: `screens/NEST_Admin_Onboarding.html`** — this is a completely new page not in the original prompt. Study the HTML carefully.

This is a **client-side multi-step form** (`'use client'`). It has a 5-step wizard with live preview panel.

**Route**: `/admin/allies/onboard`
**Layout**: Two-column grid — `ob-content-grid` (1fr 300px), form panel left, sticky preview column right.

**Step Progress Bar** (top of content area, before the two-col grid):
```
[1 Identity] [2 Expertise] [3 Sessions] [4 Documents] [5 Matching]
```
Each step item is clickable. Active step has forest-filled number circle + bottom border indicator. Done steps show `✓` and lighter background.

---

#### STEP 1 — Personal Identity

**Panel header**: "Step 1 of 5" eyebrow, "Personal Identity" title, "This is what clients see first — the face, the name, the words that make them feel safe enough to book." sub.

**Section: Core identity** (`ob-grid-2`):
- Full name (required) — placeholder "e.g. Priya Nair"
- Display name — hint: "Shown on the card. Defaults to first name."
- Pronouns (required, select): she/her, he/him, they/them, she/they, he/they, any pronouns, prefer not to say
- City / Location (required) — placeholder "e.g. Bangalore"

**Section: Profile photo**:
- Circular photo preview drop zone (88×88px, dashed border, upload icon)
- Right: "Upload profile photo" + requirements text + "Choose file" pill button

**Section: Voice & bio** (`ob-grid-1`):
- Short tagline (required, maxlength 80) — placeholder "Counsellor · 7 years · Bangalore" + char counter
- "In their own words" (required, textarea maxlength 200) — personal quote shown on profile card + char counter
- Full bio (textarea maxlength 600) — 3-4 sentences for expanded profile + char counter

**Section: Contact & onboarding** (`ob-grid-2`):
- Email (required), Phone (required), WhatsApp number (hint: "Used for session reminders"), Emergency/Admin contact (hint: "Internal use only")

**Panel footer**: "Auto-saved" left · "Save draft" ghost btn + "Next: Expertise →" primary btn

---

#### STEP 2 — Expertise & Approach

**Panel header**: "Step 2 of 5", "Expertise & Approach", "This powers the matching engine. The more precisely defined, the better the client–ally fit."

**Section: Credentials** (`ob-grid-2`):
- Primary role (select): Counsellor, Psychologist (RCI Registered), Clinical Psychologist, Therapist, Life Coach (Certified), Peer Support Specialist, Ally (Trained Listener)
- Years of experience (range slider 0–30, default 7) + display "7 yrs"
- Highest qualification — placeholder "e.g. M.Phil Clinical Psychology, NIMHANS"
- License / Registration no — placeholder "e.g. RCI/2019/KA/04821"
- Additional certifications (textarea, span-2)

**Section: Specialisations** — info notice (first 2 selected = filled tags on card) + chip group (16 options — initially selected: Heartbreak, Loneliness):
> heartbreak, loneliness, family, identity, anxiety, grief, self-esteem, career, trauma, depression, relationships, communication, confidence, cultural, lgbtq+, anger management

**Section: Therapeutic modalities** — chip group (12 options — initially selected: CBT, ACT):
> CBT, DBT, ACT, IFS, narrative therapy, person-centred, somatic, mindfulness-based, EMDR, psychodynamic, integrative, positive psychology

**Section: Client fit** (`ob-grid-2`):
- Age groups (chip: 18-24 ✓, 25-34 ✓, 35-45, 45+)
- Gender preference (chip: Any gender ✓, Women preferred, Men preferred)
- Languages spoken (text, default "English, Tamil")
- Languages for therapy (text, default "English & Tamil")

**Section: Approach style** (`ob-grid-1`):
- Session style description (textarea)
- Session tone (chips: Warm & nurturing ✓, Structured & goal-driven, Exploratory & open, Solution-focused, Quiet & reflective)

**Footer**: Back · Save draft · "Next: Sessions →"

---

#### STEP 3 — Session Format & Availability

**Panel header**: "Step 3 of 5", "Session Format & Availability", "This controls what clients see on the booking card and what the scheduler uses to surface available slots."

**Section: Format & pricing** (`ob-grid-2`):
- Session format (chips: 🎥 Online ✓, 📍 In-person, Both)
- Session duration (chips: 45min, 60min ✓, 90min)
- Session price ₹ (number, default 1200) — "₹ X,XXX / session" shown on ally card
- Intro session price ₹ (optional, number, placeholder 800)
- Max clients / week (range slider 1–30, default 12)
- Buffer between sessions (select: 10min, 15min ✓, 30min, 45min)

**Section: Typical weekly availability** — clickable grid:
| | Mon–Wed | Thu–Fri | Sat | Sun |
|---|---|---|---|---|
| Morning (9AM–12PM) | ✓ Available | Tap to add | Tap to add | Tap to add |
| Afternoon (12–4PM) | Tap to add | ✓ Available | ✓ Available | Tap to add |
| Evening (4–9PM) | ✓ Available | ✓ Available | Tap to add | Tap to add |

**Section: Platform visibility settings** — 4 toggle rows:
- "Visible in search results" (off) — "Toggle off during onboarding review"
- "Accepting new bookings" (off) — "Enable once documents are verified"
- "Include in matching algorithm" (on) — "Shows up in post-assessment suggestions"
- "Featured ally" (off) — "Shown at top of match results with a subtle highlight"

**Footer**: Back · Save draft · "Next: Documents →"

---

#### STEP 4 — Document Verification

**Panel header**: "Step 4 of 5", "Document Verification", "Required before the ally goes live. Marked documents are mandatory — others are strongly recommended."

**Section: Identity & credentials** — `ob-doc-grid` (2-col):
- Government ID (Required, uploaded ✓) — "Aadhaar / PAN / Passport. Both sides if Aadhaar."
- Degree Certificate / Transcript (Required, pending) — "Highest relevant qualification. Certified copy accepted."
- Professional License / RCI No. (Required, pending)
- Additional Certifications (optional, pending)

**Section: Safety & compliance** — `ob-doc-grid`:
- Background Check Consent (Required, pending)
- Professional Indemnity Insurance (optional, pending)
- Signed Platform Agreement & Code of Conduct (Required, span-2, "Awaiting review stage")

**Section: Admin notes (internal)** — textarea with hint "Internal only. Not visible to the ally or clients."

**Footer**: "2 of 6 documents uploaded" left · Back · Save draft · "Next: Matching →"

---

#### STEP 5 — Matching Engine Configuration

**Panel header**: "Step 5 of 5", "Matching Engine Configuration", "These weights tell the algorithm how strongly to surface this ally for specific assessment outcomes."

**Section: Assessment → Ally match weights** — info notice + 6 slider rows:
| Category | Tag | Default |
|---|---|---|
| Loneliness & disconnection | Primary | 90% |
| Heartbreak & relationships | Primary | 95% |
| Family pressure & expectations | Secondary | 70% |
| Work stress & future anxiety | Secondary | 55% |
| Identity & self-exploration | Secondary | 65% |
| Everything at once (overwhelm) | Secondary | 80% |

**Section: Tiebreaker preferences** (`ob-grid-2`):
- Sort order priority (select: Earliest availability, Lowest price, Featured status, Random)
- Manual priority score (number 0–10, default 7, hint "Boosts ranking slightly when scores are equal")

**Section: Review & activate** — warn notice "Not yet live. This ally profile is saved as a draft. To make them visible to clients, toggle 'Visible in search results' and 'Accepting new bookings' on step 3 after all required documents are verified."

**Footer**: "Draft · Not yet published" · Back · "Save as draft" secondary · "Submit for review →" primary

---

#### RIGHT COLUMN — Live Preview Panel

Sticky right column (`ob-preview-col`) with three stacked cards:

**1. Completion ring** (SVG circle progress):
- Step 1=20%, 2=40%, 3=60%, 4=80%, 5=100%
- Forest colored arc + "20%" text + "Profile complete" label

**2. Ally profile card preview** (`ob-preview-card`):
- Top (forest bg): avatar initials, name, role/tagline, pronouns + availability badges
- Bottom: "Specialises in" tags (first 2 selected = filled/forest, rest = outline), quote, session details (60min, Online, ₹1,200/session)
- Live-updates as user types in name, tagline, quote, specialisation chips

**3. Match strength preview** (`ob-match-score`):
- 4 bar rows: Loneliness 90%, Heartbreak 95%, Family 70%, Overwhelm 80%
- Live-updates from Step 5 sliders

#### Client-side JavaScript behaviour (implement as React state):
- `currentStep` state (1–5)
- `goToStep(n)` — shows/hides form sections, updates step indicator dots
- Chip click → toggle `.selected`, update preview tags
- Availability grid cell click → toggle selected
- Name input → update preview name + initials
- Tagline input → update preview role + char counter
- Own-words textarea → update preview quote + char counter
- About textarea → char counter only
- Completion ring → SVG `stroke-dashoffset` update based on step

---

### 7-I · Stub Pages (Server Components, return a notice card)

These pages are referenced in the sidebar but are out-of-scope for initial implementation. Return a simple card:

**`src/app/admin/allies/applications/page.tsx`**:
```tsx
export default function ApplicationsPage() {
  return (
    <div className="ns-card">
      <div className="ns-card__label">Applications</div>
      <div className="ns-card__title" style={{ marginBottom: 4 }}>3 pending ally applications</div>
      <p style={{ fontSize: 13, color: 'var(--ns-ink-4)' }}>Application review UI — coming soon.</p>
    </div>
  );
}
```

**`src/app/admin/matching/page.tsx`**: Similar stub — "Matching Engine configuration UI — coming soon."

**`src/app/admin/audit/page.tsx`**: Similar stub — "Audit log UI — coming soon."

---

## PHASE 8 — ENVIRONMENT VARIABLES

Verify `.env.example` contains these (add if missing):

```bash
# ── Zoho OAuth (for admin Ally scheduling integration) ──
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/v1/zoho/oauth/callback
ZOHO_API_BASE=   # Optional: override Zoho API base URL
```

---

## PHASE 9 — VERIFICATION CHECKLIST

Run `npx tsc --noEmit` — fix all type errors before proceeding.

**Route structure — all files must exist:**
- [ ] `src/app/admin/layout.tsx`
- [ ] `src/app/admin/page.tsx`
- [ ] `src/app/admin/_components/AdminSidebar.tsx`
- [ ] `src/app/admin/_components/AdminTopbar.tsx`
- [ ] `src/app/admin/admin.css`
- [ ] `src/app/admin/dashboard/page.tsx`
- [ ] `src/app/admin/integrations/page.tsx`
- [ ] `src/app/admin/integrations/_components/ZohoCard.tsx`
- [ ] `src/app/admin/integrations/_components/IntegrationsToast.tsx`
- [ ] `src/app/admin/pricing/page.tsx`
- [ ] `src/app/admin/resources/page.tsx`
- [ ] `src/app/admin/events/page.tsx`
- [ ] `src/app/admin/allies/page.tsx`
- [ ] `src/app/admin/allies/onboard/page.tsx`  ← NEW
- [ ] `src/app/admin/allies/applications/page.tsx`  ← stub
- [ ] `src/app/admin/users/page.tsx`
- [ ] `src/app/admin/matching/page.tsx`  ← stub
- [ ] `src/app/admin/audit/page.tsx`  ← stub
- [ ] `src/app/api/v1/zoho/oauth/start/route.ts`
- [ ] `src/app/api/v1/zoho/oauth/callback/route.ts`
- [ ] `src/app/api/v1/zoho/status/route.ts`
- [ ] `src/app/api/v1/zoho/credentials/route.ts`
- [ ] `src/lib/zoho/types.ts`
- [ ] `src/lib/zoho/tokenManager.ts`
- [ ] `src/lib/zoho/client.ts`
- [ ] `src/types/zoho.ts`

**Build test:**
```bash
npm run build
```

**Manual smoke test (`npm run dev`):**
1. No admin role → `/admin` redirects to `/login` ✓
2. Admin role → `/admin/dashboard` loads ✓
3. All sidebar links navigate correctly (including new Allies sub-group and System) ✓
4. `/admin/allies/onboard` renders 5-step form with right preview panel ✓
5. Step navigation (Next/Back buttons + clicking step tabs) works ✓
6. Chip selection on step 2 updates preview tags in right panel ✓
7. Name/tagline/quote inputs update right preview card live ✓
8. Completion ring percentage updates per step ✓
9. `/admin/integrations` Zoho card shows disconnected or connected state ✓
10. "Connect Zoho" → `/api/v1/zoho/oauth/start` ✓

---

## PHASE 10 — SECURITY REVIEW

- [ ] `zoho_credentials` — `DENY ALL` RLS policy (`RESTRICTIVE USING (false)`) is applied
- [ ] No access tokens logged in production code paths
- [ ] All Zoho API routes check `user.app_metadata?.role !== 'admin'`
- [ ] `createAdminClient()` never called from Client Components
- [ ] `.env.local` in `.gitignore`
- [ ] No hardcoded credentials anywhere

---

## IMPORTANT IMPLEMENTATION NOTES

1. **Next.js 16:** Read `node_modules/next/dist/docs/` before writing routes/layouts. `createClient()` is async — always `await` it.

2. **Fonts:** `admin.css` uses `DM Serif Display` and `DM Sans`. Verify these are already loaded via `next/font/google` in `src/app/layout.tsx`. If not, add them to the root layout.

3. **`'use client'` boundary:** `AdminSidebar`, `AdminTopbar`, and the Ally Onboarding page are Client Components. All other page files are Server Components — never add `'use client'` to them.

4. **Zoho India domain:** All OAuth endpoints use `https://accounts.zoho.in` (India region). Do NOT use `zoho.com`.

5. **Supabase admin client:** `createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY`. Never call from Client Components.

6. **Mock data is intentional:** All pages except `/admin/integrations` display hardcoded data. This is by design — exact data is specified per page in this prompt, taken directly from the HTML design files.

7. **IntegrationsToast must be in `<Suspense>`:** Wraps `useSearchParams()` — required by Next.js App Router.

8. **Ally Onboarding is a Client Component** because it manages 5-step navigation state, chip toggles, live preview sync, availability grid, and SVG ring animation. Use `useState` for current step, form values, and chip selections.

9. **CSS scoping for Onboarding:** Use `ob-` prefixed classes (as defined in Phase 5) so they don't clash with the `ns-` admin system classes. Both live in `admin.css`.

10. **Sidebar dividers:** The `screens/NEST_Admin_Onboarding.html` sidebar uses `.sidebar__divider` between section groups. Add `.ns-sidebar__divider` (1px rgba(255,255,255,0.08) horizontal line, `margin: 12px 24px`) to `admin.css` and insert them between CONTENT/ALLIES and ALLIES/PEOPLE groups.

---

*End of prompt. Implement all phases in order. Phase 0 (reading the HTML design files + existing codebase) is mandatory before writing any code.*
