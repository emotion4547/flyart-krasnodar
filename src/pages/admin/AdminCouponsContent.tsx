import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Copy } from 'lucide-react';
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

const emptyCoupon: Partial<Coupon> = {
  code: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_amount: null,
  max_uses: null,
  is_active: true,
  valid_from: null,
  valid_to: null,
};

const AdminCouponsContent = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // Fetch coupons
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  // Save coupon mutation
  const saveMutation = useMutation({
    mutationFn: async (coupon: Partial<Coupon>) => {
      const code = coupon.code?.toUpperCase().trim() || '';

      if (coupon.id) {
        const { id, created_at, used_count, ...updateData } = coupon;
        const { error } = await supabase
          .from('coupons')
          .update({ ...updateData, code })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert({
            code,
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
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Промокод сохранён');
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
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Промокод удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    },
  });

  const handleOpenCreate = () => {
    setEditingCoupon({ ...emptyCoupon });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
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

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditingCoupon(prev => ({ ...prev, code }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Промокоды</h1>
          <p className="text-muted-foreground">Управление скидочными кодами</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Создать промокод
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon?.id ? 'Редактировать' : 'Новый'} промокод
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Код промокода</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="SALE10"
                    value={editingCoupon?.code || ''}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      code: e.target.value.toUpperCase() 
                    }))}
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Сгенерировать
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип скидки</Label>
                  <Select
                    value={editingCoupon?.discount_type || 'percentage'}
                    onValueChange={(value) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      discount_type: value as 'percentage' | 'fixed' 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Процент (%)</SelectItem>
                      <SelectItem value="fixed">Фиксированная (₽)</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label>Лимит использований</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Без лимита"
                    value={editingCoupon?.max_uses || ''}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      max_uses: e.target.value ? Number(e.target.value) : null 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Действует с</Label>
                  <Input
                    type="date"
                    value={editingCoupon?.valid_from?.split('T')[0] || ''}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      valid_from: e.target.value ? new Date(e.target.value).toISOString() : null 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Действует до</Label>
                  <Input
                    type="date"
                    value={editingCoupon?.valid_to?.split('T')[0] || ''}
                    onChange={(e) => setEditingCoupon(prev => ({ 
                      ...prev, 
                      valid_to: e.target.value ? new Date(e.target.value).toISOString() : null 
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingCoupon?.is_active ?? true}
                  onCheckedChange={(checked) => setEditingCoupon(prev => ({ 
                    ...prev, 
                    is_active: checked 
                  }))}
                />
                <Label>Активен</Label>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Промокодов пока нет
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Мин. сумма</TableHead>
                <TableHead>Использовано</TableHead>
                <TableHead>Срок</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(coupon => {
                const isExpired = coupon.valid_to && new Date(coupon.valid_to) < new Date();
                const isExhausted = coupon.max_uses && coupon.used_count >= coupon.max_uses;

                return (
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
                      {coupon.used_count}
                      {coupon.max_uses && ` / ${coupon.max_uses}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {coupon.valid_to 
                        ? format(new Date(coupon.valid_to), 'd MMM yyyy', { locale: ru }) 
                        : '∞'
                      }
                    </TableCell>
                    <TableCell>
                      {!coupon.is_active ? (
                        <Badge variant="secondary">Неактивен</Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive">Истёк</Badge>
                      ) : isExhausted ? (
                        <Badge variant="secondary">Исчерпан</Badge>
                      ) : (
                        <Badge className="bg-green-600">Активен</Badge>
                      )}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsContent;
