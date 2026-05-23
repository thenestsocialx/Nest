# Claude Code Prompt — Zoho Booking: Token Refresh + Workspace Selection

> **Project:** Nest — Emotional Wellness Platform  
> **Feature:** Zoho Booking Integration — OAuth Token Health + Workspace Picker  
> **Author:** Arjun (Senior Architect, Nest)  
> **Mode:** Plan first, then implement

---

## CONTEXT

Nest uses Zoho Booking to manage Ally (human listener) session scheduling. The integration connects Zoho Booking to Supabase, where OAuth credentials (access token, refresh token, expiry) are stored per organisation/workspace connection.

This prompt covers two related concerns:

1. **Token Refresh Guard** — Ensure the Zoho access token is always valid before any API call is made. If it's within the expiry window, refresh it proactively and persist the new token to Supabase.
2. **Workspace Fetch + Selection** — After a successful OAuth connection, call the Zoho Booking Workspaces API, display results in a combo box, and persist the user's chosen `workspace_id` back to the same Supabase table row.

---

## ASSUMPTIONS

- Supabase table: `zoho_booking_connections` (schema below)
- Zoho OAuth refresh endpoint: `https://accounts.zoho.com/oauth/v2/token`
- Zoho Workspaces endpoint: `{domain}/bookings/v1/json/workspaces`
- `domain` is stored in the Supabase row (e.g., `https://bookings.zoho.com`)
- Stack: Next.js (App Router) + TypeScript + Supabase JS client + Tailwind CSS
- The connection settings page is an authenticated admin/internal route
- RLS is enabled on all tables — service role key used only in server actions

---

## PLAN MODE

### Step 1 — Audit & understand the existing Supabase table

Check whether `zoho_booking_connections` exists. If not, create it. Expected schema:

```sql
create table public.zoho_booking_connections (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid references public.organizations(id) on delete cascade,
  access_token     text not null,
  refresh_token    text not null,
  token_expires_at timestamptz not null,
  domain           text not null,              -- e.g. https://bookings.zoho.com
  workspace_id     text,                       -- selected after fetch
  workspace_name   text,
  connected_at     timestamptz default now(),
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

-- RLS
alter table public.zoho_booking_connections enable row level security;

-- Only service role touches this table; no user-facing RLS policy needed
-- (admin UI uses server actions with service role key)
```

Also add a Supabase DB trigger to auto-update `updated_at` on every row change.

---

### Step 2 — Token Refresh Logic (Server-Side Utility)

Create a shared utility: `lib/zoho/refreshTokenIfNeeded.ts`

**Logic:**
1. Read the connection row from Supabase using `org_id`
2. Check if `token_expires_at` is within **5 minutes** from now (buffer to avoid race conditions)
3. If yes → POST to Zoho token refresh endpoint with `refresh_token`
4. Parse new `access_token` and `expires_in` from response
5. Compute new `token_expires_at = now + expires_in seconds`
6. `upsert` the updated fields back to Supabase
7. Return the valid (possibly refreshed) `access_token`

This utility must be called at the top of every Zoho API wrapper function — never call Zoho APIs directly without passing through this guard.

---

### Step 3 — Workspaces API Wrapper

Create: `lib/zoho/fetchWorkspaces.ts`

**Flow:**
1. Call `refreshTokenIfNeeded(orgId)` → get valid access token
2. `GET {domain}/bookings/v1/json/workspaces` with `Authorization: Zoho-oauthtoken {token}`
3. Parse the response shape:
```json
{
  "response": {
    "returnvalue": {
      "data": [{ "id": "...", "name": "..." }]
    },
    "status": "success"
  }
}
```
4. Return `Array<{ id: string; name: string }>` or throw a typed error

---

### Step 4 — Server Actions

Create two Next.js server actions:

**`actions/zoho/getWorkspaces.ts`**
- Validates session (user must be authenticated + have org access)
- Calls `fetchWorkspaces(orgId)`
- Returns workspace list to the client component

**`actions/zoho/saveWorkspace.ts`**
- Accepts `{ orgId, workspaceId, workspaceName }`
- Updates `zoho_booking_connections` row with chosen workspace fields
- Returns success/error

---

### Step 5 — UI Component: Workspace Selector

Create: `components/integrations/ZohoWorkspaceSelector.tsx`

**UI behaviour:**
- On mount: call `getWorkspaces` server action → show loading state
- If error (e.g. token fetch failed) → show error banner with retry button
- On success: render a styled `<select>` combo box (or Radix UI `Select`) with workspace options
- On selection: show a "Save" button
- On save: call `saveWorkspace` → show success toast or error

**States to handle:**
- `idle` — not yet fetched
- `loading` — fetching workspaces
- `error` — fetch failed (show message + retry)
- `ready` — workspaces loaded, waiting for selection
- `saving` — save in progress
- `saved` — workspace saved successfully

