import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Ticket, Gift } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WheelSegment {
  id: string;
  label: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  prize_type: 'discount' | 'gift';
  gift_product_id: string | null;
  probability: number;
  color: string;
  is_active: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  title: string;
}

const defaultColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', 
  '#EC4899', '#06B6D4', '#EF4444', '#6B7280'
];

const emptySegment: Partial<WheelSegment> = {
  label: '',
  discount_type: 'percentage',
  discount_value: 10,
  prize_type: 'discount',
  gift_product_id: null,
  probability: 10,
  color: '#10B981',
  is_active: true,
  sort_order: 0,
};

const AdminWheelContent = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Partial<WheelSegment> | null>(null);

  // Fetch segments
  const { data: segments = [], isLoading: segmentsLoading } = useQuery({
    queryKey: ['admin-wheel-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wheel_segments')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as WheelSegment[];
    },
  });

  // Fetch products for gift selection
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-for-wheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['wheel-statistics'],
    queryFn: async () => {
      const [spinsResult, couponsResult] = await Promise.all([
        supabase.from('user_wheel_spins').select('id', { count: 'exact' }),
        supabase.from('user_coupons').select('id, is_used, expires_at'),
      ]);

      const totalSpins = spinsResult.count || 0;
      const coupons = couponsResult.data || [];
      const now = new Date();

      return {
        totalSpins,
        totalCoupons: coupons.length,
        usedCoupons: coupons.filter(c => c.is_used).length,
        expiredCoupons: coupons.filter(c => !c.is_used && new Date(c.expires_at) < now).length,
      };
    },
  });

  // Save segment mutation
  const saveMutation = useMutation({
    mutationFn: async (segment: Partial<WheelSegment>) => {
      if (segment.id) {
        const { id, ...updateData } = segment;
        const { error } = await supabase
          .from('wheel_segments')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = segment;
        const { error } = await supabase
          .from('wheel_segments')
          .insert({
            label: insertData.label || '',
            discount_type: insertData.discount_type || 'percentage',
            discount_value: insertData.discount_value || 0,
            prize_type: insertData.prize_type || 'discount',
            gift_product_id: insertData.gift_product_id || null,
            probability: insertData.probability || 10,
            color: insertData.color || '#10B981',
            is_active: insertData.is_active ?? true,
            sort_order: insertData.sort_order || 0,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wheel-segments'] });
      toast.success('Сегмент сохранён');
      setIsDialogOpen(false);
      setEditingSegment(null);
    },
    onError: () => {
      toast.error('Ошибка при сохранении');
    },
  });

  // Delete segment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wheel_segments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wheel-segments'] });
      toast.success('Сегмент удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    },
  });

  const handleOpenCreate = () => {
    setEditingSegment({ ...emptySegment, sort_order: segments.length });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (segment: WheelSegment) => {
    setEditingSegment(segment);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingSegment?.label) {
      toast.error('Введите название');
      return;
    }
    saveMutation.mutate(editingSegment);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот сегмент?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="segments">
        <TabsList className="mb-6">
          <TabsTrigger value="segments">Сегменты</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="segments">
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить сегмент
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSegment?.id ? 'Редактировать' : 'Новый'} сегмент
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Надпись на колесе</Label>
                    <Input
                      placeholder="10%, Подарок!, Попробуй ещё"
                      value={editingSegment?.label || ''}
                      onChange={(e) => setEditingSegment(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Тип приза</Label>
                    <Select
                      value={editingSegment?.prize_type || 'discount'}
                      onValueChange={(value) => setEditingSegment(prev => ({ 
                        ...prev, 
                        prize_type: value as 'discount' | 'gift',
                        gift_product_id: value === 'gift' ? prev?.gift_product_id : null,
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Скидка (промокод)</SelectItem>
                        <SelectItem value="gift">Подарок (товар из каталога)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editingSegment?.prize_type === 'discount' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Тип скидки</Label>
                        <Select
                          value={editingSegment?.discount_type || 'percentage'}
                          onValueChange={(value) => setEditingSegment(prev => ({ 
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
                        <Label>Размер</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editingSegment?.discount_value || 0}
                          onChange={(e) => setEditingSegment(prev => ({ 
                            ...prev, 
                            discount_value: Number(e.target.value) 
                          }))}
                        />
                      </div>
                    </div>
                  )}

                  {editingSegment?.prize_type === 'gift' && (
                    <div className="space-y-2">
                      <Label>Товар-подарок</Label>
                      <Select
                        value={editingSegment?.gift_product_id || ''}
                        onValueChange={(value) => setEditingSegment(prev => ({ 
                          ...prev, 
                          gift_product_id: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите товар" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Вероятность (вес)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={editingSegment?.probability || 10}
                        onChange={(e) => setEditingSegment(prev => ({ 
                          ...prev, 
                          probability: Number(e.target.value) 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Цвет</Label>
                      <div className="flex gap-1 flex-wrap">
                        {defaultColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`h-8 w-8 rounded-full border-2 transition-transform ${
                              editingSegment?.color === color ? 'border-foreground scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setEditingSegment(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingSegment?.is_active ?? true}
                      onCheckedChange={(checked) => setEditingSegment(prev => ({ 
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

          {segmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Цвет</TableHead>
                    <TableHead>Надпись</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Значение</TableHead>
                    <TableHead>Вероятность</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map(segment => (
                    <TableRow key={segment.id}>
                      <TableCell>
                        <div 
                          className="h-6 w-6 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{segment.label}</TableCell>
                      <TableCell>
                        {segment.prize_type === 'gift' ? (
                          <span className="flex items-center gap-1">
                            <Gift className="h-4 w-4" /> Подарок
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Ticket className="h-4 w-4" /> Скидка
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {segment.prize_type === 'discount' && (
                          segment.discount_type === 'percentage' 
                            ? `${segment.discount_value}%` 
                            : `${segment.discount_value} ₽`
                        )}
                      </TableCell>
                      <TableCell>{segment.probability}</TableCell>
                      <TableCell>
                        <span className={`text-sm ${segment.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {segment.is_active ? 'Активен' : 'Скрыт'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(segment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(segment.id)}
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
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Всего прокруток</p>
              <p className="text-3xl font-bold">{stats?.totalSpins || 0}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Выдано купонов</p>
              <p className="text-3xl font-bold">{stats?.totalCoupons || 0}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Использовано</p>
              <p className="text-3xl font-bold text-green-600">{stats?.usedCoupons || 0}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Истекло</p>
              <p className="text-3xl font-bold text-muted-foreground">{stats?.expiredCoupons || 0}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminWheelContent;
