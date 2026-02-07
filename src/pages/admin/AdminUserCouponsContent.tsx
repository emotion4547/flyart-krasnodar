import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Gift, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserCoupon {
  id: string;
  code: string;
  prize_type: 'discount' | 'gift';
  discount_type: string;
  discount_value: number;
  gift_product_name: string | null;
  is_used: boolean;
  used_at: string | null;
  expires_at: string;
  created_at: string;
  user_id: string;
  profiles?: {
    email: string;
    full_name: string | null;
  } | null;
}

const AdminUserCouponsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-user-coupons'],
    queryFn: async () => {
      // Get user coupons
      const { data: userCoupons, error: couponsError } = await supabase
        .from('user_coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (couponsError) throw couponsError;

      // Get profiles for each user_id
      const userIds = [...new Set(userCoupons.map(c => c.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return userCoupons.map(coupon => ({
        ...coupon,
        profiles: profilesMap.get(coupon.user_id) || null
      })) as UserCoupon[];
    },
  });

  const filteredCoupons = coupons.filter(coupon => {
    const search = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(search) ||
      coupon.profiles?.email?.toLowerCase().includes(search) ||
      coupon.profiles?.full_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по коду или пользователю..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Всего: {coupons.length} купонов
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'Ничего не найдено' : 'Пользовательских купонов пока нет'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Скидка/Подарок</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действует до</TableHead>
                <TableHead>Создан</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map(coupon => {
                const isExpired = new Date(coupon.expires_at) < new Date();

                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <code className="font-mono font-bold">{coupon.code}</code>
                    </TableCell>
                    <TableCell>
                      {coupon.prize_type === 'gift' ? (
                        <div className="flex items-center gap-1 text-pink-600">
                          <Gift className="h-4 w-4" />
                          Подарок
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <Percent className="h-4 w-4" />
                          Скидка
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.prize_type === 'gift' 
                        ? coupon.gift_product_name || '—'
                        : coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `${coupon.discount_value} ₽`
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{coupon.profiles?.full_name || '—'}</div>
                        <div className="text-muted-foreground">{coupon.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.is_used ? (
                        <Badge variant="secondary">
                          Использован {coupon.used_at && format(new Date(coupon.used_at), 'd MMM', { locale: ru })}
                        </Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive">Истёк</Badge>
                      ) : (
                        <Badge className="bg-green-600">Активен</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(coupon.expires_at), 'd MMM yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(coupon.created_at), 'd MMM yyyy', { locale: ru })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUserCouponsContent;
