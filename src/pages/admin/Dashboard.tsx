import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ShoppingCart, FolderTree, Users, TrendingUp, Clock, Plus, Upload, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { data: productsCount, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: ordersCount, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: async () => {
      const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: categoriesCount, isLoading: loadingCategories } = useQuery({
    queryKey: ['admin-categories-count'],
    queryFn: async () => {
      const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: newOrdersCount, isLoading: loadingNewOrders } = useQuery({
    queryKey: ['admin-new-orders-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      return count || 0;
    },
  });

  const { data: recentOrders, isLoading: loadingRecentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: contactRequests, isLoading: loadingContacts } = useQuery({
    queryKey: ['admin-contact-requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const stats = [
    { title: 'Товаров', value: productsCount, icon: Package, loading: loadingProducts, color: 'text-primary' },
    { title: 'Заказов', value: ordersCount, icon: ShoppingCart, loading: loadingOrders, color: 'text-blue-500' },
    { title: 'Категорий', value: categoriesCount, icon: FolderTree, loading: loadingCategories, color: 'text-green-500' },
    { title: 'Новых заказов', value: newOrdersCount, icon: TrendingUp, loading: loadingNewOrders, color: 'text-orange-500' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      new: 'Новый',
      processing: 'В работе',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground">Обзор статистики магазина</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin4547/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </Link>
          <Link to="/admin4547/import">
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Последние заказы
            </CardTitle>
            <Link to="/admin4547/orders">
              <Button variant="ghost" size="sm">
                Все заказы
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingRecentOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link 
                    key={order.id} 
                    to="/admin4547/orders"
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-sm font-medium mt-1">{order.total} ₽</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Нет заказов</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Новые заявки
            </CardTitle>
            <Link to="/admin4547/clients">
              <Button variant="ghost" size="sm">
                Все заявки
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingContacts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : contactRequests && contactRequests.length > 0 ? (
              <div className="space-y-3">
                {contactRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">{request.phone}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Новая
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Нет новых заявок</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
