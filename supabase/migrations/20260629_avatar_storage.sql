-- Create the avatars storage bucket (public, 2 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars: authenticated upload own" ON storage.objects;
DROP POLICY IF EXISTS "avatars: authenticated update own" ON storage.objects;
DROP POLICY IF EXISTS "avatars: authenticated delete own" ON storage.objects;
DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;

-- Users can upload to their own folder ({uid}/avatar.{ext})
CREATE POLICY "avatars: authenticated upload own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Users can replace (upsert) their own avatar
CREATE POLICY "avatars: authenticated update own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Users can delete their own avatar
CREATE POLICY "avatars: authenticated delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Avatars are publicly readable (bucket is public; policy as defence-in-depth)
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
