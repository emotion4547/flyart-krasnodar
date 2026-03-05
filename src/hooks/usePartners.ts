import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  benefit_short: string;
  benefit_detail: string | null;
  website_url: string | null;
  promo_code: string | null;
  discount_value: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Partner[];
    },
  });
}

export function useActivePartners() {
  return useQuery({
    queryKey: ['partners', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Partner[];
    },
  });
}
