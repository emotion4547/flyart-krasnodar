import { useState, useEffect, useCallback } from 'react';
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
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
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

      // Получаем главные изображения для всех товаров
      const productIds = (data || []).map(f => f.product_id);
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, url')
        .in('product_id', productIds)
        .eq('is_main', true);

      const imageMap = new Map(images?.map(i => [i.product_id, i.url]) || []);

      const favoritesWithImages: FavoriteProduct[] = (data || []).map(f => ({
        ...f,
        product: f.product as FavoriteProduct['product'],
        mainImage: imageMap.get(f.product_id),
      }));

      setFavorites(favoritesWithImages);
      setFavoriteIds(new Set(productIds));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (productId: string): Promise<void> => {
    if (!user) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }

    const isCurrentlyFavorite = favoriteIds.has(productId);

    try {
      if (isCurrentlyFavorite) {
        // Удаляем из избранного
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setFavorites(prev => prev.filter(f => f.product_id !== productId));
        toast.success('Удалено из избранного');
      } else {
        // Добавляем в избранное
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;

        setFavoriteIds(prev => new Set([...prev, productId]));
        toast.success('Добавлено в избранное');
        
        // Перезагружаем для получения полных данных
        fetchFavorites();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Ошибка при обновлении избранного');
    }
  }, [user, favoriteIds, fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
