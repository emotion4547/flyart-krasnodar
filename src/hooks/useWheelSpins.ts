import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const PENDING_SPIN_KEY = 'pending_wheel_spin';
const SESSION_ID_KEY = 'wheel_session_id';
const WHEEL_USED_KEY = 'flyart_wheel_used'; // permanent localStorage flag

interface WheelSegment {
  id: string;
  label: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  prize_type: 'discount' | 'gift';
  gift_product_id: string | null;
  probability: number;
  color: string;
}

interface PendingSpin {
  session_id: string;
  segment_id: string;
  prize_type: string;
  discount_type: string | null;
  discount_value: number | null;
  gift_product_id: string | null;
}

interface UseWheelSpinsResult {
  segments: WheelSegment[];
  canSpin: boolean;
  nextSpinDate: Date | null;
  isLoading: boolean;
  recordSpin: (segment: WheelSegment) => Promise<{ couponCode: string } | null>;
  savePendingSpin: (segment: WheelSegment) => Promise<void>;
  claimPendingSpin: () => Promise<PendingSpin | null>;
  hasPendingSpin: () => boolean;
  checkCanSpin: () => Promise<void>;
  getSessionId: () => string;
}

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'WHEEL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/** Mark this device as having used the wheel (permanent) */
function markWheelUsed(): void {
  localStorage.setItem(WHEEL_USED_KEY, Date.now().toString());
}

/** Check if this device has already used the wheel */
function isWheelUsedOnDevice(): boolean {
  return !!localStorage.getItem(WHEEL_USED_KEY);
}

export function useWheelSpins(): UseWheelSpinsResult {
  const { user } = useAuth();
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [nextSpinDate, setNextSpinDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка сегментов колеса
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const { data, error } = await supabase
          .from('wheel_segments')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        setSegments((data || []) as WheelSegment[]);
      } catch (err) {
        console.error('Error fetching wheel segments:', err);
      }
    };

    fetchSegments();
  }, []);

  const checkCanSpin = useCallback(async () => {
    setIsLoading(true);

    try {
      // First check: device-level flag (permanent, one-time only)
      if (isWheelUsedOnDevice()) {
        setCanSpin(false);
        setNextSpinDate(null);
        setIsLoading(false);
        return;
      }

      if (user) {
        // For authenticated users — also check DB for any previous spin
        const { data, error } = await supabase
          .from('user_wheel_spins')
          .select('spun_at')
          .eq('user_id', user.id)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          // User has spun before — mark device and deny
          markWheelUsed();
          setCanSpin(false);
          setNextSpinDate(null);
        } else {
          setCanSpin(true);
          setNextSpinDate(null);
        }
      } else {
        // For unauthenticated — check localStorage pending spin
        const pendingSpin = localStorage.getItem(PENDING_SPIN_KEY);
        setCanSpin(!pendingSpin);
        setNextSpinDate(null);
      }
    } catch (err) {
      console.error('Error checking can spin:', err);
      setCanSpin(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkCanSpin();
  }, [checkCanSpin]);

  const recordSpin = useCallback(async (segment: WheelSegment): Promise<{ couponCode: string } | null> => {
    if (!user) return null;

    try {
      const couponCode = generateCouponCode();
      
      // Получаем данные о товаре-подарке, если это gift
      let giftProductName: string | null = null;
      let giftProductImage: string | null = null;
      
      if (segment.prize_type === 'gift' && segment.gift_product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('title, id')
          .eq('id', segment.gift_product_id)
          .single();
        
        if (product) {
          giftProductName = product.title;
          
          const { data: image } = await supabase
            .from('product_images')
            .select('url')
            .eq('product_id', product.id)
            .eq('is_main', true)
            .maybeSingle();
          
          giftProductImage = image?.url || null;
        }
      }

      // Создаём персональный купон
      const { data: coupon, error: couponError } = await supabase
        .from('user_coupons')
        .insert({
          user_id: user.id,
          code: couponCode,
          discount_type: segment.discount_type,
          discount_value: segment.discount_value,
          prize_type: segment.prize_type,
          gift_product_id: segment.gift_product_id,
          gift_product_name: giftProductName,
          gift_product_image: giftProductImage,
        })
        .select()
        .single();

      if (couponError) throw couponError;

      // Записываем прокрутку
      const { error: spinError } = await supabase
        .from('user_wheel_spins')
        .insert({
          user_id: user.id,
          segment_id: segment.id,
          coupon_id: coupon.id,
        });

      if (spinError) throw spinError;

      // Mark device permanently
      markWheelUsed();
      setCanSpin(false);
      setNextSpinDate(null);

      return { couponCode };
    } catch (err) {
      console.error('Error recording spin:', err);
      return null;
    }
  }, [user]);

  const savePendingSpin = useCallback(async (segment: WheelSegment): Promise<void> => {
    const sessionId = getOrCreateSessionId();

    try {
      const pendingData: PendingSpin = {
        session_id: sessionId,
        segment_id: segment.id,
        prize_type: segment.prize_type,
        discount_type: segment.discount_type,
        discount_value: segment.discount_value,
        gift_product_id: segment.gift_product_id,
      };
      localStorage.setItem(PENDING_SPIN_KEY, JSON.stringify(pendingData));

      await supabase.from('pending_wheel_spins').insert({
        session_id: sessionId,
        segment_id: segment.id,
        prize_type: segment.prize_type,
        discount_type: segment.discount_type,
        discount_value: segment.discount_value,
        gift_product_id: segment.gift_product_id,
      });

      // Mark device permanently
      markWheelUsed();
      setCanSpin(false);
    } catch (err) {
      console.error('Error saving pending spin:', err);
    }
  }, []);

  const claimPendingSpin = useCallback(async (): Promise<PendingSpin | null> => {
    const pendingData = localStorage.getItem(PENDING_SPIN_KEY);
    if (!pendingData) return null;

    try {
      const pending: PendingSpin = JSON.parse(pendingData);
      
      localStorage.removeItem(PENDING_SPIN_KEY);

      await supabase
        .from('pending_wheel_spins')
        .delete()
        .eq('session_id', pending.session_id);

      return pending;
    } catch (err) {
      console.error('Error claiming pending spin:', err);
      return null;
    }
  }, []);

  const hasPendingSpin = useCallback((): boolean => {
    return !!localStorage.getItem(PENDING_SPIN_KEY);
  }, []);

  const getSessionId = useCallback((): string => {
    return getOrCreateSessionId();
  }, []);

  return {
    segments,
    canSpin,
    nextSpinDate,
    isLoading,
    recordSpin,
    savePendingSpin,
    claimPendingSpin,
    hasPendingSpin,
    checkCanSpin,
    getSessionId,
  };
}
