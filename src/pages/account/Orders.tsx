import { AccountLayout } from '@/components/account/AccountLayout';
import { useUserOrders } from '@/hooks/useUserOrders';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, Package, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'Новый', variant: 'default' },
  processing: { label: 'В обработке', variant: 'secondary' },
  confirmed: { label: 'Подтверждён', variant: 'outline' },
  delivering: { label: 'Доставляется', variant: 'outline' },
  completed: { label: 'Выполнен', variant: 'default' },
  cancelled: { label: 'Отменён', variant: 'destructive' },
};

const AccountOrders = () => {
  const { orders, isLoading } = useUserOrders();
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (orderId: string) => {
    setOpenOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <AccountLayout title="Мои заказы">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Заказов пока нет
          </h2>
          <p className="text-muted-foreground">
            Оформите первый заказ, и он появится здесь
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isOpen = openOrders.has(order.id);
            const status = statusLabels[order.status] || statusLabels.new;

            return (
              <Collapsible
                key={order.id}
                open={isOpen}
                onOpenChange={() => toggleOrder(order.id)}
              >
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  <CollapsibleTrigger className="w-full p-4 md:p-6 text-left hover:bg-muted/50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {order.order_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'd MMMM yyyy', { locale: ru })}
                          </p>
                        </div>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-foreground">
                          {order.total.toLocaleString('ru-RU')} ₽
                        </p>
                        <ChevronDown 
                          className={cn(
                            'h-5 w-5 text-muted-foreground transition-transform',
                            isOpen && 'rotate-180'
                          )} 
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-border/50 pt-4">
                      <h4 className="font-medium text-foreground mb-3">Состав заказа</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">
                              {item.product_title} × {item.quantity}
                            </span>
                            <span className="text-muted-foreground">
                              {item.total.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.delivery_address && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            <strong>Адрес:</strong> {order.delivery_address}
                          </p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
};

export default AccountOrders;
