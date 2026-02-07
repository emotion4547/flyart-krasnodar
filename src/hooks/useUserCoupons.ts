import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserCoupon {
  id: string;
  user_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  prize_type: 'discount' | 'gift' | 'nothing';
  gift_product_id: string | null;
  gift_product_name: string | null;
  gift_product_image: string | null;
  is_used: boolean;
  used_at: string | null;
  order_id: string | null;
  expires_at: string;
  created_at: string;
}

interface UseUserCouponsResult {
  coupons: UserCoupon[];
  activeCoupons: UserCoupon[];
  usedCoupons: UserCoupon[];
  expiredCoupons: UserCoupon[];
  isLoading: boolean;
  selectedCoupon: UserCoupon | null;
  selectCoupon: (coupon: UserCoupon | null) => void;
  markCouponAsUsed: (couponId: string, orderId: string) => Promise<void>;
  calculateDiscount: (total: number) => number;
  refetch: () => Promise<void>;
}

export function useUserCoupons(): UseUserCouponsResult {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    if (!user) {
      setCoupons([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data || []) as UserCoupon[]);
    } catch (err) {
      console.error('Error fetching user coupons:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const now = new Date();

  const activeCoupons = coupons.filter(
    c => !c.is_used && new Date(c.expires_at) > now && c.prize_type !== 'nothing'
  );

  const usedCoupons = coupons.filter(c => c.is_used);

  const expiredCoupons = coupons.filter(
    c => !c.is_used && new Date(c.expires_at) <= now
  );

  const selectCoupon = useCallback((coupon: UserCoupon | null) => {
    setSelectedCoupon(coupon);
  }, []);

  const markCouponAsUsed = useCallback(async (couponId: string, orderId: string) => {
    try {
      const { error } = await supabase
        .from('user_coupons')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          order_id: orderId,
        })
        .eq('id', couponId);

      if (error) throw error;
      
      // Обновляем локальное состояние
      setCoupons(prev => 
        prev.map(c => 
          c.id === couponId 
            ? { ...c, is_used: true, used_at: new Date().toISOString(), order_id: orderId }
            : c
        )
      );
      setSelectedCoupon(null);
    } catch (err) {
      console.error('Error marking coupon as used:', err);
      throw err;
    }
  }, []);

  const calculateDiscount = useCallback((total: number): number => {
    if (!selectedCoupon) return 0;

    if (selectedCoupon.discount_type === 'percentage') {
      return Math.round((total * selectedCoupon.discount_value) / 100);
    } else {
      return Math.min(selectedCoupon.discount_value, total);
    }
  }, [selectedCoupon]);

  return {
    coupons,
    activeCoupons,
    usedCoupons,
    expiredCoupons,
    isLoading,
    selectedCoupon,
    selectCoupon,
    markCouponAsUsed,
    calculateDiscount,
    refetch: fetchCoupons,
  };
}
