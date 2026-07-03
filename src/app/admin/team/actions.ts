'use server'

import { getAdminUser } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/audit'

export async function grantManagerRole(
  targetUserId: string,
  targetEmail: string,
): Promise<{ error?: string }> {
  const actor = await getAdminUser()
  if (!actor) return { error: 'Unauthorized' }

  if (actor.id === targetUserId) {
    return { error: 'You cannot change your own role.' }
  }

  const admin = createAdminClient()

  const { data: { user: target }, error: fetchError } = await admin.auth.admin.getUserById(targetUserId)
  if (fetchError || !target) return { error: 'User not found' }

  const currentRole = target.app_metadata?.role as string | undefined
  if (currentRole === 'admin') return { error: 'This user is already an admin and cannot be downgraded here.' }
  if (currentRole === 'manager') return { error: 'This user already has manager access.' }

  const { error } = await admin.auth.admin.updateUserById(targetUserId, {
    app_metadata: { role: 'manager' },
  })
  if (error) {
    console.error('[grantManagerRole]', error)
    return { error: 'Failed to grant access' }
  }

  logAuditEvent({
    actor_id:     actor.id,
    actor_email:  actor.email,
    actor_role:   'admin',
    event_type:   'system.role_granted',
    target_type:  'user',
    target_id:    targetUserId,
    target_label: targetEmail,
    action:       'Granted manager role',
    old_value:    { role: currentRole ?? null },
    new_value:    { role: 'manager' },
  })

  return {}
}

export async function revokeRole(
  targetUserId: string,
  targetEmail: string,
): Promise<{ error?: string }> {
  const actor = await getAdminUser()
  if (!actor) return { error: 'Unauthorized' }

  if (actor.id === targetUserId) {
    return { error: 'You cannot revoke your own access.' }
  }

  const admin = createAdminClient()

  const { data: { user: target }, error: fetchError } = await admin.auth.admin.getUserById(targetUserId)
  if (fetchError || !target) return { error: 'User not found' }

  const currentRole = target.app_metadata?.role as string | undefined
  if (currentRole === 'admin') return { error: 'Admin accounts cannot be revoked from this interface.' }
  if (!currentRole || currentRole !== 'manager') return { error: 'This user does not have a staff role.' }

  const { error } = await admin.auth.admin.updateUserById(targetUserId, {
    app_metadata: { role: null },
  })
  if (error) {
    console.error('[revokeRole]', error)
    return { error: 'Failed to revoke access' }
  }

  logAuditEvent({
    actor_id:     actor.id,
    actor_email:  actor.email,
    actor_role:   'admin',
    event_type:   'system.role_revoked',
    target_type:  'user',
    target_id:    targetUserId,
    target_label: targetEmail,
    action:       'Revoked manager role',
    old_value:    { role: 'manager' },
    new_value:    { role: null },
  })

  return {}
}
