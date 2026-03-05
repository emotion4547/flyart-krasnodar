import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface FavoriteProduct {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    price_old: number | null;
    is_active: boolean;
  } | null;
  mainImage?: string;
}

interface UseFavoritesResult {
  favorites: FavoriteProduct[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return { favorites: [] as FavoriteProduct[], ids: new Set<string>() };

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          product_id,
          created_at,
          product:products (
            id,
            title,
            slug,
            price,
            price_old,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productIds = (data || []).map(f => f.product_id);
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, url')
        .in('product_id', productIds.length > 0 ? productIds : ['__none__'])
        .eq('is_main', true);

      const imageMap = new Map(images?.map(i => [i.product_id, i.url]) || []);

      const favorites: FavoriteProduct[] = (data || []).map(f => ({
        ...f,
        product: f.product as FavoriteProduct['product'],
        mainImage: imageMap.get(f.product_id),
      }));

      return {
        favorites,
        ids: new Set(productIds),
      };
    },
    enabled: !!user,
  });

  const favorites = data?.favorites ?? [];
  const favoriteIds = data?.ids ?? new Set<string>();

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast.success('Добавлено в избранное');
    },
    onError: () => toast.error('Ошибка при обновлении избранного'),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast.success('Удалено из избранного');
    },
    onError: () => toast.error('Ошибка при обновлении избранного'),
  });

  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (productId: string): Promise<void> => {
    if (!user) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }
    if (favoriteIds.has(productId)) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  }, [user, favoriteIds, addMutation, removeMutation]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    refetch: async () => { await refetch(); },
  };
}
