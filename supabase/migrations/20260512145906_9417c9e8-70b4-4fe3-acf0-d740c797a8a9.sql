
-- 1. Fix privilege escalation: drop unused profiles.role column (auth uses user_roles)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 2. Drop overly permissive UPDATE on chat_sessions (the SECURITY DEFINER trigger handles stat updates)
DROP POLICY IF EXISTS "Anyone can update recent sessions" ON public.chat_sessions;

-- 3. Restrict sensitive settings keys from public read
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Public can view non-sensitive settings"
ON public.settings FOR SELECT
TO public
USING (key NOT IN ('analytics', 'robots_txt'));

CREATE POLICY "Admins can view all settings"
ON public.settings FOR SELECT
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- 4. Tighten order_items INSERT: order must exist, be recent, and belong to caller (or be a guest order)
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Order items can be created for own recent orders"
ON public.order_items FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND o.created_at > now() - interval '1 hour'
      AND (o.user_id IS NULL OR o.user_id = auth.uid())
  )
);

-- 5. Tighten coupon_uses INSERT: must match auth user (or be null for guest) and reference recent order
DROP POLICY IF EXISTS "Anyone can create coupon uses" ON public.coupon_uses;
CREATE POLICY "Coupon uses can be created for own recent orders"
ON public.coupon_uses FOR INSERT
TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND (
    order_id IS NULL OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.created_at > now() - interval '1 hour'
        AND (o.user_id IS NULL OR o.user_id = auth.uid())
    )
  )
);

-- 6. Tighten chat_messages INSERT: session must exist and be recent
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
CREATE POLICY "Chat messages can be created for recent sessions"
ON public.chat_messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs
    WHERE cs.id = session_id
      AND cs.created_at > now() - interval '24 hours'
  )
);

-- 7. Tighten pending_wheel_spins: only admins can list/delete; anyone can still insert (guest flow)
DROP POLICY IF EXISTS "Anyone can view pending spins" ON public.pending_wheel_spins;
DROP POLICY IF EXISTS "Anyone can delete pending spins" ON public.pending_wheel_spins;
-- "Admins can manage pending spins" remains for admin operations.
-- Client-side claim flow should move to a SECURITY DEFINER function or edge function with service role.
