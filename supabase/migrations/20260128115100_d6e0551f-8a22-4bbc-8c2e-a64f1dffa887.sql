-- Create storage bucket for product and category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to catalog images
CREATE POLICY "Catalog images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'catalog-images');

-- Allow authenticated admins/managers to upload images
CREATE POLICY "Admins and managers can upload catalog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'catalog-images' 
  AND public.is_admin_or_manager(auth.uid())
);

-- Allow authenticated admins/managers to update images
CREATE POLICY "Admins and managers can update catalog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catalog-images' 
  AND public.is_admin_or_manager(auth.uid())
);

-- Allow authenticated admins/managers to delete images
CREATE POLICY "Admins and managers can delete catalog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catalog-images' 
  AND public.is_admin_or_manager(auth.uid())
);