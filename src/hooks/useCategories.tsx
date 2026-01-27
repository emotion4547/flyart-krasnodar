import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number | null;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useFooterCategories() {
  return useQuery({
    queryKey: ['footer-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .is('parent_id', null) // Only top-level categories
        .order('sort_order', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      return data as Pick<Category, 'id' | 'name' | 'slug'>[];
    },
  });
}
