-- =============================================
-- ЧАСТЬ 1: РАСШИРЕНИЕ PROFILES (телефон уже может быть в заказах)
-- =============================================

-- Добавляем phone в profiles если его нет
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- =============================================
-- ЧАСТЬ 2: АДРЕСА ДОСТАВКИ
-- =============================================

CREATE TABLE public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Дом', -- Название адреса (Дом, Работа и т.д.)
  city text NOT NULL,
  street text NOT NULL,
  house text NOT NULL,
  apartment text,
  entrance text,
  floor text,
  intercom text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses" ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses" ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.user_addresses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all addresses" ON public.user_addresses
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- =============================================
-- ЧАСТЬ 3: ИЗБРАННОЕ
-- =============================================

CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ЧАСТЬ 4: АДМИНИСТРАТИВНЫЕ ПРОМОКОДЫ
-- =============================================

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- История использования промокодов
CREATE TABLE public.coupon_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon uses" ON public.coupon_uses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create coupon uses" ON public.coupon_uses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage coupon uses" ON public.coupon_uses
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- =============================================
-- ЧАСТЬ 5: СЕГМЕНТЫ КОЛЕСА ФОРТУНЫ
-- =============================================

CREATE TABLE public.wheel_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  prize_type text NOT NULL DEFAULT 'discount' CHECK (prize_type IN ('discount', 'gift', 'nothing')),
  gift_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  probability integer NOT NULL DEFAULT 10 CHECK (probability >= 0),
  color text NOT NULL DEFAULT '#FF6B6B',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wheel_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active segments" ON public.wheel_segments
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage segments" ON public.wheel_segments
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- =============================================
-- ЧАСТЬ 6: ПЕРСОНАЛЬНЫЕ КУПОНЫ (от колеса)
-- =============================================

CREATE TABLE public.user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  prize_type text NOT NULL DEFAULT 'discount' CHECK (prize_type IN ('discount', 'gift', 'nothing')),
  gift_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  gift_product_name text,
  gift_product_image text,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupons" ON public.user_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coupons" ON public.user_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons" ON public.user_coupons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user coupons" ON public.user_coupons
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- =============================================
-- ЧАСТЬ 7: ИСТОРИЯ ВРАЩЕНИЙ КОЛЕСА
-- =============================================

CREATE TABLE public.user_wheel_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  segment_id uuid REFERENCES public.wheel_segments(id) ON DELETE SET NULL,
  coupon_id uuid REFERENCES public.user_coupons(id) ON DELETE SET NULL,
  spun_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_wheel_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spins" ON public.user_wheel_spins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own spins" ON public.user_wheel_spins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all spins" ON public.user_wheel_spins
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- =============================================
-- ЧАСТЬ 8: ОТЛОЖЕННЫЕ ВЫИГРЫШИ (для неавторизованных)
-- =============================================

CREATE TABLE public.pending_wheel_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  segment_id uuid NOT NULL REFERENCES public.wheel_segments(id) ON DELETE CASCADE,
  prize_type text NOT NULL,
  discount_type text,
  discount_value numeric,
  gift_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pending_wheel_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pending spins" ON public.pending_wheel_spins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view pending spins" ON public.pending_wheel_spins
  FOR SELECT USING (true);

CREATE POLICY "Anyone can delete pending spins" ON public.pending_wheel_spins
  FOR DELETE USING (true);

CREATE POLICY "Admins can manage pending spins" ON public.pending_wheel_spins
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- =============================================
-- ЧАСТЬ 9: СВЯЗЬ ЗАКАЗОВ С ПОЛЬЗОВАТЕЛЯМИ
-- =============================================

-- Добавляем user_id в orders для связи с ЛК
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid;

-- Политика для просмотра своих заказов
CREATE POLICY "Users can view own orders by user_id" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- ЧАСТЬ 10: НАЧАЛЬНЫЕ СЕГМЕНТЫ КОЛЕСА
-- =============================================

INSERT INTO public.wheel_segments (label, discount_type, discount_value, prize_type, probability, color, sort_order) VALUES
  ('5%', 'percentage', 5, 'discount', 25, '#10B981', 1),
  ('10%', 'percentage', 10, 'discount', 20, '#3B82F6', 2),
  ('15%', 'percentage', 15, 'discount', 15, '#8B5CF6', 3),
  ('20%', 'percentage', 20, 'discount', 10, '#F59E0B', 4),
  ('100₽', 'fixed', 100, 'discount', 15, '#EC4899', 5),
  ('300₽', 'fixed', 300, 'discount', 10, '#06B6D4', 6),
  ('Попробуй ещё', 'percentage', 0, 'nothing', 5, '#6B7280', 7);

-- =============================================
-- ЧАСТЬ 11: ТРИГГЕРЫ ДЛЯ UPDATED_AT
-- =============================================

CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wheel_segments_updated_at
  BEFORE UPDATE ON public.wheel_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();