---

### Step 6 — Integration Page

Create or update: `app/(admin)/settings/integrations/zoho-booking/page.tsx`

- Check if a `zoho_booking_connections` row exists for this org
- If not connected: show "Connect Zoho Booking" CTA
- If connected + no workspace selected: render `<ZohoWorkspaceSelector />`
- If connected + workspace selected: show connected state with workspace name + option to change

---

### Step 7 — Cron / Background Token Refresh (optional, flag for later)

Note in the code: a background job (e.g. Supabase Edge Function on a schedule, or a Railway cron) should proactively refresh tokens for all connections where `token_expires_at < now() + interval '30 minutes'`. This avoids cold-start latency on the first API call after a long idle period.

**Do not implement this in the MVP — add a `// TODO: cron refresh` comment and open a GitHub issue.**

---

## IMPLEMENT MODE

Now implement the following in order. Do not skip steps. Do not move to the next step until the current one compiles without TypeScript errors.

---

### IMPLEMENT STEP 1 — Database Migration

```
File: supabase/migrations/{timestamp}_zoho_booking_connections.sql
```

Write the full SQL migration:
- Create `zoho_booking_connections` table with all columns above
- Enable RLS
- Add `updated_at` trigger using `moddatetime` extension (or a custom trigger function if extension unavailable)
- Add index on `org_id`

```
File: supabase/migrations/{timestamp}_zoho_booking_connections_rls.sql
```

Write RLS policies. Since this table is admin-only, add a single policy:
```sql
-- Only service role can access (no anon or authenticated user policy)
-- This is enforced by always using the service role client in server actions
```

Include a comment block explaining why no user-facing policies are needed.

---

### IMPLEMENT STEP 2 — Token Refresh Utility

```
File: lib/zoho/refreshTokenIfNeeded.ts
```

```typescript
// Requirements:
// - Accept orgId: string
// - Use Supabase service role client (imported from lib/supabase/server.ts)
// - Query zoho_booking_connections where org_id = orgId
// - Throw ZohoConnectionNotFoundError if no row exists
// - Check if token_expires_at <= now + 5 minutes
// - If refresh needed:
//     POST https://accounts.zoho.com/oauth/v2/token
//     Body: grant_type=refresh_token&refresh_token=...&client_id=...&client_secret=...
//     (client_id and client_secret from process.env.ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET)
//     Parse: access_token, expires_in
//     Compute: new token_expires_at = new Date(Date.now() + expires_in * 1000)
//     Update Supabase row: access_token, token_expires_at, updated_at
// - Return the valid access_token string
// - All errors must be typed and thrown with context (do not swallow)
// - Log token refresh events to console with timestamp (structured JSON log)
```

Include these exported types:
```typescript
export class ZohoConnectionNotFoundError extends Error {}
export class ZohoTokenRefreshError extends Error {
  constructor(message: string, public readonly status: number, public readonly body: string) {
    super(message);
  }
}
```

---

### IMPLEMENT STEP 3 — Workspaces API Wrapper

```
File: lib/zoho/fetchWorkspaces.ts
```

```typescript
// Requirements:
// - Accept orgId: string
// - Call refreshTokenIfNeeded(orgId) to get { accessToken, domain }
// - domain comes from the connection row — also return it from refreshTokenIfNeeded
//   (update the return type of refreshTokenIfNeeded to: { accessToken: string; domain: string })
// - Fetch: GET {domain}/bookings/v1/json/workspaces
// - Headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, Accept: 'application/json' }
// - Validate response.response.status === 'success'
// - Return: Array<{ id: string; name: string }>
// - If response.status !== 'success', throw ZohoApiError with the raw response body
// - Handle network errors (fetch throws) separately from API errors
```

Include:
```typescript
export class ZohoApiError extends Error {
  constructor(message: string, public readonly response: unknown) {
    super(message);
  }
}

export interface ZohoWorkspace {
  id: string;
  name: string;
}
```

---

### IMPLEMENT STEP 4 — Server Actions

```
File: app/(admin)/settings/integrations/zoho-booking/actions.ts
```

```typescript
'use server';

// Action 1: getZohoWorkspaces
// - Get current user session via Supabase auth
// - Get orgId from session (assume it's on the user's profile or a separate lookup)
// - Call fetchWorkspaces(orgId)
// - Return { success: true, workspaces: ZohoWorkspace[] } or { success: false, error: string }

// Action 2: saveZohoWorkspace
// - Accept: { workspaceId: string; workspaceName: string }
// - Get orgId from session
// - Update zoho_booking_connections set workspace_id = ..., workspace_name = ... where org_id = ...
// - Return { success: true } or { success: false, error: string }
```

