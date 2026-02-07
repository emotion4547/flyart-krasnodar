import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OrderItem {
  id: string;
  product_title: string;
  product_sku: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  delivery_cost: number | null;
  subtotal: number;
  total: number;
  comment: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface UseUserOrdersResult {
  orders: Order[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUserOrders(): UseUserOrdersResult {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Получаем заказы пользователя
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Получаем позиции заказов
      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Группируем позиции по заказам
      const itemsByOrder = (itemsData || []).reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item as OrderItem);
        return acc;
      }, {} as Record<string, OrderItem[]>);

      const ordersWithItems: Order[] = ordersData.map(order => ({
        ...order,
        items: itemsByOrder[order.id] || [],
      }));

      setOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    refetch: fetchOrders,
  };
}
