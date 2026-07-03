// POST /api/v1/allies/[id]/photo — Upload profile photo to ally-photos bucket
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse multipart body
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: '"file" field is required' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Photo must be JPEG, PNG or WebP' },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Photo must be under 5 MB' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify ally exists
  const { data: ally } = await admin
    .from('allies')
    .select('id')
    .eq('id', id)
    .single();
  if (!ally) return NextResponse.json({ error: 'Ally not found' }, { status: 404 });

  // Upload to ally-photos bucket: {ally_id}/profile.{ext}
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const storagePath = `${id}/profile.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from('ally-photos')
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('[POST /api/v1/allies/:id/photo] upload error', uploadError);
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = admin.storage.from('ally-photos').getPublicUrl(storagePath);

  // Save photo_url + path on ally row
  const { error: updateError } = await admin
    .from('allies')
    .update({ photo_url: publicUrl, photo_storage_path: storagePath })
    .eq('id', id);

  if (updateError) {
    console.error('[POST /api/v1/allies/:id/photo] update error', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ photo_url: publicUrl, storage_path: storagePath });
}