Both actions must:
- Validate the user is authenticated
- Never expose raw error stack traces to the client — log internally, return safe message
- Use the Supabase service role client for DB writes

---

### IMPLEMENT STEP 5 — Workspace Selector Component

```
File: components/integrations/ZohoWorkspaceSelector.tsx
```

```typescript
// 'use client' component
// Requirements:
// - On mount, call getZohoWorkspaces() via useTransition or useEffect
// - Manage state machine: idle → loading → error | ready → saving → saved
// - Render a <select> or Radix UI Select component styled with Tailwind
// - Show workspace options: value=workspace.id, label=workspace.name
// - Show "Save Workspace" button (disabled until a workspace is selected and not saving)
// - On save, call saveZohoWorkspace({ workspaceId, workspaceName })
// - On success: show inline success message ("Workspace saved ✓")
// - On error: show inline error with retry option
// - If workspace is already saved (prop: savedWorkspaceId), pre-select it in the combo box
// - Props interface:
//   interface Props {
//     savedWorkspaceId?: string;
//     savedWorkspaceName?: string;
//   }
```

Style requirements (Tailwind):
- Warm, minimal UI consistent with Nest's design language
- Select box: rounded-xl, border-neutral-200, focus:ring-2 focus:ring-amber-400
- Save button: bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2
- Error state: text-red-500 with a soft red background banner
- Loading state: show a subtle spinner or "Loading workspaces…" text

---

### IMPLEMENT STEP 6 — Integration Settings Page

```
File: app/(admin)/settings/integrations/zoho-booking/page.tsx
```

```typescript
// Server component
// Requirements:
// - Get org's zoho_booking_connections row (or null)
// - If not connected: render "Connect Zoho Booking" section with OAuth initiation button
//   (OAuth flow itself is out of scope for this prompt — just show a placeholder button)
// - If connected + workspace_id is null: render <ZohoWorkspaceSelector />
// - If connected + workspace_id is set: render connection summary card showing:
//     - "Connected to Zoho Booking"
//     - Workspace name
//     - "Change workspace" link (which re-renders the selector)
// - Wrap in a clean settings page layout with a heading and description
```

---

### IMPLEMENT STEP 7 — Environment Variables

Add to `.env.local.example` (never `.env.local` itself):

```env
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Add a comment block at the top of `lib/zoho/refreshTokenIfNeeded.ts` listing all required env vars and what happens if they are missing (throw at startup, not silently at runtime).

---

### IMPLEMENT STEP 8 — Types File

```
File: types/zoho.ts
```

Consolidate all Zoho-related types here:
- `ZohoWorkspace`
- `ZohoConnection` (mirrors the Supabase table row)
- `ZohoWorkspacesApiResponse` (the raw API response shape)
- Re-export error classes

---

## TESTING CHECKLIST

After implementation, verify:

- [ ] Token refresh fires when `token_expires_at` is within 5 minutes
- [ ] Token refresh does NOT fire if token is still valid (no unnecessary API calls)
- [ ] Refreshed token and new expiry are correctly written to Supabase
- [ ] Workspaces API call uses the refreshed token if a refresh occurred
- [ ] Workspace combo box shows all returned workspaces
- [ ] Selecting a workspace and saving updates the Supabase row
- [ ] Pre-selection works when `savedWorkspaceId` is passed as a prop
- [ ] Error states render correctly (bad token, network failure, API error)
- [ ] TypeScript compiles with zero errors (`tsc --noEmit`)
- [ ] No secrets are logged or exposed to the client

---

## FILE TREE (expected output)

```
supabase/
  migrations/
    {ts}_zoho_booking_connections.sql
    {ts}_zoho_booking_connections_rls.sql

lib/
  zoho/
    refreshTokenIfNeeded.ts
    fetchWorkspaces.ts
  supabase/
    server.ts          (if not already exists — Supabase server client helper)

types/
  zoho.ts

components/
  integrations/
    ZohoWorkspaceSelector.tsx

app/
  (admin)/
    settings/
      integrations/
        zoho-booking/
          page.tsx
          actions.ts

.env.local.example    (add Zoho vars)
```

---

## ARCHITECT NOTES

- **Do not** store `client_secret` anywhere in the database. It lives only in environment variables.
- **Do not** expose the service role key to any client component. All Supabase writes go through server actions.
- **Do not** call the Zoho API from client-side code. All API calls are server-side only.
- The 5-minute refresh buffer is intentional — Zoho tokens have been known to have clock skew issues in production.
- If the `zoho_booking_connections` table already exists with different column names, adapt the migration to be additive (`ALTER TABLE ADD COLUMN IF NOT EXISTS`) rather than destructive.
- Nila's booking flows depend on this integration being reliable. A stale token in production = broken Ally scheduling. Treat token health as a first-class concern.
