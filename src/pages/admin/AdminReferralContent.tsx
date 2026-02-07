import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Copy, Users, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  created_at: string;
}

interface PartnerCoupon extends Coupon {
  partner_name?: string;
}

const emptyPartnerCoupon: Partial<PartnerCoupon> = {
  code: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_amount: null,
  max_uses: null,
  is_active: true,
  valid_from: null,
  valid_to: null,
  partner_name: '',
};

const AdminReferralContent = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<PartnerCoupon> | null>(null);

  // Fetch referral coupons (those with code starting with REF-)
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-referral-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', 'REF-%')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PartnerCoupon[];
    },
  });

  // Calculate stats
  const totalPartners = coupons.length;
  const totalUses = coupons.reduce((sum, c) => sum + c.used_count, 0);
  const activePartners = coupons.filter(c => c.is_active && c.used_count > 0).length;

  // Save coupon mutation
  const saveMutation = useMutation({
    mutationFn: async (coupon: Partial<PartnerCoupon>) => {
      const code = coupon.code?.toUpperCase().trim() || '';
      const finalCode = code.startsWith('REF-') ? code : `REF-${code}`;

      if (coupon.id) {
        const { id, created_at, used_count, partner_name, ...updateData } = coupon;
        const { error } = await supabase
          .from('coupons')
          .update({ ...updateData, code: finalCode })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert({
            code: finalCode,
            discount_type: coupon.discount_type || 'percentage',
            discount_value: coupon.discount_value || 0,
            min_order_amount: coupon.min_order_amount || null,
            max_uses: coupon.max_uses || null,
            is_active: coupon.is_active ?? true,
            valid_from: coupon.valid_from || null,
            valid_to: coupon.valid_to || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-referral-coupons'] });
      toast.success('Партнёрский промокод сохранён');
      setIsDialogOpen(false);
      setEditingCoupon(null);
    },
    onError: (error: any) => {
      if (error.message?.includes('unique')) {
        toast.error('Такой код уже существует');
      } else {
        toast.error('Ошибка при сохранении');
      }
    },
  });

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-referral-coupons'] });
      toast.success('Промокод удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    },
  });

  const handleOpenCreate = () => {
    setEditingCoupon({ ...emptyPartnerCoupon });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: PartnerCoupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingCoupon?.code) {
      toast.error('Введите код промокода');
      return;
    }
    if (!editingCoupon?.discount_value || editingCoupon.discount_value <= 0) {
      toast.error('Введите размер скидки');
      return;
    }
    saveMutation.mutate(editingCoupon);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот промокод?')) {
      deleteMutation.mutate(id);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Код скопирован');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего партнёров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalPartners}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активных партнёров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{activePartners}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего использований
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {totalUses}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Создавайте промокоды для партнёров и отслеживайте их эффективность
        </p>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить партнёра
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon?.id ? 'Редактировать' : 'Новый'} партнёрский промокод
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Код промокода (без REF-)</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-l-md border border-r-0">
                    <span className="text-sm font-mono">REF-</span>
                  </div>
                  <Input
                    placeholder="PARTNER"
                    value={editingCoupon?.code?.replace('REF-', '') || ''}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      code: e.target.value.toUpperCase() 
                    }))}
                    className="font-mono rounded-l-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип скидки</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editingCoupon?.discount_type || 'percentage'}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      discount_type: e.target.value as 'percentage' | 'fixed' 
                    }))}
                  >
                    <option value="percentage">Процент (%)</option>
                    <option value="fixed">Фиксированная (₽)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Размер скидки</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingCoupon?.discount_value || ''}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      discount_value: Number(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Мин. сумма заказа (₽)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Без ограничения"
                  value={editingCoupon?.min_order_amount || ''}
                  onChange={(e) => setEditingCoupon(prev => ({ 
                    ...prev, 
                    min_order_amount: e.target.value ? Number(e.target.value) : null 
                  }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Партнёрских промокодов пока нет
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Мин. сумма</TableHead>
                <TableHead>Использований</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(coupon => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold">{coupon.code}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyCode(coupon.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `${coupon.discount_value} ₽`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.min_order_amount 
                      ? `от ${coupon.min_order_amount.toLocaleString('ru-RU')} ₽` 
                      : '—'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.used_count > 0 ? 'default' : 'secondary'}>
                      {coupon.used_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.is_active ? (
                      <Badge className="bg-green-600">Активен</Badge>
                    ) : (
                      <Badge variant="secondary">Неактивен</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(coupon.created_at), 'd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(coupon)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminReferralContent;
