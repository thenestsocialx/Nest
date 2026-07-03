// POST /api/v1/allies/[id]/documents — Upload verification document
// GET  /api/v1/allies/[id]/documents — List all documents for an ally
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DocType } from '@/types/ally';

const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_BYTES      = 20 * 1024 * 1024; // 20 MB
const VALID_DOC_TYPES = new Set<DocType>([
  'govt_id', 'degree', 'license', 'certs', 'bg_check', 'insurance', 'agreement',
]);
const REQUIRED_DOCS = new Set<DocType>(['govt_id', 'degree', 'license', 'bg_check']);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file    = formData.get('file')     as File   | null;
  const docType = formData.get('doc_type') as string | null;

  if (!file)    return NextResponse.json({ error: '"file" field required'     }, { status: 400 });
  if (!docType) return NextResponse.json({ error: '"doc_type" field required' }, { status: 400 });

  if (!VALID_DOC_TYPES.has(docType as DocType)) {
    return NextResponse.json({ error: `Invalid doc_type: ${docType}` }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'File must be JPEG, PNG or PDF' },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be under 20 MB' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify ally exists
  const { data: ally } = await admin
    .from('allies')
    .select('id')
    .eq('id', id)
    .single();
  if (!ally) return NextResponse.json({ error: 'Ally not found' }, { status: 404 });

  // Determine extension
  const extMap: Record<string, string> = {
    'image/jpeg':    'jpg',
    'image/png':     'png',
    'application/pdf': 'pdf',
  };
  const ext         = extMap[file.type] ?? 'bin';
  const storagePath = `${id}/${docType}_${Date.now()}.${ext}`;
  const bytes       = await file.arrayBuffer();

  // Upload to private ally-documents bucket
  const { error: uploadError } = await admin.storage
    .from('ally-documents')
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('[POST documents] upload', uploadError);
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // For private buckets we create a long-lived signed URL (1 year)
  const { data: signedData, error: signError } = await admin.storage
    .from('ally-documents')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

  const fileUrl = signError ? null : signedData?.signedUrl ?? null;

  // Upsert ally_documents record (unique on ally_id + doc_type)
  const { data: doc, error: upsertError } = await admin
    .from('ally_documents')
    .upsert(
      {
        ally_id:      id,
        doc_type:     docType,
        file_name:    file.name,
        storage_path: storagePath,
        file_url:     fileUrl,
        file_size:    file.size,
        mime_type:    file.type,
        is_required:  REQUIRED_DOCS.has(docType as DocType),
        status:       'uploaded',
        uploaded_by:  staff.id,
        updated_at:   new Date().toISOString(),
      },
      { onConflict: 'ally_id,doc_type' },
    )
    .select()
    .single();

  if (upsertError) {
    console.error('[POST documents] upsert', upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ document: doc }, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ally_documents')
    .select('*')
    .eq('ally_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: data ?? [] });
}
