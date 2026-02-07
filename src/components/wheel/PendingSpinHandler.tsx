import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWheelSpins } from '@/hooks/useWheelSpins';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function PendingSpinHandler() {
  const { user } = useAuth();
  const { claimPendingSpin, hasPendingSpin, segments } = useWheelSpins();
  const processedRef = useRef(false);

  useEffect(() => {
    const processPendingSpin = async () => {
      if (!user || processedRef.current || !hasPendingSpin()) return;

      processedRef.current = true;
      
      try {
        const pending = await claimPendingSpin();
        if (!pending) return;

        // Find the segment
        const segment = segments.find(s => s.id === pending.segment_id);
        if (!segment) return;

        // Generate coupon code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let couponCode = 'WHEEL-';
        for (let i = 0; i < 6; i++) {
          couponCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Get gift product info if needed
        let giftProductName: string | null = null;
        let giftProductImage: string | null = null;

        if (pending.prize_type === 'gift' && pending.gift_product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('title, id')
            .eq('id', pending.gift_product_id)
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

        // Create user coupon
        const { data: coupon, error: couponError } = await supabase
          .from('user_coupons')
          .insert({
            user_id: user.id,
            code: couponCode,
            discount_type: pending.discount_type || 'percentage',
            discount_value: pending.discount_value || 0,
            prize_type: pending.prize_type,
            gift_product_id: pending.gift_product_id,
            gift_product_name: giftProductName,
            gift_product_image: giftProductImage,
          })
          .select()
          .single();

        if (couponError) throw couponError;

        // Record spin
        await supabase.from('user_wheel_spins').insert({
          user_id: user.id,
          segment_id: pending.segment_id,
          coupon_id: coupon.id,
        });

        toast.success(
          `Ваш приз сохранён! Промокод: ${couponCode}`,
          {
            duration: 8000,
            action: {
              label: 'Мои купоны',
              onClick: () => {
                window.location.href = '/account/coupons';
              },
            },
          }
        );
      } catch (err) {
        console.error('Error processing pending spin:', err);
        processedRef.current = false;
      }
    };

    processPendingSpin();
  }, [user, claimPendingSpin, hasPendingSpin, segments]);

  return null;
}
