-- Fix orders: drop overly permissive SELECT and replace with scoped policy
DROP POLICY IF EXISTS "Anyone can view their order after creation" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix order_items: drop overly permissive SELECT and replace with scoped policy
DROP POLICY IF EXISTS "Anyone can view their order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- Fix chat_sessions: restrict UPDATE to prevent abuse
DROP POLICY IF EXISTS "Anyone can update their session" ON public.chat_sessions;

CREATE POLICY "Anyone can update recent sessions"
ON public.chat_sessions
FOR UPDATE
TO public
USING (created_at > now() - interval '24 hours')
WITH CHECK (created_at > now() - interval '24 hours');