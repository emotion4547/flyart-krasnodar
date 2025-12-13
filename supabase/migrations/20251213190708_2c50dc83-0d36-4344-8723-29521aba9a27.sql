-- Create a settings table for storing all application settings
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins/managers can manage settings
CREATE POLICY "Admins can manage settings" 
ON public.settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['admin'::text, 'manager'::text])
));

-- Anyone can read settings (for public site to use them)
CREATE POLICY "Anyone can view settings" 
ON public.settings 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
  ('general', '{"siteName": "FlyArt", "siteDescription": "Воздушные шары в Красноярске", "phone": "+7 (900) 123-45-67", "email": "info@flyart.ru", "address": "Красноярск", "workingHours": "Пн-Вс: 9:00 - 21:00"}'),
  ('delivery', '{"freeDeliveryThreshold": "3000", "selfPickup": true, "selfPickupAddress": "Красноярск", "deliveryZones": [{"name": "По городу", "price": "350"}]}'),
  ('payment', '{"cardPayment": true, "cashPayment": true, "onlinePayment": false}'),
  ('seo_templates', '{"productTitle": "{{title}} - Купить в FlyArt", "productDescription": "{{title}} по цене {{price}} руб.", "categoryTitle": "{{name}} - Каталог FlyArt", "categoryDescription": "Купить {{name}} в FlyArt."}'),
  ('robots_txt', '{"content": "User-agent: *\nAllow: /\nDisallow: /admin4547/\nDisallow: /cart\nDisallow: /checkout\n\nSitemap: https://flyart.ru/sitemap.xml"}'),
  ('analytics', '{"yandexMetrika": "", "googleAnalytics": "", "facebookPixel": ""}')
ON CONFLICT (key) DO NOTHING;

-- Create pages_seo table for static pages SEO settings
CREATE TABLE public.pages_seo (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id text NOT NULL UNIQUE,
  title text,
  description text,
  keywords text,
  h1 text,
  og_title text,
  og_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pages_seo ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage pages_seo" 
ON public.pages_seo 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['admin'::text, 'manager'::text])
));

CREATE POLICY "Anyone can view pages_seo" 
ON public.pages_seo 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pages_seo_updated_at
BEFORE UPDATE ON public.pages_seo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();