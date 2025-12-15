-- Drop old policies that use profiles.role (causing RLS recursion issues)
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Admins can view and manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view and manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage pages_seo" ON public.pages_seo;
DROP POLICY IF EXISTS "Admins can manage product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

-- Recreate policies using is_admin_or_manager() function which uses user_roles table
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can manage contact requests" 
ON public.contact_requests 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can view and manage order items" 
ON public.order_items 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can view and manage orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can manage pages_seo" 
ON public.pages_seo 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can manage product categories" 
ON public.product_categories 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can manage product images" 
ON public.product_images 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can manage settings" 
ON public.settings 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));