
-- Allow anon users to view newly created orders (needed for .select() after insert)
CREATE POLICY "Anyone can view their order after creation"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anon users to view order items (needed for order details)
CREATE POLICY "Anyone can view their order items"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (true);
