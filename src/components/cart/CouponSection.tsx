import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useUserCoupons } from '@/hooks/useUserCoupons';
import { useCoupon } from '@/hooks/useCoupon';
import { Ticket, Gift, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CouponSectionProps {
  orderTotal: number;
  onDiscountChange: (discount: number, couponCode: string | null, giftProduct?: { id: string; title: string; image: string } | null) => void;
}

export function CouponSection({ orderTotal, onDiscountChange }: CouponSectionProps) {
  const { user } = useAuth();
  const { coupons, isLoading: couponsLoading } = useUserCoupons();
  const { applyCoupon, removeCoupon, isLoading: couponLoading, error, coupon, userCoupon, calculateDiscount } = useCoupon();
  
  const [promoCode, setPromoCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeCoupons = coupons.filter(c => !c.is_used && new Date(c.expires_at) > new Date());
  const hasAppliedCoupon = coupon || userCoupon;

  const handleApplyCode = async () => {
    if (!promoCode.trim()) return;
    const result = await applyCoupon(promoCode.trim(), orderTotal, user?.id);
    if (result.success && result.appliedCoupon) {
      const discount = calculateDiscountFromCoupon(result.appliedCoupon, orderTotal);
      onDiscountChange(discount, promoCode.trim(), null);
      setPromoCode('');
    }
  };

  const handleSelectUserCoupon = async (couponCode: string) => {
    const selectedCoupon = coupons.find(c => c.code === couponCode);
    const result = await applyCoupon(couponCode, orderTotal, user?.id);
    if (result.success) {
      if (selectedCoupon?.prize_type === 'gift' && selectedCoupon.gift_product_id) {
        onDiscountChange(0, couponCode, {
          id: selectedCoupon.gift_product_id,
          title: selectedCoupon.gift_product_name || 'Подарок',
          image: selectedCoupon.gift_product_image || '',
        });
      } else if (result.appliedCoupon) {
        const discount = calculateDiscountFromCoupon(result.appliedCoupon, orderTotal);
        onDiscountChange(discount, couponCode, null);
      }
    }
  };

  // Helper to calculate discount from coupon data directly
  const calculateDiscountFromCoupon = (couponData: { discount_type: string; discount_value: number }, total: number): number => {
    if (couponData.discount_type === 'percentage') {
      return Math.round((total * couponData.discount_value) / 100);
    } else {
      return Math.min(couponData.discount_value, total);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    onDiscountChange(0, null, null);
  };

  const currentDiscount = calculateDiscount(orderTotal);

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-tiffany" />
          <span className="font-medium">Промокод</span>
          {hasAppliedCoupon && (
            <span className="text-sm text-tiffany">
              (применён: -{currentDiscount.toLocaleString('ru-RU')} ₽)
            </span>
          )}
          {!hasAppliedCoupon && activeCoupons.length > 0 && (
            <span className="text-xs bg-tiffany text-white px-2 py-0.5 rounded-full">
              {activeCoupons.length}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Applied coupon */}
          {hasAppliedCoupon && (
            <div className="flex items-center justify-between bg-tiffany-light rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-tiffany" />
                <span className="font-medium text-tiffany-dark">
                  {coupon?.code || userCoupon?.code}
                </span>
                <span className="text-sm text-tiffany">
                  -{currentDiscount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleRemoveCoupon}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Promo code input */}
          {!hasAppliedCoupon && (
            <div className="flex gap-2">
              <Input
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                className="flex-1"
              />
              <Button
                variant="tiffanyOutline"
                onClick={handleApplyCode}
                disabled={couponLoading || !promoCode.trim()}
              >
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Применить'}
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* User's available coupons */}
          {user && !hasAppliedCoupon && (
            <div className="space-y-2">
              {couponsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : activeCoupons.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">Ваши купоны:</p>
                  <div className="space-y-2">
                    {activeCoupons.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectUserCoupon(c.code)}
                        className="w-full flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        {c.prize_type === 'gift' ? (
                          <Gift className="h-5 w-5 text-cta flex-shrink-0" />
                        ) : (
                          <Ticket className="h-5 w-5 text-tiffany flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{c.code}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.prize_type === 'gift' 
                              ? `Подарок: ${c.gift_product_name}`
                              : c.discount_type === 'percentage'
                                ? `Скидка ${c.discount_value}%`
                                : `Скидка ${c.discount_value} ₽`
                            }
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          до {new Date(c.expires_at).toLocaleDateString('ru-RU')}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  У вас пока нет купонов
                </p>
              )}
            </div>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              <Link to="/auth" className="text-tiffany hover:underline">Войдите</Link>
              {' '}чтобы увидеть ваши купоны
            </p>
          )}
        </div>
      )}
    </div>
  );
}
