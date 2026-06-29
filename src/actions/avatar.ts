'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Upload or replace the current user's avatar ───────────────────────────────
// Receives a FormData with an "avatar" File field (max 2 MB, images only).
// Uploads to storage/avatars/{uid}/avatar.{ext} (upsert), then updates
// profiles.avatar_url with a versioned URL to bust the CDN cache.
export async function uploadAvatar(
  formData: FormData,
): Promise<{ avatarUrl?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'No file provided.' }

  if (!file.type.startsWith('image/')) {
    return { error: 'Please select an image file (JPEG, PNG, or WebP).' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Image must be under 2 MB.' }
  }

  const ext = file.type === 'image/png'
    ? 'png'
    : file.type === 'image/webp'
      ? 'webp'
      : 'jpg'

  const path = `${user.id}/avatar.${ext}`

  const admin = createAdminClient()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('[uploadAvatar] storage upload failed:', uploadError)
    return { error: 'Upload failed. Please try again.' }
  }

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

  // Append a version param so the CDN treats each upload as a new resource
  const now = new Date()
  const avatarUrl = `${publicUrl}?v=${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`

  const { error: dbError } = await admin
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: now.toISOString() })
    .eq('id', user.id)

  if (dbError) {
    console.error('[uploadAvatar] profile update failed:', dbError)
    return { error: 'Upload succeeded but profile update failed. Please refresh.' }
  }

  return { avatarUrl }
}
