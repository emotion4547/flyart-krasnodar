-- Fix contact_requests RLS policies
DROP POLICY IF EXISTS "Admins can manage contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Anyone can create contact requests" ON public.contact_requests;

-- Explicit policies for contact_requests
CREATE POLICY "Anyone can create contact requests"
ON public.contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete contact requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- Fix orders RLS policies
DROP POLICY IF EXISTS "Admins can view and manage orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Explicit policies for orders
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- Fix order_items RLS policies
DROP POLICY IF EXISTS "Admins can view and manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Explicit policies for order_items
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (is_admin_or_manager(auth.uid()));