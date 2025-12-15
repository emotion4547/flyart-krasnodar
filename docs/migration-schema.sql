-- =====================================================
-- FlyArt Database Schema Migration Script
-- For self-hosted Supabase on Beget
-- =====================================================

-- 1. ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- 2. TABLES
-- =====================================================

-- Categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_indexed boolean DEFAULT true,
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_title text,
  og_description text,
  og_image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text NOT NULL,
  description text,
  full_text text,
  price numeric NOT NULL,
  price_old numeric,
  quantity integer DEFAULT 0,
  weight numeric,
  length numeric,
  width numeric,
  height numeric,
  is_active boolean DEFAULT true,
  is_new boolean DEFAULT false,
  is_hit boolean DEFAULT false,
  is_sale boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  external_id text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_title text,
  og_description text,
  og_image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Product images table
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  is_main boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Product categories junction table
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

-- Orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text,
  delivery_date date,
  delivery_time text,
  delivery_cost numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'new',
  comment text,
  manager_comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  product_sku text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Contact requests table
CREATE TABLE public.contact_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  comment text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Settings table
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Pages SEO table
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

-- 3. INDEXES
-- =====================================================
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- 4. FUNCTIONS
-- =====================================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- Update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'FA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Make first user admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- 5. TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_seo_updated_at
  BEFORE UPDATE ON public.pages_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order number generation
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- New user handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages_seo ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- =====================================================

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Product images policies
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Product categories policies
CREATE POLICY "Anyone can view product categories" ON public.product_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage product categories" ON public.product_categories
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Orders policies
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (is_admin_or_manager(auth.uid()));

-- Order items policies
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view order items" ON public.order_items
  FOR SELECT USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update order items" ON public.order_items
  FOR UPDATE USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE USING (is_admin_or_manager(auth.uid()));

-- Contact requests policies
CREATE POLICY "Anyone can create contact requests" ON public.contact_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact requests" ON public.contact_requests
  FOR SELECT USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update contact requests" ON public.contact_requests
  FOR UPDATE USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can delete contact requests" ON public.contact_requests
  FOR DELETE USING (is_admin_or_manager(auth.uid()));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Settings policies
CREATE POLICY "Anyone can view settings" ON public.settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Pages SEO policies
CREATE POLICY "Anyone can view pages_seo" ON public.pages_seo
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage pages_seo" ON public.pages_seo
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
