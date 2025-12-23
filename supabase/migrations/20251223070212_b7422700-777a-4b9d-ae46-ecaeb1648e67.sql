-- Создаем таблицу отзывов
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  source TEXT, -- откуда отзыв (Яндекс, 2ГИС и т.д.)
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Политики: все могут видеть активные отзывы
CREATE POLICY "Anyone can view active reviews"
ON public.reviews
FOR SELECT
USING (is_active = true);

-- Админы могут управлять всеми отзывами
CREATE POLICY "Admins can manage reviews"
ON public.reviews
FOR ALL
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));

-- Триггер для обновления updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();