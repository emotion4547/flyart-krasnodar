import { AccountLayout } from '@/components/account/AccountLayout';
import { useUserCoupons } from '@/hooks/useUserCoupons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, Ticket, Gift, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AccountCoupons = () => {
  const { activeCoupons, usedCoupons, expiredCoupons, isLoading } = useUserCoupons();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Код скопирован');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderCoupon = (coupon: typeof activeCoupons[0], isActive: boolean = true) => {
    const isGift = coupon.prize_type === 'gift';
    const isExpired = new Date(coupon.expires_at) < new Date();
    
    return (
      <div
        key={coupon.id}
        className={cn(
          'bg-card rounded-2xl border overflow-hidden transition-opacity',
          isActive ? 'border-border/50' : 'border-border/30 opacity-60'
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {isGift ? (
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-pink-500" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-tiffany-light flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-tiffany" />
                </div>
              )}
              <div>
                <p className="font-bold text-lg text-foreground">
                  {isGift ? 'Подарок' : (
                    coupon.discount_type === 'percentage'
                      ? `−${coupon.discount_value}%`
                      : `−${coupon.discount_value.toLocaleString('ru-RU')} ₽`
                  )}
                </p>
                {isGift && coupon.gift_product_name && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {coupon.gift_product_name}
                  </p>
                )}
              </div>
            </div>
            {coupon.is_used ? (
              <Badge variant="secondary">Использован</Badge>
            ) : isExpired ? (
              <Badge variant="destructive">Истёк</Badge>
            ) : (
              <Badge variant="default" className="bg-tiffany">Активен</Badge>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
              <code className="flex-1 font-mono text-sm text-foreground">
                {coupon.code}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyCode(coupon.code)}
              >
                {copiedCode === coupon.code ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            {coupon.is_used ? (
              <>Использован {format(new Date(coupon.used_at!), 'd MMMM yyyy', { locale: ru })}</>
            ) : (
              <>Действует до {format(new Date(coupon.expires_at), 'd MMMM yyyy', { locale: ru })}</>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AccountLayout title="Мои купоны">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
        </div>
      ) : activeCoupons.length === 0 && usedCoupons.length === 0 && expiredCoupons.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Купонов пока нет
          </h2>
          <p className="text-muted-foreground">
            Крутите Колесо Фортуны и получайте скидки!
          </p>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Активные ({activeCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="used">
              Использованные ({usedCoupons.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Истёкшие ({expiredCoupons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeCoupons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет активных купонов
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeCoupons.map(c => renderCoupon(c, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="used">
            {usedCoupons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет использованных купонов
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {usedCoupons.map(c => renderCoupon(c, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired">
            {expiredCoupons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет истёкших купонов
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {expiredCoupons.map(c => renderCoupon(c, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </AccountLayout>
  );
};

export default AccountCoupons;
