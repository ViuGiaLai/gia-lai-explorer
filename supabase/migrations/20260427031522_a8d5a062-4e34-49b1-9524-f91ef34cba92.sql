-- Restrict listing of bucket objects to admins only
DROP POLICY IF EXISTS "Public can view location images" ON storage.objects;

CREATE POLICY "Admins can list location images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'location-images' AND public.has_role(auth.uid(), 'admin'));