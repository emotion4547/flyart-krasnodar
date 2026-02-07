import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
}

interface UserCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  prize_type: 'discount' | 'gift' | 'nothing';
  gift_product_id: string | null;
  gift_product_name: string | null;
  gift_product_image: string | null;
  is_used: boolean;
  expires_at: string;
}

interface UseCouponResult {
  coupon: Coupon | null;
  userCoupon: UserCoupon | null;
  isLoading: boolean;
  error: string | null;
  applyCoupon: (code: string, orderTotal: number, userId?: string) => Promise<{ success: boolean; isUserCoupon?: boolean }>;
  removeCoupon: () => void;
  calculateDiscount: (total: number) => number;
}

export function useCoupon(): UseCouponResult {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [userCoupon, setUserCoupon] = useState<UserCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCoupon = useCallback(async (code: string, orderTotal: number, userId?: string): Promise<{ success: boolean; isUserCoupon?: boolean }> => {
    setIsLoading(true);
    setError(null);

    const upperCode = code.toUpperCase().trim();

    try {
      // 1. Ищем в административных промокодах
      const { data: adminCoupon, error: adminError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError) throw adminError;

      if (adminCoupon) {
        // Проверяем срок действия
        const now = new Date();
        if (adminCoupon.valid_from && new Date(adminCoupon.valid_from) > now) {
          setError('Промокод ещё не активен');
          return { success: false };
        }
        if (adminCoupon.valid_to && new Date(adminCoupon.valid_to) < now) {
          setError('Срок действия промокода истёк');
          return { success: false };
        }

        // Проверяем лимит использований
        if (adminCoupon.max_uses && adminCoupon.used_count >= adminCoupon.max_uses) {
          setError('Промокод исчерпан');
          return { success: false };
        }

        // Проверяем минимальную сумму заказа
        if (adminCoupon.min_order_amount && orderTotal < adminCoupon.min_order_amount) {
          setError(`Минимальная сумма заказа ${adminCoupon.min_order_amount.toLocaleString('ru-RU')} ₽`);
          return { success: false };
        }

        setCoupon(adminCoupon as Coupon);
        setUserCoupon(null);
        return { success: true, isUserCoupon: false };
      }

      // 2. Если не найден в админских, ищем в персональных (если есть userId)
      if (userId) {
        const { data: personalCoupon, error: personalError } = await supabase
          .from('user_coupons')
          .select('*')
          .eq('code', upperCode)
          .eq('user_id', userId)
          .eq('is_used', false)
          .maybeSingle();

        if (personalError) throw personalError;

        if (personalCoupon) {
          // Проверяем срок действия
          if (new Date(personalCoupon.expires_at) < new Date()) {
            setError('Срок действия купона истёк');
            return { success: false };
          }

          // Если это "nothing" приз
          if (personalCoupon.prize_type === 'nothing') {
            setError('Этот купон не даёт скидку');
            return { success: false };
          }

          setUserCoupon(personalCoupon as UserCoupon);
          setCoupon(null);
          return { success: true, isUserCoupon: true };
        }
      }

      setError('Промокод не найден');
      return { success: false };
    } catch (err) {
      console.error('Error applying coupon:', err);
      setError('Ошибка при проверке промокода');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setUserCoupon(null);
    setError(null);
  }, []);

  const calculateDiscount = useCallback((total: number): number => {
    const activeCoupon = coupon || userCoupon;
    if (!activeCoupon) return 0;

    if (activeCoupon.discount_type === 'percentage') {
      return Math.round((total * activeCoupon.discount_value) / 100);
    } else {
      return Math.min(activeCoupon.discount_value, total);
    }
  }, [coupon, userCoupon]);

  return {
    coupon,
    userCoupon,
    isLoading,
    error,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
}
