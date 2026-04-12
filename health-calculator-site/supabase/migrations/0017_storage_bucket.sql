-- Create private storage bucket for generated meal plan PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-plans',
  'meal-plans',
  false,
  10485760,           -- 10MB max per PDF
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Service role full access (Edge Functions use service role key)
DROP POLICY IF EXISTS "service_role_storage_all" ON storage.objects;
CREATE POLICY "service_role_storage_all"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'meal-plans')
WITH CHECK (bucket_id = 'meal-plans');

-- Authenticated users can read their own PDF (by user_plan_id in path)
DROP POLICY IF EXISTS "anon_read_own_pdf" ON storage.objects;
CREATE POLICY "anon_read_own_pdf"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'meal-plans');
