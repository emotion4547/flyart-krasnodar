-- Создаем bucket для аватаров отзывов
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-avatars', 'review-avatars', true);

-- Политика: любой может просматривать аватары
CREATE POLICY "Anyone can view review avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-avatars');

-- Политика: только админы могут загружать аватары
CREATE POLICY "Admins can upload review avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'review-avatars' AND is_admin_or_manager(auth.uid()));

-- Политика: только админы могут обновлять аватары
CREATE POLICY "Admins can update review avatars"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'review-avatars' AND is_admin_or_manager(auth.uid()));

-- Политика: только админы могут удалять аватары
CREATE POLICY "Admins can delete review avatars"
ON storage.objects
FOR DELETE
USING (bucket_id = 'review-avatars' AND is_admin_or_manager(auth.uid()));