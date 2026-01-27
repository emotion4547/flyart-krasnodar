-- Таблица подборок (Collections)
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Связь подборок с товарами/категориями
CREATE TABLE public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_item_type CHECK (
    (product_id IS NOT NULL AND category_id IS NULL) OR
    (product_id IS NULL AND category_id IS NOT NULL)
  )
);

-- Индексы
CREATE INDEX idx_collections_active ON public.collections(is_active, sort_order);
CREATE INDEX idx_collections_slug ON public.collections(slug);
CREATE INDEX idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_product ON public.collection_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_collection_items_category ON public.collection_items(category_id) WHERE category_id IS NOT NULL;

-- Trigger для updated_at
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- RLS политики для collections
CREATE POLICY "Anyone can view active collections" ON public.collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- RLS политики для collection_items
CREATE POLICY "Anyone can view collection items" ON public.collection_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage collection items" ON public.collection_items
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Storage bucket для Hero-видео
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-videos', 'hero-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies для hero-videos bucket
CREATE POLICY "Anyone can view hero videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-videos');

CREATE POLICY "Admins can upload hero videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hero-videos' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update hero videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'hero-videos' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete hero videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'hero-videos' AND is_admin_or_manager(auth.uid()));

-- Storage bucket для изображений подборок
INSERT INTO storage.buckets (id, name, public) 
VALUES ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies для collection-images bucket
CREATE POLICY "Anyone can view collection images" ON storage.objects
  FOR SELECT USING (bucket_id = 'collection-images');

CREATE POLICY "Admins can upload collection images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'collection-images' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update collection images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'collection-images' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete collection images" ON storage.objects
  FOR DELETE USING (bucket_id = 'collection-images' AND is_admin_or_manager(auth.uid()));