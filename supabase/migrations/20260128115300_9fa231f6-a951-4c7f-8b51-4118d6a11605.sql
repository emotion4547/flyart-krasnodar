-- Create table for featured categories (popular sections on homepage)
CREATE TABLE public.featured_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  custom_image_url text,
  custom_title text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_id)
);

-- Enable RLS
ALTER TABLE public.featured_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view featured categories"
ON public.featured_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage featured categories"
ON public.featured_categories FOR ALL
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_featured_categories_updated_at
BEFORE UPDATE ON public.featured_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();