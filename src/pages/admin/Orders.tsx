import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusOptions = [
  { value: 'new', label: 'Новый', color: 'bg-blue-100 text-blue-700' },
  { value: 'processing', label: 'В работе', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'delivered', label: 'Доставлен', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Отменён', color: 'bg-red-100 text-red-700' },
];

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [managerComment, setManagerComment] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, manager_comment }: { id: string; status: string; manager_comment?: string }) => {
      const updateData: any = { status };
      if (manager_comment !== undefined) {
        updateData.manager_comment = manager_comment;
      }
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Заказ обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении заказа');
    },
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setManagerComment(order.manager_comment || '');
  };

  const handleSaveComment = () => {
    if (selectedOrder) {
      updateStatusMutation.mutate({
        id: selectedOrder.id,
        status: selectedOrder.status,
        manager_comment: managerComment,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return (
      <Badge className={`${option?.color || 'bg-muted text-muted-foreground'}`}>
        {option?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Заказы</h1>
        <p className="text-muted-foreground">Управление заказами клиентов</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону, номеру заказа..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все заказы</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground">{order.customer_phone}</TableCell>
                    <TableCell className="font-medium">{order.total} ₽</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Заказы не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Заказ {selectedOrder.order_number}</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      setSelectedOrder({ ...selectedOrder, status: value });
                      updateStatusMutation.mutate({ id: selectedOrder.id, status: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Контакты клиента</h4>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Имя:</span>
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Телефон:</span>
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium">Доставка</h4>
                    <p className="text-sm">{selectedOrder.delivery_address}</p>
                    {selectedOrder.delivery_date && (
                      <p className="text-sm text-muted-foreground">
                        Дата: {format(new Date(selectedOrder.delivery_date), 'dd.MM.yyyy', { locale: ru })}
                        {selectedOrder.delivery_time && ` ${selectedOrder.delivery_time}`}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Состав заказа</h4>
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{item.product_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {item.price} ₽
                          </p>
                        </div>
                        <p className="font-medium">{item.total} ₽</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Подытог:</span>
                    <span>{selectedOrder.subtotal} ₽</span>
                  </div>
                  {selectedOrder.delivery_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Доставка:</span>
                      <span>{selectedOrder.delivery_cost} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого:</span>
                    <span>{selectedOrder.total} ₽</span>
                  </div>
                </div>

                {selectedOrder.comment && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium">Комментарий клиента</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{selectedOrder.comment}</p>
                  </div>
                )}

                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="manager_comment">Комментарий менеджера</Label>
                  <Textarea
                    id="manager_comment"
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    rows={3}
                    placeholder="Добавить примечание к заказу..."
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveComment}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Сохранить комментарий
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
